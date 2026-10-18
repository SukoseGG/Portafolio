"use strict";

/* ===== Textos de extras (main.js los mezcla con TEXTOS) ===== */
const TEXTOS_EXTRA = {
  en: {
    vYo: "me.txt",
    vTerminal: "terminal.exe",
    vMensaje: "message.exe",
    terminalBienvenida: "type help for commands, or ls to see what you can open",
    terminalAyuda: "commands:\nls, open <window>, msg, ping, date, lang en|es, clear, help",
    terminalMsgInicio: "new message. type cancel to abort.",
    terminalCancelado: "cancelled",
    terminalDesconocido: "command not found: ",
    mensajeNombre: "name",
    mensajeCorreo: "email",
    mensajeTexto: "message",
    mensajeEnviar: "send",
    mensajeEnviando: "sending...",
    mensajeOk: "message sent, thanks!",
    mensajeInvalido: "check the fields and try again",
    mensajeLimite: "too many messages right now, try again later",
    mensajeError: "could not send, try again later",
    proyectosCargando: "loading projects...",
    proyectosError: "could not load projects"
  },
  es: {
    vYo: "yo.txt",
    vTerminal: "terminal.exe",
    vMensaje: "mensaje.exe",
    terminalBienvenida: "escribe help para ver los comandos, o ls para ver qué puedes abrir",
    terminalAyuda: "comandos:\nls, open <ventana>, msg, ping, date, lang en|es, clear, help",
    terminalMsgInicio: "mensaje nuevo. escribe cancel para cancelar.",
    terminalCancelado: "cancelado",
    terminalDesconocido: "comando no encontrado: ",
    mensajeNombre: "nombre",
    mensajeCorreo: "correo",
    mensajeTexto: "mensaje",
    mensajeEnviar: "enviar",
    mensajeEnviando: "enviando...",
    mensajeOk: "mensaje enviado, gracias!",
    mensajeInvalido: "revisa los campos e inténtalo de nuevo",
    mensajeLimite: "demasiados mensajes por ahora, prueba más tarde",
    mensajeError: "no se pudo enviar, inténtalo más tarde",
    proyectosCargando: "cargando proyectos...",
    proyectosError: "no se pudieron cargar los proyectos"
  }
};

/* ===== yo.txt: edita lo que quieras mostrar (la página es pública) ===== */
const YO = [
  { es: "música: Deftones, Nirvana, Radiohead, Muse, Camellia", en: "music: Deftones, Nirvana, Radiohead, Muse, Camellia" },
  { es: "juegos: rhythm games, Deltarune, ULTRAKILL, Warframe, Minecraft", en: "games: rhythm games, Deltarune, ULTRAKILL, Warframe, Minecraft" },
  { es: "estética: cyber, Y2K y jumpstyle", en: "aesthetic: cyber, Y2K and jumpstyle" },
  { es: "color favorito: verde", en: "favorite color: green" }
];

/* ===== Envío de mensajes (lo usan message.exe y la terminal) ===== */
const ERRORES_CONTACTO = { 400: "mensajeInvalido", 429: "mensajeLimite" };

async function enviarContacto(datos) {          // devuelve la clave del texto a mostrar
  try {
    const respuesta = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    if (respuesta.ok) return "mensajeOk";
    return ERRORES_CONTACTO[respuesta.status] ?? "mensajeError";
  } catch {
    return "mensajeError";
  }
}

function iniciarFormulario() {
  const formulario = document.getElementById("contacto-form");
  const boton = document.getElementById("cf-enviar");
  const estado = document.getElementById("cf-estado");

  formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    boton.disabled = true;
    estado.textContent = t("mensajeEnviando");
    const resultado = await enviarContacto(Object.fromEntries(new FormData(formulario)));
    if (resultado === "mensajeOk") formulario.reset();
    estado.textContent = t(resultado);
    boton.disabled = false;
  });
}

/* ===== terminal.exe: lanzador y herramientas ===== */
const MAX_LINEAS_TERMINAL = 200;   // evita que el DOM crezca sin límite
const VENTANAS = {                 // alias de la terminal -> clave de la ventana
  hello: "vHola", services: "vServicios", skills: "vHabilidades", projects: "vProyectos",
  me: "vYo", terminal: "vTerminal", message: "vMensaje", links: "vRedes"
};
const PASOS_MENSAJE = [["nombre", "mensajeNombre"], ["correo", "mensajeCorreo"], ["mensaje", "mensajeTexto"]];

function botonTarea(alias) {       // hasOwn: "constructor" o "__proto__" no cuentan como ventanas
  if (!Object.hasOwn(VENTANAS, alias)) return null;
  return document.querySelector(`#tareas-lista [data-i18n="${VENTANAS[alias]}"]`);
}

