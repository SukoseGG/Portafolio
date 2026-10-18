"use strict";

/* ===== Datos: edita solo esta sección ===== */
const PERFIL = {
  email: "",   // el correo no se muestra: los mensajes llegan por el formulario
  github: "https://github.com/SukoseGG",
  instagram: "https://www.instagram.com/_sukose/",
  twitter: "https://x.com/Sukose_GG"
};

const HABILIDADES = [
  "Python", "Flask", "BeautifulSoup", "Selenium", "psutil",
  "HTML5", "CSS3", "JavaScript", "Git", "Render"
];

// Un texto puede ser un string (igual en ambos idiomas) o { es, en }
const SERVICIOS = [
  { es: "scripts de automatización a tu medida", en: "custom automation scripts" },
  { es: "web scraping con BeautifulSoup y Selenium", en: "web scraping with BeautifulSoup and Selenium" },
  { es: "microservicios y apps web con Flask", en: "microservices and web apps with Flask" },
  { es: "páginas y portafolios en HTML, CSS y JS puros", en: "landing pages and portfolios in plain HTML, CSS and JS" },
  { es: "mantenimiento de PC e instalación de sistemas operativos", en: "PC maintenance and operating system installs" }
];

let PROYECTOS_CACHE = null;   // los proyectos viven en app.py y llegan por /api/proyectos

/* ===== Idiomas ===== */
const SEP = "\u00a0".repeat(6);
const IDIOMAS = ["en", "es"];

const TEXTOS = {
  en: {
    titulo: "Sukose | Portfolio",
    lema: "automation, microservices and web tools",
    marquesina: `welcome to my page :3${SEP}system online${SEP}thanks for visiting`,
    vHola: "hello.txt",
    vServicios: "services.exe",
    vHabilidades: "skills.txt",
    vProyectos: "projects",
    vRedes: "my-links.org",
    p1: "welcome to my page!! i'm Sukose.",
    p2: "i write clean, modular code that's ready to run, with fast delivery.",
    p3: "available for freelance projects with clients worldwide.",
    verProyecto: "view project",
    correo: ">>click here to email me!!",
    github: ">>click here to see my github!!",
    instagram: ">>follow me on instagram!!",
    twitter: ">>follow me on twitter!!",
    sinDatos: "add your links in PERFIL (main.js)",
    botonIdioma: "ES",
    cambiarIdioma: "Switch to Spanish",
    navegacion: "Windows"
  },
  es: {
    titulo: "Sukose | Portafolio",
    lema: "automatización, microservicios y herramientas web",
    marquesina: `bienvenido a mi página :3${SEP}sistema en línea${SEP}gracias por visitar`,
    vHola: "hola.txt",
    vServicios: "servicios.exe",
    vHabilidades: "habilidades.txt",
    vProyectos: "proyectos",
    vRedes: "mis-redes.org",
    p1: "bienvenido a mi página!! soy Sukose.",
    p2: "escribo código limpio y modular, listo para ejecutar, con entregas rápidas.",
    p3: "disponible para proyectos freelance con clientes de todo el mundo.",
    verProyecto: "ver proyecto",
    correo: ">>haz clic para escribirme!!",
    github: ">>haz clic para ver mi github!!",
    instagram: ">>sígueme en instagram!!",
    twitter: ">>sígueme en twitter!!",
    sinDatos: "agrega tus enlaces en PERFIL (main.js)",
    botonIdioma: "EN",
    cambiarIdioma: "Cambiar a inglés",
    navegacion: "Ventanas"
  }
};

for (const id of IDIOMAS) Object.assign(TEXTOS[id], TEXTOS_EXTRA[id]);   // textos de extras.js
const alCambiarIdioma = [];                                               // ganchos para extras.js

let idioma = "en";
const t = clave => TEXTOS[idioma][clave];
const loc = valor => (typeof valor === "string" ? valor : valor[idioma]);

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem("idioma");
    if (IDIOMAS.includes(guardado)) return guardado;   // valida: solo "en" o "es"
  } catch {
    /* almacenamiento bloqueado: seguimos sin guardar */
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

function guardarIdioma() {
  try {
    localStorage.setItem("idioma", idioma);
  } catch {
    /* almacenamiento bloqueado */
  }
}

/* ===== Utilidades ===== */
function crear(tag, { texto, clase, atributos } = {}, hijos = []) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;          // textContent evita inyección de HTML
  for (const [clave, valor] of Object.entries(atributos ?? {})) nodo.setAttribute(clave, valor);
  nodo.append(...hijos);
  return nodo;
}

