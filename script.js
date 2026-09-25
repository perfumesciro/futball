// ==========================================
// NOVA AI - SCRIPT PRINCIPAL
// ==========================================

"use strict";

// ==========================================
// ELEMENTOS
// ==========================================

const messages = document.getElementById("messages");
const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");

const history = document.getElementById("history");
const searchChats = document.getElementById("searchChats");

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");

const newChatBtn = document.getElementById("newChat");
const topNewChat = document.getElementById("topNewChat");

const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearBtn");

const voiceBtn = document.getElementById("voiceBtn");

const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");

const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");

const welcome = document.getElementById("welcome");

// ==========================================
// CONFIGURACIÓN
// ==========================================

const STORAGE_KEY = "nova_chats_v4";
const THEME_KEY = "nova_theme";

let chats = [];
let currentChatId = null;

let isSending = false;
let selectedFiles = [];


// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();
    loadChats();

    if (chats.length === 0) {
        createChat(false);
    } else {
        currentChatId = chats[0].id;
        renderHistory();
        renderCurrentChat();
    }

    setupSuggestions();
    setupTextarea();
    setupEvents();

    checkServer();

    // Revisar estado cada 15 segundos
    setInterval(checkServer, 15000);
});


// ==========================================
// EVENTOS
// ==========================================

function setupEvents() {

    sendBtn.addEventListener("click", sendMessage);

    promptInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }

    });


    newChatBtn.addEventListener("click", () => {
        createChat(true);
        closeMobileSidebar();
    });


    if (topNewChat) {
        topNewChat.addEventListener("click", () => {
            createChat(true);
        });
    }


    clearBtn.addEventListener("click", clearCurrentChat);


    themeBtn.addEventListener("click", toggleTheme);


    menuBtn.addEventListener("click", () => {
        sidebar.classList.add("open");
    });


    closeSidebar.addEventListener("click", closeMobileSidebar);


    searchChats.addEventListener("input", () => {
        renderHistory(searchChats.value);
    });


    attachBtn.addEventListener("click", () => {
        fileInput.click();
    });


    fileInput.addEventListener("change", handleFiles);


    voiceBtn.addEventListener("click", startVoiceRecognition);

}


// ==========================================
// CHATS
// ==========================================

function createChat(open = true) {

    const chat = {
        id: Date.now().toString(),
        title: "Nuevo chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    chats.unshift(chat);

    currentChatId = chat.id;

    saveChats();
    renderHistory();
    renderCurrentChat();

    if (open) {
        promptInput.focus();
    }
}


// ==========================================
// OBTENER CHAT ACTUAL
// ==========================================

function getCurrentChat() {

    return chats.find(chat => chat.id === currentChatId);

}


// ==========================================
// GUARDAR
// ==========================================

function saveChats() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
    );

}


// ==========================================
// CARGAR
// ==========================================

function loadChats() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            chats = JSON.parse(saved);
        }

    } catch (error) {

        console.error("No se pudieron cargar los chats.");

        chats = [];

    }

}


// ==========================================
// HISTORIAL
// ==========================================

function renderHistory(search = "") {

    history.innerHTML = "";

    const text = search.toLowerCase().trim();

    const filtered = chats.filter(chat =>
        chat.title.toLowerCase().includes(text)
    );


    if (filtered.length === 0) {

        history.innerHTML = `
            <div class="empty-history">
                No hay conversaciones
            </div>
        `;

        return;
    }


    filtered.forEach(chat => {

        const item = document.createElement("div");

        item.className = "history-item";

        if (chat.id === currentChatId) {
            item.classList.add("active");
        }


        item.innerHTML = `
            <div class="history-main">
                <i class="fa-regular fa-message"></i>
                <span>${escapeHTML(chat.title)}</span>
            </div>

            <button
                class="history-delete"
                title="Eliminar"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        `;


        item.addEventListener("click", (event) => {

            if (
                event.target.closest(".history-delete")
            ) {
                return;
            }

            currentChatId = chat.id;

            saveChats();
            renderHistory();
            renderCurrentChat();

            closeMobileSidebar();

        });


        const deleteButton =
            item.querySelector(".history-delete");


        deleteButton.addEventListener("click", (event) => {

            event.stopPropagation();

            deleteChat(chat.id);

        });


        history.appendChild(item);

    });

}


