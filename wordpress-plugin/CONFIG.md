# Configuración avanzada - Bellota API

## Configuración de CORS

### Agregar múltiples dominios

Editar `bellota-api.php` y modificar:

```php
define('BAHIA_API_ORIGINS', [
    'https://bahiafronteriza.com.do',
    'https://www.bahiafronteriza.com.do',
    'http://localhost:3000',           // Desarrollo local
    'https://app.ejemplo.com',         // App externa
    'https://mobile.ejemplo.com',      // App móvil
]);
```

### Permitir todos los orígenes (NO RECOMENDADO)

```php
define('BAHIA_API_ORIGINS', ['*']);  // ⚠️ Solo para desarrollo
```

### Dominios con subdominio

```php
define('BAHIA_API_ORIGINS', [
    'https://bahiafronteriza.com.do',
    'https://www.bahiafronteriza.com.do',
    'https://app1.bahiafronteriza.com.do',
    'https://app2.bahiafronteriza.com.do',
]);
```

## Configuración de Caché (TTL)

### Tiempos de vida en caché

```php
// Artículos - cambios frecuentes
define('BAHIA_API_TTL_POSTS', 120);      // 2 minutos (default)
define('BAHIA_API_TTL_POSTS', 300);      // 5 minutos (más estable)
define('BAHIA_API_TTL_POSTS', 600);      // 10 minutos (menos actualizaciones)

// Artículos individuales (por slug)
define('BAHIA_API_TTL_SLUG', 300);       // 5 minutos (default)
define('BAHIA_API_TTL_SLUG', 600);       // 10 minutos

// Categorías - raramente cambian
define('BAHIA_API_TTL_CATS', 3600);      // 1 hora (default)
define('BAHIA_API_TTL_CATS', 86400);     // 24 horas (máximo)

// Media/Imágenes - nunca cambian
define('BAHIA_API_TTL_MEDIA', 86400);    // 24 horas (default)
define('BAHIA_API_TTL_MEDIA', 604800);   // 7 días (máximo)
```

### Recomendaciones por tipo de sitio

#### Blog de actualizaciones frecuentes
```php
define('BAHIA_API_TTL_POSTS', 120);      // 2 minutos
define('BAHIA_API_TTL_SLUG', 300);       // 5 minutos
define('BAHIA_API_TTL_CATS', 3600);      // 1 hora
define('BAHIA_API_TTL_MEDIA', 86400);    // 24 horas
```

#### Periódico (noticias por hora)
```php
define('BAHIA_API_TTL_POSTS', 300);      // 5 minutos
define('BAHIA_API_TTL_SLUG', 600);       // 10 minutos
define('BAHIA_API_TTL_CATS', 3600);      // 1 hora
define('BAHIA_API_TTL_MEDIA', 86400);    // 24 horas
```

#### Sitio estático/poco cambio
```php
define('BAHIA_API_TTL_POSTS', 3600);     // 1 hora
define('BAHIA_API_TTL_SLUG', 3600);      // 1 hora
define('BAHIA_API_TTL_CATS', 86400);     // 24 horas
define('BAHIA_API_TTL_MEDIA', 604800);   // 7 días
```

## Configuración de Rate Limiting

### Límites por endpoint

```php
// Posts (lectura)
define('BAHIA_API_LIMIT_POSTS', 36000);       // 600/minuto (default)
define('BAHIA_API_LIMIT_POSTS', 72000);       // 1200/minuto (más alto)
define('BAHIA_API_LIMIT_POSTS', 18000);       // 300/minuto (más bajo)

// Categorías (lectura)
define('BAHIA_API_LIMIT_CATEGORIES', 36000);  // 600/minuto (default)

// Media (lectura)
define('BAHIA_API_LIMIT_MEDIA', 36000);       // 600/minuto (default)

// Vistas (escritura)
define('BAHIA_API_LIMIT_VIEW', 7200);         // 120/minuto (default)
define('BAHIA_API_LIMIT_VIEW', 3600);         // 60/minuto (más restrictivo)
```

### Configuración según tipo de tráfico

#### Frontend Next.js (SSR/ISR)
```php
// El frontend hace requests desde el servidor
// Usar límites altos para NO bloquear renders
define('BAHIA_API_LIMIT_POSTS', 36000);       // 600/min
define('BAHIA_API_LIMIT_CATEGORIES', 36000);  // 600/min
define('BAHIA_API_LIMIT_MEDIA', 36000);       // 600/min
define('BAHIA_API_LIMIT_VIEW', 7200);         // 120/min
```

#### API pública (múltiples clientes)
```php
// Proteger más contra abuso
define('BAHIA_API_LIMIT_POSTS', 18000);       // 300/min
define('BAHIA_API_LIMIT_CATEGORIES', 18000);  // 300/min
define('BAHIA_API_LIMIT_MEDIA', 18000);       // 300/min
define('BAHIA_API_LIMIT_VIEW', 3600);         // 60/min
```

## Configuración de Throttling

### Espaciar requests mínimamente

