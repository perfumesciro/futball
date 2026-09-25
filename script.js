// =====================================================
// NOVA AI — SCRIPT PRINCIPAL
// =====================================================

const $ = (id) => document.getElementById(id);

const messagesEl = $("messages");
const promptEl = $("prompt");
const sendBtn = $("sendBtn");
const historyEl = $("history");
const sidebar = $("sidebar");
const statusText = $("statusText");
const statusDot = document.querySelector(".status-dot");

const STORAGE_KEY = "nova_chats_v3";
const THEME_KEY = "nova_theme";

let chats = [];
let currentChatId = null;
let loading = false;


// =====================================================
// INICIALIZACIÓN
// =====================================================

try {
    chats = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(chats)) {
        chats = [];
    }

} catch {
    chats = [];
}


// =====================================================
// GUARDAR DATOS
// =====================================================

function saveChats() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
    );
}


// =====================================================
// OBTENER CHAT ACTUAL
// =====================================================

function getCurrentChat() {

    return chats.find(
        chat => chat.id === currentChatId
    );
}


// =====================================================
// CREAR NUEVO CHAT
// =====================================================

function createChat() {

    const chat = {

        id:
            typeof crypto !== "undefined" &&
            crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(),

        title: "Nueva conversación",

        messages: [],

        createdAt: Date.now()

    };

    chats.unshift(chat);

    currentChatId = chat.id;

    saveChats();

    renderHistory();

    renderMessages();

    closeSidebar();
}


// =====================================================
// ABRIR CHAT
// =====================================================

function openChat(id) {

    if (loading) return;

    currentChatId = id;

    renderHistory();

    renderMessages();

    closeSidebar();
}


// =====================================================
// ELIMINAR CHAT
// =====================================================

function deleteChat(id) {

    if (loading) return;

    const confirmDelete =
        confirm(
            "¿Querés eliminar esta conversación?"
        );

    if (!confirmDelete) return;

    chats = chats.filter(
        chat => chat.id !== id
    );

    if (currentChatId === id) {

        currentChatId =
            chats.length > 0
                ? chats[0].id
                : null;
    }

    saveChats();

    renderHistory();

    renderMessages();
}


// =====================================================
// HISTORIAL
// =====================================================

function renderHistory() {

    const searchInput = $("searchChats");

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    historyEl.innerHTML = "";

    const filteredChats =
        chats.filter(chat =>
            chat.title
                .toLowerCase()
                .includes(search)
        );


    if (filteredChats.length === 0) {

        const empty = document.createElement("div");

        empty.style.padding = "15px";
        empty.style.color = "var(--muted)";
        empty.style.fontSize = "13px";

        empty.textContent =
            search
                ? "No se encontraron chats."
                : "Todavía no hay conversaciones.";

        historyEl.appendChild(empty);

        return;
    }


    filteredChats.forEach(chat => {

        const item =
            document.createElement("div");

        item.className =
            "history-item" +
            (
                chat.id === currentChatId
                    ? " active"
                    : ""
            );


        const icon =
            document.createElement("i");

        icon.className =
            "fa-regular fa-message";


        const title =
            document.createElement("span");

        title.textContent =
            chat.title;


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-chat";

        deleteButton.title =
            "Eliminar conversación";


        const trash =
            document.createElement("i");

        trash.className =
            "fa-solid fa-trash";


        deleteButton.appendChild(trash);


        deleteButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                deleteChat(chat.id);

            }
        );


        item.appendChild(icon);

        item.appendChild(title);

        item.appendChild(deleteButton);


        item.addEventListener(
            "click",
            () => openChat(chat.id)
        );


        historyEl.appendChild(item);

    });
}


// =====================================================
// PANTALLA DE BIENVENIDA
// =====================================================

