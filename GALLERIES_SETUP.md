# 🖼️ Configuración de Galerías - Morro Informativo

Esta guía explica cómo integrar las galerías del plugin WordPress Bellota API con tu sitio Next.js.

## ✅ Lo que se ha hecho

### 1. **Actualización de la API URL**
   - ✓ Cambió de `morro/v1` a `bahia/v1` en `src/config/site.ts`
   - ✓ El sitio ahora apunta correctamente al plugin Bellota API instalado en WordPress

### 2. **Funciones de API para Galerías**
   - ✓ Agregadas funciones en `src/lib/wp.ts`:
     - `getGalleries()` - Obtener listado de galerías paginadas
     - `getGalleryBySlug()` - Obtener una galería específica con todas sus fotos
     - `getFeaturedImageGallery()` - Extraer imagen destacada de una galería

### 3. **Nuevas Rutas de Página**
   - ✓ `/galerias` - Página principal con grid de galerías
   - ✓ `/galerias/[slug]` - Página de detalle de cada galería
   - ✓ Páginas de loading skeleton para mejor UX

### 4. **Navegación**
   - ✓ Agregado enlace "Galerías" en el menú principal

### 5. **CORS Actualizado**
   - ✓ Agregados dominios a la whitelist en el plugin:
     - `https://morroinformativo.com`
     - `https://www.morroinformativo.com`
     - `http://localhost:3000` (desarrollo local)
     - `http://127.0.0.1:3000` (desarrollo local alternativo)

---

## 🚀 Próximos Pasos

### Paso 1: Crear Galerías en WordPress
1. Accede a tu WordPress en `https://redaccion.morroinformativo.com/wp-admin/`
2. Ve a **Galerías** (nueva sección en el menú lateral)
3. Crea una nueva galería:
   - **Título**: Ej: "Fiesta Patronal 2026"
   - **Descripción**: Resumen corto
   - **Contenido**: Descripción larga (opcional)
   - **Imagen Destacada**: Portada de la galería
   - **Imágenes de la Galería**: Selecciona múltiples fotos del media library
4. **Publica** la galería

**⚠️ Importante**: El slug de la galería debe usar:
- Solo letras minúsculas
- Solo números
- Solo guiones `-` (sin espacios ni caracteres especiales)
- Ej: `fiesta-patronal-2026` ✓ | `Fiesta Patronal 2026` ✗

### Paso 2: Prueba en Desarrollo

**Opción A: Usar Node.js**
```bash
node test-api.js
```

**Opción B: Prueba manual en navegador**
1. Abre: `https://redaccion.morroinformativo.com/wp-json/bahia/v1/galerias`
2. Deberías ver un JSON con las galerías

**Opción C: En tu sitio Next.js**
```bash
npm run dev
```
- Abre `http://localhost:3000/galerias`
- Deberías ver el listado de galerías

### Paso 3: Verifica que todo funciona

```bash
# En la raíz del proyecto
npm run dev
```

Luego:
- **Listado**: http://localhost:3000/galerias
- **Detalle**: http://localhost:3000/galerias/tu-slug-aqui

---

## 🔧 Configuración Técnica

### Endpoints REST del Plugin

#### 1. Listado de Galerías
```
GET /wp-json/bahia/v1/galerias
```

**Parámetros:**
- `page` (default: 1)
- `per_page` (default: 12, máximo: 50)
- `search` (buscar por título)
- `category` (ID de categoría)
- `author` (ID del autor)
- `orderby` (date, title, rand, modified)
- `order` (DESC, ASC)

**Ejemplo:**
```
/wp-json/bahia/v1/galerias?page=1&per_page=12&orderby=date&order=DESC
```

#### 2. Detalle de Galería
```
GET /wp-json/bahia/v1/galerias/{slug}
```

**Ejemplo:**
```
/wp-json/bahia/v1/galerias/fiesta-patronal-2026
```

Devuelve la galería completa con todas las fotos, tamaños de imagen, etc.

### Caché

