
// ================================
// NOVA AI - SCRIPT
// ================================

let modoActual = "normal";


// ================================
// ELEMENTOS
// ================================

const input = document.getElementById("input");
const chat = document.getElementById("chat");
const inicio = document.getElementById("inicio");
const herramientas = document.getElementById("herramientas");
const botonEnviar = document.getElementById("botonEnviar");
const listaChats = document.getElementById("listaChats");


// ================================
// ENVIAR MENSAJE
// ================================

function enviar() {

    const mensaje = input.value.trim();

    if (mensaje === "") {
        return;
    }

    agregarMensaje(mensaje, "usuario");

    input.value = "";

    input.style.height = "auto";

    mostrarChat();

    botonEnviar.disabled = true;

    setTimeout(function () {

        const respuesta = responder(mensaje);

        agregarMensaje(respuesta, "nova");

        botonEnviar.disabled = false;

    }, 400);
}


// ================================
// ENTER
// ================================

function manejarEnter(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        enviar();
    }
}


// ================================
// AGREGAR MENSAJE
// ================================

function agregarMensaje(texto, tipo) {

    const mensaje = document.createElement("div");

    if (tipo === "usuario") {

        mensaje.className = "mensaje usuario";

    } else {

        mensaje.className = "mensaje nova";

    }

    mensaje.textContent = texto;

    chat.appendChild(mensaje);

    chat.scrollTop = chat.scrollHeight;
}


// ================================
// RESPUESTAS DE NOVA
// ================================

function responder(mensaje) {

    const texto = mensaje.toLowerCase().trim();


    // SALUDO

    if (
        texto === "hola" ||
        texto === "holaa" ||
        texto === "buenas" ||
        texto.includes("hola nova")
    ) {

        return "¡Hola! 👋 Soy NOVA. ¿En qué puedo ayudarte?";

    }


    // CÓMO ESTÁ

    if (
        texto.includes("cómo estás") ||
        texto.includes("como estas")
    ) {

        return "¡Todo bien! Estoy lista para ayudarte. 😎";

    }


    // QUIÉN ES

    if (
        texto.includes("quién sos") ||
        texto.includes("quien sos") ||
        texto.includes("quién eres") ||
        texto.includes("quien eres")
    ) {

        return "Soy NOVA AI, un asistente virtual creado para ayudarte con estudio, programación, ideas y tareas.";

    }


    // QUÉ PUEDE HACER

    if (
        texto.includes("qué podés hacer") ||
        texto.includes("que podes hacer") ||
        texto.includes("qué puedes hacer") ||
        texto.includes("funciones")
    ) {

        return "Puedo ayudarte con matemática, programación, ideas, estudio, organización y cálculos.";

    }


    // AYUDA

    if (texto === "ayuda" || texto === "help") {

        return "Podés decirme, por ejemplo: «25 + 30», «ayudame a estudiar» o «ayudame a programar».";

    }


    // CALCULADORA

    const resultado = calcular(texto);

    if (resultado !== null) {

        return "🧮 El resultado es " + resultado;

    }


    // CUÁNTO ES

    if (
        texto.startsWith("cuánto es") ||
        texto.startsWith("cuanto es")
    ) {

        let operacion = texto
            .replace("cuánto es", "")
            .replace("cuanto es", "")
            .trim();

        const resultadoOperacion = calcular(operacion);

        if (resultadoOperacion !== null) {

            return "🧮 El resultado es " + resultadoOperacion;

        }

    }


    // ESTUDIO

    if (
        texto.includes("estudiar") ||
        texto.includes("examen") ||
        texto.includes("tarea")
    ) {

        return "📚 Claro. Decime qué materia o tema estás estudiando y te ayudo paso a paso.";

    }


    // PROGRAMACIÓN

    if (
        texto.includes("programar") ||
        texto.includes("programación") ||
        texto.includes("programacion") ||
        texto.includes("código") ||
        texto.includes("codigo")
    ) {

        return "💻 Claro. Puedo ayudarte con HTML, CSS y JavaScript paso a paso.";

    }


    // IDEAS

    if (
        texto.includes("idea") ||
        texto.includes("ideas")
    ) {

        return "💡 Una idea podría ser crear una app de tareas, una calculadora, un calendario o un pequeño juego.";

    }


    // ORGANIZAR

    if (
        texto.includes("organizar") ||
        texto.includes("organizar mi día") ||
        texto.includes("organizar mi dia")
    ) {

        return "📋 Podemos organizar tu día dividiendo tus tareas en: importantes, normales y para después.";

    }


    // DESPEDIDA

    if (
        texto === "chau" ||
        texto === "adios" ||
        texto === "adiós"
    ) {

        return "¡Nos vemos! 👋";

    }


    // RESPUESTA GENERAL

    return "Todavía estoy aprendiendo. Probá escribiendo «ayuda» para ver algunas cosas que puedo hacer.";

}


