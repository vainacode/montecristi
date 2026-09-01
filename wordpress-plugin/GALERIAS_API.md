# API REST de Galerías - Documentación

## Introducción

La extensión de Galerías agrega soporte completo para galerías de fotos al plugin Bellota API. Incluye un Custom Post Type, metabox en el admin, y endpoints REST profesionales con caché inteligente.

---

## Instalación

1. El archivo `galleries.php` se encuentra en `/wordpress-plugin/includes/`
2. Se incluye automáticamente desde el plugin principal `bellota-api.php`
3. No requiere configuración adicional

---

## Administración de Galerías

### Custom Post Type

- **Nombre**: Galerías
- **Slug**: `galerias`
- **URL**: `/galerias/` (ej: `https://bahiafronteriza.com.do/galerias/`)
- **Menú**: Dashicons Gallery
- **Soporta**: Título, Editor, Imagen Destacada, Extracto, Autor

### Campos de Galería

Cada galería contiene:
- **Título**: Nombre de la galería
- **Descripción**: Extracto/resumen corto
- **Contenido**: Descripción completa HTML
- **Imagen Destacada**: Portada de la galería
- **Imágenes**: Array de IDs de fotos (guardado en meta `gallery_images`)
- **Categoría**: Categoría de galería (taxonomy `gallery_cat`)
- **Autor**: Usuario que creó la galería
- **Fecha**: Fecha de publicación

### Metabox en Admin

En el editor de galerías aparece una caja "Imágenes de la Galería" que permite:

- ✅ Seleccionar múltiples imágenes desde Media Library
- ✅ Ver miniaturas
- ✅ Reordenar imágenes (arrastrando)
- ✅ Eliminar imágenes (botón ×)
- ✅ Guardar automáticamente con seguridad (nonce)

---

## Endpoints REST

### Base URL
```
/wp-json/bahia/v1/
```

### 1. Listado de Galerías

**Endpoint:**
```
GET /wp-json/bahia/v1/galerias
```

**Parámetros:**

| Parámetro | Tipo | Default | Máximo | Descripción |
|-----------|------|---------|--------|-------------|
| `page` | int | 1 | - | Número de página |
| `per_page` | int | 12 | 50 | Galerías por página |
| `offset` | int | 0 | - | Desplazamiento (alternativa a page) |
| `search` | string | '' | 200 chars | Buscar por título |
| `category` | int | 0 | - | ID de categoría |
| `author` | int | 0 | - | ID del autor |
| `orderby` | string | 'date' | - | Campo: date, title, rand, modified |
| `order` | string | 'DESC' | - | ASC o DESC |

**Respuesta (200 OK):**
```json
{
  "success": true,
  "page": 1,
  "per_page": 12,
  "total": 25,
  "total_pages": 3,
  "data": [
    {
      "id": 123,
      "title": "Fiesta Patronal 2026",
      "slug": "fiesta-patronal-2026",
      "excerpt": "Imágenes de la fiesta patronal...",
      "description": "Imágenes de la fiesta patronal...",
      "date": "2026-06-14T10:00:00+00:00",
      "author": {
        "id": 1,
        "name": "Admin"
      },
      "featured_image": {
        "id": 55,
        "source_url": "https://example.com/wp-content/uploads/2026/06/image.jpg",
        "thumbnail": "https://example.com/wp-content/uploads/2026/06/image-150x150.jpg",
        "medium": "https://example.com/wp-content/uploads/2026/06/image-300x225.jpg",
        "large": "https://example.com/wp-content/uploads/2026/06/image-1024x768.jpg",
        "alt": "Descripción alternativa"
      },
      "photos_count": 20
    }
  ]
}
```

### 2. Detalle de Galería

**Endpoint:**
```
GET /wp-json/bahia/v1/galerias/{slug}
```

**Parámetros:**

| Parámetro | Requerido | Descripción |
|-----------|-----------|-------------|
| `slug` | Sí | Slug de la galería (ej: `fiesta-patronal-2026`) |

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Fiesta Patronal 2026",
    "slug": "fiesta-patronal-2026",
    "excerpt": "Imágenes de la fiesta...",
    "description": "Imágenes de la fiesta...",
    "date": "2026-06-14T10:00:00+00:00",
    "author": {
      "id": 1,
      "name": "Admin"
    },
    "featured_image": {
      "id": 55,
      "source_url": "https://example.com/wp-content/uploads/2026/06/image.jpg",
      "thumbnail": "https://example.com/wp-content/uploads/2026/06/image-150x150.jpg",
      "medium": "https://example.com/wp-content/uploads/2026/06/image-300x225.jpg",
      "large": "https://example.com/wp-content/uploads/2026/06/image-1024x768.jpg",
      "alt": "Descripción alternativa"
    },
    "photos_count": 20,
    "content": "<p>Descripción completa en HTML...</p>",
    "photos": [
      {
        "id": 10,
        "url": "https://example.com/wp-content/uploads/2026/06/photo1.jpg",
        "width": 1200,
        "height": 800,
        "thumbnail": "https://example.com/wp-content/uploads/2026/06/photo1-150x150.jpg",
        "medium": "https://example.com/wp-content/uploads/2026/06/photo1-300x225.jpg",
        "large": "https://example.com/wp-content/uploads/2026/06/photo1-1024x768.jpg",
        "alt": "Descripción de la foto",
        "caption": "Pie de foto opcional"
      }
    ]
  }
}
```

**Errores:**

```json
// 404 - Galería no encontrada
{
  "error": "Galería no encontrada"
}

