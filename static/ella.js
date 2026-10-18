"use strict";

/* ===== Datos de ella: edita aquí ===== */
const ELLA = {
  mostrar: true,                 // false = quita la sección de la página
  nombre: "Vanessa",             // o el apodo que prefieras
  firma: "Sukose",               // como le firmas tú
  juntosDesde: [2024, 4, 7],     // año, mes, día
  cumple: [7, 2],                // mes, día
  // Un párrafo por línea. {nombre} y {firma} se reemplazan solos.
  // Todo lo que esté entre [corchetes] es un hueco para que escribas tú.
    carta: [
    "Para ti, {nombre}:",
    "Quería escribirte algo que durara más que un mensaje, y esta fue la forma que encontré: hacerte un lugar en mi página.",
    "Desde el 7 de abril de 2024 pasaron muchas cosas, pero una no cambió: sigo eligiéndote. Quiero que sepas que me siento muy afortunado de tenerte en mi vida.",
    "Lo que más admiro de ti es lo auténtica que eres. Amas lo que amas sin pedir permiso ni disculpas: lo tierno, lo serio, lo que otros no entienden. Nadie más puede pasar de Chiikawa o Hello Kitty a Alice in Borderland y que todo tenga sentido, porque todo eso eres tú.",
    "Admiro también todo lo que haces con tus manos y con tu voz: dibujas, cantas, bailas. Tienes un talento enorme, y ojalá lo vieras como yo lo veo. Como cuando me enseñas algo que hiciste y me quedo sin palabras, porque no puedo creer que alguien sea así de talentosa.",
    "La distancia es difícil y no voy a fingir lo contrario. Pero cada mensaje y cada llamada me recuerdan por qué vale la pena, y todo lo que hago, incluido esto, lo hago pensando en que algún día no haya ninguna.",
    "Te amo, {nombre}. No por una sola cosa, sino por todas: por cómo eres, por cómo me haces sentir y por quién soy yo cuando estoy contigo.",
    "Gracias por ser tú.",
    "— {firma} ♡"
  ]
};

/* ===== Fechas ===== */
const DIA_MS = 86_400_000;

