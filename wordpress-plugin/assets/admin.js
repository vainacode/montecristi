jQuery(document).ready(function ($) {
    // ═══════════════════════════════════════════════════════════════════════════
    // VERTICAL TAB NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════════
    $('.bellota-menu-btn').on('click', function (e) {
        e.preventDefault();
        var targetTab = $(this).data('tab');
        
        // Remove active class from buttons & panels
        $('.bellota-menu-btn').removeClass('active');
        $('.bellota-panel').removeClass('active');
        
        // Activate current selection
        $(this).addClass('active');
        $('#' + targetTab).addClass('active');
    });

    // Header Actions navigation bindings
    $('#btn-header-tester').on('click', function (e) {
        e.preventDefault();
        $('.bellota-menu-btn[data-tab="tab-tester"]').trigger('click');
    });

    $('#btn-header-flush').on('click', function (e) {
        e.preventDefault();
        // Trigger main cache flush action
        $('#btn-flush-cache-main').trigger('click');
    });

    // Card shortcuts navigation to Tester Tab
    $('.btn-nav-tester').on('click', function (e) {
        e.preventDefault();
        var endpoint = $(this).data('endpoint');
        $('#tester-endpoint').val(endpoint).trigger('change');
        $('.bellota-menu-btn[data-tab="tab-tester"]').trigger('click');
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // FLOATING TOAST NOTIFICATION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    function showToast(message) {
        var $toastBox = $('#bellota-toast-box');
        $toastBox.html(
            '<div class="bellota-toast">' +
            '    <span class="dashicons dashicons-yes" style="color: #10b981; font-size: 20px; width: 20px; height: 20px; line-height: 20px;"></span>' +
            '    <span>' + message + '</span>' +
            '</div>'
        );
        $toastBox.removeClass('hidden').fadeIn();
        
        setTimeout(function () {
            $toastBox.fadeOut(function () {
                $toastBox.addClass('hidden');
            });
        }, 4000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CACHE FLUSHING (AJAX)
    // ═══════════════════════════════════════════════════════════════════════════
    function flushCacheAPI(buttonElement, spinnerElement) {
        if (buttonElement.prop('disabled')) {
            return;
        }

        buttonElement.prop('disabled', true);
        if (spinnerElement) spinnerElement.removeClass('hidden');

        // Activar la animación de barrido (escoba)
        var $overlay = $('#bellota-cleaner-overlay');
        $overlay.addClass('active');

        $.ajax({
            url: bahiaAdmin.ajaxurl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'bahia_flush_cache',
                nonce: bahiaAdmin.nonce
            },
            success: function (response) {
                if (response.success) {
                    // Retardar la actualización de UI para permitir que corra la animación de la escoba
                    setTimeout(function () {
                        // Actualizar datos en la UI
                        $('#epoch-display').text(response.data.epoch);
                        $('#table-epoch').text(response.data.epoch);
                        $('#transient-count-display').text(response.data.transient_count);
                        $('#table-transient-count').text(response.data.transient_count);
                        
                        // Actualizar lista de actividad reciente
                        if (response.data.activity_html) {
                            $('.activity-list').html(response.data.activity_html);
                        }
                        
                        // Añadir animación de pulso a las tarjetas estadísticas correspondientes
                        $('.bellota-stat-card').eq(1).addClass('bellota-pulse-update');
                        $('.bellota-stat-card').eq(2).addClass('bellota-pulse-update');
                        setTimeout(function () {
                            $('.bellota-stat-card').removeClass('bellota-pulse-update');
                        }, 1200);

                        $overlay.removeClass('active');
                        showToast('Caché vaciado e invalidado correctamente.');
                    }, 1200);
                } else {
                    $overlay.removeClass('active');
                    alert('Error: ' + (response.data.message || 'No se pudo vaciar el caché.'));
                }
            },
            error: function () {
                $overlay.removeClass('active');
                alert('Ocurrió un error en el servidor al intentar vaciar el caché.');
            },
            complete: function () {
                setTimeout(function () {
                    buttonElement.prop('disabled', false);
                    if (spinnerElement) spinnerElement.addClass('hidden');
                }, 1200);
            }
        });
    }

    $('#btn-flush-cache-quick').on('click', function () {
        flushCacheAPI($(this), null);
    });

    $('#btn-flush-cache-main').on('click', function () {
        flushCacheAPI($(this), $('#cache-spinner'));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // INTERACTIVE API TESTER (API CLIENT)
    // ═══════════════════════════════════════════════════════════════════════════
    var $testerEndpoint = $('#tester-endpoint');

    // Show/hide fields dynamically on selection change
    $testerEndpoint.on('change', function () {
        var selectedOpt = $(this).find('option:selected');
        var allowedFields = selectedOpt.data('fields').split(',');
        
        // Hide all fields first
        $('.field-group').addClass('hidden');
        
        // Show allowed fields
        allowedFields.forEach(function (field) {
            if (field === 'id') {
                $('#field-id').removeClass('hidden');
            } else if (field === 'slug') {
                $('#field-slug').removeClass('hidden');
            } else if (field === 'per_page') {
                $('#field-per-page').removeClass('hidden');
            } else if (field === 'page') {
                $('#field-page').removeClass('hidden');
            } else if (field === 'search') {
                $('#field-search').removeClass('hidden');
            }
        });
    });

    // Trigger change event to set initial field visibility
    $testerEndpoint.trigger('change');

    // Handle Form Submission (REST Request execution)
    $('#bellota-tester-form').on('submit', function (e) {
        e.preventDefault();
        
        var endpoint = $testerEndpoint.val();
        var method = 'GET';
        var urlPath = '/wp-json/bahia/v1';
        
        // Get values
        var idVal = $('#tester-param-id').val();
        var slugVal = $('#tester-param-slug').val();
        var perPageVal = $('#tester-param-per-page').val();
        var pageVal = $('#tester-param-page').val();
        var searchVal = $('#tester-param-search').val();
        
        var queryParams = [];

        // Build API URL path and parameters depending on selection
        if (endpoint === '/posts') {
            urlPath += '/posts';
            if (perPageVal) queryParams.push('per_page=' + perPageVal);
            if (pageVal) queryParams.push('page=' + pageVal);
            if (searchVal) queryParams.push('search=' + encodeURIComponent(searchVal));
        } else if (endpoint === '/posts-slug') {
            urlPath += '/posts';
            if (slugVal) queryParams.push('slug=' + encodeURIComponent(slugVal));
        } else if (endpoint === '/categories') {
            urlPath += '/categories';
        } else if (endpoint === '/media') {
            urlPath += '/media/' + (idVal || '1');
        } else if (endpoint === '/view') {
            urlPath += '/view/' + (idVal || '1');
            method = 'POST'; // Views increment requires a POST request
        }

        if (queryParams.length > 0) {
            urlPath += '?' + queryParams.join('&');
        }

        // Disable button & reset status
        var $submitBtn = $('#btn-tester-submit');
        $submitBtn.prop('disabled', true).html('<span class="bellota-spinner" style="width: 14px; height: 14px; border-width: 2px; vertical-align: middle; margin-right: 6px;"></span> Enviando...');
        
        var $statusBadge = $('#tester-status-badge');
        $statusBadge.text('Enviando').removeClass('status-green status-red').addClass('status-gray');
        
        var $latencyDisplay = $('#tester-latency-display');
        $latencyDisplay.text('Latencia: -- ms');
        
        var $responseViewer = $('#tester-response-viewer');
        $responseViewer.text('// Esperando respuesta del servidor...');
        $responseViewer.addClass('loading'); // Iniciar animación scanline en terminal

        // Start timer
        var startTime = performance.now();

        // AJAX Request to WP REST API
        $.ajax({
            url: urlPath,
            type: method,
            dataType: 'json',
            success: function (data, textStatus, xhr) {
                var latency = Math.round(performance.now() - startTime);
                
                // Update Metadata
                $latencyDisplay.text('Latencia: ' + latency + ' ms');
                $statusBadge.text(xhr.status + ' OK').removeClass('status-gray status-red').addClass('status-green');
                
                // Format & Output JSON
                $responseViewer.text(JSON.stringify(data, null, 4));

                // Leer métricas reales devueltas en los headers e integrar en panel
                updateMetricsFromHeaders(xhr);
            },
            error: function (xhr) {
                var latency = Math.round(performance.now() - startTime);
                
                // Update Metadata
                $latencyDisplay.text('Latencia: ' + latency + ' ms');
                var statusText = xhr.status ? xhr.status + ' ' + xhr.statusText : 'Error';
                $statusBadge.text(statusText).removeClass('status-gray status-green').addClass('status-red');
                
                // Format & Output Error Response
                var responseData = xhr.responseJSON || { error: 'Ocurrió un error inesperado al procesar la solicitud.' };
                $responseViewer.text(JSON.stringify(responseData, null, 4));

                // Leer métricas reales devueltas en los headers
                updateMetricsFromHeaders(xhr);
            },
            complete: function () {
                $submitBtn.prop('disabled', false).html('<span class="dashicons dashicons-admin-generic"></span> Enviar Petición API');
                $responseViewer.removeClass('loading'); // Detener animación scanline
            }
        });
    });

    // Helper para actualizar las métricas y el gráfico en vivo
    function updateMetricsFromHeaders(xhr) {
        var totalReqs = xhr.getResponseHeader('X-Bellota-Total-Requests');
        var avgLatency = xhr.getResponseHeader('X-Bellota-Avg-Latency');
        var hitRate = xhr.getResponseHeader('X-Bellota-Hit-Rate');
        var historyStr = xhr.getResponseHeader('X-Bellota-History');
        
        if (totalReqs && avgLatency && hitRate) {
            // Actualizar tarjetas de métricas superiores
            $('#avg-latency-display').text(avgLatency + ' ms');
            $('#hit-rate-display').text(hitRate + '%');
            
            // Actualizar KPIs de la pestaña de rendimiento
            $('#total-requests-display').text(parseInt(totalReqs).toLocaleString());
            $('#avg-latency-display-kpi').text(avgLatency + ' ms');
            $('#hit-rate-display-kpi').text(hitRate + '%');

            // Pulso animado en tarjeta de latencia cuando hay actualizaciones
            $('.bellota-stat-card').eq(3).addClass('bellota-pulse-update');
            setTimeout(function() {
                $('.bellota-stat-card').removeClass('bellota-pulse-update');
            }, 1000);
            
            // Redibujar gráfico SVG en tiempo real
            if (historyStr) {
                var historyArr = historyStr.split(',').map(Number);
                updateSVGChart(historyArr);
            }
        }
    }

    function updateSVGChart(history) {
        var n = history.length;
        if (n === 0) return;
        
        var maxVal = Math.max(80, Math.max.apply(null, history));
        var points = [];
        for (var i = 0; i < n; i++) {
            var x = (n > 1) ? (i / (n - 1)) * 500 : 0;
            var y = 200 - ((history[i] / maxVal) * 140 + 30);
            points.push(x + ',' + y);
        }
        
        var pathD = 'M ' + points.join(' L ');
        var gradD = pathD + ' L 500 200 L 0 200 Z';
        
        // Actualizar el d del trazado del gráfico y su degradado
        var paths = $('.simulated-chart-container svg path');
        if (paths.length >= 2) {
            $(paths[0]).attr('d', gradD);
            $(paths[1]).attr('d', pathD);
        }
        
        // Actualizar posición del círculo sobre el último punto
        var lastPoint = points[n - 1].split(',');
        var lastX = parseFloat(lastPoint[0]);
        var lastY = parseFloat(lastPoint[1]);
        
        $('.simulated-chart-container svg circle').attr({
            cx: lastX,
            cy: lastY
        });
        
        // Actualizar el tooltip flotante
        var tooltipLeft = (n > 1) ? ((n - 1.5) / (n - 1)) * 100 : 80;
        $('.chart-tooltip').css({
            left: tooltipLeft + '%',
            top: (lastY - 45) + 'px'
        });
        $('.chart-tooltip .chart-tooltip-val strong').text(history[n - 1] + ' ms');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTERACTIVE DOCUMENTATION CODE TABS
    // ═══════════════════════════════════════════════════════════════════════════
    $('.doc-tab-btn').on('click', function (e) {
        e.preventDefault();
        if ($(this).hasClass('doc-copy-btn')) return;

        var $tabsContainer = $(this).closest('.doc-code-tabs');
        var lang = $(this).data('lang');

        // Toggle active button
        $tabsContainer.find('.doc-tab-btn').removeClass('active');
        $(this).addClass('active');

        // Toggle active pre codeblock
        $tabsContainer.find('.doc-pre').removeClass('active');
        $tabsContainer.find('.doc-pre[data-lang="' + lang + '"]').addClass('active');
    });

    // Copy to clipboard with success animation
    $('.doc-copy-btn').on('click', function (e) {
        e.preventDefault();
        var $btn = $(this);
        var $tabsContainer = $btn.closest('.doc-code-tabs');
        var text = $tabsContainer.find('.doc-pre.active').text();

        navigator.clipboard.writeText(text).then(function () {
            var originalHtml = $btn.html();
            $btn.html('<span class="dashicons dashicons-yes"></span> ¡Copiado!');
            $btn.addClass('success');
            setTimeout(function () {
                $btn.html(originalHtml).removeClass('success');
            }, 2000);
        });
    });
});
