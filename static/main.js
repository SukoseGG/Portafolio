"use strict";

/* ===== Datos: edita solo esta sección ===== */
const PERFIL = {
  email: "dmcsukha@gmail.com",   // ej: "tucorreo@gmail.com"
  github: "github.com/SukoseGG"   // ej: "https://github.com/tu-usuario"
};

const HABILIDADES = [
  "Python", "Flask", "BeautifulSoup", "Selenium", "psutil",
  "HTML5", "CSS3", "JavaScript", "Git", "Render"
];

const PROYECTOS = [
  {
    titulo: "System Resource Monitor",
    descripcion: "Panel que muestra el uso de recursos del sistema en tiempo real.",
    tags: ["Python", "Flask", "psutil"],
    url: ""    // enlace a la demo o al repositorio
  },
  {
    titulo: "Tarjeta digital",
    descripcion: "Página con una tarjeta descargable y audio incrustado, publicada en Render.",
    tags: ["Flask", "Render", "JavaScript"],
    url: ""
  }
];

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

function renderProyectos() {
  const contenedor = document.getElementById("proyectos-lista");
  contenedor.replaceChildren(...PROYECTOS.map(proyecto => {
    const tags = crear("ul", { clase: "fichas" });
    renderFichas(tags, proyecto.tags);

    const hijos = [
      crear("h3", { texto: proyecto.titulo }),
      crear("p", { texto: proyecto.descripcion }),
      tags
    ];
    const url = urlSegura(proyecto.url);
    if (url) {
      hijos.push(crear("a", {
        texto: "ver proyecto",
        clase: "enlace",
        atributos: { href: url, target: "_blank", rel: "noopener noreferrer" }
      }));
    }
    return crear("article", { clase: "proyecto" }, hijos);
  }));
}

function renderContacto() {
  const lista = document.getElementById("contacto-lista");
  const filas = [];

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(PERFIL.email)) {
    filas.push(crear("li", {}, [crear("a", { texto: ">>haz clic para escribirme!!", atributos: { href: `mailto:${PERFIL.email}` } })]));
  }
  const github = urlSegura(PERFIL.github);
  if (github) {
    filas.push(crear("li", {}, [crear("a", { texto: ">>haz clic para ver mi github!!", atributos: { href: github, target: "_blank", rel: "noopener noreferrer" } })]));
  }
  if (filas.length === 0) {
    filas.push(crear("li", { texto: "agrega tu correo y tu github en PERFIL (main.js)" }));
  }
  lista.replaceChildren(...filas);
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
    crear("button", { texto: "_", atributos: { type: "button", "data-accion": "minimizar", "aria-label": "Minimizar" } }),
    crear("button", { texto: "×", atributos: { type: "button", "data-accion": "cerrar", "aria-label": "Cerrar" } })
  ]);
  const barra = crear("header", { clase: "barra-v" }, [crear("h2", { texto: ventana.dataset.titulo }), botones]);
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
      texto: ventana.dataset.titulo,
      atributos: { type: "button", "aria-pressed": "true" }
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
    reloj.textContent = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  };
  pintar();
  setInterval(pintar, 30000);
}

function iniciar() {
  renderFichas(document.getElementById("habilidades"), HABILIDADES);
  renderProyectos();
  renderContacto();
  iniciarVentanas();
  iniciarReloj();
}

iniciar();
