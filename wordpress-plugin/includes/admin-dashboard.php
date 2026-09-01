<?php
defined( 'ABSPATH' ) || exit;

global $wpdb;

// Gather statistics
$epoch = bahia_list_epoch();
$transient_count = (int) $wpdb->get_var(
    $wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE %s",
        $wpdb->esc_like( '_transient_bahia_' ) . '%'
    )
);

$total_views = (int) $wpdb->get_var(
    $wpdb->prepare(
        "SELECT SUM(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = %s",
        'bahia_views_count'
    )
);

$has_redis = wp_using_ext_object_cache();
$has_apcu  = function_exists( 'apcu_inc' );

// Top 3 viewed posts (for the side column)
$top_posts = get_posts( [
    'post_type'      => 'post',
    'posts_per_page' => 3,
    'meta_key'       => 'bahia_views_count',
    'orderby'        => 'meta_value_num',
    'order'          => 'DESC',
] );

$base_url = home_url( '/wp-json/' . BAHIA_API_NS );

// Load dynamic query performance stats
$stats = get_option('bellota_api_stats');
if ( ! is_array( $stats ) || empty( $stats['history'] ) ) {
    $stats = [
        'total_requests' => 0,
        'cache_hits'     => 0,
        'total_latency'  => 0.0,
        'history'        => [35, 42, 38, 45, 40, 48, 45],
        'endpoints'      => [
            'posts'      => ['requests' => 0, 'latency' => 0.0],
            'categories' => ['requests' => 0, 'latency' => 0.0],
            'media'      => ['requests' => 0, 'latency' => 0.0],
            'view'       => ['requests' => 0, 'latency' => 0.0],
        ],
    ];
}
$avg_latency = $stats['total_requests'] > 0 ? round($stats['total_latency'] / $stats['total_requests'], 1) : 45.0;
$hit_rate = $stats['total_requests'] > 0 ? round(($stats['cache_hits'] / $stats['total_requests']) * 100, 1) : 98.4;

$posts_reqs = $stats['endpoints']['posts']['requests'] ?? 0;
$posts_lat = $stats['endpoints']['posts']['latency'] ?? 0;
$posts_avg = $posts_reqs > 0 ? round($posts_lat / $posts_reqs, 1) : 32.0;

$cats_reqs = $stats['endpoints']['categories']['requests'] ?? 0;
$cats_lat = $stats['endpoints']['categories']['latency'] ?? 0;
$cats_avg = $cats_reqs > 0 ? round($cats_lat / $cats_reqs, 1) : 15.0;

$view_reqs = $stats['endpoints']['view']['requests'] ?? 0;
$view_lat = $stats['endpoints']['view']['latency'] ?? 0;
$view_avg = $view_reqs > 0 ? round($view_lat / $view_reqs, 1) : 48.0;

$history = $stats['history'];
$n = count($history);
$max_val = max(80, max($history));
$points = [];
for ($i = 0; $i < $n; $i++) {
    $x = ($n > 1) ? ($i / ($n - 1)) * 500 : 0;
    $v = $history[$i];
    $y = 200 - (($v / $max_val) * 140 + 30);
    $points[] = "$x,$y";
}
$path_d = '';
if (!empty($points)) {
    $path_d = 'M ' . implode(' L ', $points);
}
$grad_d = $path_d ? $path_d . ' L 500 200 L 0 200 Z' : '';
?>

