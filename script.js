/* =========================================================
   NOVA AI - SCRIPT PRINCIPAL
   ========================================================= */

let modoActual = "normal";
let chats = [];
let chatActual = null;


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarChats();

    if (chats.length > 0) {
        chatActual = chats[0];
    } else {
        crearChat();
    }

    actualizarHistorial();

});


/* =========================================================
   NUEVO CHAT
   ========================================================= */

function nuevoChat() {

    crearChat();

    mostrarInicio();

    actualizarHistorial();

}


function crearChat() {

    const nuevo = {
        id: Date.now(),
        titulo: "Nuevo chat",
        mensajes: []
    };

    chats.unshift(nuevo);

    chatActual = nuevo;

    guardarChats();

}


/* =========================================================
   GUARDAR CHATS
   ========================================================= */

function guardarChats() {

    localStorage.setItem(
        "nova_chats",
        JSON.stringify(chats)
    );

}


function cargarChats() {

    try {

        const guardados = localStorage.getItem("nova_chats");

        if (guardados) {

            chats = JSON.parse(guardados);

        }

    } catch (error) {

        console.log("No se pudieron cargar los chats.");

        chats = [];

    }

}


/* =========================================================
   HISTORIAL
   ========================================================= */

function actualizarHistorial() {

    const lista = document.getElementById("listaChats");

    if (!lista) return;

    lista.innerHTML = "";

    chats.forEach(chat => {

        const boton = document.createElement("button");

        boton.className = "chat-historial";

        boton.innerText =
            chat.titulo || "Nuevo chat";

        boton.onclick = () => {

            abrirChat(chat.id);

        };

        lista.appendChild(boton);

    });

}


function abrirChat(id) {

    const encontrado = chats.find(chat => chat.id === id);

    if (!encontrado) return;

    chatActual = encontrado;

    mostrarChat();

}


/* =========================================================
   MOSTRAR INICIO
   ========================================================= */

function mostrarInicio() {

    document.getElementById("inicio")?.classList.remove("oculto");

    document.getElementById("chat")?.classList.add("oculto");

    document.getElementById("herramientas")?.classList.add("oculto");

}


/* =========================================================
   MOSTRAR CHAT
   ========================================================= */

function mostrarChat() {

    const inicio = document.getElementById("inicio");
    const chat = document.getElementById("chat");
    const herramientas = document.getElementById("herramientas");

    inicio?.classList.add("oculto");

    herramientas?.classList.add("oculto");

    chat?.classList.remove("oculto");

    renderizarMensajes();

}


/* =========================================================
   RENDERIZAR MENSAJES
   ========================================================= */

function renderizarMensajes() {

    const chat = document.getElementById("chat");

    if (!chat || !chatActual) return;

    chat.innerHTML = "";

    chatActual.mensajes.forEach(mensaje => {

        crearMensajeVisual(
            mensaje.texto,
            mensaje.tipo
        );

    });

    chat.scrollTop = chat.scrollHeight;

}


function crearMensajeVisual(texto, tipo) {

    const chat = document.getElementById("chat");

    const mensaje = document.createElement("div");

    if (tipo === "usuario") {

        mensaje.className =
            "mensaje mensaje-usuario";

        mensaje.innerHTML = `
            <div class="mensaje-texto">
                ${escaparHTML(texto)}
            </div>
        `;

    } else {

        mensaje.className =
            "mensaje mensaje-ia";

        mensaje.innerHTML = `
            <div class="avatar">N</div>

            <div class="mensaje-texto">
                ${formatearRespuesta(texto)}
            </div>
        `;

    }

    chat.appendChild(mensaje);

}


/* =========================================================
   ENVIAR MENSAJE
   ========================================================= */

async function enviar() {

    const input = document.getElementById("input");
    const boton = document.getElementById("botonEnviar");

    if (!input) return;

    const mensaje = input.value.trim();

    if (!mensaje) return;

    if (!chatActual) {

        crearChat();

    }


    /* Cambiar título del chat */

    if (
        !chatActual.mensajes.length &&
        chatActual.titulo === "Nuevo chat"
    ) {

        chatActual.titulo =
            mensaje.substring(0, 30);

    }


    /* Guardar mensaje */

    chatActual.mensajes.push({

        tipo: "usuario",

        texto: mensaje

    });


    guardarChats();

    actualizarHistorial();

    mostrarChat();


    input.value = "";

    input.style.height = "42px";


    boton.disabled = true;


    /* Mostrar indicador */

    const indicador = document.createElement("div");

    indicador.className = "mensaje mensaje-ia";

    indicador.id = "indicador";

    indicador.innerHTML = `
        <div class="avatar">N</div>

        <div class="mensaje-texto">

            <div class="pensando">

                <span></span>
                <span></span>
                <span></span>

                NOVA está pensando...

            </div>

        </div>
    `;

    document.getElementById("chat")
        .appendChild(indicador);


    document.getElementById("chat")
        .scrollTop = 999999;


    try {

        const respuesta = await fetch("/chat", {

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

            throw new Error(
                "Error del servidor"
            );

        }


        const datos =
            await respuesta.json();


        document.getElementById(
            "indicador"
        )?.remove();


        const respuestaTexto =
            datos.reply ||
            "NOVA no recibió una respuesta.";


        chatActual.mensajes.push({

            tipo: "ia",

            texto: respuestaTexto

        });


        guardarChats();

        renderizarMensajes();


    } catch (error) {

        document.getElementById(
            "indicador"
        )?.remove();


        chatActual.mensajes.push({

            tipo: "ia",

            texto:
                "No pude conectarme con NOVA. " +
                "El mensaje quedó guardado y podés intentarlo nuevamente."

        });


        guardarChats();

        renderizarMensajes();

    }


    boton.disabled = false;

    input.focus();

}


/* =========================================================
   ENTER
   ========================================================= */

function manejarEnter(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        enviar();

    }

}


