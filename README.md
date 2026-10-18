# Portafolio · Sukose

Sitio web personal de **Sukose**, desarrollador Python, Flask y herramientas web.  
Una página estilo *"desktop window manager"* (ventanas móviles, terminal emulada y tema retro verde-tóxico sobre fondo negro).

## Características

- **One-page** con ventanas estilo Windows: arrástralas, minimízalas, ciérralas desde la barra de tareas.
- **Terminal emulada** integrada con comandos (`help`, `about`, `skills`, `projects`, `contact`, `whoami`, `lang`, `clear`).
- **Pantalla de arranque** tipo BIOS/boot (se muestra una vez por sesión).
- **Multilingüe** completo (es / en) con persistencia en `localStorage`.
- **Formulario de contacto** con envío real por [Resend](https://resend.com) (incluye honeypot anti-spam y rate-limiting).
- **Dashboard de recursos** en tiempo real (CPU, RAM, uptime) vía `psutil` con caché de 2 s.
- **Barra de tareas** con reloj en vivo y toggle de idioma.
- **Seguridad**: CSP estricta, headers de seguridad, cache-busting de estáticos.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3 · Flask 3 |
| Monitor de recursos | psutil |
| Envío de email | Resend API (requests) |
| Servidor (producción) | Gunicorn |
| Frontend | HTML5 · CSS3 (vanilla) · JavaScript (ES2023, vanilla) |
| Despliegue | Render (proyectos) |

## Estructura del proyecto

```
.
├── app.py                 # Aplicación Flask (rutas, datos, seguridad)
├── requirements.txt       # Dependencias
├── .env.example           # Template de variables de entorno
├── templates/
│   └── index.html         # Única plantilla (renderizada por Flask)
└── static/
    ├── style.css          # Estilos (tema oscuro, HUD, terminal)
    ├── main.js            # JS principal (i18n, ventanas, datos, contacto)
    ├── extras.js          # JS extra (terminal, arranque, formulario)
    └── ruido.svg          # Textura de grano visual (SVG con filtro fractal noise)
```

## Cómo ejecutar localmente

### 1. Clonar y crear el entorno virtual

```bash
git clone https://github.com/SukoseGG/Portafolio.git
cd Portafolio
python -m venv .venv
```

### 2. Instalar dependencias

```bash
source .venv/bin/activate        # Linux / macOS
# o
.venv\Scripts\activate            # Windows

pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `RESEND_API_KEY` | Clave API de Resend para enviar correos. | Solo para contacto |
| `CONTACTO_DESTINO` | Email donde llegarán los mensajes del formulario. | Solo para contacto |
| `PORT` | Puerto del servidor (default: `8000`). | No |

> Sin `RESEND_API_KEY` / `CONTACTO_DESTINO`, el formulario de contacto responde `503` (modo de desarrollo sin envío de email).

### 4. Ejecutar

```bash
python app.py
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000) 🌐

## Despliegue (producción)

```bash
gunicorn app:app
```

En **Render** o similar, configura las variables de entorno `RESEND_API_KEY` y `CONTACTO_DESTINO`, y apunta el build command a `pip install -r requirements.txt` y el start command a `gunicorn app:app`.

## API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/salud` | Health check → `{"estado": "ok"}` |
| `GET` | `/api/proyectos` | Lista de proyectos (JSON) |
| `GET` | `/api/sistema` | `cpu`, `ram`, `uptime` (psutil, cached 2s) |
| `POST` | `/api/contacto` | Envía un email (JSON). Rate-limited a 10/hora. |

### `POST /api/contacto`

```json
{
  "nombre": "Ana",
  "correo": "ana@ejemplo.com",
  "mensaje": "Hola, me gustaría cotizar un proyecto.",
  "web": ""        // honeypot: dejar vacío
}
```

Respuestas: `200 ok` · `400 invalido` · `429 limite` · `503 servidor` · `502` (fallo de Resend)

## Desarrollo

- Los textos del frontend viven en `TEXTOS` (`main.js`) y `TEXTOS_EXTRA` (`extras.js`); la convención es clave-valor por idioma (`es`/`en`).
- Los datos de proyectos están en `app.py` (`PROYECTOS`) — también duplicados en `main.js`. Ver [tareas pendientes](#tareas-pendientes).
- Los estilos usan variables CSS: `--acento` (verde tóxico), `--lima`, `--menta`, `--oscuro`, `--panel`.
- Los estáticos se sirven con cache-busting automático vía el helper Jinja `estatico('archivo.js')` → `?v=<timestamp>`.

## Tareas pendientes

- ☐ Consolidar `PROYECTOS` (backend y frontend están duplicados; la API no se consume desde el cliente)
- ☐ Tests automatizados (`pytest` + Flask test client)
- ☐ Configuración de deploy (Dockerfile / gunicorn config)
- ☐ Manejadores de errores personalizados (404, 500)
- ☐ Configuración de logging explícita

## Licencia

Este proyecto es un portafolio personal. El código fuente está disponible para referencia.