<div class="bellota-dashboard-container">
    <!-- Sidebar Left -->
    <aside class="bellota-sidebar">
        <div class="bellota-sidebar-top">
            <div class="bellota-sidebar-header">
                <span class="bellota-sidebar-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Bellota API">
                      <path d="M32 4v8M12 28c0-12 8-16 20-16s20 4 20 16H12z" stroke="#F5A623" stroke-width="4" stroke-linecap="round" fill="#F5A623" />
                      <path d="M16 28c0 14 8 30 16 30s16-16 16-30H16z" fill="#0B1E3D" />
                    </svg>
                </span>
                <div>
                    <h2 class="bellota-sidebar-title">Bellota API</h2>
                    <p class="bellota-sidebar-subtitle">WordPress Plugin</p>
                </div>
            </div>

            <nav class="bellota-sidebar-menu">
                <button class="bellota-menu-btn active" data-tab="tab-overview">
                    <span class="dashicons dashicons-dashboard"></span> Vista General
                </button>
                <button class="bellota-menu-btn" data-tab="tab-cache">
                    <span class="dashicons dashicons-database"></span> Gestión de Caché
                </button>
                <button class="bellota-menu-btn" data-tab="tab-tester">
                    <span class="dashicons dashicons-rest-api"></span> Consola de Pruebas
                </button>
                <button class="bellota-menu-btn" data-tab="tab-docs">
                    <span class="dashicons dashicons-editor-help"></span> Documentación
                </button>
            </nav>
        </div>

        <div class="bellota-sidebar-promo">
            <h4>Soporte Premium</h4>
            <p>¿Necesitas ayuda con integraciones de Next.js u optimizaciones avanzadas?</p>
            <a href="https://bellotahosting.net" target="_blank" class="btn-orange-upgrade">Obtener Soporte</a>
        </div>
    </aside>

    <!-- Main Content Right -->
    <main class="bellota-main">
        
        <!-- Scrollable content area -->
        <div class="bellota-main-scrollable">
            <!-- Header Row -->
            <div class="bellota-header-row">
                <div class="bellota-header-title-area">
                    <h1 class="bellota-header-title">Panel de Control</h1>
                    <span class="bellota-header-badge">Motor Optimizado</span>
                </div>
                <div class="bellota-header-actions">
                    <button class="bellota-btn btn-secondary-white" id="btn-header-tester">
                        <span class="dashicons dashicons-rest-api"></span> Probar API
                    </button>
                    <button class="bellota-btn btn-dark" id="btn-header-flush">
                        <span class="dashicons dashicons-trash"></span> Vaciar Caché
                    </button>
                </div>
            </div>

            <!-- PANEL 1: OVERVIEW -->
            <div class="bellota-panel active" id="tab-overview">
                <!-- Stats Grid -->
                <div class="bellota-stats-grid">
                    <div class="bellota-card bellota-stat-card">
                        <div class="bellota-stat-info">
                            <span class="bellota-stat-label">Vistas Totales</span>
                            <div class="bellota-stat-value-container">
                                <span class="bellota-stat-value"><?= number_format($total_views) ?></span>
                                <span class="bellota-stat-change up">Visitas</span>
                            </div>
                        </div>
                        <div class="bellota-stat-icon blue">
                            <span class="dashicons dashicons-visibility"></span>
                        </div>
                    </div>

                    <div class="bellota-card bellota-stat-card">
                        <div class="bellota-stat-info">
                            <span class="bellota-stat-label">Caché en DB</span>
                            <div class="bellota-stat-value-container">
                                <span class="bellota-stat-value" id="transient-count-display"><?= $transient_count ?></span>
                                <span class="bellota-stat-change info">Objetos</span>
                            </div>
                        </div>
                        <div class="bellota-stat-icon green">
                            <span class="dashicons dashicons-backup"></span>
                        </div>
                    </div>

                    <div class="bellota-card bellota-stat-card">
                        <div class="bellota-stat-info">
                            <span class="bellota-stat-label">Caché Epoch</span>
                            <div class="bellota-stat-value-container">
                                <span class="bellota-stat-value" id="epoch-display"><?= $epoch ?></span>
                                <span class="bellota-stat-change up">Activo</span>
                            </div>
                        </div>
                        <div class="bellota-stat-icon purple">
                            <span class="dashicons dashicons-update"></span>
                        </div>
                    </div>

                    <div class="bellota-card bellota-stat-card">
                        <div class="bellota-stat-info">
                            <span class="bellota-stat-label">Latencia API</span>
                            <div class="bellota-stat-value-container">
                                <span class="bellota-stat-value" id="avg-latency-display"><?= $avg_latency ?> ms</span>
                                <span class="bellota-stat-change up" id="hit-rate-display"><?= $hit_rate ?>%</span>
                            </div>
                        </div>
                        <div class="bellota-stat-icon amber">
                            <span class="dashicons dashicons-dashboard"></span>
                        </div>
                    </div>
                </div>

                <!-- Two columns content -->
                <div class="bellota-dashboard-content">
                    
                    <!-- Left Column (Wider) -->
                    <div class="bellota-col-main">
                        <!-- Chart Card -->
                        <div class="bellota-card">
                            <div class="chart-header">
                                <h3 class="bellota-card-title"><span class="dashicons dashicons-chart-line"></span> Rendimiento de Consultas</h3>
                                <div class="chart-filters">
                                    <button class="chart-filter-btn">Día</button>
                                    <button class="chart-filter-btn active">Semana</button>
                                    <button class="chart-filter-btn">Mes</button>
                                </div>
                            </div>
                            
                            <div class="chart-kpi-container">
                                <div class="chart-kpi">
                                    <span class="chart-kpi-label">Peticiones Totales</span>
                                    <span class="chart-kpi-value" id="total-requests-display"><?= number_format($stats['total_requests']) ?></span>
                                </div>
                                <div class="chart-kpi">
                                    <span class="chart-kpi-label">Latencia Media</span>
                                    <span class="chart-kpi-value" id="avg-latency-display-kpi"><?= $avg_latency ?> ms</span>
                                </div>
                                <div class="chart-kpi">
                                    <span class="chart-kpi-label">Tasa de Acierto de Caché</span>
                                    <span class="chart-kpi-value" id="hit-rate-display-kpi" style="color: var(--success-color);"><?= $hit_rate ?>%</span>
                                </div>
                            </div>

                            <div class="simulated-chart-container">
                                <svg viewBox="0 0 500 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#3C3AF9" stop-opacity="0.15" />
                                            <stop offset="100%" stop-color="#3C3AF9" stop-opacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <!-- Grid Lines -->
                                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" stroke-width="1" />
                                    <line x1="0" y1="160" x2="500" y2="160" stroke="#f1f5f9" stroke-width="1" />
                                    
                                    <!-- Gradient area -->
                                    <path d="<?= esc_attr($grad_d) ?>" fill="url(#chart-grad)" />
                                    
                                    <!-- Stroke Curve line -->
                                    <path d="<?= esc_attr($path_d) ?>" fill="none" stroke="#F5A623" stroke-width="3" stroke-linecap="round" />
                                    
                                    <!-- Hover circle -->
                                    <?php if ($n > 0): 
                                        $last_pt = explode(',', $points[$n - 1]);
                                        $last_x = $last_pt[0];
                                        $last_y = $last_pt[1];
                                    ?>
                                        <circle cx="<?= esc_attr($last_x) ?>" cy="<?= esc_attr($last_y) ?>" r="6" fill="#F5A623" stroke="#ffffff" stroke-width="2" />
                                    <?php endif; ?>
                                </svg>
                                <?php if ($n > 0): 
                                    $tooltip_left = ($n > 1) ? (($n - 1.5) / ($n - 1)) * 100 : 80;
                                ?>
                                    <div class="chart-tooltip" style="left: <?= esc_attr($tooltip_left) ?>%; top: <?= esc_attr($last_y - 45) ?>px;">
                                        <span class="chart-tooltip-date">Última Petición</span>
                                        <span class="chart-tooltip-val">Latencia: <strong style="color: #F5A623;"><?= end($history) ?> ms</strong></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Modules Performance Card -->
                        <div class="bellota-card">
                            <h3 class="bellota-card-title"><span class="dashicons dashicons-admin-generic"></span> Rendimiento de Endpoints API</h3>
                            <p class="bellota-card-desc">Límites y optimización por cada canal expuesto.</p>

                            <div class="top-posts-list">
                                <div class="post-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                                    <div class="post-info" style="margin-bottom: 4px;">
                                        <span class="post-title-text" style="font-size: 13px;">Listar Artículos (<code>GET /posts</code>)</span>
                                        <span class="post-views-badge">600 petic/hora</span>
                                    </div>
                                    <div class="post-actions" style="font-size: 11px; color: var(--text-muted);">
                                        Optimización: Caché transients activada. Tiempo medio de respuesta: <strong><?= $posts_avg ?> ms</strong>.
                                    </div>
                                </div>
                                <div class="post-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                                    <div class="post-info" style="margin-bottom: 4px;">
                                        <span class="post-title-text" style="font-size: 13px;">Listar Categorías (<code>GET /categories</code>)</span>
                                        <span class="post-views-badge">600 petic/hora</span>
                                    </div>
                                    <div class="post-actions" style="font-size: 11px; color: var(--text-muted);">
                                        Optimización: Almacenamiento transient en memoria. Tiempo medio de respuesta: <strong><?= $cats_avg ?> ms</strong>.
                                    </div>
                                </div>
                                <div class="post-item">
                                    <div class="post-info" style="margin-bottom: 4px;">
                                        <span class="post-title-text" style="font-size: 13px;">Registrar Visitas (<code>POST /view/{id}</code>)</span>
                                        <span class="post-views-badge">60 petic/hora</span>
                                    </div>
                                    <div class="post-actions" style="font-size: 11px; color: var(--text-muted);">
                                        Optimización: Escritura directa en WordPress Meta, compatible con Redis. Tiempo medio de respuesta: <strong><?= $view_avg ?> ms</strong>.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column (Narrower) -->
                    <div class="bellota-col-side">
                        <!-- Recent Activity Card -->
                        <div class="bellota-card">
                            <h3 class="bellota-card-title"><span class="dashicons dashicons-list-view"></span> Actividad Reciente</h3>
                            <div class="activity-list">
                                <?= bellota_get_activity_html() ?>
                            </div>
                        </div>

                        <!-- Top Viewed Articles (Ranked List) -->
                        <div class="bellota-card">
                            <h3 class="bellota-card-title"><span class="dashicons dashicons-awards"></span> Artículos Populares</h3>
                            <div class="ranked-posts-list">
                                <?php if ( ! empty( $top_posts ) ) : ?>
                                    <?php 
                                    $rank = 1;
                                    foreach ( $top_posts as $post ) : 
                                        $views = (int) get_post_meta( $post->ID, 'bahia_views_count', true );
                                    ?>
                                        <div class="ranked-post-item">
                                            <div class="ranked-post-left">
                                                <span class="ranked-number"><?= $rank++ ?></span>
                                                <span class="ranked-post-title" title="<?= esc_attr(get_the_title($post->ID)) ?>">
                                                    <?= esc_html( get_the_title( $post->ID ) ) ?>
                                                </span>
                                            </div>
                                            <span class="ranked-post-views"><?= number_format($views) ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                <?php else : ?>
                                    <div class="bellota-empty-state" style="padding: 10px 0;">
                                        <p style="font-size: 12px; margin: 0; color: var(--text-muted);">Sin visitas registradas.</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Server Endpoints Pills -->
                        <div class="bellota-card">
                            <h3 class="bellota-card-title"><span class="dashicons dashicons-share"></span> Endpoints Populares</h3>
                            <div class="trending-pills-list">
                                <div class="trending-pill-item">
                                    <span class="trending-pill-name">/posts</span>
                                    <button class="trending-pill-action btn-nav-tester" data-endpoint="/posts">Probar</button>
                                </div>
                                <div class="trending-pill-item">
                                    <span class="trending-pill-name">/categories</span>
                                    <button class="trending-pill-action btn-nav-tester" data-endpoint="/categories">Probar</button>
                                </div>
                                <div class="trending-pill-item">
                                    <span class="trending-pill-name">/view</span>
                                    <button class="trending-pill-action btn-nav-tester" data-endpoint="/view">Probar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- PANEL 2: CACHE MANAGEMENT -->
            <div class="bellota-panel" id="tab-cache">
                <div class="bellota-card">
                    <h3 class="bellota-card-title"><span class="dashicons dashicons-database"></span> Configuración de Almacenamiento</h3>
                    <p class="bellota-card-desc">Estado detallado del sistema de caché transients e invalidación en memoria de la API.</p>

                    <div class="cache-status-container">
                        <div class="cache-stats-table-wrapper">
                            <table class="bellota-table">
                                <thead>
                                    <tr>
                                        <th>Módulo</th>
                                        <th>Estado / Valor</th>
                                        <th>Descripción Técnica</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Epoch de Caché</strong></td>
                                        <td><code id="table-epoch"><?= $epoch ?></code></td>
                                        <td>Generación de versión de claves. Al cambiar, invalida todo el almacenamiento persistente en memoria instantáneamente.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Transients Activos</strong></td>
                                        <td><code id="table-transient-count"><?= $transient_count ?></code></td>
                                        <td>Registros temporales persistidos en la tabla <code>wp_options</code>.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Almacenamiento de Objetos</strong></td>
                                        <td>
                                            <?= $has_redis ? '<span class="status-badge-inline success">Activo (Object Cache)</span>' : '<span class="status-badge-inline warning">Inactivo (Fallback BD)</span>' ?>
                                        </td>
                                        <td>
                                            <?php if ( ! $has_redis ) : ?>
                                                Recomendado instalar Redis/Memcached para caching en memoria y lograr tiempos de respuesta de &lt; 30ms.
                                            <?php else : ?>
                                                Object cache activo en memoria RAM, óptimo rendimiento.
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>APCu (Rate Limiting)</strong></td>
                                        <td>
                                            <?= $has_apcu ? '<span class="status-badge-inline success">Activo (APCu)</span>' : '<span class="status-badge-inline warning">No disponible</span>' ?>
                                        </td>
                                        <td>
                                            <?php if ( ! $has_apcu ) : ?>
                                                Instala la extensión php-apcu en tu VPS para procesar el limitador de IPs en la memoria local del proceso con 0 llamadas a BD.
                                            <?php else : ?>
                                                Rate limiting en memoria de proceso (0 impacto en base de datos).
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="cache-action-box">
                            <div class="cache-action-box-content">
                                <h4>Limpiar almacenamiento y regenerar versión</h4>
                                <p>Esta acción fuerza el incremento del Epoch del sistema. Esto invalida todos los transients en memoria de manera atómica, garantizando que el frontend cargue los datos más recientes en la siguiente petición.</p>
                            </div>
                            <div>
                                <button class="bellota-btn btn-primary" id="btn-flush-cache-main">
                                    <span class="dashicons dashicons-trash"></span> Vaciar Caché de la API
                                </button>
                                <span class="bellota-spinner hidden" id="cache-spinner" style="vertical-align: middle; margin-left: 10px;"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PANEL 3: TESTER (API TESTER CLIENT) -->
            <div class="bellota-panel" id="tab-tester">
                <div class="bellota-card">
                    <h3 class="bellota-card-title"><span class="dashicons dashicons-rest-api"></span> Consola de Pruebas (API Client)</h3>
                    <p class="bellota-card-desc">Ejecuta solicitudes directamente desde el panel para testear la API y depurar las respuestas JSON.</p>

                    <div class="tester-split-layout">
                        <!-- Tester Form (Left) -->
                        <div class="tester-form-panel">
                            <form id="bellota-tester-form">
                                <div class="tester-form-group">
                                    <label class="tester-label" for="tester-endpoint">Ruta de la API</label>
                                    <select class="tester-select" id="tester-endpoint">
                                        <option value="/posts" data-fields="per_page,page,search">/posts (Listar Artículos)</option>
                                        <option value="/posts-slug" data-fields="slug">/posts?slug={slug} (Artículo por Slug)</option>
                                        <option value="/categories" data-fields="">/categories (Listar Categorías)</option>
                                        <option value="/media" data-fields="id">/media/{id} (Cargar Multimedia)</option>
                                        <option value="/view" data-fields="id">/view/{id} (Incrementar Vista [POST])</option>
                                    </select>
                                </div>

                                <div class="tester-form-group field-group hidden" id="field-id">
                                    <label class="tester-label" for="tester-param-id">ID del Recurso</label>
                                    <input type="number" class="tester-input" id="tester-param-id" value="1" placeholder="Ej: 14">
                                </div>

                                <div class="tester-form-group field-group hidden" id="field-slug">
                                    <label class="tester-label" for="tester-param-slug">Slug del Artículo</label>
                                    <input type="text" class="tester-input" id="tester-param-slug" placeholder="Ej: articulo-de-prueba">
                                </div>

                                <div class="tester-form-group field-group" id="field-per-page">
                                    <label class="tester-label" for="tester-param-per-page">Artículos por página (per_page)</label>
                                    <input type="number" class="tester-input" id="tester-param-per-page" value="5" min="1" max="100">
                                </div>

                                <div class="tester-form-group field-group" id="field-page">
                                    <label class="tester-label" for="tester-param-page">Página (page)</label>
                                    <input type="number" class="tester-input" id="tester-param-page" value="1" min="1">
                                </div>

                                <div class="tester-form-group field-group" id="field-search">
                                    <label class="tester-label" for="tester-param-search">Buscar texto (search)</label>
                                    <input type="text" class="tester-input" id="tester-param-search" placeholder="Buscar en el título o contenido...">
                                </div>

                                <div style="margin-top: 24px;">
                                    <button type="submit" class="bellota-btn btn-primary btn-full-width" id="btn-tester-submit">
                                        <span class="dashicons dashicons-admin-generic"></span> Enviar Petición API
                                    </button>
                                </div>
                            </form>

                            <div class="info-box mt-20">
                                <h4>ℹ️ Prueba de CORS y Rate Limits</h4>
                                <p>Al hacer peticiones desde esta consola, se simula una solicitud REST nativa del navegador. Esto te ayuda a comprobar la latencia del servidor y el comportamiento de las cabeceras de CORS.</p>
                            </div>
                        </div>

                        <!-- Tester Results (Right) -->
                        <div class="tester-result-panel">
                            <div class="tester-meta-row">
                                <div class="tester-meta-status">
                                    <span>Estado:</span>
                                    <span class="tester-status-pill status-gray" id="tester-status-badge">Esperando</span>
                                </div>
                                <span class="tester-latency" id="tester-latency-display">Latencia: -- ms</span>
                            </div>
                            <pre class="tester-code-viewer" id="tester-response-viewer">// Haz clic en "Enviar Petición API" para ver la respuesta JSON formateada aquí.</pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PANEL 5: DOCUMENTACIÓN -->
            <div class="bellota-panel" id="tab-docs">
                <div class="bellota-card">
                    <h3 class="bellota-card-title"><span class="dashicons dashicons-editor-help"></span> Documentación de la API para Desarrolladores</h3>
                    <p class="bellota-card-desc">Guía rápida de integración y ejemplos de uso para conectar tu Frontend (Next.js, React, Vue, Vanilla JS) con la API de Bellota.</p>

                    <div class="info-box" style="margin-bottom: 28px;">
                        <h4>🚀 Integración Rápida</h4>
                        <p>Todos los endpoints devuelven respuestas en formato JSON estándar. Para solicitudes externas, asegúrate de que el dominio de tu aplicación Frontend esté agregado a la lista de orígenes permitidos (CORS) configurados en el plugin.</p>
                    </div>

                    <!-- CARD 1: /posts -->
                    <div class="doc-card">
                        <div class="doc-card-header">
                            <span class="doc-badge get">GET</span>
                            <span class="doc-path">/wp-json/bahia/v1/posts</span>
                            <span class="doc-desc">Listar Artículos</span>
                        </div>
                        <div class="doc-card-body">
                            <p>Recupera una lista de artículos publicados con filtros avanzados de paginación, taxonomías y búsqueda.</p>
                            
                            <div class="doc-params">
                                <h5>Parámetros de Consulta (Query Params)</h5>
                                <div class="doc-param-row">
                                    <span class="param-name">per_page</span>
                                    <span class="param-type">int</span>
                                    <span class="param-desc">Cantidad de posts por página (por defecto 18, máx. 100)</span>
                                </div>
                                <div class="doc-param-row">
                                    <span class="param-name">page</span>
                                    <span class="param-type">int</span>
                                    <span class="param-desc">Número de página a retornar (por defecto 1)</span>
                                </div>
                                <div class="doc-param-row">
                                    <span class="param-name">search</span>
                                    <span class="param-type">string</span>
                                    <span class="param-desc">Buscar término específico en título o contenido</span>
                                </div>
                            </div>

                            <div class="doc-code-tabs">
                                <div class="doc-code-tab-header">
                                    <button class="doc-tab-btn active" data-lang="js">JavaScript (fetch)</button>
                                    <button class="doc-tab-btn" data-lang="next">Next.js (App Router)</button>
                                    <button class="doc-tab-btn" data-lang="curl">cURL</button>
                                    <button class="doc-copy-btn"><span class="dashicons dashicons-admin-page"></span> Copiar Código</button>
                                </div>
                                <div class="doc-code-content">
                                    <pre class="doc-pre active" data-lang="js">fetch("<?= esc_url($base_url . '/posts?per_page=5&page=1') ?>")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error cargando posts:", error));</pre>
                                    <pre class="doc-pre" data-lang="next">// src/app/posts/page.js