function createWelcome() {

    const welcome =
        document.createElement("div");

    welcome.className = "welcome";


    welcome.innerHTML = `

        <div class="welcome-logo">
            ✦
        </div>

        <h1>
            Hola, soy NOVA.
        </h1>

        <p>
            Tu asistente inteligente.
            ¿Qué hacemos hoy?
        </p>

        <div class="suggestions">

            <button data-prompt="Ayudame a crear una página web moderna">

                <i class="fa-solid fa-code"></i>

                Crear una página web

            </button>


            <button data-prompt="Explicame un tema interesante de forma sencilla">

                <i class="fa-solid fa-lightbulb"></i>

                Aprender algo nuevo

            </button>


            <button data-prompt="Dame ideas para crear un proyecto">

                <i class="fa-solid fa-rocket"></i>

                Crear un proyecto

            </button>


            <button data-prompt="Ayudame a estudiar para una prueba">

                <i class="fa-solid fa-book"></i>

                Estudiar

            </button>

        </div>

    `;


    welcome
        .querySelectorAll("[data-prompt]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    promptEl.value =
                        button.dataset.prompt;

                    autoResize();

                    sendMessage();

                }
            );

        });


    return welcome;
}


// =====================================================
// MOSTRAR MENSAJES
// =====================================================

function renderMessages() {

    const chat =
        getCurrentChat();


    messagesEl.innerHTML = "";


    if (
        !chat ||
        chat.messages.length === 0
    ) {

        messagesEl.appendChild(
            createWelcome()
        );

        return;
    }


    chat.messages.forEach(message => {

        messagesEl.appendChild(
            createMessageElement(message)
        );

    });


    scrollToBottom();
}


// =====================================================
// CREAR MENSAJE
// =====================================================

function createMessageElement(message) {

    const element =
        document.createElement("div");


    element.className =
        "message " + message.role;


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";


    avatar.textContent =
        message.role === "assistant"
            ? "✦"
            : "U";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    formatMessage(
        message.content,
        content
    );


    if (message.role === "assistant") {

        const copyButton =
            document.createElement("button");

        copyButton.className =
            "copy-message";


        copyButton.innerHTML =
            `
            <i class="fa-regular fa-copy"></i>
            Copiar respuesta
            `;


        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        message.content
                    );

                    copyButton.innerHTML =
                        `
                        <i class="fa-solid fa-check"></i>
                        ¡Copiado!
                        `;

                    setTimeout(() => {

                        copyButton.innerHTML =
                            `
                            <i class="fa-regular fa-copy"></i>
                            Copiar respuesta
                            `;

                    }, 1500);

                } catch {

                    alert(
                        "No se pudo copiar la respuesta."
                    );

                }

            }
        );


        content.appendChild(copyButton);

    }


    if (message.role === "user") {

        element.appendChild(content);

        element.appendChild(avatar);

    } else {

        element.appendChild(avatar);

        element.appendChild(content);

    }


    return element;
}


// =====================================================
// FORMATEAR RESPUESTAS
// =====================================================

function formatMessage(text, container) {

    if (!text) return;


    /*
        Detectamos bloques de código:

        ```html
        código
        ```

    */


    const parts =
        text.split(
            /(```[\s\S]*?```)/g
        );


    parts.forEach(part => {

        if (
            part.startsWith("```")
        ) {

            const content =
                part.slice(3, -3);


            const lines =
                content.split("\n");


            let language = "";


            if (
                lines.length > 0 &&
                !lines[0].includes(" ")
            ) {

                language =
                    lines.shift().trim();

            }


            const code =
                lines.join("\n");


            const pre =
                document.createElement("pre");


            const codeElement =
                document.createElement("code");


            codeElement.textContent =
                code;


            const copyButton =
                document.createElement("button");


            copyButton.className =
                "copy-btn";


            copyButton.textContent =
                "Copiar";


            copyButton.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            code
                        );

                        copyButton.textContent =
                            "¡Copiado!";

                        setTimeout(() => {

                            copyButton.textContent =
                                "Copiar";

                        }, 1500);

                    } catch {

                        copyButton.textContent =
                            "Error";

                    }

                }
            );


            if (
