"use strict";

/* ===== Datos: edita solo esta sección ===== */
const PERFIL = {
  email: "",   // ej: "tucorreo@gmail.com"
  github: ""   // ej: "https://github.com/tu-usuario"
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

/* ===== Render ===== */
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
        texto: "Ver proyecto",
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
    filas.push(crear("li", {}, [crear("a", { texto: "Escribir por correo", atributos: { href: `mailto:${PERFIL.email}` } })]));
  }
  const github = urlSegura(PERFIL.github);
  if (github) {
    filas.push(crear("li", {}, [crear("a", { texto: "Ver mi GitHub", atributos: { href: github, target: "_blank", rel: "noopener noreferrer" } })]));
  }
  if (filas.length === 0) {
    filas.push(crear("li", { texto: "Agrega tu correo y tu GitHub en el objeto PERFIL de este archivo." }));
  }
  lista.replaceChildren(...filas);
}

function iniciar() {
  renderFichas(document.getElementById("habilidades"), HABILIDADES);
  renderProyectos();
  renderContacto();
  document.getElementById("anio").textContent = new Date().getFullYear();
}

iniciar();