function urlSegura(valor) {                      // solo http/https, nada de javascript:
  try {
    const url = new URL(valor);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

/* ===== Contenido ===== */
function renderFichas(contenedor, items) {
  contenedor.replaceChildren(...items.map(item => crear("li", { texto: item })));
}

function renderTextos(id, items) {
  renderFichas(document.getElementById(id), items.map(loc));
}

async function cargarProyectos() {
  const contenedor = document.getElementById("proyectos-lista");
  contenedor.replaceChildren(crear("p", { texto: t("proyectosCargando") }));
  try {
    const respuesta = await fetch("/api/proyectos");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    PROYECTOS_CACHE = await respuesta.json();
    renderProyectos();
  } catch (error) {
    console.error("No se pudieron cargar los proyectos:", error);
    contenedor.replaceChildren(crear("p", { texto: t("proyectosError") }));
  }
}

function renderProyectos() {
  const proyectos = PROYECTOS_CACHE ?? [];
  const contenedor = document.getElementById("proyectos-lista");
  contenedor.replaceChildren(...proyectos.map(proyecto => {
    const tags = crear("ul", { clase: "fichas" });
    renderFichas(tags, proyecto.tags);

    const hijos = [
      crear("h3", { texto: loc(proyecto.titulo) }),
      crear("p", { texto: loc(proyecto.descripcion) }),
      tags
    ];
    const url = urlSegura(proyecto.url);
    if (url) {
      hijos.push(crear("a", {
        texto: t("verProyecto"),
        clase: "enlace",
        atributos: { href: url, target: "_blank", rel: "noopener noreferrer" }
      }));
    }
    return crear("article", { clase: "proyecto" }, hijos);
  }));
}

function enlacesContacto() {
  const enlaces = [];
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(PERFIL.email)) {
    enlaces.push({ texto: t("correo"), atributos: { href: `mailto:${PERFIL.email}` } });
  }
  for (const clave of ["github", "instagram", "twitter"]) {
    const url = urlSegura(PERFIL[clave]);
    if (url) {
      enlaces.push({ texto: t(clave), atributos: { href: url, target: "_blank", rel: "noopener noreferrer" } });
    }
  }
  return enlaces;
}

function renderContacto() {
  const filas = enlacesContacto().map(enlace => crear("li", {}, [crear("a", enlace)]));
  if (filas.length === 0) filas.push(crear("li", { texto: t("sinDatos") }));
  document.getElementById("contacto-lista").replaceChildren(...filas);
}

/* Aplica el idioma actual a todo: textos fijos, listas y botón */
function aplicarIdioma() {
  document.documentElement.lang = idioma;
  document.title = t("titulo");
  document.querySelectorAll("[data-i18n]").forEach(nodo => {
    nodo.textContent = t(nodo.dataset.i18n);
  });
  renderTextos("servicios-lista", SERVICIOS);
  renderProyectos();
  renderContacto();

  const boton = document.getElementById("idioma");
  boton.textContent = t("botonIdioma");
  boton.setAttribute("aria-label", t("cambiarIdioma"));
  document.getElementById("tareas").setAttribute("aria-label", t("navegacion"));
  alCambiarIdioma.forEach(funcion => funcion());
}

function iniciarIdioma() {
  idioma = idiomaInicial();
  document.getElementById("idioma").addEventListener("click", () => {
    idioma = idioma === "en" ? "es" : "en";
    guardarIdioma();
    aplicarIdioma();
  });
}

/* ===== Ventanas estilo escritorio ===== */
const posiciones = new WeakMap();
const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
let capaSuperior = 10;

function traerAlFrente(ventana) {
  ventana.style.zIndex = ++capaSuperior;
}

function mover(ventana, x, y) {
  posiciones.set(ventana, { x, y });
  ventana.style.transform = `translate(${x}px, ${y}px)`;
}

function crearBarra(ventana) {
  const botones = crear("div", { clase: "botones" }, [
    crear("button", { texto: "_", atributos: { type: "button", "data-accion": "minimizar", "aria-label": "–" } }),
    crear("button", { texto: "×", atributos: { type: "button", "data-accion": "cerrar", "aria-label": "×" } })
  ]);
  const titulo = crear("h2", { atributos: { "data-i18n": ventana.dataset.titulo } });
  const barra = crear("header", { clase: "barra-v" }, [titulo, botones]);
  ventana.prepend(barra);
  return barra;
}

function activarArrastre(ventana, barra) {
  barra.addEventListener("pointerdown", evento => {
    if (evento.target.closest("button")) return;
    const { x, y } = posiciones.get(ventana);
    const origenX = evento.clientX - x;
    const origenY = evento.clientY - y;
    barra.setPointerCapture(evento.pointerId);

    const arrastrar = e => mover(ventana, e.clientX - origenX, e.clientY - origenY);
    const soltar = () => {
      barra.removeEventListener("pointermove", arrastrar);
      barra.removeEventListener("pointerup", soltar);
      barra.removeEventListener("pointercancel", soltar);
    };
    barra.addEventListener("pointermove", arrastrar);
    barra.addEventListener("pointerup", soltar);
    barra.addEventListener("pointercancel", soltar);
  });
}

function iniciarVentanas() {
  const lista = document.getElementById("tareas-lista");

  document.querySelectorAll(".ventana").forEach(ventana => {
    const barra = crearBarra(ventana);
    mover(ventana, 0, 0);
    activarArrastre(ventana, barra);
    ventana.addEventListener("pointerdown", () => traerAlFrente(ventana));

    const tarea = crear("button", {
      atributos: { type: "button", "aria-pressed": "true", "data-i18n": ventana.dataset.titulo }
    });
    lista.append(tarea);

    barra.addEventListener("click", evento => {
      const accion = evento.target.closest("button")?.dataset.accion;
      if (accion === "minimizar") ventana.classList.toggle("min");
      if (accion === "cerrar") {
        ventana.hidden = true;
        tarea.setAttribute("aria-pressed", "false");
      }
    });

    tarea.addEventListener("click", () => {      // reabre, resetea posición y trae al frente
      ventana.hidden = false;
      ventana.classList.remove("min");
      mover(ventana, 0, 0);
      traerAlFrente(ventana);
      tarea.setAttribute("aria-pressed", "true");
      ventana.scrollIntoView({ behavior: REDUCIR ? "auto" : "smooth", block: "center" });
    });
  });
}

function iniciarReloj() {
  const reloj = document.getElementById("reloj");
  const pintar = () => {
    reloj.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  pintar();
  setInterval(pintar, 30000);
}

function iniciar() {
  renderFichas(document.getElementById("habilidades"), HABILIDADES);
  iniciarIdioma();
  iniciarVentanas();
  iniciarReloj();
  iniciarExtras();
  aplicarIdioma();
  cargarProyectos();
}

iniciar();