/* =========================================================
   SUGERENCIAS
   ========================================================= */

function usarSugerencia(texto) {

    const input =
        document.getElementById("input");

    mostrarChat();

    input.value = texto;

    input.focus();

}


/* =========================================================
   MODOS
   ========================================================= */

function cambiarModo(modo, boton) {

    modoActual = modo;

    document
        .querySelectorAll(".modo")
        .forEach(elemento => {

            elemento.classList.remove(
                "activo"
            );

        });


    boton.classList.add("activo");


    const input =
        document.getElementById("input");


    const textos = {

        normal:
            "Escribí un mensaje para NOVA...",

        tutor:
            "¿Qué querés aprender?",

        code:
            "Pegá tu código o explicame el problema...",

        ideas:
            "¿Qué querés crear?"

    };


    input.placeholder =
        textos[modo] ||
        textos.normal;

}


/* =========================================================
   HERRAMIENTAS
   ========================================================= */

function mostrarHerramientas() {

    document
        .getElementById("inicio")
        ?.classList.add("oculto");

    document
        .getElementById("chat")
        ?.classList.add("oculto");

    document
        .getElementById("herramientas")
        ?.classList.remove("oculto");

}


function abrirHerramienta(tipo) {

    const contenido =
        document.getElementById(
            "modalContenido"
        );

    if (!contenido) return;


    if (tipo === "calculadora") {

        contenido.innerHTML = `

            <h2>🧮 Calculadora</h2>

            <input
                id="calcInput"
                class="herramienta-input"
                placeholder="Ej: 25 * 4 + 10"
            >

            <button
                class="herramienta-boton"
                onclick="calcular()"
            >
                Calcular
            </button>

            <div id="resultadoCalc"></div>

        `;

    }


    if (tipo === "estudio") {

        contenido.innerHTML = `

            <h2>📚 NOVA Tutor</h2>

            <p>
                NOVA puede explicarte un tema
                paso a paso y adaptarse a tu nivel.
            </p>

            <button
                class="herramienta-boton"
                onclick="usarHerramientaEnChat(
                    'Quiero estudiar un tema. Explicámelo paso a paso y haceme preguntas para comprobar si entendí.'
                )"
            >
                Empezar a estudiar
            </button>

        `;

    }


    if (tipo === "ideas") {

        contenido.innerHTML = `

            <h2>💡 NOVA Ideas</h2>

            <p>
                Decime qué querés crear y NOVA
                puede ayudarte a convertirlo
                en un proyecto real.
            </p>

            <button
                class="herramienta-boton"
                onclick="usarHerramientaEnChat(
                    'Dame 10 ideas originales de proyectos que pueda crear y explicame cómo empezar cada uno.'
                )"
            >
                Generar ideas
            </button>

        `;

    }


    if (tipo === "codigo") {

        contenido.innerHTML = `

            <h2>💻 NOVA Code</h2>

            <p>
                NOVA puede ayudarte a encontrar
                errores y entender tu código.
            </p>

            <button
                class="herramienta-boton"
                onclick="usarHerramientaEnChat(
                    'Quiero programar. Ayudame a construir mi proyecto paso a paso y explicame cada parte del código.'
                )"
            >
                Abrir NOVA Code
            </button>

        `;

    }


    if (tipo === "planner") {

        contenido.innerHTML = `

            <h2>📅 NOVA Planner</h2>

            <input
                id="plannerInput"
                class="herramienta-input"
                placeholder="¿Qué proyecto querés organizar?"
            >

            <button
                class="herramienta-boton"
                onclick="crearPlan()"
            >
                Crear plan
            </button>

            <div id="planResultado"></div>

        `;

    }


    if (tipo === "notas") {

        const notas =
            localStorage.getItem(
                "nova_notas"
            ) || "";


        contenido.innerHTML = `

            <h2>📝 Notas</h2>

            <textarea
                id="notasInput"
                class="notas"
                placeholder="Escribí tus notas..."
            >${escaparHTML(notas)}</textarea>

            <button
                class="herramienta-boton"
                onclick="guardarNotas()"
            >
                Guardar notas
            </button>

            <p id="notaEstado"></p>

        `;

    }


    document
        .getElementById("modal")
        ?.classList.remove("oculto");

}