// ================================
// CALCULADORA
// ================================

function calcular(texto) {

    let expresion = texto
        .replace(/x/gi, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, ".");

    // Solo permite números y operaciones matemáticas

    if (!/^[0-9+\-*/().%\s]+$/.test(expresion)) {

        return null;

    }

    try {

        const resultado = Function(
            '"use strict"; return (' + expresion + ")"
        )();

        if (
            typeof resultado === "number" &&
            Number.isFinite(resultado)
        ) {

            return resultado;

        }

    } catch (error) {

        return null;

    }

    return null;
}


// ================================
// MOSTRAR CHAT
// ================================

function mostrarChat() {

    inicio.style.display = "none";

    herramientas.classList.add("oculto");

    chat.style.display = "flex";

}


// ================================
// NUEVO CHAT
// ================================

function nuevoChat() {

    chat.innerHTML = "";

    inicio.style.display = "flex";

    herramientas.classList.add("oculto");

    chat.style.display = "none";

    input.value = "";

}


// ================================
// INICIO
// ================================

function mostrarInicio() {

    inicio.style.display = "flex";

    herramientas.classList.add("oculto");

    chat.style.display = "none";

}


// ================================
// HISTORIAL
// ================================

function mostrarHistorial() {

    inicio.style.display = "none";

    herramientas.classList.add("oculto");

    chat.style.display = "flex";

}


// ================================
// HERRAMIENTAS
// ================================

function mostrarHerramientas() {

    inicio.style.display = "none";

    chat.style.display = "none";

    herramientas.classList.remove("oculto");

}


// ================================
// SUGERENCIAS
// ================================

function usarSugerencia(texto) {

    input.value = texto;

    enviar();

}


// ================================
// CAMBIAR MODO
// ================================

function cambiarModo(modo, boton) {

    modoActual = modo;

    const botones = document.querySelectorAll(".modo");

    botones.forEach(function (b) {

        b.classList.remove("activo");

    });

    boton.classList.add("activo");

}


// ================================
// HERRAMIENTAS INDIVIDUALES
// ================================

function abrirHerramienta(herramienta) {

    mostrarChat();

    let mensaje = "";

    if (herramienta === "calculadora") {

        mensaje = "🧮 Calculadora abierta. Escribí una operación como 25 + 30.";

    }

    if (herramienta === "estudio") {

        mensaje = "📚 NOVA Tutor. Decime qué tema querés estudiar.";

    }

    if (herramienta === "ideas") {

        mensaje = "💡 NOVA Ideas. Decime qué tipo de proyecto querés crear.";

    }

    if (herramienta === "codigo") {

        mensaje = "💻 NOVA Code. Decime qué código querés crear o corregir.";

    }

    if (herramienta === "planner") {

        mensaje = "📅 NOVA Planner. Podemos organizar tus tareas y proyectos.";

    }

    if (herramienta === "notas") {

        mensaje = "📝 Notas. Escribí la información que quieras guardar.";

    }

    agregarMensaje(mensaje, "nova");

}


// ================================
// CONFIGURACIÓN
// ================================

function abrirConfiguracion() {

    const modal = document.getElementById("modal");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <h2>Configuración</h2>
        <p>NOVA AI</p>
        <p>Versión local</p>
    `;

    modal.classList.remove("oculto");

}


// ================================
// CERRAR MODAL
// ================================

function cerrarModal() {

    const modal = document.getElementById("modal");

    modal.classList.add("oculto");

}


// ================================
// INICIO
// ================================

chat.style.display = "none";

console.log("NOVA AI funcionando correctamente.");