function hoyUTC() {                  // usar UTC evita saltos por cambio de horario
  const ahora = new Date();
  return Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function proxima(mes, dia) {         // la próxima vez que cae ese día (hoy cuenta)
  const hoy = hoyUTC();
  let anio = new Date().getFullYear();
  if (Date.UTC(anio, mes - 1, dia) < hoy) anio += 1;
  return { dias: Math.round((Date.UTC(anio, mes - 1, dia) - hoy) / DIA_MS), anio };
}

/* ===== Ventanas rosas ===== */
function ventanaRosa(titulo, hijos) {
  return crear("article", { clase: "v-rosa" }, [
    crear("h3", { texto: titulo }),
    crear("div", { clase: "v-rosa-cuerpo" }, hijos)
  ]);
}

function parrafosCarta() {
  return ELLA.carta.map(texto => crear("p", {
    texto: texto.replaceAll("{nombre}", ELLA.nombre).replaceAll("{firma}", ELLA.firma),
    clase: texto.startsWith("—") ? "firma" : undefined
  }));
}

function filaContador(antes, numero, despues) {
  return crear("p", { clase: "contador" }, [antes, crear("strong", { texto: String(numero) }), despues]);
}

function contador() {
  const [anio, mes, dia] = ELLA.juntosDesde;
  const juntos = Math.round((hoyUTC() - Date.UTC(anio, mes - 1, dia)) / DIA_MS);
  const aniversario = proxima(mes, dia);
  const cumple = proxima(...ELLA.cumple);
  const faltan = n => (n === 1 ? ["falta ", " día"] : ["faltan ", " días"]);

  const filas = [filaContador("llevamos ", juntos, " días juntos ♡")];
  if (aniversario.dias === 0) {
    filas.push(crear("p", { clase: "contador", texto: "¡hoy es nuestro aniversario! ♡" }));
  } else {
    const [a, d] = faltan(aniversario.dias);
    filas.push(filaContador(a, aniversario.dias, `${d} para nuestros ${aniversario.anio - anio} años`));
  }
  if (cumple.dias === 0) {
    filas.push(crear("p", { clase: "contador", texto: "¡hoy es su cumpleaños! ♡" }));
  } else {
    const [a, d] = faltan(cumple.dias);
    filas.push(filaContador(a, cumple.dias, `${d} para su cumpleaños`));
  }
  return filas;
}

/* ===== El portal: pregunta -> transición -> su mundo ===== */
const raiz = document.documentElement;
let mundoAbierto = false;

function bloquearFondo(bloqueado) {   // inert: sin foco, clics ni lectores de pantalla
  document.querySelectorAll("main, .portada, .marquesina, .tareas").forEach(el => { el.inert = bloqueado; });
}

function entrarMundo() {
  if (mundoAbierto) return;
  mundoAbierto = true;
  const mundo = document.getElementById("mundo-ella");
  if (!REDUCIR) raiz.classList.add("reiniciando");          // el temblor dura 0,6 s
  setTimeout(() => {
    mundo.hidden = false;
    mundo.scrollTop = 0;
    bloquearFondo(true);
    requestAnimationFrame(() => requestAnimationFrame(() => mundo.classList.add("abierto")));
    document.getElementById("ella-volver").focus();
  }, REDUCIR ? 0 : 450);
  setTimeout(() => raiz.classList.remove("reiniciando"), 1100);
}

function salirMundo() {
  if (!mundoAbierto) return;
  const mundo = document.getElementById("mundo-ella");
  mundo.classList.remove("abierto");
  setTimeout(() => {
    mundo.hidden = true;
    mundoAbierto = false;
    bloquearFondo(false);
    document.getElementById("boton-amor")?.focus();
  }, REDUCIR ? 300 : 900);
}

function abrirDialogo() {
  if (mundoAbierto || document.getElementById("dialogo-amor")) return;
  const texto = crear("p", { clase: "dialogo-texto", texto: "¿esto es amor?" });
  const si = crear("button", { texto: "sí", atributos: { type: "button" } });
  const no = crear("button", { texto: "no", atributos: { type: "button" } });
  const dialogo = crear("div", {
    clase: "dialogo-amor",
    atributos: { id: "dialogo-amor", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "dialogo-titulo" }
  }, [
    crear("h3", { texto: "pregunta.exe", atributos: { id: "dialogo-titulo" } }),
    crear("div", { clase: "dialogo-cuerpo" }, [texto, crear("div", { clase: "dialogo-botones" }, [si, no])])
  ]);

  const cerrar = () => {
    dialogo.remove();
    if (!mundoAbierto) bloquearFondo(false);
    document.getElementById("boton-amor")?.focus();
  };
  si.addEventListener("click", () => { dialogo.remove(); entrarMundo(); });
  no.addEventListener("click", () => { texto.textContent = "error: esa respuesta no existe ♡"; });
  dialogo.addEventListener("keydown", evento => { if (evento.key === "Escape") cerrar(); });

  bloquearFondo(true);
  document.body.append(dialogo);
  si.focus();
}

function iniciarElla() {
  const mundo = document.getElementById("mundo-ella");
  if (!ELLA.mostrar) {
    mundo.remove();
    return;
  }
  if (ELLA.carta.some(texto => texto.includes("["))) {
    console.warn("La carta tiene huecos [entre corchetes] sin llenar.");
  }
  document.getElementById("ella-titulo").textContent = `para ${ELLA.nombre} ♡`;
  document.getElementById("ella-ventanas").replaceChildren(
    ventanaRosa("carta.txt", parrafosCarta()),
    ventanaRosa("contador.exe", contador())
  );

  document.getElementById("ella-volver").addEventListener("click", salirMundo);
  document.addEventListener("keydown", evento => { if (evento.key === "Escape" && mundoAbierto) salirMundo(); });

  const boton = crear("button", { texto: "♡", atributos: { id: "boton-amor", type: "button", "aria-label": "♡" } });
  document.querySelector(".tareas").insertBefore(boton, document.getElementById("reloj"));
  boton.addEventListener("click", abrirDialogo);
}

iniciarElla();