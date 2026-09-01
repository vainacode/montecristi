# Morro Informativo

Portal de noticias digital líder en Montecristi y la región noroeste de la República Dominicana.

Construido con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** y **WordPress Headless CMS**.

---

## Características principales

- **Headless CMS:** WordPress REST API v2 como backend de contenido
- **ISR (Incremental Static Regeneration):** Páginas pre-generadas con revalidación automática cada 60s
- **"Las Más Leídas" con GA4:** Ranking real de artículos por visitas de Google Analytics (con fallback a WordPress)
- **Marca de agua automática:** Las imágenes descargadas incluyen el logo del portal
- **Newsletter funcional:** Compatible con Mailchimp y Brevo (Sendinblue)
- **Campanita de notificaciones:** Panel de últimas noticias en el header
- **Páginas de categoría únicas:** Cada sección tiene un diseño visual propio (Montecristi, Viral, Farándula, La República)
- **Protección Cloudflare:** Headers de seguridad, middleware de bots, caché CDN optimizada
- **SEO completo:** Open Graph, Twitter Cards, Facebook App ID, metadatos dinámicos por página

---

## Configuración rápida

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales (newsletter, GA4 — ver sección más abajo).

### 3. Configurar el sitio

Abre `src/config/site.ts` — **este es el único archivo que necesitas editar** para personalizar:

- Nombre y URL del sitio
- URLs de redes sociales
- ID de Google Analytics
- Imagen OG por defecto
- Configuración de AdSense
- Proveedor de newsletter

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

---

## Google Analytics 4

### Paso 1 — Activar el tracking

