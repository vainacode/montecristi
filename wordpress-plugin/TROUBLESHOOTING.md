# Troubleshooting - Bellota API

## Errores de instalación

### "Plugin requiere PHP 7.4 o superior"

**Error completo:**
```
Bellota API: Este plugin requiere PHP 7.4 o superior. Tu versión actual es X.X.X
```

**Causa:** Tu servidor ejecuta una versión de PHP antigua

**Soluciones:**

1. **En cPanel:**
   - Ir a cPanel → EasyApache (o PHP Selector)
   - Cambiar versión de PHP a 7.4, 8.0, 8.1 o 8.2
   - Seleccionar extensiones necesarias
   - Aplicar cambios

2. **En Plesk:**
   - Ir a Hosting & Subscriptions
   - Seleccionar dominio
   - PHP Settings → Cambiar versión

3. **En hosting VPS/Cloud:**
   - Contactar soporte para actualizar PHP
   - O editar archivo de configuración según el servidor

4. **En GoDaddy/1&1:**
   - Account Settings → General → PHP Version
   - Seleccionar versión más reciente

**Verificar versión actual:**
```bash
php --version
```

---

## Errores de activación

### "Fatal error: Class not found"

**Error típico:**
```
Fatal error: Class 'WP_REST_Request' not found in bellota-api.php
```

**Causa:** WordPress no está completamente instalado o cargado

**Soluciones:**

1. **Verificar instalación de WordPress:**
   - Ir a Dashboard y revisar que todo funciona
   - Ir a Settings → Permalinks y guardar
   - Desactivar todos los plugins excepto Bellota API

2. **Verificar archivo wp-load.php:**
   ```php
   // Agregar al principio de bellota-api.php
   if (!defined('ABSPATH')) {
       exit;
   }
   ```

3. **En cPanel:**
   - Verificar que `wp-config.php` existe
   - Verificar que permiso es 644

4. **Restaurar desde backup:**
   ```bash
   cp wp-config.php.bak wp-config.php
   ```

---

## Errores de CORS

### "Access to XMLHttpRequest blocked by CORS policy"

**Error en consola del navegador:**
```
Access to XMLHttpRequest at 'https://api.ejemplo.com/wp-json/bahia/v1/posts'
from origin 'https://app.ejemplo.com' has been blocked by CORS policy
```

**Causa:** Tu dominio no está en la lista de orígenes permitidos

**Solución 1: Agregar dominio (recomendado)**

Editar `bellota-api.php`:

```php
define('BAHIA_API_ORIGINS', [
    'https://bahiafronteriza.com.do',
    'https://www.bahiafronteriza.com.do',
    'https://app.ejemplo.com',  // ← AGREGAR AQUÍ
    'https://www.app.ejemplo.com',
    'http://localhost:3000',
]);
```

Guardar y vaciar caché del navegador (Ctrl+Shift+Del).

**Solución 2: Permitir todos (SOLO DESARROLLO)**

```php
// ⚠️ NUNCA en producción
define('BAHIA_API_ORIGINS', ['*']);
```

**Solución 3: Verificar que es HTTPS**

```php
// ❌ INCORRECTO
'http://app.ejemplo.com'

// ✅ CORRECTO
'https://app.ejemplo.com'
```

---

## Errores 429 (Rate Limit)

### "Demasiadas solicitudes (429)"

**Error:**
```
{
  "code": "rate_limit_exceeded",
  "message": "Demasiadas solicitudes. Inténtalo en una hora."
}
```

**Causa:** Se alcanzó el límite de requests por IP

**Soluciones:**

1. **Esperar 1 hora** (solución temporal)

2. **Aumentar límite en bellota-api.php:**
   ```php
   define('BAHIA_API_LIMIT_POSTS', 72000);      // 1200/min
   define('BAHIA_API_LIMIT_CATEGORIES', 72000);
   define('BAHIA_API_LIMIT_MEDIA', 72000);
   define('BAHIA_API_LIMIT_VIEW', 14400);
   ```

3. **Vaciar manualmente:**
   - WordPress Dashboard → Bellota API
   - Clic en "Vaciar caché"
   - Esperar 2 minutos

4. **Por terminal (si tienes SSH):**
   ```bash
   wp transient delete-expired
   ```

---

## Errores de caché

### "Cambios no se reflejan"

**Problema:** Editas un artículo pero la API devuelve contenido viejo

**Causa:** El caché no se invalidó automáticamente

**Soluciones:**

1. **Vaciar caché desde admin:**
   - Bellota API → Vaciar caché
   - Esperar 30 segundos

2. **Aumentar velocidad de actualización:**
   ```php
   define('BAHIA_API_TTL_POSTS', 60);  // 1 minuto en lugar de 2
   ```

3. **Verificar que se guarda correctamente:**
   - Editar artículo
   - Clic en "Actualizar"
   - Esperar confirmación "Artículo actualizado"

4. **Comprobar que el caché funciona:**
   - Abrir DevTools (F12)
   - Ir a Network
   - Buscar request a `/bahia/v1/posts`
   - Ver header `X-Cache: HIT` o `MISS`

---

## Errores de base de datos

### "Wordpress database error"

**Error:**
```
WordPress database error: [Table 'db_name.wp_bellota_api_logs' doesn't exist]
```

**Causa:** La tabla de logs no se creó durante la activación

**Soluciones:**

1. **Reactivar plugin:**
   - Dashboard → Plugins
   - Desactivar Bellota API
   - Esperar 10 segundos
   - Activar nuevamente

