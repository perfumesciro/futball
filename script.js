const chat = document.getElementById("chat");
const input = document.getElementById("input");
const botonEnviar = document.getElementById("botonEnviar");

let modoActual = "normal";
let chats = JSON.parse(localStorage.getItem("nova_chats") || "[]");
let chatActual = null;

// ===============================
// INICIO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    actualizarHistorial();

    if (chats.length === 0) {
        crearChat();
    } else {
        abrirChat(chats[0].id);
    }

    if (input) {
        input.addEventListener("keydown", manejarEnter);

        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = input.scrollHeight + "px";
        });
    }
});

// ===============================
// NUEVO CHAT
// ===============================

function nuevoChat() {
    crearChat();
}

function crearChat() {
    const nuevo = {
        id: Date.now(),
        titulo: "Nueva conversación",
        mensajes: []
    };

    chats.unshift(nuevo);
    chatActual = nuevo.id;

    guardarChats();
    actualizarHistorial();
    mostrarInicio();
}

// ===============================
// GUARDAR
// ===============================

function guardarChats() {
    localStorage.setItem("nova_chats", JSON.stringify(chats));
}

// ===============================
// HISTORIAL
// ===============================

function actualizarHistorial() {
    const lista = document.getElementById("listaChats");

    if (!lista) return;

    lista.innerHTML = "";

    chats.forEach(c => {
        const boton = document.createElement("button");

        boton.className = "chat-historial";
        boton.textContent = c.titulo || "Nueva conversación";

        boton.onclick = () => {
            abrirChat(c.id);
        };

        lista.appendChild(boton);
    });
}

// ===============================
// ABRIR CHAT
// ===============================

function abrirChat(id) {
    const encontrado = chats.find(c => c.id === id);

    if (!encontrado) return;

    chatActual = id;

    mostrarChat();
    renderizarMensajes();
}

// ===============================
// INICIO
// ===============================

function mostrarInicio() {
    const inicio = document.getElementById("inicio");
    const chatZona = document.getElementById("chat");

    if (inicio) inicio.style.display = "block";
    if (chatZona) chatZona.innerHTML = "";
}

// ===============================
// CHAT
// ===============================

function mostrarChat() {
    const inicio = document.getElementById("inicio");

    if (inicio) {
        inicio.style.display = "none";
    }
}

// ===============================
// RENDERIZAR MENSAJES
// ===============================

function renderizarMensajes() {
    const zona = document.getElementById("chat");

    if (!zona) return;

    zona.innerHTML = "";

    const actual = chats.find(c => c.id === chatActual);

    if (!actual) return;

    actual.mensajes.forEach(mensaje => {
        crearMensajeVisual(
            mensaje.rol,
            mensaje.texto
        );
    });

    zona.scrollTop = zona.scrollHeight;
}

// ===============================
// MENSAJE VISUAL
// ===============================

function crearMensajeVisual(rol, texto) {
    const zona = document.getElementById("chat");

    if (!zona) return;

    const contenedor = document.createElement("div");

    contenedor.className =
        rol === "user"
            ? "mensaje usuario"
            : "mensaje nova";

    const contenido = document.createElement("div");

    contenido.className = "mensaje-contenido";

    contenido.innerHTML =
        formatearRespuesta(texto);

    contenedor.appendChild(contenido);

    zona.appendChild(contenedor);

    zona.scrollTop = zona.scrollHeight;
}

// ===============================
// ENVIAR
// ===============================

