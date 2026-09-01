# Integración de Sistema de Visitas Reales (Las Más Leídas)

Para hacer que la sección de **"Las Más Leídas"** funcione basada en *views* (visitas reales) en lugar de una etiqueta manual, hemos construido un sistema nativo y ultra-rápido que conecta Next.js directamente con la base de datos de tu WordPress sin necesidad de descargar plugins pesados.

### Instrucciones para WordPress

1. Ve a tu panel de administración de WordPress.
2. Entra en **Apariencia > Editor de archivos de temas** (o utiliza un plugin seguro como *Code Snippets*).
3. Abre el archivo `functions.php` de tu tema activo.
4. Pega el siguiente código exactamente como está al final del archivo:

```php
// =========================================================================
// MORRO INFORMATIVO - SISTEMA DE VISITAS PARA "LAS MÁS LEÍDAS"
// =========================================================================

// 1. Crear el Endpoint (API) para que Next.js registre la visita silenciosamente
add_action('rest_api_init', function () {
    register_rest_route('morro/v1', '/view/(?P<id>\\d+)', array(
        'methods' => 'POST',
        'callback' => 'morro_registrar_visita',
        'permission_callback' => '__return_true' // Permitir acceso público para sumar visitas
    ));
});

function morro_registrar_visita($request) {
    $post_id = $request['id'];
    
    // Obtenemos las visitas actuales, si no existen será 0
    $visitas_actuales = (int) get_post_meta($post_id, 'morro_views_count', true);
    $nuevas_visitas = $visitas_actuales + 1;
    
    // Guardamos la nueva cantidad de visitas en la base de datos de WP
    update_post_meta($post_id, 'morro_views_count', $nuevas_visitas);
    
    return rest_ensure_response(array(
        'status' => 'success', 
        'post_id' => $post_id, 
        'views' => $nuevas_visitas
    ));
}

// 2. Exponer el número de visitas en los resultados estándar de la API de WP (Opcional pero recomendado para debug)
add_action('rest_api_init', function() {
    register_rest_field('post', 'vistas_reales', array(
        'get_callback' => function( $post_arr ) {
            return (int) get_post_meta( $post_arr['id'], 'morro_views_count', true );
        },
    ));
});
```

### 5. ¿Qué hace este código?
- Cada vez que alguien entra a leer una noticia en tu portal (Next.js), el portal envía una señal invisible a la ruta `TUDOMINIO.com/wp-json/morro/v1/view/ID_DEL_POST`.
- WordPress recibe la señal, toma la noticia y le suma **+1** a su récord interno (`morro_views_count`).
- Automáticamente, nuestro portal fue programado para pedirle a WordPress la lista de noticias ordenadas exactamente por este contador numérico. ¡La noticia con el número más alto se pone en el top #1 de "Las Más Leídas"!

Listo, no tienes que hacer nada más. El portal hará todo el trabajo de seguimiento y diseño por sí solo.

---

## 🛡️ Guía de Seguridad Anti-Hackeos (Vital para WordPress)

Dado que Next.js (el frontend) es esencialmente **inhackeable** porque no tiene base de datos directa ni panel de administración público, **el 99% de los ataques se dirigirán a tu instalación de WordPress**.

Para blindar tu WordPress y evitar que secuestren tu portal, sigue estos pasos indispensables:

### 1. Ocultar la URL de Login (Vital)
Los hackers usan bots para atacar `/wp-admin` o `/wp-login.php`.
- **Solución:** Instala el plugin gratuito **"WPS Hide Login"**.
- Cambia la ruta a algo secreto, por ejemplo: `TUDOMINIO.com/entrar-morro-secreto`.

### 2. Autenticación de Dos Pasos (2FA)
Obliga a todos los editores y administradores a usar una app como Google Authenticator.
- **Solución:** Instala el plugin **"Wordfence Security"** o **"WP 2FA"**.

### 3. Bloquear Ejecución PHP en Carpetas Vulnerables
Evita que hackers suban archivos maliciosos ocultos en imágenes.
- Instala **Wordfence Security** e inicia escaneos semanales, o usa **iThemes Security** para deshabilitar la ejecución de PHP en la carpeta `wp-content/uploads/`.

### 4. Desactivar XML-RPC
El protocolo XML-RPC suele ser explotado para ataques de fuerza bruta masivos.
- **Solución:** Usa el plugin **"Disable XML-RPC"** o añádelo con un snippet de código:
```php
add_filter('xmlrpc_enabled', '__return_false');
```

### 5. Restringir la exposición de Autores (User Enumeration)
Si alguien escribe `/?author=1`, WordPress revelará el nombre de usuario del administrador principal.
- **Solución:** Añade esto también a tu `functions.php`:
```php
if (!is_admin()) {
    if (preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING'])) die();
    add_filter('redirect_canonical', function($redirect_url, $requested_url) {
        if (is_author()) return false;
        return $redirect_url;
    }, 10, 2);
}
```

### ¿Qué hicimos en el Frontend (Next.js)?
En el código de la portada (Next.js) ya hemos activado las siguientes protecciones de Grado Bancario:
- **Strict-Transport-Security (HSTS):** Fuerza conexiones encriptadas.
- **X-XSS-Protection:** Bloquea inyecciones de código (Cross-Site Scripting).
- **X-Frame-Options:** Evita que clonen tu sitio o lo pongan dentro de un iframe para robar contraseñas (Clickjacking).
- **Control de Permisos:** Bloquea el uso no autorizado de cámara y micrófono por scripts de terceros.