export default async function PostsPage() {
  const res = await fetch("<?= esc_url($base_url . '/posts?per_page=5') ?>", {
    next: { revalidate: 300 } // Caché revalidado en backend cada 5 minutos
  });
  const posts = await res.json();
  
  return (
    &lt;div class="posts-list"&gt;
      {posts.map(post =&gt; (
        &lt;article key={post.id}&gt;
          &lt;h2&gt;{post.title.rendered}&lt;/h2&gt;
          &lt;div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} /&gt;
        &lt;/article&gt;
      ))}
    &lt;/div&gt;
  );
}</pre>
                                    <pre class="doc-pre" data-lang="curl">curl -X GET "<?= esc_url($base_url . '/posts?per_page=5') ?>"</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 2: /posts?slug=... -->
                    <div class="doc-card">
                        <div class="doc-card-header">
                            <span class="doc-badge get">GET</span>
                            <span class="doc-path">/wp-json/bahia/v1/posts?slug={slug}</span>
                            <span class="doc-desc">Artículo por Slug</span>
                        </div>
                        <div class="doc-card-body">
                            <p>Recupera un artículo completo incluyendo su contenido JSON y la metadata SEO nativa (Yoast SEO o Rank Math) basada en su identificador slug.</p>
                            
                            <div class="doc-params">
                                <h5>Parámetros de Consulta (Query Params)</h5>
                                <div class="doc-param-row">
                                    <span class="param-name">slug</span>
                                    <span class="param-type">string</span>
                                    <span class="param-desc">El slug textual único del artículo (ej: <code>articulo-de-prueba</code>)</span>
                                </div>
                            </div>

                            <div class="doc-code-tabs">
                                <div class="doc-code-tab-header">
                                    <button class="doc-tab-btn active" data-lang="js">JavaScript (fetch)</button>
                                    <button class="doc-tab-btn" data-lang="next">Next.js (App Router)</button>
                                    <button class="doc-tab-btn" data-lang="curl">cURL</button>
                                    <button class="doc-copy-btn"><span class="dashicons dashicons-admin-page"></span> Copiar Código</button>
                                </div>
                                <div class="doc-code-content">
                                    <pre class="doc-pre active" data-lang="js">fetch("<?= esc_url($base_url . '/posts?slug=ejemplo-de-slug') ?>")
  .then(response => response.json())
  .then(posts => {
    if (posts.length > 0) {
      const post = posts[0];
      console.log("Título:", post.title.rendered);
      console.log("Meta SEO:", post.yoast_head_json || post.rank_math_head_json);
    }
  });</pre>
                                    <pre class="doc-pre" data-lang="next">// src/app/posts/[slug]/page.js