async function enviar() {

    const mensaje = input.value.trim();

    if (!mensaje) return;

    const actual =
        chats.find(c => c.id === chatActual);

    if (!actual) return;

    // Guardar mensaje del usuario
    actual.mensajes.push({
        rol: "user",
        texto: mensaje
    });

    if (
        actual.titulo === "Nueva conversación"
    ) {
        actual.titulo =
            mensaje.substring(0, 30) +
            (mensaje.length > 30 ? "..." : "");
    }

    guardarChats();
    actualizarHistorial();

    input.value = "";
    input.style.height = "auto";

    mostrarChat();

    crearMensajeVisual(
        "user",
        mensaje
    );

    // =================================
    // RESPUESTAS LOCALES
    // =================================

    const respuestaLocal =
        responderLocalmente(mensaje);

    if (respuestaLocal !== null) {

        actual.mensajes.push({
            rol: "assistant",
            texto: respuestaLocal
        });

        guardarChats();

        crearMensajeVisual(
            "assistant",
            respuestaLocal
        );

        return;
    }

    // =================================
    // INTENTAR SERVIDOR
    // =================================

    const cargando =
        document.createElement("div");

    cargando.className =
        "mensaje nova cargando";

    cargando.innerHTML = `
        <div class="mensaje-contenido">
            <span>●</span>
            <span>●</span>
            <span>●</span>
        </div>
    `;

    chat.appendChild(cargando);

    try {

        const respuesta =
            await fetch("/chat", {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: mensaje,
                    mode: modoActual
                })
            });

        if (!respuesta.ok) {
            throw new Error("Servidor no disponible");
        }

        const datos =
            await respuesta.json();

        cargando.remove();

        const texto =
            datos.reply ||
            "No recibí una respuesta.";

        actual.mensajes.push({
            rol: "assistant",
            texto: texto
        });

        guardarChats();

        crearMensajeVisual(
            "assistant",
            texto
        );

    } catch (error) {

        cargando.remove();

        const texto =
            "No pude conectarme con NOVA en este momento. " +
            "Tu mensaje quedó guardado.";

        actual.mensajes.push({
            rol: "assistant",
            texto: texto
        });

        guardarChats();

        crearMensajeVisual(
            "assistant",
            texto
        );
    }
}

// ===============================
// RESPUESTAS LOCALES
// ===============================

function responderLocalmente(mensaje) {

    const texto =
        mensaje
            .toLowerCase()
            .trim();

    // Saludos
    if (
        texto === "hola" ||
        texto === "hola nova" ||
        texto === "buenas"
    ) {
        return "¡Hola! 👋 Soy NOVA. ¿En qué puedo ayudarte?";
    }

    // 1 + 1
    if (
        texto === "1+1" ||
        texto === "1 + 1"
    ) {
        return "2";
    }

    // 2 + 2
    if (
        texto === "2+2" ||
        texto === "2 + 2"
    ) {
        return "4";
    }

    // Quién eres
    if (
        texto.includes("quien sos") ||
        texto.includes("quién sos") ||
        texto.includes("quien eres")
    ) {
        return "Soy NOVA AI, tu asistente inteligente.";
    }

    // Qué puede hacer
    if (
        texto.includes("que podes hacer") ||
        texto.includes("qué podés hacer")
    ) {
        return "Puedo ayudarte a estudiar, programar, generar ideas, organizar proyectos y mucho más.";
    }

    return null;
}

// ===============================
// ENTER
// ===============================

function manejarEnter(evento) {

    if (
        evento.key === "Enter" &&
        !evento.shiftKey
    ) {
        evento.preventDefault();

        enviar();
    }
}

// ===============================
// SUGERENCIAS
// ===============================

function usarSugerencia(texto) {

    input.value = texto;

    input.focus();
}

// ===============================
// MODOS
// ===============================

function cambiarModo(modo) {

    modoActual = modo;

    document
        .querySelectorAll(".modo")
        .forEach(boton => {
            boton.classList.remove("activo");
        });

    const boton =
        document.querySelector(
            `[data-modo="${modo}"]`
        );

    if (boton) {
        boton.classList.add("activo");
    }
}

// ===============================
// HERRAMIENTAS
// ===============================

function mostrarHerramientas() {

    const inicio =
        document.getElementById("inicio");

    const herramientas =
        document.getElementById("herramientas");

    if (inicio)
        inicio.style.display = "none";

    if (herramientas)
        herramientas.style.display = "block";
}

// ===============================
// FORMATO
// ===============================

function formatearRespuesta(texto) {

    let seguro =
        escaparHTML(texto);

    seguro =
        seguro.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

    seguro =
        seguro.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

    seguro =
        seguro.replace(
            /\n/g,
            "<br>"
        );

    return seguro;
}

// ===============================
// SEGURIDAD
// ===============================

function escaparHTML(texto) {

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===============================
// CONFIGURACIÓN
// ===============================

function abrirConfiguracion() {

    const modal =
        document.getElementById("modal");

    if (modal)
        modal.style.display = "flex";
}

// ===============================
// BORRAR CHATS
// ===============================

function borrarTodosLosChats() {

    if (
        !confirm(
            "¿Seguro que querés borrar todas las conversaciones?"
        )
    ) {
        return;
    }

    chats = [];

    localStorage.removeItem(
        "nova_chats"
    );

    crearChat();
}

// ===============================
// CERRAR MODAL
// ===============================

function cerrarModal() {

    const modal =
        document.getElementById("modal");

    if (modal)
        modal.style.display = "none";
}