/* =========================================================
   CALCULADORA
   ========================================================= */

function calcular() {

    const input =
        document.getElementById(
            "calcInput"
        );

    const resultado =
        document.getElementById(
            "resultadoCalc"
        );


    try {

        const expresion =
            input.value.trim();


        if (!expresion) {

            resultado.innerText =
                "Escribí una operación.";

            return;

        }


        /*
          Permitimos solamente números
          y operadores matemáticos básicos.
        */

        if (
            !/^[0-9+\-*/().%\s]+$/
                .test(expresion)
        ) {

            resultado.innerText =
                "Operación no válida.";

            return;

        }


        const valor =
            Function(
                `"use strict"; return (${expresion})`
            )();


        resultado.innerText =
            "Resultado: " + valor;

    } catch {

        resultado.innerText =
            "No pude realizar el cálculo.";

    }

}


/* =========================================================
   PLANNER
   ========================================================= */

function crearPlan() {

    const input =
        document.getElementById(
            "plannerInput"
        );

    const resultado =
        document.getElementById(
            "planResultado"
        );


    const proyecto =
        input.value.trim();


    if (!proyecto) {

        resultado.innerText =
            "Escribí un proyecto.";

        return;

    }


    resultado.innerHTML = `

        <h3>Plan para: ${escaparHTML(proyecto)}</h3>

        <ol>

            <li>Definir el objetivo.</li>

            <li>Dividir el proyecto en tareas.</li>

            <li>Empezar por la primera tarea.</li>

            <li>Probar lo realizado.</li>

            <li>Corregir errores.</li>

            <li>Mejorar el resultado.</li>

            <li>Finalizar y guardar el proyecto.</li>

        </ol>

    `;

}


/* =========================================================
   NOTAS
   ========================================================= */

function guardarNotas() {

    const input =
        document.getElementById(
            "notasInput"
        );

    if (!input) return;


    localStorage.setItem(
        "nova_notas",
        input.value
    );


    const estado =
        document.getElementById(
            "notaEstado"
        );


    if (estado) {

        estado.innerText =
            "✓ Notas guardadas";

    }

}


/* =========================================================
   ABRIR HERRAMIENTA EN CHAT
   ========================================================= */

function usarHerramientaEnChat(texto) {

    cerrarModal();

    mostrarChat();

    const input =
        document.getElementById("input");

    input.value = texto;

    input.focus();

}


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function abrirConfiguracion() {

    const contenido =
        document.getElementById(
            "modalContenido"
        );


    contenido.innerHTML = `

        <h2>⚙ Configuración</h2>

        <p>
            Configuración de NOVA AI
        </p>

        <hr>

        <h3>Conversaciones</h3>

        <button
            class="herramienta-boton"
            onclick="borrarTodosLosChats()"
        >
            Borrar historial
        </button>

        <p style="color:#747d8d;font-size:12px;">
            Esto eliminará las conversaciones
            guardadas en este navegador.
        </p>

    `;


    document
        .getElementById("modal")
        ?.classList.remove("oculto");

}


/* =========================================================
   BORRAR TODOS LOS CHATS
   ========================================================= */

function borrarTodosLosChats() {

    const confirmar =
        confirm(
            "¿Querés borrar todas las conversaciones?"
        );


    if (!confirmar) return;


    chats = [];

    localStorage.removeItem(
        "nova_chats"
    );


    crearChat();

    actualizarHistorial();

    mostrarInicio();

    cerrarModal();

}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function cerrarModal() {

    document
        .getElementById("modal")
        ?.classList.add("oculto");

}


/* =========================================================
   FORMATEAR RESPUESTAS
   ========================================================= */

function formatearRespuesta(texto) {

    let resultado =
        escaparHTML(texto);


    /*
      Código entre ```
    */

    resultado =
        resultado.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    /*
      Negrita
    */

    resultado =
        resultado.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
      Saltos de línea
    */

    resultado =
        resultado.replace(
            /\n/g,
            "<br>"
        );


    return resultado;

}


/* =========================================================
   SEGURIDAD HTML
   ========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;

}


/* =========================================================
   AUTO AJUSTAR TEXTAREA
   ========================================================= */

document.addEventListener(
    "input",
    event => {

        if (
            event.target.id !== "input"
        ) return;


        event.target.style.height =
            "42px";


        event.target.style.height =
            Math.min(
                event.target.scrollHeight,
                180
            ) + "px";

    }
);