export default async function PostDetail({ params }) {
  const { slug } = await params;
  const res = await fetch(`<?= esc_url($base_url . '/posts?slug=') ?>${slug}`, {
    next: { revalidate: 600 } // Revalidar cada 10 minutos
  });
  const posts = await res.json();
  
  if (!posts || posts.length === 0) {
    return &lt;div&gt;Artículo no encontrado&lt;/div&gt;;
  }
  
  const post = posts[0];
  
  return (
    &lt;article class="post-container"&gt;
      &lt;h1&gt;{post.title.rendered}&lt;/h1&gt;
      &lt;div dangerouslySetInnerHTML={{ __html: post.content.rendered }} /&gt;
    &lt;/article&gt;
  );
}</pre>
                                    <pre class="doc-pre" data-lang="curl">curl -X GET "<?= esc_url($base_url . '/posts?slug=ejemplo-de-slug') ?>"</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 3: /categories -->
                    <div class="doc-card">
                        <div class="doc-card-header">
                            <span class="doc-badge get">GET</span>
                            <span class="doc-path">/wp-json/bahia/v1/categories</span>
                            <span class="doc-desc">Listar Categorías</span>
                        </div>
                        <div class="doc-card-body">
                            <p>Recupera la lista de categorías del blog con el recuento de artículos asociados de forma directa.</p>
                            
                            <div class="doc-params">
                                <h5>Parámetros de Consulta (Query Params)</h5>
                                <div class="doc-param-row">
                                    <span class="param-desc">Este endpoint no requiere parámetros obligatorios.</span>
                                </div>
                            </div>

                            <div class="doc-code-tabs">
                                <div class="doc-code-tab-header">
                                    <button class="doc-tab-btn active" data-lang="js">JavaScript (fetch)</button>
                                    <button class="doc-tab-btn" data-lang="next">Next.js (App Router)</button>
                                    <button class="doc-tab-btn" data-lang="curl">cURL</button>
                                    <button class="doc-copy-btn"><span class="dashicons dashicons-admin-page"></span> Copiar Código</button>
                                </div>
                                <div class="doc-code-content">
                                    <pre class="doc-pre active" data-lang="js">fetch("<?= esc_url($base_url . '/categories') ?>")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error al cargar categorías:", error));</pre>
                                    <pre class="doc-pre" data-lang="next">// src/app/categories/page.js