- **Listado**: Se cachea por 120 segundos (configurable en BAHIA_API_TTL_POSTS)
- **Detalle**: Se cachea por 300 segundos (configurable en BAHIA_API_TTL_SLUG)
- **Next.js**: Se revalida cada 60 segundos (ISR)

El caché se invalida automáticamente cuando:
- Se crea/actualiza una galería en WordPress
- Se elimina una galería

### Rate Limiting

- **Límite**: 36,000 requests por hora por IP
- **Promedio**: ~10 requests por segundo
- Protegido contra abusos y DDoS

---

## 📋 Estructura de Datos

### Galería (Listado)
```json
{
  "id": 123,
  "title": "Fiesta Patronal 2026",
  "slug": "fiesta-patronal-2026",
  "excerpt": "Resumen corto...",
  "description": "Resumen corto...",
  "date": "2026-06-14T10:00:00+00:00",
  "author": {
    "id": 1,
    "name": "Admin"
  },
  "featured_image": {
    "id": 55,
    "source_url": "https://...",
    "thumbnail": "https://...",
    "medium": "https://...",
    "large": "https://...",
    "alt_text": "Descripción"
  },
  "photos_count": 20
}
```

### Galería (Detalle)
Incluye todo lo anterior, más:
```json
{
  "content": "<p>Descripción HTML completa...</p>",
  "photos": [
    {
      "id": 10,
      "url": "https://...",
      "width": 1200,
      "height": 800,
      "thumbnail": "https://...",
      "medium": "https://...",
      "large": "https://...",
      "alt": "Descripción de la foto",
      "caption": "Pie de foto"
    }
  ]
}
```

---

## ❓ Solución de Problemas

### Problema: No veo galerías en `/galerias`

1. ✓ Verifica que hayas creado galerías en WordPress (estado: Publicada)
2. ✓ Abre `https://redaccion.morroinformativo.com/wp-json/bahia/v1/galerias`
3. ✓ Deberías ver un JSON con galerías
4. ✓ Si está vacío, crea una galería en WordPress y espera 2 minutos (caché)

### Problema: Error CORS al acceder desde Next.js

1. ✓ Verifica la whitelist en `wordpress-plugin/bellota-api.php` línea 63-70
2. ✓ Asegúrate de que tu dominio esté incluido
3. ✓ Reinicia WordPress después de cambios
4. ✓ Limpia caché del navegador (Ctrl+Shift+Del)

### Problema: Las fotos no se muestran

1. ✓ Verifica que las imágenes estén en el Media Library de WordPress
2. ✓ Asegúrate de que la galería tenga imágenes asignadas en "Imágenes de la Galería"
3. ✓ Espera a que se invalide el caché (máx 5 minutos)
4. ✓ Limpia caché del navegador

### Problema: Endpoint retorna 404

1. ✓ Verifica el slug de la galería (debe ser en minúsculas)
2. ✓ Prueba en: `https://redaccion.morroinformativo.com/wp-json/bahia/v1/galerias`
3. ✓ Copia el slug exacto de la respuesta

---

## 🎨 Personalización

### Cambiar el caché
En `wordpress-plugin/bellota-api.php`:
```php
define('BAHIA_API_TTL_POSTS', 120);  // Galerías (listado) - segundos
define('BAHIA_API_TTL_SLUG', 300);   // Galería individual - segundos
```

### Cambiar items por página
En `src/app/galerias/page.tsx`:
```typescript
const { galleries, totalPages } = await getGalleries({
  page,
  per_page: 12,  // ← Cambiar esto
  orderby: "date",
  order: "DESC",
});
```

### Cambiar orden de galerías
```typescript
getGalleries({
  orderby: "title",  // date, title, rand, modified
  order: "ASC",      // ASC o DESC
})
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa que el plugin Bellota API esté activado en WordPress
2. Verifica que el Custom Post Type "Galerías" aparezca en el menú admin
3. Consulta los logs de WordPress en `/wp-content/debug.log`
4. Prueba los endpoints directamente en el navegador

---

**¡Listo!** Tu sitio ya está configurado para mostrar galerías. 🎉