// ==========================================
// ELIMINAR CHAT
// ==========================================

function deleteChat(id) {

    const index = chats.findIndex(chat => chat.id === id);

    if (index === -1) return;


    chats.splice(index, 1);


    if (chats.length === 0) {

        createChat(false);

    } else {

        if (currentChatId === id) {
            currentChatId = chats[0].id;
        }

    }


    saveChats();

    renderHistory();
    renderCurrentChat();

}


// ==========================================
// RENDERIZAR CHAT
// ==========================================

function renderCurrentChat() {

    messages.innerHTML = "";

    const chat = getCurrentChat();

    if (!chat) return;


    if (chat.messages.length === 0) {

        messages.appendChild(
            createWelcome()
        );

        return;

    }


    chat.messages.forEach(message => {

        addMessageToScreen(
            message.role,
            message.content,
            false
        );

    });


    scrollToBottom();

}


// ==========================================
// BIENVENIDA
// ==========================================

function createWelcome() {

    const element = document.createElement("div");

    element.className = "welcome";

    element.innerHTML = `
        <div class="welcome-logo">
            N
        </div>

        <h1>
            Hola, soy <span>NOVA</span>
        </h1>

        <p>
            Tu asistente inteligente.
            Preguntame lo que quieras.
        </p>

        <div class="suggestions">

            <button
                class="suggestion"
                data-prompt="Explicame qué cosas podés hacer."
            >
                <div class="suggestion-icon">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>

                <div>
                    <strong>¿Qué podés hacer?</strong>
                    <span>Conocé las funciones de NOVA</span>
                </div>
            </button>


            <button
                class="suggestion"
                data-prompt="Ayudame a crear una página web moderna."
            >
                <div class="suggestion-icon">
                    <i class="fa-solid fa-code"></i>
                </div>

                <div>
                    <strong>Programación</strong>
                    <span>Creá una página web conmigo</span>
                </div>
            </button>


            <button
                class="suggestion"
                data-prompt="Explicame algo interesante que probablemente no conozca."
            >
                <div class="suggestion-icon">
                    <i class="fa-solid fa-lightbulb"></i>
                </div>

                <div>
                    <strong>Aprender algo</strong>
                    <span>Descubrí algo nuevo</span>
                </div>
            </button>


            <button
                class="suggestion"
                data-prompt="Ayudame a tener una idea para un proyecto."
            >
                <div class="suggestion-icon">
                    <i class="fa-solid fa-rocket"></i>
                </div>

                <div>
                    <strong>Crear un proyecto</strong>
                    <span>Empecemos una idea nueva</span>
                </div>
            </button>

        </div>
    `;


    element
        .querySelectorAll("[data-prompt]")
        .forEach(button => {

            button.addEventListener("click", () => {

                promptInput.value =
                    button.dataset.prompt;

                promptInput.focus();

                autoResize();

            });

        });


    return element;

}


// ==========================================
// SUGERENCIAS
// ==========================================

function setupSuggestions() {

    document
        .querySelectorAll("[data-prompt]")
        .forEach(button => {

            button.addEventListener("click", () => {

                promptInput.value =
                    button.dataset.prompt;

                promptInput.focus();

                autoResize();

            });

        });

}


// ==========================================
// ENVIAR MENSAJE
// ==========================================