2. **Crear tabla manualmente:**
   
   Si tienes acceso a phpMyAdmin en cPanel:
   ```sql
   CREATE TABLE IF NOT EXISTS wp_bellota_api_logs (
       id mediumint(9) NOT NULL AUTO_INCREMENT,
       timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
       endpoint varchar(100) NOT NULL,
       ip_address varchar(45),
       status_code int,
       response_time float,
       PRIMARY KEY (id),
       KEY endpoint (endpoint),
       KEY timestamp (timestamp)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   ```

3. **Por terminal:**
   ```bash
   wp db query < setup.sql
   ```

---

## Errores de permisos

### "Permission denied" al editar archivos

**En cPanel File Manager:**

1. Click derecho en carpeta `bellota-api`
2. "Change Permissions"
3. Establecer a `755`
4. Click derecho en archivos `.php`
5. Establecer a `644`

**Por terminal:**
```bash
chmod 755 bellota-api
chmod 644 bellota-api/*.php
chmod 755 bellota-api/includes
chmod 755 bellota-api/assets
```

**Por FTP:**
1. Seleccionar carpeta
2. Right-click → File Permissions
3. Establecer a 755
4. Seleccionar archivos
5. Establecer a 644

---

## Errores de performance

### "Latencia muy alta (>500ms)"

**Síntomas:**
- API toma mucho tiempo en responder
- Header `X-Bellota-Avg-Latency` muestra valor alto

**Soluciones:**

1. **Activar caché:**
   - Verificar que `X-Cache: HIT` aparece en respuestas
   - Si no, aumentar TTL:
     ```php
     define('BAHIA_API_TTL_POSTS', 300);  // 5 minutos
     ```

2. **Reducir cantidad de posts:**
   - En requests, usar `per_page=10` en lugar de 50
   - Esto reduce carga de base de datos

3. **Activar Redis/Memcached:**
   - Si está disponible en tu hosting
   - Pedirle al hosting que lo active
   - O usar hosting con Redis pre-configurado

4. **Optimizar base de datos:**
   ```bash
   wp db optimize
   ```

5. **Aumentar límites de PHP en cPanel:**
   - cPanel → MultiPHP INI Editor
   - Aumentar:
     ```
     max_execution_time = 60
     memory_limit = 512M
     max_input_vars = 5000
     ```

---

## Errores de compatibilidad

### "Plugin conflicta con otro plugin"

**Síntomas:**
- Error al activar con otro plugin activo
- Desaparece al desactivar otro plugin

**Soluciones:**

1. **Identificar conflicto:**
   - Desactivar todos los plugins excepto Bellota API
   - Activar plugins uno a uno
   - Ver cuál causa el problema

2. **Plugins conocidos de conflicto:**
   - WP REST Cache (desactivar)
   - REST API enhancements (verificar versión)
   - ACF (usar versión 6.0+)

3. **Reportar conflicto:**
   - Email: support@bellotahosting.net
   - Incluir nombres de plugins que entran en conflicto

---

## Errores 404 en endpoints

### "404 Not Found en /wp-json/bahia/v1/posts"

**Causa:** Los permalinks de WordPress no están configurados correctamente

**Soluciones:**

1. **Regenerar permalinks:**
   - Dashboard → Settings → Permalinks
   - Seleccionar estructura (no "Plain")
   - Clic en "Save Changes"

2. **Verificar .htaccess:**
   - Debe contener reglas para REST API
   - Por FTP, revisar que existe y tiene contenido

3. **Crear .htaccess manualmente:**
   ```apache
   # BEGIN WordPress
   <IfModule mod_rewrite.c>
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.php [L]
   </IfModule>
   # END WordPress
   ```

4. **Probar con URL completa:**
   ```bash
   curl "https://ejemplo.com/wp-json/bahia/v1/posts"
   ```

---

## Errores de respuesta vacía

### "API devuelve array vacío []"

**Problema:** Requests devuelven `[]` aunque hay artículos

**Causa:** Artículos no están publicados o tienen estado diferente

**Soluciones:**

1. **Verificar estado de artículos:**
   - Dashboard → Posts
   - Asegurar que tienen status "Published"
   - No "Draft" o "Pending"

2. **Verificar categorías:**
   - Si usas filtro `categories=5`
   - Asegurar que artículos tienen esa categoría
   - O quitar filtro temporalmente para probar

3. **Verificar búsqueda:**
   - Si usas `search=término`
   - Asegurar que el término existe en título/contenido

4. **Probar sin parámetros:**
   ```bash
   curl "https://ejemplo.com/wp-json/bahia/v1/posts"
   ```
   Si esto devuelve resultados, el problema está en los filtros

---

## Errores de memoria

### "Fatal error: Out of memory"

**Error:**
```
Fatal error: Allowed memory size of 134217728 bytes exhausted
```

**Causa:** Limite de memoria de PHP es bajo

**Soluciones en cPanel:**

1. **MultiPHP INI Editor:**
   - cPanel → MultiPHP INI Editor
   - Buscar `memory_limit`
   - Cambiar a `512M` o `1G`
   - Guardar

2. **O editar wp-config.php:**
   ```php
   define('WP_MEMORY_LIMIT', '512M');
   define('WP_MAX_MEMORY_LIMIT', '1G');
   ```

3. **Por terminal:**
   ```bash
   php -r "echo ini_get('memory_limit');"
   ```

---

## Contacto de soporte

Si después de estas soluciones persiste el problema:

**Email:** support@bellotahosting.net

**Incluir:**
- Versión de PHP
- Versión de WordPress
- Mensaje de error exacto
- Pasos para reproducir el problema
- Logs de `/wp-content/debug.log` (si disponible)

**Foro de soporte:**
https://bellotahosting.net/forum/

---

**Última actualización:** 2024-06-14
**Versión de Bellota API:** 3.0.0
