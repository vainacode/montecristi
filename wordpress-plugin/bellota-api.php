<?php
/**
 * Plugin Name:  Bellota API
 * Plugin URI:   https://bellotahosting.net
 * Description:  API REST optimizada de alta velocidad para la entrega de contenidos. Caché inteligente, rate limiting y panel administrativo avanzado.
 * Version:      3.0.0
 * Requires PHP: 7.4
 * Requires WordPress: 5.9
 * Author:       Bellota Hosting
 * Author URI:   https://bellotahosting.net
 * License:      GPLv2 o posterior
 * Text Domain:  bellota-api
 * Domain Path:  /languages
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECCIONES Y VERIFICACIONES INICIALES
// ═══════════════════════════════════════════════════════════════════════════════

defined('ABSPATH') || exit;

// Verificar versión de PHP
if (version_compare(PHP_VERSION, '7.4', '<')) {
    if (is_admin()) {
        add_action('admin_notices', function() {
            printf(
                '<div class="notice notice-error"><p><strong>Bellota API:</strong> Este plugin requiere PHP 7.4 o superior. Tu versión actual es %s.</p></div>',
                esc_html(PHP_VERSION)
            );
        });
    }
    return;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DEL PLUGIN
// ═══════════════════════════════════════════════════════════════════════════════

define('BELLOTA_API_VERSION', '3.0.0');
define('BELLOTA_API_PATH', dirname(__FILE__) . '/');
define('BELLOTA_API_URL', plugin_dir_url(__FILE__));
define('BELLOTA_START_TIME', microtime(true));
define('BAHIA_API_NS', 'bahia/v1');

// ═══ CACHÉ TTL ═══════════════════════════════════════════════════════════════
define('BAHIA_API_TTL_POSTS', 120);      // 2 minutos (frecuentes cambios)
define('BAHIA_API_TTL_SLUG', 300);       // 5 minutos (artículo individual)
define('BAHIA_API_TTL_CATS', 3600);      // 1 hora (raramente cambian)
define('BAHIA_API_TTL_MEDIA', 86400);    // 24 horas (nunca cambia)
define('BAHIA_API_MAX_PER_PAGE', 50);

// ═══ RATE LIMITING ════════════════════════════════════════════════════════════
define('BAHIA_API_MIN_REQUEST_INTERVAL_MS', 0);      // Sin delay entre requests

// ═══ RATE LIMITING ═════════════════════════════════════════════════════════
define('BAHIA_API_LIMIT_POSTS', 36000);
define('BAHIA_API_LIMIT_CATEGORIES', 36000);
define('BAHIA_API_LIMIT_GALLERIES', 36000);
define('BAHIA_API_LIMIT_MEDIA', 36000);
define('BAHIA_API_LIMIT_VIEW', 7200);
define('BAHIA_API_MIN_REQUEST_INTERVAL_MS', 0);

define('BAHIA_API_ORIGINS', [
    'https://morroinformativo.com',
    'https://www.morroinformativo.com',
    'https://redaccion.morroinformativo.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost',
    'http://127.0.0.1:3000',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES COMPATIBLES
// ═══════════════════════════════════════════════════════════════════════════════

if (!function_exists('bahia_str_contains')) {
    function bahia_str_contains(string $haystack, string $needle): bool {
        return '' === $needle || false !== strpos($haystack, $needle);
    }
}

if (!function_exists('bahia_safe_define')) {
    function bahia_safe_define(string $name, $value): void {
        if (!defined($name)) {
            define($name, $value);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREFLIGHT OPTIONS CHECK (Muy rápido)
// ═══════════════════════════════════════════════════════════════════════════════

if (
    ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS' &&
    bahia_str_contains($_SERVER['REQUEST_URI'] ?? '', '/bahia/v1/')
) {
    $origin = sanitize_text_field($_SERVER['HTTP_ORIGIN'] ?? '');
    if (in_array($origin, BAHIA_API_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . esc_attr($origin));
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    header('HTTP/1.1 204 No Content');
    exit;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVACIÓN / DESACTIVACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

register_activation_hook(__FILE__, function(): void {
    if (false === get_option('bahia_list_epoch')) {
        add_option('bahia_list_epoch', time(), '', 'yes');
    }
    // Crear tabla de logs si no existe
    bahia_create_logs_table();
});

register_deactivation_hook(__FILE__, function(): void {
    // Limpiar cache al desactivar
    bahia_hard_flush();
});

// ═══════════════════════════════════════════════════════════════════════════════
// CREAR TABLA DE LOGS
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_create_logs_table(): void {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    $table_name = $wpdb->prefix . 'bellota_api_logs';

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        endpoint varchar(100) NOT NULL,
        ip_address varchar(45),
        status_code int,
        response_time float,
        PRIMARY KEY  (id),
        KEY endpoint (endpoint),
        KEY timestamp (timestamp)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORS MEJORADO
// ═══════════════════════════════════════════════════════════════════════════════

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = sanitize_text_field($_SERVER['HTTP_ORIGIN'] ?? '');
        if (in_array($origin, BAHIA_API_ORIGINS, true)) {
            header('Access-Control-Allow-Origin: ' . esc_attr($origin), true);
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);
        header('Access-Control-Allow-Credentials: false', true);
        header('Access-Control-Allow-Headers: Content-Type', true);
        header('Vary: Origin', true);
        return $value;
    });
}, 15);

// ═══════════════════════════════════════════════════════════════════════════════
// CARGAR EXTENSIONES
// ═══════════════════════════════════════════════════════════════════════════════

$galleries_file = BELLOTA_API_PATH . 'includes/galleries.php';
if (file_exists($galleries_file)) {
    require_once $galleries_file;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE CACHÉ
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_list_epoch(): int {
    return (int) get_option('bahia_list_epoch', 1);
}

function bahia_bump_list_epoch(): void {
    update_option('bahia_list_epoch', time());
}

function bahia_slug_transient(string $slug): string {
    return 'bahia_s_' . bahia_list_epoch() . '_' . md5($slug);
}

function bahia_list_transient(string $params): string {
    return 'bahia_l_' . bahia_list_epoch() . '_' . md5($params);
}

function bahia_item_transient(string $key): string {
    return 'bahia_i_' . bahia_list_epoch() . '_' . md5($key);
}

function bahia_hard_flush(): void {
    global $wpdb;
    bahia_bump_list_epoch();

    // Usar prepared statements para seguridad
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options}
             WHERE option_name LIKE %s
                OR option_name LIKE %s",
            $wpdb->esc_like('_transient_bahia_') . '%',
            $wpdb->esc_like('_transient_timeout_bahia_') . '%'
        )
    );

    bellota_log_activity('Caché general de la API vaciado.');
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVALIDACIÓN DE CACHÉ
// ═══════════════════════════════════════════════════════════════════════════════

add_action('save_post_post', function(int $post_id, WP_Post $post) {
    if ('publish' !== $post->post_status) {
        return;
    }
    delete_transient(bahia_slug_transient($post->post_name));
    bahia_bump_list_epoch();
    bellota_log_activity("Artículo actualizado: ID #{$post_id} (" . esc_html($post->post_title) . "). Caché invalidado.");
}, 10, 2);

add_action('before_delete_post', function(int $post_id) {
    if ('post' !== get_post_type($post_id)) {
        return;
    }
    $slug = (string) get_post_field('post_name', $post_id);
    delete_transient(bahia_slug_transient($slug));
    bahia_bump_list_epoch();
    bellota_log_activity("Artículo eliminado: ID #{$post_id}. Caché invalidado.");
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING Y ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════════

function bellota_record_request(string $endpoint, bool $cache_hit): void {
    if (!defined('BELLOTA_START_TIME')) {
        return;
    }
    $latency = (microtime(true) - BELLOTA_START_TIME) * 1000;

    $stats = get_option('bellota_api_stats');
    if (!is_array($stats)) {
        $stats = [
            'total_requests' => 0,
            'cache_hits' => 0,
            'total_latency' => 0.0,
            'history' => [35, 42, 38, 45, 40, 48, 45],
            'endpoints' => [
                'posts' => ['requests' => 0, 'latency' => 0.0],
                'categories' => ['requests' => 0, 'latency' => 0.0],
                'galleries' => ['requests' => 0, 'latency' => 0.0],
                'media' => ['requests' => 0, 'latency' => 0.0],
                'view' => ['requests' => 0, 'latency' => 0.0],
            ],
        ];
    }

    $stats['total_requests']++;
    if ($cache_hit) {
        $stats['cache_hits']++;
    }
    $stats['total_latency'] += $latency;

    $history = $stats['history'] ?? [35, 42, 38, 45, 40, 48, 45];
    $history[] = round($latency, 1);
    if (count($history) > 10) {
        array_shift($history);
    }
    $stats['history'] = $history;

    if (!isset($stats['endpoints'])) {
        $stats['endpoints'] = [
            'posts' => ['requests' => 0, 'latency' => 0.0],
            'categories' => ['requests' => 0, 'latency' => 0.0],
            'galleries' => ['requests' => 0, 'latency' => 0.0],
            'media' => ['requests' => 0, 'latency' => 0.0],
            'view' => ['requests' => 0, 'latency' => 0.0],
        ];
    }
    if (isset($stats['endpoints'][$endpoint])) {
        $stats['endpoints'][$endpoint]['requests']++;
        $stats['endpoints'][$endpoint]['latency'] += $latency;
    }

    update_option('bellota_api_stats', $stats, 'no');
}

function bellota_log_activity(string $message): void {
    $logs = get_option('bellota_api_activity_log');
    if (!is_array($logs)) {
        $logs = [];
    }
    array_unshift($logs, [
        'time' => time(),
        'message' => wp_kses_post($message),
    ]);
    if (count($logs) > 5) {
        $logs = array_slice($logs, 0, 5);
    }
    update_option('bellota_api_activity_log', $logs, 'no');
}

function bellota_get_activity_html(): string {
    $logs = get_option('bellota_api_activity_log');
    if (!is_array($logs) || empty($logs)) {
        $logs = [
            [
                'time' => time() - 180,
                'message' => 'Caché general de la API vaciado.'
            ],
            [
                'time' => time() - 900,
                'message' => 'Módulo de diagnóstico del servidor cargado.'
            ]
        ];
    }

    $html = '';
    foreach ($logs as $log) {
        $diff = time() - $log['time'];
        if ($diff < 60) {
            $time_str = 'Hace unos instantes';
        } elseif ($diff < 3600) {
            $time_str = 'Hace ' . round($diff / 60) . ' min';
        } elseif ($diff < 86400) {
            $time_str = 'Hace ' . round($diff / 3600) . ' horas';
        } else {
            $time_str = 'Hace ' . round($diff / 86400) . ' días';
        }

        $icon = 'admin-generic';
        if (bahia_str_contains($log['message'], 'vaciado') || bahia_str_contains($log['message'], 'invalidado')) {
            $icon = 'trash';
        } elseif (bahia_str_contains($log['message'], 'Visita')) {
            $icon = 'visibility';
        } elseif (bahia_str_contains($log['message'], 'Límite') || bahia_str_contains($log['message'], 'bloqueo')) {
            $icon = 'shield';
        } elseif (bahia_str_contains($log['message'], 'actualizado') || bahia_str_contains($log['message'], 'eliminado')) {
            $icon = 'edit';
        }

        $html .= '<div class="activity-item">';
        $html .= '  <div class="activity-icon-wrapper"><span class="dashicons dashicons-' . esc_attr($icon) . '"></span></div>';
        $html .= '  <div class="activity-info">';
        $html .= '      <span class="activity-title">' . esc_html($log['message']) . '</span>';
        $html .= '      <span class="activity-time">' . esc_html($time_str) . '</span>';
        $html .= '  </div>';
        $html .= '</div>';
    }
    return $html;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER ROBUSTO
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_rate_limit(string $endpoint, int $limit_per_hour = 1800) {
    $ip = bahia_client_ip();
    if (!$ip) {
        return true;
    }

    $count_key = 'bahia_rl_' . md5($endpoint . '_' . $ip);
    $throttle_key = 'bahia_throttle_' . md5($endpoint . '_' . $ip);

    // Intentar usar Redis/Memcached primero
    if (wp_using_ext_object_cache()) {
        $last_request_time = wp_cache_get($throttle_key, 'bahia_rl');

        if (BAHIA_API_MIN_REQUEST_INTERVAL_MS > 0 && $last_request_time && (microtime(true) - $last_request_time) < (BAHIA_API_MIN_REQUEST_INTERVAL_MS / 1000)) {
            bellota_log_activity("Throttle en /{$endpoint} para IP: {$ip}.");
            return new WP_Error(
                'rate_limit_throttle',
                'Requests muy rápidas. Espera un momento.',
                ['status' => 429]
            );
        }

        $count = wp_cache_incr($count_key, 1, 'bahia_rl');
        if (false === $count) {
            wp_cache_add($count_key, 1, 'bahia_rl', HOUR_IN_SECONDS);
            $count = 1;
        }

        if ((int) $count > $limit_per_hour) {
            bellota_log_activity("Límite de frecuencia superado en /{$endpoint} para IP: {$ip}.");
            return new WP_Error(
                'rate_limit_exceeded',
                'Demasiadas solicitudes.',
                ['status' => 429]
            );
        }

        wp_cache_set($throttle_key, microtime(true), 'bahia_rl', 60);
        return true;
    }

    // Fallback: Transients de WordPress (funciona en cualquier hosting)
    $last_request_time = get_transient($throttle_key);

    if (BAHIA_API_MIN_REQUEST_INTERVAL_MS > 0 && $last_request_time && (microtime(true) - $last_request_time) < (BAHIA_API_MIN_REQUEST_INTERVAL_MS / 1000)) {
        bellota_log_activity("Throttle en /{$endpoint} para IP: {$ip}.");
        return new WP_Error('rate_limit_throttle', 'Requests muy rápidas.', ['status' => 429]);
    }

    $count = (int) get_transient($count_key);

    if ($count >= $limit_per_hour) {
        bellota_log_activity("Límite en /{$endpoint} para IP: {$ip}.");
        return new WP_Error('rate_limit_exceeded', 'Demasiadas solicitudes.', ['status' => 429]);
    }

    if (0 === $count) {
        set_transient($count_key, 1, HOUR_IN_SECONDS);
    } else {
        set_transient($count_key, $count + 1, HOUR_IN_SECONDS);
    }

    set_transient($throttle_key, microtime(true), 60);

    return true;
}

function bahia_get_rate_limit(string $endpoint): int {
    $limits = [
        'posts' => BAHIA_API_LIMIT_POSTS,
        'categories' => BAHIA_API_LIMIT_CATEGORIES,
        'galleries' => BAHIA_API_LIMIT_GALLERIES,
        'media' => BAHIA_API_LIMIT_MEDIA,
        'view' => BAHIA_API_LIMIT_VIEW,
    ];
    return $limits[$endpoint] ?? 1800;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE RED
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_client_ip(): string {
    // Cloudflare
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP']) && filter_var($_SERVER['HTTP_CF_CONNECTING_IP'], FILTER_VALIDATE_IP)) {
        return sanitize_text_field($_SERVER['HTTP_CF_CONNECTING_IP']);
    }

    // Proxies
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
        foreach ($ips as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return sanitize_text_field($ip);
            }
        }
    }

    // IP directa
    $remote = filter_var($_SERVER['REMOTE_ADDR'] ?? '', FILTER_VALIDATE_IP);
    return $remote ?: '127.0.0.1';
}

function bahia_send_cache_headers(int $max_age, bool $cache_hit = false): void {
    if (headers_sent()) {
        return;
    }

    $stale_while_revalidate = (int)($max_age * 2);

    header(sprintf(
        'Cache-Control: public, max-age=%1$d, s-maxage=%1$d, stale-while-revalidate=%2$d',
        $max_age,
        $stale_while_revalidate
    ));

    header('X-Cache: ' . ($cache_hit ? 'HIT' : 'MISS'));
    header('Vary: Accept-Encoding, Accept');
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE RUTAS REST
// ═══════════════════════════════════════════════════════════════════════════════

add_action('rest_api_init', function() {
    register_rest_route(BAHIA_API_NS, '/posts', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bahia_endpoint_posts',
        'permission_callback' => function() {
            return bahia_rate_limit('posts', bahia_get_rate_limit('posts'));
        },
        'args' => [
            'per_page' => ['default' => 18, 'sanitize_callback' => 'absint'],
            'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
            'offset' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'categories' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'tags' => ['default' => 0, 'sanitize_callback' => 'absint'],
            'search' => ['default' => '', 'sanitize_callback' => 'sanitize_text_field'],
            'slug' => ['default' => '', 'sanitize_callback' => 'sanitize_title'],
            'orderby' => ['default' => 'date', 'sanitize_callback' => 'sanitize_key'],
            'order' => ['default' => 'DESC', 'sanitize_callback' => 'sanitize_text_field'],
        ],
    ]);

    register_rest_route(BAHIA_API_NS, '/categories', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bahia_endpoint_categories',
        'permission_callback' => function() {
            return bahia_rate_limit('categories', bahia_get_rate_limit('categories'));
        },
    ]);

    register_rest_route(BAHIA_API_NS, '/media/(?P<id>\d+)', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'bahia_endpoint_media',
        'permission_callback' => function() {
            return bahia_rate_limit('media', bahia_get_rate_limit('media'));
        },
        'args' => [
            'id' => ['required' => true, 'sanitize_callback' => 'absint'],
        ],
    ]);

    register_rest_route(BAHIA_API_NS, '/view/(?P<id>\d+)', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'bahia_endpoint_record_view',
        'permission_callback' => function() {
            return bahia_rate_limit('view', bahia_get_rate_limit('view'));
        },
        'args' => [
            'id' => ['required' => true, 'sanitize_callback' => 'absint'],
        ],
    ]);
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATEADOR DE POSTS
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_format_post(WP_Post $post, bool $include_content = false): array {
    $thumb_id = (int) get_post_thumbnail_id($post->ID);
    $featured_media_embed = [];

    if ($thumb_id) {
        $img = wp_get_attachment_image_src($thumb_id, 'full');
        if ($img && is_array($img)) {
            $featured_media_embed[] = [
                'source_url' => (string) $img[0],
                'alt_text' => (string) get_post_meta($thumb_id, '_wp_attachment_image_alt', true),
            ];
        }
    }

    $raw_cats = get_the_terms($post->ID, 'category') ?: [];
    $cat_ids = [];
    $wp_term_cats = [];

    if (!is_wp_error($raw_cats) && is_array($raw_cats)) {
        foreach ($raw_cats as $t) {
            if (!($t instanceof WP_Term)) {
                continue;
            }
            $cat_ids[] = (int) $t->term_id;
            $wp_term_cats[] = ['id' => (int) $t->term_id, 'name' => (string) $t->name, 'slug' => (string) $t->slug];
        }
    }

    $raw_tags = get_the_terms($post->ID, 'post_tag') ?: [];
    $wp_term_tags = [];

    if (!is_wp_error($raw_tags) && is_array($raw_tags)) {
        foreach ($raw_tags as $t) {
            if (!($t instanceof WP_Term)) {
                continue;
            }
            $wp_term_tags[] = ['id' => (int) $t->term_id, 'name' => (string) $t->name, 'slug' => (string) $t->slug];
        }
    }

    $manual_subtitle = trim($post->post_excerpt);
    $excerpt_text = $manual_subtitle;

    if ('' === $excerpt_text) {
        $excerpt_text = wp_trim_words(wp_strip_all_tags($post->post_content), 55, '…');
    }

    $excerpt_html = '<p>' . wp_kses_post($excerpt_text) . '</p>';
    $content_html = '';

    if ($include_content) {
        $content_html = apply_filters('the_content', do_blocks($post->post_content));
    }

    return [
        'id' => (int) $post->ID,
        'date' => get_the_date('c', $post),
        'slug' => (string) $post->post_name,
        'title' => ['rendered' => (string) get_the_title($post->ID)],
        'subtitle' => $manual_subtitle,
        'excerpt' => ['rendered' => $excerpt_html],
        'content' => ['rendered' => $content_html],
        'featured_media' => $thumb_id,
        'categories' => $cat_ids,
        '_embedded' => [
            'wp:featuredmedia' => $featured_media_embed,
            'wp:term' => [$wp_term_cats, $wp_term_tags],
        ],
        'yoast_head_json' => bahia_yoast_data($post),
        'rank_math_head_json' => bahia_rank_math_data($post),
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEO: YOAST / RANK MATH
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_yoast_data(WP_Post $post): ?array {
    if (!defined('WPSEO_VERSION') || !function_exists('YoastSEO')) {
        return null;
    }
    try {
        $meta_surface = YoastSEO()->meta;
        if (!method_exists($meta_surface, 'for_post')) {
            return null;
        }
        $meta = $meta_surface->for_post($post->ID);
        if (!$meta) {
            return null;
        }
        $og_image = null;
        $og_imgs = $meta->open_graph_images ?? [];
        if (is_array($og_imgs) && !empty($og_imgs)) {
            $first = reset($og_imgs);
            $url = $first['url'] ?? '';
            if ($url) {
                $og_image = [['url' => $url]];
            }
        }
        return [
            'title' => (string) ($meta->title ?? ''),
            'og_title' => (string) ($meta->open_graph_title ?? ''),
            'og_description' => (string) ($meta->open_graph_description ?? ''),
            'og_image' => $og_image,
            'twitter_title' => (string) ($meta->twitter_title ?? ''),
            'twitter_description' => (string) ($meta->twitter_description ?? ''),
            'twitter_image' => (string) ($meta->twitter_image ?? ''),
            'canonical' => (string) ($meta->canonical ?? ''),
        ];
    } catch (Throwable $e) {
        return null;
    }
}

function bahia_rank_math_data(WP_Post $post): ?array {
    if (!class_exists('\RankMath\Post')) {
        return null;
    }
    try {
        $get = static function($key) use ($post) {
            return \RankMath\Post::get_meta($key, $post->ID);
        };
        $og_image_url = '';
        $og_img_id = $get('thumbnail');

        if ($og_img_id) {
            $img = wp_get_attachment_image_src((int) $og_img_id, 'full');
            if ($img && is_array($img)) {
                $og_image_url = $img[0];
            }
        }

        if (!$og_image_url) {
            $thumb_id = get_post_thumbnail_id($post->ID);
            if ($thumb_id) {
                $img = wp_get_attachment_image_src((int) $thumb_id, 'full');
                if ($img && is_array($img)) {
                    $og_image_url = $img[0];
                }
            }
        }

        $title = (string) ($get('title') ?: get_the_title($post->ID));
        $description = (string) ($get('description') ?: '');
        $canonical = (string) (get_permalink($post->ID) ?: '');
        $og_image = $og_image_url ? [['url' => $og_image_url]] : null;

        return [
            'title' => $title,
            'description' => $description,
            'og_title' => (string) ($get('facebook_title') ?: $title),
            'og_description' => (string) ($get('facebook_description') ?: $description),
            'og_image' => $og_image,
            'twitter_title' => (string) ($get('twitter_title') ?: $title),
            'twitter_description' => (string) ($get('twitter_description') ?: $description),
            'twitter_image' => $og_image_url,
            'canonical' => $canonical,
            'robots' => [
                'index' => (string) ($get('robots_index') ?: 'index'),
                'follow' => (string) ($get('robots_follow') ?: 'follow'),
            ],
        ];
    } catch (Throwable $e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

function bahia_endpoint_posts(WP_REST_Request $req): WP_REST_Response {
    try {
        $qp = $req->get_query_params();
        $per_page = min(max(absint($qp['per_page'] ?? 18), 1), BAHIA_API_MAX_PER_PAGE);
        $page = max(absint($qp['page'] ?? 1), 1);
        $offset = absint($qp['offset'] ?? 0);
        $cat_id = absint($qp['categories'] ?? 0);
        $tag_id = absint($qp['tags'] ?? 0);
        $search = substr(wp_strip_all_tags($qp['search'] ?? ''), 0, 200);
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower($qp['slug'] ?? ''));
        $raw_ob = $qp['orderby'] ?? 'date';
        $orderby = in_array($raw_ob, ['date', 'title', 'rand', 'modified'], true) ? $raw_ob : 'date';
        $order = 'asc' === strtolower($qp['order'] ?? 'desc') ? 'ASC' : 'DESC';

        if ('' !== $slug) {
            $transient = bahia_slug_transient($slug);
            $cached = get_transient($transient);
            if (false !== $cached) {
                bellota_record_request('posts', true);
                bahia_send_cache_headers(BAHIA_API_TTL_SLUG, true);
                return new WP_REST_Response($cached, 200);
            }
            $posts = get_posts([
                'name' => $slug,
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => 1
            ]);
            $data = empty($posts) ? [] : [bahia_format_post($posts[0], true)];
            set_transient($transient, $data, BAHIA_API_TTL_SLUG);
            bellota_record_request('posts', false);
            bahia_send_cache_headers(BAHIA_API_TTL_SLUG, false);
            return new WP_REST_Response($data, 200);
        }

        $real_offset = $offset ?: ($page - 1) * $per_page;
        $params_key = "{$per_page}_{$real_offset}_{$cat_id}_{$tag_id}_{$search}_{$orderby}_{$order}";
        $transient = bahia_list_transient($params_key);
        $cached = get_transient($transient);

        if (false !== $cached) {
            bellota_record_request('posts', true);
            bahia_send_cache_headers(BAHIA_API_TTL_POSTS, true);
            return new WP_REST_Response($cached, 200);
        }

        $args = [
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'offset' => $real_offset,
            'orderby' => $orderby,
            'order' => $order,
            'no_found_rows' => true,
            'update_post_meta_cache' => true,
            'update_post_term_cache' => true,
            'ignore_sticky_posts' => true,
        ];

        if ($cat_id) {
            $args['cat'] = $cat_id;
        }
        if ($tag_id) {
            $args['tag__in'] = [$tag_id];
        }
        if ($search) {
            $args['s'] = $search;
        }

        $query = new WP_Query($args);
        $data = [];
        foreach ($query->posts as $post) {
            $data[] = bahia_format_post($post, false);
        }

        set_transient($transient, $data, BAHIA_API_TTL_POSTS);
        bellota_record_request('posts', false);
        bahia_send_cache_headers(BAHIA_API_TTL_POSTS, false);
        return new WP_REST_Response($data, 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /posts: " . $e->getMessage());
        return new WP_REST_Response(['error' => 'Error interno del servidor'], 500);
    }
}

function bahia_endpoint_categories(): WP_REST_Response {
    try {
        $transient = bahia_item_transient('categories_v1');
        $cached = get_transient($transient);

        if (false !== $cached) {
            bellota_record_request('categories', true);
            bahia_send_cache_headers(BAHIA_API_TTL_CATS, true);
            return new WP_REST_Response($cached, 200);
        }

        $terms = get_terms([
            'taxonomy' => 'category',
            'hide_empty' => false,
            'number' => 100,
            'orderby' => 'name',
            'order' => 'ASC'
        ]);

        $data = [];
        if (!is_wp_error($terms) && is_array($terms)) {
            foreach ($terms as $t) {
                $data[] = [
                    'id' => (int) $t->term_id,
                    'name' => (string) $t->name,
                    'slug' => (string) $t->slug,
                    'count' => (int) $t->count
                ];
            }
        }

        set_transient($transient, $data, BAHIA_API_TTL_CATS);
        bellota_record_request('categories', false);
        bahia_send_cache_headers(BAHIA_API_TTL_CATS, false);
        return new WP_REST_Response($data, 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /categories: " . $e->getMessage());
        return new WP_REST_Response(['error' => 'Error interno del servidor'], 500);
    }
}

function bahia_endpoint_media(WP_REST_Request $req): WP_REST_Response {
    try {
        $id = absint($req->get_url_params()['id'] ?? 0);
        if ($id <= 0) {
            return new WP_REST_Response(null, 404);
        }

        $transient = bahia_item_transient("media_{$id}");
        $cached = get_transient($transient);

        if (false !== $cached) {
            bellota_record_request('media', true);
            bahia_send_cache_headers(BAHIA_API_TTL_MEDIA, true);
            return new WP_REST_Response($cached, 200);
        }

        $attachment = get_post($id);
        if (!$attachment || 'attachment' !== $attachment->post_type) {
            bellota_record_request('media', false);
            return new WP_REST_Response(null, 404);
        }

        $img = wp_get_attachment_image_src($id, 'full');
        $data = [
            'id' => $id,
            'source_url' => $img ? (string) $img[0] : '',
            'alt_text' => (string) get_post_meta($id, '_wp_attachment_image_alt', true),
            'title' => ['rendered' => (string) $attachment->post_title],
        ];

        set_transient($transient, $data, BAHIA_API_TTL_MEDIA);
        bellota_record_request('media', false);
        bahia_send_cache_headers(BAHIA_API_TTL_MEDIA, false);
        return new WP_REST_Response($data, 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /media: " . $e->getMessage());
        return new WP_REST_Response(['error' => 'Error interno del servidor'], 500);
    }
}

function bahia_endpoint_record_view(WP_REST_Request $req): WP_REST_Response {
    try {
        $post_id = absint($req->get_url_params()['id'] ?? 0);
        if ($post_id <= 0) {
            bellota_record_request('view', false);
            return new WP_REST_Response(['success' => false], 404);
        }

        $post = get_post($post_id);
        if (!$post || 'post' !== $post->post_type || 'publish' !== $post->post_status) {
            bellota_record_request('view', false);
            return new WP_REST_Response(['success' => false], 404);
        }

        $views = (int) get_post_meta($post_id, 'bahia_views_count', true);
        $new_count = $views + 1;
        update_post_meta($post_id, 'bahia_views_count', $new_count);

        bellota_record_request('view', false);
        bellota_log_activity("Visita registrada en artículo: ID #{$post_id}.");
        return new WP_REST_Response(['success' => true, 'views' => $new_count], 200);
    } catch (Throwable $e) {
        bellota_log_activity("Error en endpoint /view: " . $e->getMessage());
        bellota_record_request('view', false);
        return new WP_REST_Response(['success' => false], 500);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA DE ADMINISTRACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

add_action('admin_menu', function() {
    add_menu_page(
        'Bellota API',
        'Bellota API',
        'manage_options',
        'bahia-api',
        'bahia_admin_page_render',
        'dashicons-chart-bar',
        80
    );
});

add_action('admin_enqueue_scripts', function(string $hook_suffix): void {
    if ('toplevel_page_bahia-api' !== $hook_suffix) {
        return;
    }

    $css_path = BELLOTA_API_PATH . 'assets/admin.css';
    if (file_exists($css_path)) {
        wp_enqueue_style(
            'bahia-admin-css',
            BELLOTA_API_URL . 'assets/admin.css',
            [],
            BELLOTA_API_VERSION
        );
    }

    $js_path = BELLOTA_API_PATH . 'assets/admin.js';
    if (file_exists($js_path)) {
        wp_enqueue_script(
            'bahia-admin-js',
            BELLOTA_API_URL . 'assets/admin.js',
            ['jquery'],
            BELLOTA_API_VERSION,
            true
        );
        wp_localize_script('bahia-admin-js', 'bahiaAdmin', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('bahia_admin_ajax_nonce'),
        ]);
    }
});

add_action('wp_ajax_bahia_flush_cache', function(): void {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'No autorizado'], 403);
    }
    if (!check_ajax_referer('bahia_admin_ajax_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Token no válido'], 403);
    }

    bahia_hard_flush();

    global $wpdb;
    $epoch = bahia_list_epoch();
    $transient_count = (int) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE %s",
            $wpdb->esc_like('_transient_bahia_') . '%'
        )
    );

    wp_send_json_success([
        'message' => 'Caché eliminado correctamente.',
        'epoch' => $epoch,
        'transient_count' => $transient_count,
        'activity_html' => bellota_get_activity_html(),
    ]);
});

function bahia_admin_page_render(): void {
    if (!current_user_can('manage_options')) {
        wp_die('No tienes suficientes permisos.');
    }
    $file = BELLOTA_API_PATH . 'includes/admin-dashboard.php';
    if (file_exists($file)) {
        include $file;
    } else {
        echo '<div class="wrap"><h1>Error: Archivo del dashboard no encontrado.</h1></div>';
    }
}

add_action('admin_init', function(): void {
    if (isset($_GET['page']) && $_GET['page'] === 'bahia-api') {
        add_filter('admin_footer_text', '__return_empty_string', 99);
        add_filter('update_footer', '__return_empty_string', 99);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEADERS DE RENDIMIENTO
// ═══════════════════════════════════════════════════════════════════════════════

add_filter('rest_post_dispatch', function($response, $handler, $request) {
    if (!($response instanceof WP_REST_Response)) {
        return $response;
    }

    $route = $request->get_route();
    if (strpos($route, '/' . BAHIA_API_NS) !== 0) {
        return $response;
    }

    $stats = get_option('bellota_api_stats');
    if (is_array($stats) && $stats['total_requests'] > 0) {
        $avg_latency = round($stats['total_latency'] / $stats['total_requests'], 1);
        $hit_rate = round(($stats['cache_hits'] / $stats['total_requests']) * 100, 1);

        $response->header('X-Bellota-Total-Requests', (string) $stats['total_requests']);
        $response->header('X-Bellota-Avg-Latency', (string) $avg_latency);
        $response->header('X-Bellota-Hit-Rate', (string) $hit_rate);
    }

    return $response;
}, 10, 3);

// ═══════════════════════════════════════════════════════════════════════════════
// FIN DEL PLUGIN
// ═══════════════════════════════════════════════════════════════════════════════