async function sendMessage() {

    if (isSending) return;


    const text = promptInput.value.trim();


    if (!text && selectedFiles.length === 0) {
        return;
    }


    const chat = getCurrentChat();

    if (!chat) return;


    isSending = true;

    sendBtn.disabled = true;


    // ======================================
    // TEXTO DEL USUARIO
    // ======================================

    let userText = text;


    if (selectedFiles.length > 0) {

        const names = selectedFiles
            .map(file => file.name)
            .join(", ");


        if (userText) {
            userText += `\n\n[Archivos adjuntos: ${names}]`;
        } else {
            userText =
                `[Archivos adjuntos: ${names}]`;
        }

    }


    // ======================================
    // AGREGAR USUARIO
    // ======================================

    chat.messages.push({
        role: "user",
        content: userText
    });


    chat.updatedAt = Date.now();


    // Crear título automáticamente
    if (
        chat.title === "Nuevo chat" &&
        text
    ) {

        chat.title =
            text.length > 35
                ? text.substring(0, 35) + "..."
                : text;

    }


    saveChats();

    renderHistory();


    // ======================================
    // MOSTRAR MENSAJE
    // ======================================

    removeWelcome();

    addMessageToScreen(
        "user",
        userText,
        true
    );


    promptInput.value = "";

    selectedFiles = [];

    fileInput.value = "";

    autoResize();


    // ======================================
    // INDICADOR
    // ======================================

    const thinking = addThinking();

    scrollToBottom();


    try {

        // ==================================
        // PREPARAR MENSAJES PARA LA IA
        // ==================================

        const apiMessages =
            chat.messages.map(message => ({
                role: message.role,
                content: message.content
            }));


        // ==================================
        // CONECTAR CON SERVER
        // ==================================

        const response = await fetch(
            "/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    messages: apiMessages
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `Error del servidor: ${response.status}`
            );

        }


        const data = await response.json();


        // ==================================
        // OBTENER RESPUESTA
        // ==================================

        const reply =
            data.reply ||
            data.response ||
            data.message;


        if (!reply) {

            throw new Error(
                "La IA no devolvió ninguna respuesta."
            );

        }


        // ==================================
        // QUITAR THINKING
        // ==================================

        thinking.remove();


        // ==================================
        // GUARDAR RESPUESTA
        // ==================================

        chat.messages.push({
            role: "assistant",
            content: reply
        });


        chat.updatedAt = Date.now();


        saveChats();


        // ==================================
        // MOSTRAR RESPUESTA
        // ==================================

        addMessageToScreen(
            "assistant",
            reply,
            true
        );


    } catch (error) {

        console.error(error);

        thinking.remove();


        const errorMessage =
            `No pude conectarme con el cerebro de NOVA.\n\n` +
            `Comprobá que el servidor esté funcionando ` +
            `y que el modelo de IA esté iniciado.\n\n` +
            `Error: ${error.message}`;


        addMessageToScreen(
            "assistant",
            errorMessage,
            true
        );

    }


    isSending = false;

    sendBtn.disabled = false;

    promptInput.focus();

    scrollToBottom();

}


// ==========================================
// MOSTRAR MENSAJE
// ==========================================

function addMessageToScreen(
    role,
    content,
    animate = false
) {

    const message = document.createElement("div");

    message.className =
        `message ${role}`;


    const avatar =
        role === "user"
            ? "T"
            : "N";


    const name =
        role === "user"
            ? "Vos"
            : "NOVA";


    message.innerHTML = `

        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">

            <div class="message-header">
                <strong>${name}</strong>
            </div>

            <div class="message-text">
                ${formatMessage(content)}
            </div>

        </div>

    `;


    if (animate) {
        message.classList.add("message-animate");
    }


    messages.appendChild(message);


    // Botones copiar
    setupCopyButtons(message);

}


// ==========================================
// FORMATEAR RESPUESTA
// ==========================================

function formatMessage(text) {

    if (!text) return "";


    let safe = escapeHTML(text);


    // Código
    safe = safe.replace(
        /```([\s\S]*?)```/g,
        `
        <div class="code-wrapper">

            <button
                class="copy-code"
                type="button"
            >
                <i class="fa-regular fa-copy"></i>
                Copiar
            </button>

            <pre><code>$1</code></pre>

        </div>
        `
    );


    // Negrita
    safe = safe.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // Cursiva
    safe = safe.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );


    // Links
    safe = safe.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );


    // Saltos
    safe = safe.replace(
        /\n/g,
        "<br>"
    );


    return safe;

}


// ==========================================
// COPIAR
// ==========================================

