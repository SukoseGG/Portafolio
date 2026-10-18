"use strict";

/* ===== Textos nuevos (main.js los mezcla con TEXTOS) ===== */
const TEXTOS_EXTRA = {
  en: {
    vYo: "me.txt",
    vTerminal: "terminal.exe",
    terminalBienvenida: "type help to see the commands",
    terminalAyuda: "commands:\nhelp, about, skills, projects, contact, whoami, lang en|es, clear",
    terminalDesconocido: "command not found: "
  },
  es: {
    vYo: "yo.txt",
    vTerminal: "terminal.exe",
    terminalBienvenida: "escribe help para ver los comandos",
    terminalAyuda: "comandos:\nhelp, about, skills, projects, contact, whoami, lang en|es, clear",
    terminalDesconocido: "comando no encontrado: "
  }
};

/* ===== yo.txt: edita lo que quieras mostrar (la página es pública) ===== */
const YO = [
  { es: "música: Deftones, Nirvana, Radiohead, Muse, Camellia", en: "music: Deftones, Nirvana, Radiohead, Muse, Camellia" },
  { es: "juegos: rhythm games, Deltarune, ULTRAKILL, Warframe, Minecraft", en: "games: rhythm games, Deltarune, ULTRAKILL, Warframe, Minecraft" },
  { es: "estética: cyber, Y2K y jumpstyle", en: "aesthetic: cyber, Y2K and jumpstyle" },
  { es: "color favorito: verde", en: "favorite color: green" }
];

/* ===== terminal.exe ===== */
const MAX_LINEAS_TERMINAL = 200;   // evita que el DOM crezca sin límite

function iniciarTerminal() {
  const salida = document.getElementById("terminal-salida");
  const entrada = document.getElementById("terminal-entrada");

  const escribir = (texto, clase) => {
    texto.split("\n").forEach(linea => salida.append(crear("p", { texto: linea || "\u00a0", clase })));
    while (salida.childElementCount > MAX_LINEAS_TERMINAL) salida.firstElementChild.remove();
    salida.scrollTop = salida.scrollHeight;
  };

  const COMANDOS = {
    help: () => t("terminalAyuda"),
    about: () => `${t("p1")}\n${t("p2")}`,
    skills: () => HABILIDADES.join(", "),
    projects: () => PROYECTOS.map(p => `- ${loc(p.titulo)}: ${loc(p.descripcion)}`).join("\n"),
    contact: () => [PERFIL.email, PERFIL.github, PERFIL.instagram, PERFIL.twitter].filter(Boolean).join("\n"),
    whoami: () => "sukose",
    clear: () => { salida.replaceChildren(); return null; },
    lang: ([destino]) => {
      if (!IDIOMAS.includes(destino)) return "usage: lang en|es";
      if (destino !== idioma) document.getElementById("idioma").click();
      return null;
    }
  };

  entrada.addEventListener("keydown", evento => {
    if (evento.key !== "Enter") return;
    const texto = entrada.value.trim();
    const [comando = "", ...args] = texto.toLowerCase().split(/\s+/);
    entrada.value = "";
    escribir(`> ${texto}`, "eco");
    if (!comando) return;

    // hasOwn evita que "constructor" o "__proto__" se ejecuten como comandos
    const accion = Object.hasOwn(COMANDOS, comando) ? COMANDOS[comando] : null;
    const respuesta = accion ? accion(args) : `${t("terminalDesconocido")}${comando.slice(0, 20)}`;
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
}