function iniciarTerminal() {
  const salida = document.getElementById("terminal-salida");
  const entrada = document.getElementById("terminal-entrada");
  let flujo = null;                // conversación guiada del comando msg

  const escribir = (texto, clase) => {
    texto.split("\n").forEach(linea => salida.append(crear("p", { texto: linea || "\u00a0", clase })));
    while (salida.childElementCount > MAX_LINEAS_TERMINAL) salida.firstElementChild.remove();
    salida.scrollTop = salida.scrollHeight;
  };

  const preguntar = () => escribir(`${t(PASOS_MENSAJE[flujo.paso][1])}:`);

  async function avanzarFlujo(texto) {
    if (texto.toLowerCase() === "cancel") {
      flujo = null;
      escribir(t("terminalCancelado"));
      return;
    }
    if (!texto) return preguntar();
    flujo.datos[PASOS_MENSAJE[flujo.paso][0]] = texto;
    flujo.paso += 1;
    if (flujo.paso < PASOS_MENSAJE.length) return preguntar();

    const datos = flujo.datos;
    flujo = null;
    escribir(t("mensajeEnviando"));
    escribir(t(await enviarContacto(datos)));
  }

  const COMANDOS = {
    help: () => t("terminalAyuda"),
    ls: () => Object.keys(VENTANAS).filter(botonTarea).join("  "),
    open: ([alias]) => {
      const boton = botonTarea(alias);
      if (!boton) return "usage: open <window> (see ls)";
      boton.click();
      return null;
    },
    msg: () => {
      flujo = { paso: 0, datos: {} };
      escribir(t("terminalMsgInicio"));
      preguntar();
      return null;
    },
    ping: async () => {
      const inicio = performance.now();
      try {
        const respuesta = await fetch("/salud", { cache: "no-store" });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return `pong: ${Math.round(performance.now() - inicio)} ms`;
      } catch {
        return "ping failed";
      }
    },
    date: () => new Date().toLocaleString(idioma),
    sudo: args => {
      if (args.join(" ") !== "hire me") return "sudo: nice try";
      botonTarea("message")?.click();
      return "permission granted. opening message.exe...";
    },
    clear: () => { salida.replaceChildren(); return null; },
    lang: ([destino]) => {
      if (!IDIOMAS.includes(destino)) return "usage: lang en|es";
      if (destino !== idioma) document.getElementById("idioma").click();
      return null;
    }
  };

  entrada.addEventListener("keydown", async evento => {
    if (evento.key !== "Enter") return;
    const texto = entrada.value.trim();
    entrada.value = "";
    escribir(`> ${texto}`, "eco");
    if (flujo) return avanzarFlujo(texto);

    const [comando = "", ...args] = texto.toLowerCase().split(/\s+/);
    if (!comando) return;
    // hasOwn evita que "constructor" o "__proto__" se ejecuten como comandos
    const accion = Object.hasOwn(COMANDOS, comando) ? COMANDOS[comando] : null;
    const respuesta = accion ? await accion(args) : `${t("terminalDesconocido")}${comando.slice(0, 20)}`;
    if (respuesta) escribir(respuesta);
  });

  salida.closest(".contenido").addEventListener("click", () => entrada.focus());
  escribir(t("terminalBienvenida"));
}

/* ===== Pantalla de arranque (una vez por sesión) ===== */
async function iniciarArranque() {
  const LINEAS = ["SUKOSE.OS v1.0", "checking memory... ok", "loading python... ok", "loading flask... ok", "mounting desktop... ok", "welcome."];

  let visto = false;
  try {
    visto = sessionStorage.getItem("arranque") === "1";
    sessionStorage.setItem("arranque", "1");
  } catch {
    /* sin almacenamiento: se mostrará en cada carga */
  }
  if (visto || REDUCIR) return;

  const texto = crear("pre");
  const pantalla = crear("div", { clase: "arranque", atributos: { "aria-hidden": "true" } }, [texto]);
  document.body.append(pantalla);

  let cerrada = false;
  const cerrar = () => {
    cerrada = true;
    pantalla.classList.add("fuera");
    setTimeout(() => pantalla.remove(), 500);
  };
  pantalla.addEventListener("pointerdown", cerrar);          // toca para saltar
  addEventListener("keydown", cerrar, { once: true });       // o cualquier tecla

  for (const linea of LINEAS) {
    if (cerrada) return;
    texto.textContent += `${linea}\n`;
    await new Promise(resolver => setTimeout(resolver, 380));
  }
  if (!cerrada) cerrar();
}

/* ===== Punto de entrada: lo llama main.js ===== */
function iniciarExtras() {
  alCambiarIdioma.push(() => {
    renderTextos("yo-lista", YO);
    document.getElementById("terminal-entrada").setAttribute("aria-label", t("vTerminal"));
  });
  iniciarTerminal();
  iniciarArranque();
  iniciarFormulario();
}