// 500 - Error interno
{
  "error": "Error interno del servidor"
}
```

---

## Caché y Performance

### Estrategia de Caché

| Recurso | TTL | Invalidación |
|---------|-----|--------------|
| Listado de galerías | 120s (2 min) | Al crear/editar galería |
| Galería individual | 300s (5 min) | Al editar galería |
| Categorías | 3600s (1h) | Manual |

### Transientes Usados

```
bahia_l_<epoch>_<hash_params>  // Listados
bahia_s_<epoch>_<hash_slug>    // Slugs individuales
```

El sistema usa `epoch` para invalidación masiva cuando se guarda cualquier galería.

### Optimización

✅ **No se cargan todas las fotos en listado** - Solo aparece `photos_count`  
✅ **Fotos completas solo en detalle** - Se optimiza el ancho de banda  
✅ **Caché agresivo** - Respuestas rápidas (35-50ms típico)  
✅ **Rate limiting** - 36,000 requests/hora por endpoint

---

## Rate Limiting

```php
define('BAHIA_API_LIMIT_GALLERIES', 36000); // Por IP/hora
```

Límite: **36,000 requests por hora** (10 req/segundo en promedio)

---

## Ejemplos de Uso

### Obtener galerías más recientes

```bash
curl "https://bahiafronteriza.com.do/wp-json/bahia/v1/galerias?page=1&per_page=12&order=DESC"
```

### Buscar galerías por término

```bash
curl "https://bahiafronteriza.com.do/wp-json/bahia/v1/galerias?search=fiesta&per_page=20"
```

### Obtener galerías de una categoría

```bash
curl "https://bahiafronteriza.com.do/wp-json/bahia/v1/galerias?category=5&per_page=15"
```

### Obtener detalle completo de una galería

```bash
curl "https://bahiafronteriza.com.do/wp-json/bahia/v1/galerias/fiesta-patronal-2026"
```

### Con fetch en JavaScript

```javascript
// Listado
const response = await fetch('/wp-json/bahia/v1/galerias?page=1&per_page=12');
const data = await response.json();
console.log(data.data); // Array de galerías

// Detalle
const detail = await fetch('/wp-json/bahia/v1/galerias/fiesta-patronal-2026');
const gallery = await detail.json();
console.log(gallery.data.photos); // Array con todas las fotos
```

---

## Seguridad

✅ **Sanitización**: Todos los inputs se validan y limpian  
✅ **Escapado**: Outputs escapados para prevenir XSS  
✅ **Nonces**: Metabox protegido con nonce CSRF  
✅ **Permisos**: Se verifica `edit_post` al guardar metadatos  
✅ **Rate Limiting**: Protege contra abuso/DDoS  

---

## Estructura de Archivos

```
wordpress-plugin/
├── bellota-api.php              (Archivo principal - MODIFICADO)
└── includes/
    ├── galleries.php            (NUEVO - Extensión de galerías)
    └── admin-dashboard.php      (Existente)
```

---

## Changelog

### v3.1.0 (Galerías)

- ✅ Custom Post Type `galerias`
- ✅ Metabox para seleccionar imágenes
- ✅ Endpoint: `GET /galerias` (listado paginado)
- ✅ Endpoint: `GET /galerias/{slug}` (detalle con fotos)
- ✅ Caché inteligente (120s listado, 300s detalle)
- ✅ Rate limiting (36k req/hora)
- ✅ Taxonomía: `gallery_cat`
- ✅ Integración completa con estadísticas del dashboard

---

## Notas Técnicas

### Función: `bahia_format_gallery()`

Formatea un post de galería como JSON:

```php
$formatted = bahia_format_gallery($post, $include_photos = false);
// Sin fotos: listado (50KB archivo)
// Con fotos: detalle (300KB+ dependiendo de cantidad)
```

### Función: `bahia_format_photo()`

Formatea una imagen adjunta con todos los tamaños:

```php
$photo = bahia_format_photo($image_id);
// Devuelve: url, thumbnail, medium, large, alt, caption, width, height
```

### Filtro: `bahia_rate_limit_key`

Para modificar límites:

```php
add_filter('bahia_rate_limit_key', function($key) {
    if ('galleries' === $key) {
        return 72000; // 2x el límite
    }
    return $key;
});
```

---

## FAQ

**P: ¿Puedo cambiar el slug de las galerías?**  
R: Sí, modifica `'rewrite' => ['slug' => 'mi-slug']` en `register_post_type()`

**P: ¿Cómo agrego campos adicionales?**  
R: Usa ACF o `add_post_meta()` en el metabox

**P: ¿Se puede cambiar el TTL del caché?**  
R: Define las constantes antes de que se cargue el plugin:
```php
define('BAHIA_API_TTL_POSTS', 300); // Galerías usan esto
```

**P: ¿Compatible con ACF?**  
R: Sí, puedes agregar campos ACF adicionales sin problemas

---

## Soporte

Para reportar bugs o solicitar features, contacta al equipo de desarrollo.