```php
// Throttle desactivado (el frontend serializa)
define('BAHIA_API_MIN_REQUEST_INTERVAL_MS', 0);    // default

// Espaciar requests a 50ms (solo si necesario)
define('BAHIA_API_MIN_REQUEST_INTERVAL_MS', 50);   // 50ms entre requests

// Espaciar requests a 100ms (muy restrictivo)
define('BAHIA_API_MIN_REQUEST_INTERVAL_MS', 100);  // 100ms entre requests
```

## Configuración de Máximo de resultados por página

```php
define('BAHIA_API_MAX_PER_PAGE', 50);   // Maximum permitido
define('BAHIA_API_MAX_PER_PAGE', 100);  // Aumentar si se necesita
define('BAHIA_API_MAX_PER_PAGE', 25);   // Reducir para menor carga
```

## Optimizaciones para hosting compartido

### Configuración lite para recursos limitados

```php
// Caché más agresivo
define('BAHIA_API_TTL_POSTS', 600);         // 10 minutos
define('BAHIA_API_TTL_SLUG', 900);          // 15 minutos
define('BAHIA_API_TTL_CATS', 86400);        // 24 horas

// Rate limiting más restrictivo
define('BAHIA_API_LIMIT_POSTS', 18000);     // 300/min
define('BAHIA_API_LIMIT_CATEGORIES', 18000);
define('BAHIA_API_LIMIT_MEDIA', 18000);
define('BAHIA_API_LIMIT_VIEW', 3600);       // 60/min

// Máximo de items por página reducido
define('BAHIA_API_MAX_PER_PAGE', 25);
```

## Optimizaciones para hosting de alto rendimiento

### Configuración agresiva

```php
// Caché menos restrictivo
define('BAHIA_API_TTL_POSTS', 60);          // 1 minuto
define('BAHIA_API_TTL_SLUG', 120);          // 2 minutos
define('BAHIA_API_TTL_CATS', 3600);         // 1 hora

// Rate limiting más alto
define('BAHIA_API_LIMIT_POSTS', 72000);     // 1200/min
define('BAHIA_API_LIMIT_CATEGORIES', 72000);
define('BAHIA_API_LIMIT_MEDIA', 72000);
define('BAHIA_API_LIMIT_VIEW', 14400);      // 240/min

// Máximo de items por página aumentado
define('BAHIA_API_MAX_PER_PAGE', 100);
```

## Variables de entorno (Alternativa a defines)

Si prefieres usar variables de entorno en lugar de editar el código:

### En archivo .htaccess
```apache
SetEnv BAHIA_API_TTL_POSTS 300
SetEnv BAHIA_API_LIMIT_POSTS 36000
SetEnv BAHIA_API_ORIGINS "https://example.com,https://app.example.com"
```

### En wp-config.php
```php
// Definir antes de incluir wp-settings.php
define('BELLOTA_API_TTL_POSTS', getenv('BAHIA_API_TTL_POSTS') ?: 120);
define('BELLOTA_API_LIMIT_POSTS', getenv('BAHIA_API_LIMIT_POSTS') ?: 36000);
```

## Integración con plugins de caché

### Con W3 Total Cache
```php
// El plugin usa WordPress transients
// Bellota API es compatible automáticamente
// Configurar en W3TC:
// - Database Cache: Habilitado
// - Object Cache: Habilitado (si Redis disponible)
```

### Con WP Super Cache
```php
// Compatible - no necesita configuración especial
// Bellota API tiene su propio sistema de caché
// independiente de WP Super Cache
```

### Con Redis Cache
```php
// Si tienes Redis habilitado en WordPress
// Bellota API usará automáticamente wp_cache functions
// que se benefician de Redis
```

## Monitoreo y debug

### Habilitar debug mode

```php
// En wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Logs en /wp-content/debug.log
```

### Headers de debug en respuestas API

```php
// Cada respuesta incluye:
// X-Bellota-Total-Requests: número total
// X-Bellota-Avg-Latency: latencia promedio
// X-Bellota-Hit-Rate: porcentaje de cache hits
// X-Cache: HIT or MISS
```

### Ver estadísticas en panel admin

1. WordPress → Bellota API
2. Ver Dashboard con gráficos en tiempo real
3. Revisar "Activity Log"

## Problemas comunes y soluciones

### Caché muy agresivo (contenido desactualizado)

**Síntoma:** Cambios no se reflejan inmediatamente

**Solución:**
```php
define('BAHIA_API_TTL_POSTS', 60);  // Reducir TTL
```

**Alternativa:** Vaciar caché manualmente desde panel admin

### Too many requests (Error 429)

**Síntoma:** Frontend recibe errores de rate limit

**Solución para Next.js SSR:**
```php
define('BAHIA_API_LIMIT_POSTS', 72000);  // Aumentar límite
```

### Latencia alta

**Causa:** Caché no está funcionando

**Solución:**
1. Verificar que transients están activos
2. Si tienes Redis, activarlo en WordPress
3. Reducir TTL para cachear más frecuentemente

---

Para más ayuda, contactar a soporte@bellotahosting.net
