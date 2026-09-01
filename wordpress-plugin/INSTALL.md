# Guía de Instalación - Bellota API

## Requisitos previos

- PHP 7.4 o superior
- WordPress 5.9 o superior
- Acceso a cPanel, FTP o editor de archivos
- MySQL/MariaDB (incluido en WordPress)

## Método 1: Instalación desde WordPress (Recomendado)

### Si tienes acceso al panel de control de WordPress

1. **Ir a Plugins**
   - Dashboard de WordPress → Plugins → Agregar nuevo

2. **Buscar e instalar**
   - Buscar "Bellota API"
   - Clic en "Instalar ahora"
   - Clic en "Activar"

3. **Configurar**
   - Ir a Bellota API en el menú lateral
   - Revisar configuración
   - ¡Listo!

## Método 2: Instalación mediante cPanel

### Paso 1: Conectar a cPanel

1. Abrir cPanel (usualmente en `cpanel.tu-dominio.com`)
2. Ingresar usuario y contraseña
3. Ir a **File Manager**

### Paso 2: Subir archivos

1. Navegar a `public_html/wp-content/plugins`
2. Crear nueva carpeta: `bellota-api`
3. Abrir carpeta creada
4. Subir estos archivos:
   - `bellota-api.php`
   - `README.md`
   - `INSTALL.md`
   - Carpeta `includes/` completa
   - Carpeta `assets/` completa

### Paso 3: Activar en WordPress

1. Ir al panel de WordPress
2. Dashboard → Plugins
3. Encontrar "Bellota API"
4. Clic en "Activar"

## Método 3: Instalación mediante FTP

### Paso 1: Conectar por FTP

Usar cliente FTP (FileZilla, WinSCP, etc.):
```
Host: tu-dominio.com (o IP del servidor)
Usuario: tu-usuario-ftp
Contraseña: tu-contraseña-ftp
Puerto: 21 (o 22 para SFTP)
```

### Paso 2: Navegar y crear carpeta

1. Navegar a `/public_html/wp-content/plugins`
2. Crear carpeta: `bellota-api`
3. Entrar a la carpeta

### Paso 3: Subir archivos

Subir todos estos archivos a la carpeta:
```
bellota-api.php
README.md
INSTALL.md
includes/
  └── admin-dashboard.php
  └── .htaccess
assets/
  └── admin.css
  └── admin.js
  └── favicon.svg
  └── .htaccess
```

### Paso 4: Activar

1. Ir a WordPress Dashboard
2. Plugins → Encontrar "Bellota API"
3. Activar

## Método 4: Instalación por terminal (Avanzado)

### Si tienes acceso SSH

```bash
# Conectar al servidor
ssh usuario@tu-dominio.com

# Navegar a plugins
cd public_html/wp-content/plugins

# Crear carpeta
mkdir bellota-api
cd bellota-api

# Descargar plugin (o subir manualmente)
wget https://tu-servidor.com/bellota-api.zip
unzip bellota-api.zip

# Asegurar permisos correctos
chmod 755 .
chmod 644 *.php
chmod 644 *.md
chmod 755 includes
chmod 755 assets

# Listo, activar desde WordPress
```

## Verificación después de la instalación

### Checklist de verificación

- [ ] Carpeta `bellota-api` existe en `/wp-content/plugins/`
- [ ] Archivo `bellota-api.php` está presente
- [ ] Opción "Bellota API" aparece en el menú de WordPress
- [ ] Panel administrativo carga sin errores
- [ ] Sin mensajes de error en el log de WordPress

### Comprobar que funciona

1. **Comprobar endpoints**
   ```bash
   curl "https://tu-dominio.com/wp-json/bahia/v1/posts"
   ```

2. **Ver respuesta JSON**
   - Debería retornar array de artículos
   - Status 200 (éxito)

3. **Revisar logs**
   - WordPress → Tools → Site Health
   - Verificar sin errores críticos

## Posibles errores y soluciones

### Error: "Parse error" en bellota-api.php

**Causa:** Versión de PHP inferior a 7.4

**Solución:**
```
1. Contactar al hosting para actualizar PHP
2. O crear archivo `wp-config-extra.php` con:
   <?php
   // Si PHP < 7.4, desactivar manualmente
   define('WP_DEBUG', false);
```

### Error: "Fatal error: Uncaught Error"

**Causa:** Función de WordPress no disponible

**Solución:**
```
1. Verificar que WordPress está completamente instalado
2. Desactivar otros plugins que puedan entrar en conflicto
3. Activar DEBUG en wp-config.php:
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
```

### Error: "Permission denied" al subir archivos

**Solución en cPanel:**
1. Ir a File Manager
2. Click derecho en carpeta `bellota-api`
3. Change Permissions → 755
4. Click derecho en archivos → 644

**Solución en FTP:**
1. Seleccionar carpeta
2. Click derecho → File Permissions
3. Establecer a 755
4. Archivos a 644

### CORS Bloqueado

**Error en consola:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
1. Editar `bellota-api.php`
2. Encontrar línea con `BAHIA_API_ORIGINS`
3. Agregar tu dominio:
   ```php
   define('BAHIA_API_ORIGINS', [
       'https://mi-dominio.com',
       'https://www.mi-dominio.com',
       'https://otro-dominio.com',
   ]);
   ```
4. Guardar archivo
5. Vaciar caché del navegador

## Próximos pasos

### 1. Configurar orígenes CORS

Si tienes múltiples dominios, editar `bellota-api.php`:
```php
define('BAHIA_API_ORIGINS', [
    'https://bahiafronteriza.com.do',
    'https://www.bahiafronteriza.com.do',
    'https://frontend.example.com',
]);
```

### 2. Ajustar límites de caché

Según tus necesidades, editar constantes de TTL:
```php
define('BAHIA_API_TTL_POSTS', 120);    // Cambiar a tu valor
```

### 3. Optimizar rate limiting

Si tu frontend hace muchas requests:
```php
define('BAHIA_API_LIMIT_POSTS', 36000);  // Aumentar si es necesario
```

### 4. Monitorear rendimiento

Ir a **Bellota API** en el panel para ver:
- Estadísticas en tiempo real
- Latencia de requests
- Tasa de caché hits
- Log de actividad

## Soporte

Si encuentras problemas:

1. **Revisar error log**
   - WordPress → Tools → Site Health
   - O revisar `/wp-content/debug.log`

2. **Contactar soporte**
   - Email: support@bellotahosting.net
   - Incluir: versión PHP, WordPress, error exacto

3. **Comunidad**
   - Foro: https://bellotahosting.net/forum
   - Chat: support@bellotahosting.net

---

**¡Instalación completada!** El plugin está listo para usar.
