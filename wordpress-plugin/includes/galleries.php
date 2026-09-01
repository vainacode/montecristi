<?php
/**
 * Galerías REST API
 * Extensión del plugin Bellota API para galerías de fotos
 */

defined('ABSPATH') || exit;

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM POST TYPE: GALERÍAS
// ═══════════════════════════════════════════════════════════════════════════════

add_action('init', function() {
    register_post_type('galerias', [
        'labels' => [
            'name' => 'Galerías',
            'singular_name' => 'Galería',
            'menu_name' => 'Galerías',
            'add_new' => 'Agregar nueva galería',
            'add_new_item' => 'Agregar nueva galería',
            'edit_item' => 'Editar galería',
            'view_item' => 'Ver galería',
        ],
        'public' => true,
        'show_ui' => true,
        'show_in_rest' => true,
        'rest_base' => 'galerias',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'author'],
        'has_archive' => true,
        'rewrite' => [
            'slug' => 'galerias',
            'with_front' => false,
        ],
        'menu_icon' => 'dashicons-format-gallery',
        'menu_position' => 5,
        'can_export' => true,
    ]);

    register_taxonomy('gallery_cat', 'galerias', [
        'labels' => [
            'name' => 'Categorías de Galerías',
            'singular_name' => 'Categoría de Galería',
        ],
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_in_rest' => true,
        'rewrite' => [
            'slug' => 'galeria-categoria',
            'with_front' => false,
        ],
    ]);
});

// ═══════════════════════════════════════════════════════════════════════════════
// METABOX: SELECTOR DE IMÁGENES PARA GALERÍAS
// ═══════════════════════════════════════════════════════════════════════════════

add_action('add_meta_boxes', function() {
    add_meta_box(
        'gallery_images_metabox',
        'Imágenes de la Galería',
        'bahia_gallery_images_metabox_callback',
        'galerias',
        'normal',
        'high'
    );
});

function bahia_gallery_images_metabox_callback($post) {
    wp_nonce_field('bahia_gallery_nonce_action', 'bahia_gallery_nonce');

    $gallery_ids = get_post_meta($post->ID, 'gallery_images', true);
    if (!is_array($gallery_ids)) {
        $gallery_ids = [];
    }

    echo '<div id="gallery-images-container" style="margin-bottom: 20px;">';

    foreach ($gallery_ids as $image_id) {
        $image_url = wp_get_attachment_image_src($image_id, 'thumbnail');
        if ($image_url) {
            echo '<div class="gallery-image-item" data-id="' . esc_attr($image_id) . '" style="display: inline-block; margin-right: 10px; margin-bottom: 10px; position: relative;">';
            echo '<img src="' . esc_url($image_url[0]) . '" style="max-width: 100px; max-height: 100px; cursor: move;">';
            echo '<button type="button" class="button remove-gallery-image" style="position: absolute; top: -5px; right: -5px;">×</button>';
            echo '</div>';
        }
    }

    echo '</div>';

    echo '<button id="add-gallery-images" class="button button-primary" type="button">Agregar Imágenes</button>';
    echo '<input type="hidden" id="gallery-images-ids" name="gallery_images" value="' . esc_attr(implode(',', $gallery_ids)) . '">';

    echo '<script type="text/javascript">
    (function($) {
        var frame;
        $(document).ready(function() {
            $("#add-gallery-images").on("click", function(e) {
                e.preventDefault();
                if (frame) {
                    frame.open();
                    return;
                }

                frame = wp.media({
                    title: "Seleccionar Imágenes",
                    button: {
                        text: "Usar Imágenes"
                    },
                    multiple: true,
                    library: {
                        type: "image"
                    }
                });

                frame.on("select", function() {
                    var selection = frame.state().get("selection");
                    var currentIds = $("#gallery-images-ids").val().split(",").filter(Boolean);

                    selection.each(function(attachment) {
                        if (currentIds.indexOf(attachment.id.toString()) === -1) {
                            currentIds.push(attachment.id);
                        }
                    });

                    updateGalleryImages(currentIds);
                });

                frame.open();
            });

            $(document).on("click", ".remove-gallery-image", function(e) {
                e.preventDefault();
                var $item = $(this).closest(".gallery-image-item");
                var imageId = $item.data("id");
                var currentIds = $("#gallery-images-ids").val().split(",").filter(Boolean);
                var index = currentIds.indexOf(imageId.toString());
                if (index > -1) {
                    currentIds.splice(index, 1);
                }
                updateGalleryImages(currentIds);
            });

            function updateGalleryImages(ids) {
                $("#gallery-images-ids").val(ids.join(","));
                renderGalleryImages(ids);
            }

            function renderGalleryImages(ids) {
                var container = $("#gallery-images-container");
                container.empty();

                ids.forEach(function(id) {
                    $.ajax({
                        url: "/wp-json/wp/v2/media/" + id,
                        type: "GET",
                        success: function(data) {
                            var thumbUrl = data.media_details.sizes.thumbnail.source_url;
                            var html = "<div class=\"gallery-image-item\" data-id=\"" + id + "\" style=\"display: inline-block; margin-right: 10px; margin-bottom: 10px; position: relative;\">";
                            html += "<img src=\"" + thumbUrl + "\" style=\"max-width: 100px; max-height: 100px; cursor: move;\">";
                            html += "<button type=\"button\" class=\"button remove-gallery-image\" style=\"position: absolute; top: -5px; right: -5px;\">×</button>";
                            html += "</div>";
                            container.append(html);
                        }
                    });
                });
            }
        });
    })(jQuery);
    </script>';
}

