```javascript
const chat = document.querySelector(".chat");
const input = document.querySelector("input");
const sendButton = document.querySelector("button");

function agregarMensaje(texto, tipo) {
    const mensaje = document.createElement("div");

    mensaje.classList.add("message", tipo);
    mensaje.textContent = texto;

    chat.appendChild(mensaje);
    chat.scrollTop = chat.scrollHeight;
}

function calcular(texto) {
    try {
        const expresion = texto
            .replace(/x/gi, "*")
            .replace(/÷/g, "/");

        if (!/^[0-9+\-*/().%\s]+$/.test(expresion)) {
            return null;
        }

        const resultado = Function(
            '"use strict"; return (' + expresion + ')'
        )();

        if (typeof resultado === "number" && isFinite(resultado)) {
            return resultado;
        }

        return null;
    } catch {
        return null;
    }
}

function responder(mensaje) {
    const texto = mensaje.toLowerCase().trim();

    // Saludos
    if (
        texto === "hola" ||
        texto === "holaa" ||
        texto === "hola nova" ||
        texto === "buenas"
    ) {
        return "¡Hola! Soy NOVA AI. ¿En qué te puedo ayudar?";
    }

    // Cómo está
    if (
        texto.includes("cómo estás") ||
        texto.includes("como estas")
    ) {
        return "¡Todo bien! Estoy lista para ayudarte.";
    }

    // Qué puede hacer
    if (
        texto.includes("qué podés hacer") ||
        texto.includes("que podes hacer") ||
        texto.includes("qué puedes hacer") ||
        texto.includes("funciones")
    ) {
        return "Puedo ayudarte con cálculos, ideas, programación, estudio y preguntas simples.";
    }

    // Quién es
    if (
        texto.includes("quién sos") ||
        texto.includes("quien sos") ||
        texto.includes("quién eres") ||
        texto.includes("quien eres")
    ) {
        return "Soy NOVA AI, tu asistente virtual.";
    }

    // Ayuda
    if (texto === "ayuda" || texto === "help") {
        return "Podés preguntarme algo como: 25 + 30, dame una idea para un proyecto, o ayudame con matemática.";
    }

    // Calculadora
    const resultado = calcular(texto);

    if (resultado !== null) {
        return "El resultado es " + resultado;
    }

    // Matemática sencilla
    if (
        texto.includes("cuánto es") ||
        texto.includes("cuanto es")
    ) {
        const operacion = texto
            .replace("cuánto es", "")
            .replace("cuanto es", "")
            .trim();

        const resultadoOperacion = calcular(operacion);

        if (resultadoOperacion !== null) {
            return "El resultado es " + resultadoOperacion;
        }
    }

    // Programación
    if (
        texto.includes("programar") ||
        texto.includes("programación") ||
        texto.includes("programacion") ||
        texto.includes("código") ||
        texto.includes("codigo")
    ) {
        return "¡Claro! Puedo ayudarte a aprender HTML, CSS y JavaScript paso a paso.";
    }

    // Ideas
    if (
        texto.includes("idea") ||
        texto.includes("ideas")
    ) {
        return "Podés hacer una calculadora, una lista de tareas, un calendario, un juego sencillo o una página personal.";
    }

    // Estudio
    if (
        texto.includes("estudiar") ||
        texto.includes("tarea") ||
        texto.includes("examen")
    ) {
        return "Puedo ayudarte a estudiar explicándote los temas paso a paso y preparándote ejercicios.";
    }

    // Despedida
    if (
        texto === "chau" ||
        texto === "adiós" ||
        texto === "adios"
    ) {
        return "¡Nos vemos! 👋";
    }

    // Respuesta por defecto
    return "Todavía estoy aprendiendo. Probá preguntarme algo más simple o escribí «ayuda».";
}

function enviarMensaje() {
    const mensaje = input.value.trim();

    if (mensaje === "") {
        return;
    }

    agregarMensaje(mensaje, "user");

    input.value = "";

    setTimeout(() => {
        const respuesta = responder(mensaje);
        agregarMensaje(respuesta, "bot");
    }, 400);
}

sendButton.addEventListener("click", enviarMensaje);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        enviarMensaje();
    }
});
```
