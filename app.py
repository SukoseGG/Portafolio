import os
import re
import time
from collections import deque

import psutil
import requests
from flask import Flask, jsonify, render_template, request, url_for

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 3600     # caché de estáticos: 1 hora
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024       # rechaza peticiones de más de 16 KB

INICIO = time.time()
psutil.cpu_percent(interval=None)  # la primera lectura siempre da 0.0, la descartamos

RESEND_URL = "https://api.resend.com/emails"
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MENSAJES_POR_HORA = 10          # tope total, protege tu cuota de Resend y tu bandeja
_envios = deque()               # marcas de tiempo de los envíos recientes

# Un texto puede ser un string o {"es": ..., "en": ...}
PROYECTOS = [
    {
        "titulo": "System Resource Monitor",
        "descripcion": {
            "es": "Panel que muestra el uso de recursos del sistema en tiempo real.",
            "en": "Dashboard that shows system resource usage in real time.",
        },
        "tags": ["Python", "Flask", "psutil"],
        "url": "",  # enlace a la demo o al repositorio
    },
    {
        "titulo": {"es": "Tarjeta digital", "en": "Digital card"},
        "descripcion": {
            "es": "Página con una tarjeta descargable y audio incrustado, publicada en Render.",
            "en": "Web page with a downloadable card and embedded audio, deployed on Render.",
        },
        "tags": ["Flask", "Render", "JavaScript"],
        "url": "",
    },
]

_cache_sistema = {"momento": 0.0, "datos": None}


def leer_sistema():
    """Lee CPU y RAM como máximo una vez cada 2 s, sin importar cuántos visitantes haya."""
    ahora = time.monotonic()
    if _cache_sistema["datos"] is None or ahora - _cache_sistema["momento"] > 2:
        _cache_sistema["momento"] = ahora
        _cache_sistema["datos"] = {
            "cpu": psutil.cpu_percent(interval=None),
            "ram": psutil.virtual_memory().percent,
            "uptime": int(time.time() - INICIO),
        }
    return _cache_sistema["datos"]


def hay_cupo():
    ahora = time.monotonic()
    while _envios and ahora - _envios[0] > 3600:
        _envios.popleft()
    return len(_envios) < MENSAJES_POR_HORA


@app.context_processor
def ayudantes_plantilla():
    def estatico(archivo):
        ruta = os.path.join(app.static_folder, archivo)
        return url_for("static", filename=archivo, v=int(os.path.getmtime(ruta)))
    return {"estatico": estatico}


@app.after_request
def cabeceras_seguridad(respuesta):
    respuesta.headers["Content-Security-Policy"] = (
        "default-src 'self'; base-uri 'none'; "
        "form-action 'none'; frame-ancestors 'none'"
    )
    respuesta.headers["X-Content-Type-Options"] = "nosniff"
    respuesta.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if request.path.startswith("/api/"):
        respuesta.headers["Cache-Control"] = "no-store"
    return respuesta


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/salud")
def salud():
    return {"estado": "ok"}


@app.route("/api/proyectos")
def api_proyectos():
    return jsonify(PROYECTOS)


@app.route("/api/sistema")
def api_sistema():
    return jsonify(leer_sistema())


@app.post("/api/contacto")
def api_contacto():
    datos = request.get_json(silent=True)     # solo acepta JSON, no formularios de otros sitios
    if not isinstance(datos, dict):
        return jsonify(error="invalido"), 400
    if datos.get("web"):                      # campo trampa: solo los bots lo llenan
        return jsonify(ok=True)               # fingimos éxito para no darles pistas

    nombre = " ".join(str(datos.get("nombre", "")).split())   # quita saltos de línea
    correo = str(datos.get("correo", "")).strip()
    mensaje = str(datos.get("mensaje", "")).strip()
    if not (
        1 <= len(nombre) <= 80
        and len(correo) <= 120 and EMAIL_RE.match(correo)
        and 1 <= len(mensaje) <= 2000
    ):
        return jsonify(error="invalido"), 400
    if not hay_cupo():
        return jsonify(error="limite"), 429

    clave = os.environ.get("RESEND_API_KEY")
    destino = os.environ.get("CONTACTO_DESTINO")
    if not clave or not destino:
        return jsonify(error="servidor"), 503

    try:
        respuesta = requests.post(
            RESEND_URL,
            headers={"Authorization": f"Bearer {clave}"},
            json={
                "from": "Portafolio <onboarding@resend.dev>",
                "to": [destino],
                "reply_to": correo,
                "subject": f"Portafolio: mensaje de {nombre[:60]}",
                "text": f"De: {nombre} <{correo}>\n\n{mensaje}",
            },
            timeout=8,
        )
        respuesta.raise_for_status()
    except requests.RequestException:
        app.logger.exception("no se pudo enviar el correo")
        return jsonify(error="servidor"), 502

    _envios.append(time.monotonic())
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))