function setupCopyButtons(container) {

    container
        .querySelectorAll(".copy-code")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const code =
                        button.parentElement
                            .querySelector("code")
                            .innerText;


                    try {

                        await navigator.clipboard.writeText(
                            code
                        );


                        button.innerHTML =
                            `<i class="fa-solid fa-check"></i> Copiado`;


                        setTimeout(() => {

                            button.innerHTML =
                                `<i class="fa-regular fa-copy"></i> Copiar`;

                        }, 1500);


                    } catch {

                        button.innerText =
                            "No se pudo copiar";

                    }

                }
            );

        });

}


// ==========================================
// THINKING
// ==========================================

function addThinking() {

    const element =
        document.createElement("div");


    element.className =
        "message assistant thinking-message";


    element.innerHTML = `

        <div class="message-avatar">
            N
        </div>

        <div class="message-content">

            <div class="message-header">
                <strong>NOVA</strong>
            </div>

            <div class="thinking">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>

    `;


    messages.appendChild(element);


    return element;

}


// ==========================================
// QUITAR WELCOME
// ==========================================

function removeWelcome() {

    const existing =
        messages.querySelector(".welcome");


    if (existing) {
        existing.remove();
    }

}


// ==========================================
// TEXTAREA
// ==========================================

function setupTextarea() {

    promptInput.addEventListener(
        "input",
        autoResize
    );

}


function autoResize() {

    promptInput.style.height = "auto";

    promptInput.style.height =
        Math.min(
            promptInput.scrollHeight,
            180
        ) + "px";

}


// ==========================================
// ARCHIVOS
// ==========================================

function handleFiles(event) {

    selectedFiles =
        Array.from(event.target.files);


    if (selectedFiles.length === 0) {
        return;
    }


    const names =
        selectedFiles
            .map(file => file.name)
            .join(", ");


    promptInput.placeholder =
        `Archivos: ${names}`;


    promptInput.focus();

}


// ==========================================
// VOZ
// ==========================================

function startVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Tu navegador no permite reconocimiento de voz."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang = "es-AR";

    recognition.interimResults = false;

    recognition.continuous = false;


    recognition.onstart = () => {

        voiceBtn.classList.add("recording");

    };


    recognition.onend = () => {

        voiceBtn.classList.remove("recording");

    };


    recognition.onerror = () => {

        voiceBtn.classList.remove("recording");

    };


    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;


        promptInput.value +=
            (promptInput.value ? " " : "") +
            transcript;


        autoResize();

        promptInput.focus();

    };


    recognition.start();

}


// ==========================================
// TEMA
// ==========================================

function loadTheme() {

    const theme =
        localStorage.getItem(THEME_KEY);


    if (theme === "light") {

        document.body.classList.add("light");

    }

}


function toggleTheme() {

    document.body.classList.toggle("light");


    const isLight =
        document.body.classList.contains("light");


    localStorage.setItem(
        THEME_KEY,
        isLight ? "light" : "dark"
    );

}


// ==========================================
// LIMPIAR CHAT
// ==========================================

function clearCurrentChat() {

    const chat = getCurrentChat();

    if (!chat) return;


    if (chat.messages.length === 0) {
        return;
    }


    const confirmed =
        confirm(
            "¿Querés borrar todos los mensajes de este chat?"
        );


    if (!confirmed) return;


    chat.messages = [];

    chat.title = "Nuevo chat";

    chat.updatedAt = Date.now();


    saveChats();

    renderHistory();
    renderCurrentChat();

}


// ==========================================
// SIDEBAR
// ==========================================

function closeMobileSidebar() {

    sidebar.classList.remove("open");

}


// ==========================================
// ESTADO DEL SERVIDOR
// ==========================================

async function checkServer() {

    try {

        const response =
            await fetch(
                "/api/status",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error();
        }


        const data =
            await response.json();


        if (
            data.online === true ||
            data.status === "online"
        ) {

            setStatus(
                "NOVA está en línea",
                true
            );

        } else {

            setStatus(
                "IA desconectada",
                false
            );

        }


    } catch {

        setStatus(
            "Servidor desconectado",
            false
        );

    }

}


// ==========================================
// STATUS
// ==========================================

function setStatus(text, online) {

    if (statusText) {
        statusText.textContent = text;
    }


    if (statusDot) {

        statusDot.classList.toggle(
            "online",
            online
        );

    }

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// SCROLL
// ==========================================

function scrollToBottom() {

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });

}