1. Ve a [analytics.google.com](https://analytics.google.com) → Administrar → Crear propiedad
2. En **Streams de datos** → Web → copia el **Measurement ID** (formato `G-XXXXXXXXXX`)
3. Agrega en `src/config/site.ts`:

```ts
googleAnalytics: {
  measurementId: "G-TU_ID_AQUI",  // ← pega aquí
  // ...
}
```

Con solo este paso, GA4 ya rastrea todas las visitas automáticamente, incluyendo navegación entre páginas (SPA).

---

### Paso 2 — Activar "Las Más Leídas" con datos reales de GA

Por defecto, el widget usa los posts recientes como fallback. Para que muestre los artículos con más visitas reales en los últimos 7 días, completa este setup una sola vez:

#### A) Crear cuenta de servicio en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto o selecciona el existente
3. Habilita la **Google Analytics Data API**:
   - Ir a *APIs y servicios* → *Biblioteca*
   - Buscar "Google Analytics Data API" → Habilitar
4. Crear cuenta de servicio:
   - Ir a *IAM y administración* → *Cuentas de servicio* → Crear
   - Nombre: `morro-analytics-reader` (o cualquiera)
   - Rol: ninguno (se asigna en GA4)
   - Clic en *Listo* → Abrir la cuenta → pestaña **Claves** → Agregar clave JSON
   - Descarga el archivo JSON

#### B) Dar acceso en GA4

1. En Google Analytics: *Administrar* → *Gestión de acceso a la cuenta*
2. Agregar el **email de la cuenta de servicio** (`xxxx@tu-proyecto.iam.gserviceaccount.com`)
3. Rol: **Lector**

#### C) Copiar credenciales a `.env.local`

Del archivo JSON descargado, extrae:

```bash
# .env.local

# El campo "client_email" del JSON
GA_SERVICE_ACCOUNT_EMAIL=mi-cuenta@mi-proyecto.iam.gserviceaccount.com

# El campo "private_key" del JSON (TODO en una sola línea, los saltos de línea como \n literal)
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
```

> **Truco:** Para convertir la clave a una línea, ejecuta en la terminal:
> ```bash
> cat tu-archivo.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['private_key'].replace('\n','\\n'))"
> ```

#### D) Agregar el Property ID en `site.ts`

El Property ID es el número que aparece en GA4 → *Administrar* → *Configuración de la propiedad* (solo números, ej: `123456789`).

```ts
googleAnalytics: {
  measurementId: "G-XXXXXXXXXX",
  propertyId: "123456789",       // ← agregar aquí
}
```

#### E) Resultado

- El widget "Las Más Leídas" consultará GA4 cada hora y mostrará los 5 artículos más visitados en los últimos 7 días
- Si las credenciales fallan o no hay datos suficientes, vuelve automáticamente al fallback de WordPress

---

## Newsletter

El formulario de suscripción está conectado a `/api/newsletter`. Para activarlo:

### Opción A — Brevo (recomendado, gratuito hasta 300 emails/día)

1. Crea cuenta en [brevo.com](https://brevo.com)
2. *Settings* → *API Keys* → Crea una clave
3. *Contacts* → *Lists* → Crea una lista y anota su ID (número)
4. En `src/config/site.ts`: cambia `provider: "brevo"`
5. En `.env.local`:
   ```
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
   BREVO_LIST_ID=3
   ```

### Opción B — Mailchimp

1. Crea cuenta en [mailchimp.com](https://mailchimp.com)
2. *Account* → *API Keys* → Crea una clave
3. *Audience* → *Settings* → anota el **Audience ID**
4. En `src/config/site.ts`: cambia `provider: "mailchimp"`
5. En `.env.local`:
   ```
   MAILCHIMP_API_KEY=xxxxxxxxxx-us1
   MAILCHIMP_LIST_ID=abc123def
   ```

---

## Marca de agua en imágenes

Configuración en `src/config/site.ts` → sección `watermark`:

```ts
watermark: {
  enabled: true,              // activar/desactivar
  opacity: 0.75,              // 0 = invisible, 1 = opaco total
  position: "bottom-right",  // bottom-right | bottom-left | center
  sizePercent: 22,            // tamaño del logo = 22% del ancho
  marginPercent: 2,           // margen desde los bordes
}
```

La marca de agua se aplica en `/api/image?url=<url>`. En las páginas de artículos, hacer clic derecho sobre la imagen principal descarga automáticamente la versión marcada.

---

## Protección con Cloudflare

### Para Cloudflare CDN (Proxy)

1. Agrega tu dominio a [cloudflare.com](https://cloudflare.com)
2. Cambia los nameservers a los de Cloudflare
3. Activa el proxy (nube naranja) en tu DNS
4. Los headers de seguridad de `next.config.ts` y `middleware.ts` se aplican automáticamente
5. Para mejor rendimiento, activa **Argo Smart Routing** y **HTTP/3**

### Para Cloudflare Pages

El archivo `public/_headers` configura caché y seguridad automáticamente.

### Reglas de Firewall recomendadas en Cloudflare

| Expresión | Acción |
|-----------|--------|
| `ip.geoip.country in {"CN" "RU" "KP"}` | Block (ajusta según tu audiencia) |
| `http.request.uri.path contains "/wp-admin"` | Block |
| `http.request.uri.path contains "/xmlrpc.php"` | Block |
| `cf.threat_score > 30` | Challenge |

---

## Despliegue en Producción (FastPanel)

Este proyecto está optimizado para su despliegue en paneles como **FastPanel** o cualquier servidor con Node.js.

1.  **Configuración del Servidor:**
    *   Asegúrate de que la URL de WordPress en `src/config/site.ts` sea accesible desde tu servidor.
    *   Configura el puerto (por defecto 3000) en las opciones de Node.js de FastPanel.
    
2.  **Compilación Local:**
    ```bash
    npm run build
    ```
    
3.  **Archivos para Subir:**
    *   Debido al modo `output: 'standalone'` configurado en `next.config.ts`, la forma más eficiente de desplegar es subir el contenido de la carpeta `.next/standalone` al servidor.
    *   También debes copiar las carpetas `public/` y `.next/static/` dentro de la carpeta standalone de destino para que los estilos y archivos se carguen correctamente.

4.  **Ejecución:**
    *   Usa `node server.js` para iniciar el servidor de producción.

## Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz con metadata completa
│   ├── page.tsx                # Portada
│   ├── category/[slug]/        # Páginas de categoría (diseño único por sección)
│   ├── article/[slug]/         # Artículo individual
│   └── api/
│       ├── newsletter/         # POST → suscripción newsletter
│       ├── posts/              # GET → posts paginados (cargar más)
│       └── image/              # GET → imagen con marca de agua
├── components/
│   ├── Header.tsx              # Navegación + campanita de notificaciones
│   ├── NewsCard.tsx            # Tarjeta de noticia (hero / grid / secondary)
│   ├── LoadMoreFeed.tsx        # Feed paginado con "Cargar más"
│   ├── MostRead.tsx            # Widget "Las Más Leídas"
│   ├── NewsletterWidget.tsx    # Formulario de newsletter funcional
│   ├── AdSense.tsx             # Publicidad (AdSense + custom + placeholder)
│   ├── AnalogClock.tsx         # Reloj analógico (usado en Montecristi)
│   ├── ProtectedImage.tsx      # Imagen con descarga de marca de agua
│   └── GoogleAnalytics.tsx     # Script GA4 + tracking SPA
├── config/
│   └── site.ts                 # ← TODA la configuración aquí
└── lib/
    ├── wp.ts                   # WordPress API
    └── analytics.ts            # GA4 Data API para "Las Más Leídas"
middleware.ts                   # Seguridad Cloudflare + cache headers
```

---

## Despliegue

**Vercel** (recomendado): compatible con ISR, Edge Functions y variables de entorno.

**Cloudflare Pages**: usa `@cloudflare/next-on-pages` y el archivo `public/_headers` incluido.

---

## Seguridad API de WordPress

> El frontend se desplegará en `morronoticias.com`. El CMS de WordPress debe estar en un subdominio no obvio.

**No usar:** `admin.`, `wp.`, `cms.` — son los primeros objetivos de bots y escáneres.
**Usar:** Algo como `api-x9k2.morronoticias.com` o `redaccion.morronoticias.com`.

Configura la URL en `src/config/site.ts` → `api.wordpressUrl`.

<!-- Last deployment update: 2026-04-21 -->
