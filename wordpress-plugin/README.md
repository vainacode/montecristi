# Bellota API - Plugin WordPress

**Versión:** 3.0.0  
**Autor:** Bellota Hosting  
**Licencia:** GPLv2 o posterior  
**Requiere:** PHP 7.4+, WordPress 5.9+

## 📋 Descripción

API REST optimizada de alta velocidad para la entrega de contenidos con caché inteligente basada en épocas, limitador de frecuencia (rate limiting) y panel administrativo avanzado con diagnóstico en tiempo real.

## ✨ Características

- ✅ **Caché inteligente** - Sistema de épocas para invalidación automática
- ✅ **Rate limiting** - Protección contra abuso de API
- ✅ **Compatible con cualquier hosting** - Funciona en cPanel, Plesk, VPS, etc.
- ✅ **Soporte para Redis/Memcached** - Caché distribuido opcional
- ✅ **Integración SEO** - Soporte para Yoast y Rank Math
- ✅ **Panel administrativo** - Dashboard con estadísticas en tiempo real
- ✅ **CORS configurable** - Acceso desde dominios específicos
- ✅ **Logging de actividad** - Registro de cambios y operaciones
- ✅ **Manejo de errores robusto** - Try-catch en todos los endpoints

## 🚀 Instalación

### Opción 1: Instalación manual
1. Descargar el plugin
2. Extraer en `/wp-content/plugins/bellota-api/`
3. Activar desde el panel de WordPress
4. Configurar en **Bellota API** en el menú lateral

### Opción 2: Mediante cPanel File Manager
1. Conectar a cPanel
2. Ir a **File Manager** → `/public_html/wp-content/plugins/`
3. Crear carpeta `bellota-api`
4. Subir archivos del plugin
5. Activar desde WordPress

### Opción 3: Mediante FTP
1. Conectar por FTP a tu servidor
2. Navegar a `/wp-content/plugins/`
3. Crear carpeta `bellota-api`
4. Subir todos los archivos
5. Activar desde WordPress

## 📖 Uso

### Endpoints disponibles

#### 1. **GET /wp-json/bahia/v1/posts**
Obtener artículos con opciones de filtrado

**Parámetros:**
```
- per_page: número de artículos (default: 18, máximo: 50)
- page: número de página (default: 1)
- categories: ID de categoría (default: 0)
- search: término de búsqueda (default: '')
- slug: búsqueda por slug (default: '')
- orderby: campo de ordenamiento (date, title, rand, modified)
- order: ASC o DESC (default: DESC)
```

**Ejemplo:**
```bash
curl "https://example.com/wp-json/bahia/v1/posts?per_page=10&page=1&categories=5"
```

#### 2. **GET /wp-json/bahia/v1/categories**
Obtener todas las categorías

**Ejemplo:**
```bash
curl "https://example.com/wp-json/bahia/v1/categories"
```

#### 3. **GET /wp-json/bahia/v1/media/{id}**
Obtener información de una imagen/media

**Parámetros:**
```
- id: ID del media (requerido)
```

**Ejemplo:**
```bash
curl "https://example.com/wp-json/bahia/v1/media/123"
```

#### 4. **POST /wp-json/bahia/v1/view/{id}**
Registrar una vista de artículo

**Parámetros:**
```
- id: ID del artículo (requerido)
```

**Ejemplo:**
```bash
curl -X POST "https://example.com/wp-json/bahia/v1/view/456"
```

## 🔧 Configuración

### Configurar orígenes CORS

Editar el archivo `bellota-api.php` y modificar:

```php
define('BAHIA_API_ORIGINS', [
    'https://tusitio.com',
    'https://www.tusitio.com',
    'https://otro-dominio.com',
]);
```

### Ajustar TTL de caché

```php
define('BAHIA_API_TTL_POSTS', 120);      // 2 minutos
define('BAHIA_API_TTL_SLUG', 300);       // 5 minutos
define('BAHIA_API_TTL_CATS', 3600);      // 1 hora
define('BAHIA_API_TTL_MEDIA', 86400);    // 24 horas
```

### Límites de rate limiting

```php
define('BAHIA_API_LIMIT_POSTS', 36000);       // 600/min
define('BAHIA_API_LIMIT_CATEGORIES', 36000);  // 600/min
define('BAHIA_API_LIMIT_MEDIA', 36000);       // 600/min
define('BAHIA_API_LIMIT_VIEW', 7200);         // 120/min
```

## 📊 Panel Administrativo

Acceder a **Bellota API** en el menú lateral de WordPress para:

- 📈 Ver estadísticas de rendimiento en tiempo real
- 📉 Gráficos de latencia y tasa de caché
- 🔄 Vaciar caché manualmente
- 📋 Registro de actividad
- 🔍 Diagnóstico del servidor

## 🛡️ Seguridad

- **Validación de entrada:** Todos los parámetros son sanitizados
- **Rate limiting:** Protección contra fuerza bruta
- **CORS seguro:** Solo dominios autorizados
- **Prepared statements:** Prevención de SQL injection
- **Nonces de WordPress:** Protección CSRF en admin
- **Capacidades de usuario:** Solo administradores pueden acceder al panel

## 🐛 Solución de problemas

### Error: "Plugin requiere PHP 7.4"
- **Solución:** Actualizar PHP en cPanel o contactar con el hosting

### Error 429: "Demasiadas solicitudes"
- **Solución:** Esperar una hora o vaciar caché desde el panel
- **Causa:** Se alcanzó el límite de rate limiting

### Caché no se actualiza
- **Solución:** Ir a **Bellota API** → **Vaciar caché**
- **Nota:** El caché se invalida automáticamente al guardar/eliminar artículos

### CORS bloqueado
- **Solución:** Agregar tu dominio a `BAHIA_API_ORIGINS` en `bellota-api.php`
- **Error típico:** "Access to XMLHttpRequest has been blocked by CORS policy"

## 📋 Compatibilidad

| Sistema | Soporte |
|---------|---------|
| PHP 7.4+ | ✅ Sí |
| PHP 8.0+ | ✅ Sí |
| WordPress 5.9+ | ✅ Sí |
| WordPress 6.0+ | ✅ Sí |
| cPanel | ✅ Sí |
| Plesk | ✅ Sí |
| VPS Linux | ✅ Sí |
| Windows hosting | ⚠️ No recomendado |
| Redis/Memcached | ✅ Opcional |
| Yoast SEO | ✅ Compatible |
| Rank Math | ✅ Compatible |

## 📞 Soporte

Para reportar problemas o solicitar features:
- Email: support@bellotahosting.net
- Sitio: https://bellotahosting.net

## 📄 Licencia

GPLv2 o posterior. Ver archivo LICENSE.

---

**Bellota Hosting** © 2024