add_action('save_post_galerias', function($post_id) {
    if (!isset($_POST['bahia_gallery_nonce']) || !wp_verify_nonce($_POST['bahia_gallery_nonce'], 'bahia_gallery_nonce_action')) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $gallery_images = isset($_POST['gallery_images']) ? sanitize_text_field($_POST['gallery_images']) : '';
    $image_ids = array_map('absint', array_filter(explode(',', $gallery_images)));

    if (!empty($image_ids)) {
        update_post_meta($post_id, 'gallery_images', $image_ids);
    } else {
        delete_post_meta($post_id, 'gallery_images');
    }

    bahia_bump_list_epoch();
    bellota_log_activity("Galería actualizada: ID #{$post_id}. Caché invalidado.");
}, 10);

// ═══════════════════════════════════════════════════════════════════════════════
// INVALIDACIÓN DE CACHÉ PARA GALERÍAS
// ═══════════════════════════════════════════════════════════════════════════════

add_action('save_post_galerias', function($post_id, WP_Post $post) {
    if ('publish' !== $post->post_status) {
        return;
    }
    bahia_bump_list_epoch();
    delete_transient(bahia_slug_transient($post->post_name));
}, 10, 2);

add_action('before_delete_post', function($post_id) {
    if ('galerias' !== get_post_type($post_id)) {
        return;
    }
    $slug = (string) get_post_field('post_name', $post_id);
    delete_transient(bahia_slug_transient($slug));
    bahia_bump_list_epoch();
    bellota_log_activity("Galería eliminada: ID #{$post_id}. Caché invalidado.");
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATEO DE GALERÍA (Similiar a bahia_format_post)
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_format_gallery(WP_Post $post, bool $include_photos = false): array {
    $thumb_id = (int) get_post_thumbnail_id($post->ID);
    $featured_media_embed = [];

    if ($thumb_id) {
        $img = wp_get_attachment_image_src($thumb_id, 'full');
        if ($img && is_array($img)) {
            $featured_media_embed[] = [
                'id' => $thumb_id,
                'source_url' => (string) $img[0],
                'alt_text' => (string) get_post_meta($thumb_id, '_wp_attachment_image_alt', true),
                'thumbnail' => (string) wp_get_attachment_image_src($thumb_id, 'thumbnail')[0],
                'medium' => (string) wp_get_attachment_image_src($thumb_id, 'medium')[0],
                'large' => (string) wp_get_attachment_image_src($thumb_id, 'large')[0],
            ];
        }
    }

    $gallery_images = get_post_meta($post->ID, 'gallery_images', true);
    if (!is_array($gallery_images)) {
        $gallery_images = [];
    }

    $data = [
        'id' => (int) $post->ID,
        'date' => get_the_date('c', $post),
        'slug' => (string) $post->post_name,
        'title' => (string) get_the_title($post->ID),
        'excerpt' => (string) wp_strip_all_tags($post->post_excerpt),
        'description' => (string) wp_strip_all_tags($post->post_excerpt),
        'featured_image' => !empty($featured_media_embed) ? $featured_media_embed[0] : null,
        'photos_count' => (int) count($gallery_images),
        'author' => [
            'id' => (int) $post->post_author,
            'name' => (string) get_the_author_meta('display_name', $post->post_author),
        ],
    ];

    if ($include_photos && !empty($gallery_images)) {
        $photos = [];
        foreach ($gallery_images as $image_id) {
            $photo = bahia_format_photo($image_id);
            if ($photo) {
                $photos[] = $photo;
            }
        }
        $data['photos'] = $photos;
        $data['content'] = wp_kses_post(apply_filters('the_content', do_blocks($post->post_content)));
    }

    return $data;
}

function bahia_format_photo(int $image_id): ?array {
    $attachment = get_post($image_id);
    if (!$attachment || 'attachment' !== $attachment->post_type) {
        return null;
    }

    $full = wp_get_attachment_image_src($image_id, 'full');
    if (!$full || !is_array($full)) {
        return null;
    }

    return [
        'id' => $image_id,
        'url' => (string) $full[0],
        'width' => (int) $full[1],
        'height' => (int) $full[2],
        'thumbnail' => (string) wp_get_attachment_image_src($image_id, 'thumbnail')[0],
        'medium' => (string) wp_get_attachment_image_src($image_id, 'medium')[0],
        'large' => (string) wp_get_attachment_image_src($image_id, 'large')[0],
        'alt' => (string) get_post_meta($image_id, '_wp_attachment_image_alt', true),
        'caption' => (string) $attachment->post_excerpt,
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINTS REST
// ═══════════════════════════════════════════════════════════════════════════════

add_action('rest_api_init', function() {
    // Listado de galerías
    register_rest_route(BAHIA_API_NS, '/galerias', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bahia_endpoint_galleries',
        'permission_callback' => function() {
            return bahia_rate_limit('galleries', bahia_get_rate_limit('galleries'));
        },
        'args' => [
            'per_page' => ['default' => 12, 'sanitize_callback' => 'absint'],
            'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
            'offset' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'search' => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
            'category' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'author' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'orderby' => ['default' => 'date', 'sanitize_callback' => 'sanitize_key'],
            'order' => ['default' => 'DESC', 'sanitize_callback' => 'sanitize_text_field'],
        ],
    ]);

    // Detalle de galería individual
    register_rest_route(BAHIA_API_NS, '/galerias/(?P<slug>[a-z0-9\-]+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bahia_endpoint_gallery_detail',
        'permission_callback' => function() {
            return bahia_rate_limit('galleries', bahia_get_rate_limit('galleries'));
        },
        'args' => [
            'slug' => ['required' => true, 'sanitize_callback' => 'sanitize_title'],
        ],
    ]);
});

function bahia_endpoint_galleries(WP_REST_Request $req): WP_REST_Response {
    try {
        $qp = $req->get_query_params();
        $per_page = min(max(absint($qp['per_page'] ?? 12), 1), BAHIA_API_MAX_PER_PAGE);
        $page = max(absint($qp['page'] ?? 1), 1);
        $offset = absint($qp['offset'] ?? 0);
        $cat_id = absint($qp['category'] ?? 0);
        $author_id = absint($qp['author'] ?? 0);
        $search = substr(wp_strip_all_tags($qp['search'] ?? ''), 0, 200);
        $raw_ob = $qp['orderby'] ?? 'date';
        $orderby = in_array($raw_ob, ['date', 'title', 'rand', 'modified'], true) ? $raw_ob : 'date';
        $order = 'asc' === strtolower($qp['order'] ?? 'desc') ? 'ASC' : 'DESC';

        $real_offset = $offset ?: ($page - 1) * $per_page;
        $params_key = "gal_{$per_page}_{$real_offset}_{$cat_id}_{$author_id}_{$search}_{$orderby}_{$order}";
        $transient = bahia_list_transient($params_key);
        $cached = get_transient($transient);

        if (false !== $cached) {
            bellota_record_request('galleries', true);
            bahia_send_cache_headers(BAHIA_API_TTL_POSTS, true);
            return new WP_REST_Response($cached, 200);
        }

        $args = [
            'post_type' => 'galerias',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'offset' => $real_offset,
            'orderby' => $orderby,
            'order' => $order,
            'no_found_rows' => true,
            'update_post_meta_cache' => true,
            'update_post_term_cache' => true,
        ];

        if ($cat_id) {
            $args['tax_query'] = [
                [
                    'taxonomy' => 'gallery_cat',
                    'field' => 'term_id',
                    'terms' => $cat_id,
                ],
            ];
        }

        if ($author_id) {
            $args['author'] = $author_id;
        }

        if ($search) {
            $args['s'] = $search;
        }

        $query = new WP_Query($args);
        $data = [];
        foreach ($query->posts as $post) {
            $data[] = bahia_format_gallery($post, false);
        }

        $total = 999; // Sin rows count por performance
        $total_pages = ceil($total / $per_page);

        $response = [
            'success' => true,
            'page' => (int) $page,
            'per_page' => (int) $per_page,
            'total' => (int) $total,
            'total_pages' => (int) $total_pages,
            'data' => $data,
        ];

        set_transient($transient, $response, BAHIA_API_TTL_POSTS);
        bellota_record_request('galleries', false);
        bahia_send_cache_headers(BAHIA_API_TTL_POSTS, false);
        return new WP_REST_Response($response, 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /galerias: " . $e->getMessage());
        return new WP_REST_Response(['error' => 'Error interno del servidor'], 500);
    }
}

function bahia_endpoint_gallery_detail(WP_REST_Request $req): WP_REST_Response {
    try {
        $slug = sanitize_title($req->get_param('slug'));

        $transient = bahia_slug_transient('gal_' . $slug);
        $cached = get_transient($transient);
        if (false !== $cached) {
            bellota_record_request('galleries', true);
            bahia_send_cache_headers(BAHIA_API_TTL_SLUG, true);
            return new WP_REST_Response($cached, 200);
        }

        $galleries = get_posts([
            'name' => $slug,
            'post_type' => 'galerias',
            'post_status' => 'publish',
            'posts_per_page' => 1,
        ]);

        if (empty($galleries)) {
            return new WP_REST_Response(['error' => 'Galería no encontrada'], 404);
        }

        $gallery = bahia_format_gallery($galleries[0], true);
        $response = [
            'success' => true,
            'data' => $gallery,
        ];

        set_transient($transient, $response, BAHIA_API_TTL_SLUG);
        bellota_record_request('galleries', false);
        bahia_send_cache_headers(BAHIA_API_TTL_SLUG, false);
        return new WP_REST_Response($response, 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /galerias/{slug}: " . $e->getMessage());
        return new WP_REST_Response(['error' => 'Error interno del servidor'], 500);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASA DE LÍMITE PARA GALERÍAS
// ═══════════════════════════════════════════════════════════════════════════════

if (!defined('BAHIA_API_LIMIT_GALLERIES')) {
    define('BAHIA_API_LIMIT_GALLERIES', 36000);
}

add_filter('bahia_rate_limit_key', function($key) {
    if ('galleries' === $key) {
        return BAHIA_API_LIMIT_GALLERIES;
    }
    return $key;
});