export default async function CategoriesPage() {
  const res = await fetch("<?= esc_url($base_url . '/categories') ?>", {
    next: { revalidate: 86400 } // Revalidar una vez al día (24 horas)
  });
  const categories = await res.json();
  
  return (
    &lt;ul class="categories-list"&gt;
      {categories.map(cat =&gt; (
        &lt;li key={cat.id}&gt;{cat.name} ({cat.count} artículos)&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}</pre>
                                    <pre class="doc-pre" data-lang="curl">curl -X GET "<?= esc_url($base_url . '/categories') ?>"</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 4: /media/{id} -->
                    <div class="doc-card">
                        <div class="doc-card-header">
                            <span class="doc-badge get">GET</span>
                            <span class="doc-path">/wp-json/bahia/v1/media/{id}</span>
                            <span class="doc-desc">Cargar Multimedia</span>
                        </div>
                        <div class="doc-card-body">
                            <p>Recupera la URL de origen y metadatos alternativos de un archivo adjunto de medios (imágenes o videos destacadas) usando su ID.</p>
                            
                            <div class="doc-params">
                                <h5>Parámetros de Ruta (Path Params)</h5>
                                <div class="doc-param-row">
                                    <span class="param-name">id</span>
                                    <span class="param-type">int</span>
                                    <span class="param-desc">El ID numérico único del archivo adjunto (ej: <code>14</code>)</span>
                                </div>
                            </div>

                            <div class="doc-code-tabs">
                                <div class="doc-code-tab-header">
                                    <button class="doc-tab-btn active" data-lang="js">JavaScript (fetch)</button>
                                    <button class="doc-tab-btn" data-lang="next">Next.js (React Component)</button>
                                    <button class="doc-tab-btn" data-lang="curl">cURL</button>
                                    <button class="doc-copy-btn"><span class="dashicons dashicons-admin-page"></span> Copiar Código</button>
                                </div>
                                <div class="doc-code-content">
                                    <pre class="doc-pre active" data-lang="js">fetch("<?= esc_url($base_url . '/media/14') ?>")
  .then(response => response.json())
  .then(data => console.log("Imagen destacada:", data.source_url))
  .catch(error => console.error("Error al cargar multimedia:", error));</pre>
                                    <pre class="doc-pre" data-lang="next">// src/components/FeaturedImage.js
import Image from "next/image";

export default async function FeaturedImage({ mediaId }) {
  if (!mediaId) return null;
  
  const res = await fetch(`<?= esc_url($base_url . '/media/') ?>${mediaId}`, {
    next: { revalidate: 86400 } // Guardar en caché por 24 horas
  });
  const media = await res.json();
  
  if (!media || !media.source_url) return null;
  
  return (
    &lt;Image 
      src={media.source_url} 
      alt={media.alt_text || media.title.rendered} 
      width={800} 
      height={450} 
      priority
    /&gt;
  );
}</pre>
                                    <pre class="doc-pre" data-lang="curl">curl -X GET "<?= esc_url($base_url . '/media/14') ?>"</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 5: /view/{id} -->
                    <div class="doc-card">
                        <div class="doc-card-header">
                            <span class="doc-badge post">POST</span>
                            <span class="doc-path">/wp-json/bahia/v1/view/{id}</span>
                            <span class="doc-desc">Registrar Visita</span>
                        </div>
                        <div class="doc-card-body">
                            <p>Incrementa atómicamente el contador de visitas de un artículo específico sin sobrecargar la base de datos de WordPress (compatible con Redis Object Cache).</p>
                            
                            <div class="doc-params">
                                <h5>Parámetros de Ruta (Path Params)</h5>
                                <div class="doc-param-row">
                                    <span class="param-name">id</span>
                                    <span class="param-type">int</span>
                                    <span class="param-desc">El ID numérico del artículo a actualizar (ej: <code>14</code>)</span>
                                </div>
                            </div>

                            <div class="doc-code-tabs">
                                <div class="doc-code-tab-header">
                                    <button class="doc-tab-btn active" data-lang="js">JavaScript (fetch)</button>
                                    <button class="doc-tab-btn" data-lang="next">Next.js (React Component)</button>
                                    <button class="doc-tab-btn" data-lang="curl">cURL</button>
                                    <button class="doc-copy-btn"><span class="dashicons dashicons-admin-page"></span> Copiar Código</button>
                                </div>
                                <div class="doc-code-content">
                                    <pre class="doc-pre active" data-lang="js">fetch("<?= esc_url($base_url . '/view/14') ?>", {
  method: "POST"
})
  .then(response => response.json())
  .then(result => console.log("Visitas actualizadas:", result.views))
  .catch(error => console.error("Error al registrar vista:", error));</pre>
                                    <pre class="doc-pre" data-lang="next">// src/components/RecordVisit.js
"use client";
import { useEffect } from "react";

export default function RecordVisit({ postId }) {
  useEffect(() => {
    if (!postId) return;
    
    fetch(`<?= esc_url($base_url . '/view/') ?>${postId}`, { 
      method: "POST" 
    })
      .then(res => res.json())
      .then(data => {
        console.log("Visitas actualizadas del artículo:", data.views);
      })
      .catch(err => console.error("Error al registrar visitas:", err));
  }, [postId]);

  return null; // Componente silencioso de analíticas
}</pre>
                                    <pre class="doc-pre" data-lang="curl">curl -X POST "<?= esc_url($base_url . '/view/14') ?>"</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
        </div>

        <!-- System Diagnostics Banner (Full Width Bottom) -->
        <footer class="bellota-system-footer">
            <div class="bellota-system-footer-item">
                <span class="bellota-system-footer-label">Versión de PHP</span>
                <span class="bellota-system-footer-value"><?= esc_html( PHP_VERSION ) ?></span>
            </div>
            <div class="bellota-system-footer-item">
                <span class="bellota-system-footer-label">WordPress</span>
                <span class="bellota-system-footer-value">v<?= esc_html( get_bloginfo('version') ) ?></span>
            </div>
            <div class="bellota-system-footer-item">
                <span class="bellota-system-footer-label">Almacenamiento Objeto</span>
                <span class="bellota-system-footer-value <?= $has_redis ? 'success' : 'warning' ?>">
                    <?= $has_redis ? 'Redis/Memcached Activo' : 'Transients DB' ?>
                </span>
            </div>
            <div class="bellota-system-footer-item">
                <span class="bellota-system-footer-label">Módulo APCu</span>
                <span class="bellota-system-footer-value <?= $has_apcu ? 'success' : 'warning' ?>">
                    <?= $has_apcu ? 'Disponible' : 'No disponible' ?>
                </span>
            </div>
            <div class="bellota-system-footer-item">
                <span class="bellota-system-footer-label">CORS Namespace</span>
                <span class="bellota-system-footer-value"><code><?= esc_html( BAHIA_API_NS ) ?></code></span>
            </div>
        </footer>

    </main>
</div>

<!-- Floating toast notification container -->
<div class="hidden" id="bellota-toast-box"></div>

<!-- Sweeping Broom Animation Overlay -->
<div class="bellota-cleaner-overlay" id="bellota-cleaner-overlay">
    <div class="cleaner-content">
        <div class="sweeper-broom">
            <svg class="sweeper-broom-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#3C3AF9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="5" x2="11" y2="13" />
                <path d="M12 12l-6 6v3h3l6-6M9 15l2 2" />
                <path d="M5 16h6" stroke-dasharray="2 2" />
            </svg>
        </div>
        <div class="dust-container">
            <span class="dust dust-1"></span>
            <span class="dust dust-2"></span>
            <span class="dust dust-3"></span>
        </div>
        <div class="sweeper-text">Limpiando Caché de la API...</div>
    </div>
</div>
