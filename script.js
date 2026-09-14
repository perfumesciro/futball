
// ======================================================
// NOVA AI - SCRIPT PRINCIPAL
// ======================================================

// URL DE TU WORKER DE CLOUDFLARE
const API_URL = "https://nova-ai.pixelartnju.workers.dev/";

let modoActual = "normal";

let chats = JSON.parse(
    localStorage.getItem("nova_chats") || "[]"
);

let chatActual = null;


// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    actualizarHistorial();

    if (chats.length === 0) {
        crearChat();
    } else {
        abrirChat(chats[0].id);
    }

    const input = document.getElementById("input");

    if (input) {

        input.addEventListener(
            "keydown",
            manejarEnter
        );

        input.addEventListener(
            "input",
            () => {

                input.style.height = "auto";

                input.style.height =
                    input.scrollHeight + "px";
            }
        );
    }
});


// ======================================================
// NUEVO CHAT
// ======================================================

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


// ======================================================
// GUARDAR CHATS
// ======================================================

function guardarChats() {

    localStorage.setItem(
        "nova_chats",
        JSON.stringify(chats)
    );
}


// ======================================================
// HISTORIAL
// ======================================================

function actualizarHistorial() {

    const lista =
        document.getElementById("listaChats");

    if (!lista) return;

    lista.innerHTML = "";

    chats.forEach(chatItem => {

        const boton =
            document.createElement("button");

        boton.className =
            "chat-historial";

        boton.textContent =
            chatItem.titulo ||
            "Nueva conversación";

        boton.onclick = () => {

            abrirChat(chatItem.id);
        };

        lista.appendChild(boton);
    });
}


// ======================================================
// ABRIR CHAT
// ======================================================

function abrirChat(id) {

    const encontrado =
        chats.find(c => c.id === id);

    if (!encontrado) return;

    chatActual = id;

    mostrarChat();

    renderizarMensajes();
}


// ======================================================
// MOSTRAR INICIO
// ======================================================

function mostrarInicio() {

    const inicio =
        document.getElementById("inicio");

    const zonaChat =
        document.getElementById("chat");

    if (inicio) {
        inicio.style.display = "block";
    }

    if (zonaChat) {
        zonaChat.innerHTML = "";
    }
}


// ======================================================
// MOSTRAR CHAT
// ======================================================

function mostrarChat() {

    const inicio =
        document.getElementById("inicio");

    if (inicio) {
        inicio.style.display = "none";
    }
}


// ======================================================
// RENDERIZAR MENSAJES
// ======================================================

function renderizarMensajes() {

    const zona =
        document.getElementById("chat");

    if (!zona) return;

    zona.innerHTML = "";

    const actual =
        chats.find(c => c.id === chatActual);

    if (!actual) return;

    actual.mensajes.forEach(mensaje => {

        crearMensajeVisual(
            mensaje.rol,
            mensaje.texto
        );
    });

    zona.scrollTop =
        zona.scrollHeight;
}


// ======================================================
// CREAR MENSAJE VISUAL
// ======================================================

function crearMensajeVisual(
    rol,
    texto
) {

    const zona =
        document.getElementById("chat");

    if (!zona) return;

    const contenedor =
        document.createElement("div");

    contenedor.className =
        rol === "user"
            ? "mensaje usuario"
            : "mensaje nova";

    const contenido =
        document.createElement("div");

    contenido.className =
        "mensaje-contenido";

    contenido.innerHTML =
        formatearRespuesta(texto);

    contenedor.appendChild(
        contenido
    );

    zona.appendChild(
        contenedor
    );

    zona.scrollTop =
        zona.scrollHeight;
}


// ======================================================
// ENVIAR MENSAJE
// ======================================================

async function enviar() {

    const input =
        document.getElementById("input");

    if (!input) return;

    const mensaje =
        input.value.trim();

    if (!mensaje) return;

    const actual =
        chats.find(c => c.id === chatActual);

    if (!actual) return;


    // ------------------------------------------
    // GUARDAR MENSAJE DEL USUARIO
    // ------------------------------------------

    actual.mensajes.push({

        rol: "user",

        texto: mensaje
    });


    // ------------------------------------------
    // NOMBRE AUTOMÁTICO DEL CHAT
    // ------------------------------------------

    if (
        actual.titulo ===
        "Nueva conversación"
    ) {

        actual.titulo =
            mensaje.substring(0, 30) +
            (
                mensaje.length > 30
                    ? "..."
                    : ""
            );
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


    // ------------------------------------------
    // LOADING
    // ------------------------------------------

    const zona =
        document.getElementById("chat");

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

    zona.appendChild(cargando);

    zona.scrollTop =
        zona.scrollHeight;


    // ------------------------------------------
    // CONEXIÓN CON CLOUDFLARE
    // ------------------------------------------

    try {

        const respuesta =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            mensaje,

                        mode:
                            modoActual
                    })
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error del servidor: " +
                respuesta.status
            );
        }


        const datos =
            await respuesta.json();


        cargando.remove();


        const texto =
            datos.reply ||
            "NOVA no pudo generar una respuesta.";


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

        console.error(
            "Error NOVA:",
            error
        );


        cargando.remove();


        const mensajeError =
            "No pude conectarme con NOVA. " +
            "Revisá que el Worker de Cloudflare esté implementado correctamente.";


        actual.mensajes.push({

            rol: "assistant",

            texto: mensajeError
        });


        guardarChats();


        crearMensajeVisual(
            "assistant",
            mensajeError
        );
    }
}


// ======================================================
// ENTER
// ======================================================

function manejarEnter(evento) {

    if (
        evento.key === "Enter" &&
        !evento.shiftKey
    ) {

        evento.preventDefault();

        enviar();
    }
}


// ======================================================
// SUGERENCIAS
// ======================================================

function usarSugerencia(texto) {

    const input =
        document.getElementById("input");

    if (!input) return;

    input.value = texto;

    input.focus();
}


// ======================================================
// CAMBIAR MODO
// ======================================================

function cambiarModo(modo) {

    modoActual = modo;

    document
        .querySelectorAll(".modo")
        .forEach(boton => {

            boton.classList.remove(
                "activo"
            );
        });

    const boton =
        document.querySelector(
            `[data-modo="${modo}"]`
        );

    if (boton) {

        boton.classList.add(
            "activo"
        );
    }
}


// ======================================================
// HERRAMIENTAS
// ======================================================

function mostrarHerramientas() {

    const inicio =
        document.getElementById("inicio");

    const herramientas =
        document.getElementById("herramientas");

    if (inicio) {

        inicio.style.display = "none";
    }

    if (herramientas) {

        herramientas.style.display =
            "block";
    }
}


// ======================================================
// FORMATO DE RESPUESTA
// ======================================================

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


// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHTML(texto) {

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// CONFIGURACIÓN
// ======================================================

function abrirConfiguracion() {

    const modal =
        document.getElementById("modal");

    if (modal) {

        modal.style.display = "flex";
    }
}


// ======================================================
// BORRAR TODOS LOS CHATS
// ======================================================

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


// ======================================================
// CERRAR MODAL
// ======================================================

function cerrarModal() {

    const modal =
        document.getElementById("modal");

    if (modal) {

        modal.style.display = "none";
    }
}

