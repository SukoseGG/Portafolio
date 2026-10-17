import os
from flask import Flask, render_template

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 3600  # caché de estáticos: 1 hora


@app.after_request
def cabeceras_seguridad(respuesta):
    respuesta.headers["Content-Security-Policy"] = (
        "default-src 'self'; base-uri 'none'; "
        "form-action 'none'; frame-ancestors 'none'"
    )
    respuesta.headers["X-Content-Type-Options"] = "nosniff"
    respuesta.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return respuesta


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/salud")
def salud():
    return {"estado": "ok"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))
