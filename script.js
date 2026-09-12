/* =========================================================
   NOVA AI
   Frontend
========================================================= */

const state = {
    currentChat: null,
    webEnabled: false,
    currentModel: "NOVA 1.0",
    chats: JSON.parse(localStorage.getItem("nova_chats") || "[]"),
    files: JSON.parse(localStorage.getItem("nova_files") || "[]"),
    darkMode: true
};


/* =========================================================
   ELEMENTOS
========================================================= */

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const welcome = document.getElementById("welcome");
const suggestions = document.getElementById("suggestions");

const recentChats = document.getElementById("recentChats");

const webButton = document.getElementById("webButton");
const webStatus = document.getElementById("webStatus");

const fileInput = document.getElementById("fileInput");

const modelSelector = document.getElementById("modelSelector");
const modelMenu = document.getElementById("modelMenu");
const currentModel = document.getElementById("currentModel");

const searchOverlay = document.getElementById("searchOverlay");
const settingsOverlay = document.getElementById("settingsOverlay");
const libraryOverlay = document.getElementById("libraryOverlay");

const searchResults = document.getElementById("searchResults");

const themeButton = document.getElementById("themeButton");

const sidebar = document.querySelector(".sidebar");


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderRecentChats();

    renderLibrary();

    loadSettings();

    setupEvents();

});


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

    /* NUEVO CHAT */

    document
        .getElementById("newChatButton")
        .addEventListener("click", newChat);

    document
        .getElementById("topNewChat")
        .addEventListener("click", newChat);


    /* ENVIAR */

    sendButton.addEventListener("click", sendMessage);


    /* ENTER */

    messageInput.addEventListener("keydown", (event) => {

        const enterSend =
            document.getElementById("enterSend")?.checked ?? true;

        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            enterSend
        ) {

            event.preventDefault();

            sendMessage();
        }

    });


    /* AUTO RESIZE */

    messageInput.addEventListener("input", () => {

        messageInput.style.height = "auto";

        messageInput.style.height =
            Math.min(messageInput.scrollHeight, 160) + "px";

    });


    /* WEB */

    webButton.addEventListener("click", toggleWeb);


    /* FILE */

    document
        .getElementById("attachButton")
        .addEventListener("click", () => {
            fileInput.click();
        });

    document
        .getElementById("fileButton")
        .addEventListener("click", () => {
            fileInput.click();
        });

    fileInput.addEventListener("change", handleFiles);


    /* MODELO */

    modelSelector.addEventListener("click", (event) => {

        event.stopPropagation();

        modelMenu.classList.toggle("show");

    });


    document
        .querySelectorAll(".model-option")
        .forEach(button => {

            button.addEventListener("click", () => {

                state.currentModel =
                    button.dataset.model;

                currentModel.textContent =
                    state.currentModel;

                modelMenu.classList.remove("show");

            });

        });


    /* CERRAR MENUS */

    document.addEventListener("click", (event) => {

        if (
            !modelMenu.contains(event.target) &&
            !modelSelector.contains(event.target)
        ) {

            modelMenu.classList.remove("show");

        }

    });


    /* TEMA */

    themeButton.addEventListener("click", toggleTheme);


    /* BUSCAR */

    document
        .getElementById("topSearchButton")
        .addEventListener("click", openSearch);


    /* SETTINGS */

    document
        .querySelector('[data-section="settings"]')
        .addEventListener("click", openSettings);


    /* LIBRARY */

    document
        .querySelector('[data-section="library"]')
        .addEventListener("click", openLibrary);


    /* CHATS */

    document
        .querySelector('[data-section="chats"]')
        .addEventListener("click", () => {

            closeAllOverlays();

        });


    /* BUSCAR */

    document
        .querySelector('[data-section="search"]')
        .addEventListener("click", openSearch);


    /* SUGERENCIAS */

    document
        .querySelectorAll(".suggestion-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                messageInput.value =
                    card.dataset.prompt;

                sendMessage();

            });

        });


    /* MODALES */

    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id =
                    button.dataset.close;

                document
                    .getElementById(id)
                    .classList.remove("show");

            });

        });


    /* BUSQUEDA DE CHATS */

    document
        .getElementById("conversationSearch")
        .addEventListener("input", event => {

            searchConversations(event.target.value);

        });


    /* CONFIG */

    document
        .getElementById("darkMode")
        .addEventListener("change", event => {

            state.darkMode = event.target.checked;

            applyTheme();

            saveSettings();

        });


    document
        .getElementById("animationsEnabled")
        .addEventListener("change", saveSettings);


    document
        .getElementById("enterSend")
        .addEventListener("change", saveSettings);


    /* MOBILE */

    document
        .getElementById("mobileMenu")
        .addEventListener("click", () => {

            sidebar.classList.toggle("mobile-open");

        });


    /* PERFIL */

    document
        .getElementById("profileButton")
        .addEventListener("click", () => {

            alert(
                "Perfil local de NOVA AI.\n\n" +
                "Más adelante podés agregar inicio de sesión."
            );

        });

}


/* =========================================================
   NUEVO CHAT
========================================================= */

function newChat() {

    state.currentChat = {
        id: Date.now(),
        title: "Nueva conversación",
        messages: [],
        created: Date.now()
    };

    messages.innerHTML = "";

    welcome.style.display = "block";
    suggestions.style.display = "grid";

    messageInput.value = "";

    renderRecentChats();

}


/* =========================================================
   ENVIAR MENSAJE
========================================================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (!text) return;


    if (!state.currentChat) {

        state.currentChat = {
            id: Date.now(),
            title: createTitle(text),
            messages: [],
            created: Date.now()
        };

    }


    if (
        state.currentChat.title ===
        "Nueva conversación"
    ) {

        state.currentChat.title =
            createTitle(text);

    }


    welcome.style.display = "none";

    suggestions.style.display = "none";


    addMessage(
        "user",
        text
    );


    state.currentChat.messages.push({
        role: "user",
        content: text
    });


    messageInput.value = "";

    messageInput.style.height = "auto";

    saveChats();

    renderRecentChats();


    const typing = showTyping();


    try {

        const response =
            await askNOVA(text);

        typing.remove();

        addAIMessage(response);

    } catch (error) {

        typing.remove();

        addAIMessage({
            text:
                "No pude conectarme con el servidor de NOVA.\n\n" +
                "Si todavía no configuraste `server.js`, " +
                "podés hacerlo siguiendo los pasos que te paso después del código.",
            sources: []
        });

        console.error(error);

    }

}


/* =========================================================
   LLAMAR AL BACKEND
========================================================= */

async function askNOVA(text) {

    const response = await fetch(
        "/api/chat",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: text,

                model: state.currentModel,

                web: state.webEnabled,

                history:
                    state.currentChat.messages.slice(-20)

            })

        }
    );


    if (!response.ok) {

        throw new Error(
            "Error del servidor"
        );

    }


    return await response.json();

}


/* =========================================================
   AGREGAR MENSAJE
========================================================= */

function addMessage(role, text) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${role}`;


    if (role === "ai") {

        wrapper.innerHTML = `

            <div class="message-avatar">
                N
            </div>

            <div>

                <div class="message-bubble">
                    ${formatText(text)}
                </div>

            </div>

        `;

    } else {

        wrapper.innerHTML = `

            <div class="message-bubble">
                ${formatText(text)}
            </div>

        `;

    }


    messages.appendChild(wrapper);

    scrollToBottom();

    return wrapper;

}


/* =========================================================
   MENSAJE DE IA
========================================================= */

function addAIMessage(data) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai";


    let sourcesHTML = "";


    if (
        data.sources &&
        data.sources.length
    ) {

        sourcesHTML = `

            <div class="sources">

                <div class="sources-title">
                    Fuentes consultadas
                </div>

                ${data.sources
                    .map(source => {

                        const title =
                            escapeHTML(
                                source.title ||
                                source.url
                            );

                        const url =
                            escapeAttribute(
                                source.url
                            );

                        return `
                            <a
                                class="source-link"
                                href="${url}"
                                target="_blank"
                                rel="noopener noreferrer">

                                ${title}

                            </a>
                        `;

                    })
                    .join("")
                }

            </div>

        `;

    }


    wrapper.innerHTML = `

        <div class="message-avatar">
            N
        </div>

        <div>

            <div class="message-bubble">

                ${formatText(
                    data.text || ""
                )}

                ${sourcesHTML}

            </div>


            <div class="message-tools">

                <button
                    class="message-tool copy-button">
                    Copiar
                </button>

                <button
                    class="message-tool regenerate-button">
                    Regenerar
                </button>

            </div>

        </div>

    `;


    messages.appendChild(wrapper);


    /* COPIAR */

    wrapper
        .querySelector(".copy-button")
        .addEventListener("click", () => {

            navigator.clipboard.writeText(
                data.text || ""
            );

        });


    /* REGENERAR */

    wrapper
        .querySelector(".regenerate-button")
        .addEventListener("click", () => {

            const lastUserMessage =
                [...state.currentChat.messages]
                    .reverse()
                    .find(
                        item =>
                            item.role === "user"
                    );

            if (!lastUserMessage) return;

            messageInput.value =
                lastUserMessage.content;

            sendMessage();

        });


    state.currentChat.messages.push({

        role: "assistant",

        content:
            data.text || ""

    });


    saveChats();

    scrollToBottom();

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai";


    wrapper.innerHTML = `

        <div class="message-avatar">
            N
        </div>

        <div class="typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    messages.appendChild(wrapper);

    scrollToBottom();

    return wrapper;

}


/* =========================================================
   WEB
========================================================= */

function toggleWeb() {

    state.webEnabled =
        !state.webEnabled;


    webButton.classList.toggle(
        "active",
        state.webEnabled
    );


    webStatus.textContent =
        state.webEnabled
            ? "Web activada"
            : "Web desactivada";


    webStatus.classList.toggle(
        "active",
        state.webEnabled
    );

}


/* =========================================================
   ARCHIVOS
========================================================= */

function handleFiles(event) {

    const files =
        [...event.target.files];


    if (!files.length) return;


    files.forEach(file => {

        const item = {

            id: Date.now() + Math.random(),

            name: file.name,

            type: file.type,

            size: file.size,

            date: Date.now()

        };


        state.files.push(item);

    });


    localStorage.setItem(
        "nova_files",
        JSON.stringify(state.files)
    );


    renderLibrary();


    alert(
        `${files.length} archivo(s) agregado(s) a la biblioteca.`
    );


    fileInput.value = "";

}


/* =========================================================
   BIBLIOTECA
========================================================= */

function renderLibrary() {

    const container =
        document.getElementById(
            "libraryContent"
        );


    if (!state.files.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>▣</div>

                <h3>
                    No hay archivos todavía
                </h3>

                <p>
                    Los archivos que adjuntes aparecerán aquí.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        state.files
            .map(file => `

                <div class="search-result">

                    <strong>
                        ${escapeHTML(file.name)}
                    </strong>

                    <span>
                        ${formatBytes(file.size)}
                    </span>

                </div>

            `)
            .join("");

}


/* =========================================================
   CHATS
========================================================= */

function saveChats() {

    if (!state.currentChat) return;


    const index =
        state.chats.findIndex(
            chat =>
                chat.id ===
                state.currentChat.id
        );


    if (index === -1) {

        state.chats.unshift(
            state.currentChat
        );

    } else {

        state.chats[index] =
            state.currentChat;

    }


    localStorage.setItem(
        "nova_chats",
        JSON.stringify(state.chats)
    );

}


/* =========================================================
   CHATS RECIENTES
========================================================= */

function renderRecentChats() {

    recentChats.innerHTML = "";


    state.chats
        .slice(0, 30)
        .forEach(chat => {

            const button =
                document.createElement("button");

            button.className =
                "recent-chat";

            button.textContent =
                chat.title;


            button.addEventListener(
                "click",
                () => loadChat(chat.id)
            );


            recentChats.appendChild(
                button
            );

        });

}


/* =========================================================
   CARGAR CHAT
========================================================= */

function loadChat(id) {

    const chat =
        state.chats.find(
            item => item.id === id
        );


    if (!chat) return;


    state.currentChat = chat;


    messages.innerHTML = "";

    welcome.style.display = "none";
    suggestions.style.display = "none";


    chat.messages.forEach(message => {

        if (message.role === "user") {

            addMessage(
                "user",
                message.content
            );

        } else {

            addAIMessage({
                text: message.content,
                sources: []
            });

        }

    });


    sidebar.classList.remove(
        "mobile-open"
    );

}


/* =========================================================
   BUSCAR CONVERSACIONES
========================================================= */

function openSearch() {

    closeAllOverlays();

    searchOverlay.classList.add("show");

    document
        .getElementById("conversationSearch")
        .focus();

    searchConversations("");

}


function searchConversations(query) {

    const q =
        query.toLowerCase().trim();


    const results =
        state.chats.filter(chat => {

            return (
                chat.title
                    .toLowerCase()
                    .includes(q)
                ||
                chat.messages.some(
                    message =>
                        message.content
                            .toLowerCase()
                            .includes(q)
                )
            );

        });


    if (!results.length) {

        searchResults.innerHTML = `

            <div class="empty-state">

                <div>⌕</div>

                <h3>
                    No encontré conversaciones
                </h3>

            </div>

        `;

        return;

    }


    searchResults.innerHTML =
        results.map(chat => `

            <div
                class="search-result"
                data-chat-id="${chat.id}">

                <strong>
                    ${escapeHTML(chat.title)}
                </strong>

                <span>
                    ${chat.messages.length} mensajes
                </span>

            </div>

        `)
        .join("");


    searchResults
        .querySelectorAll(".search-result")
        .forEach(result => {

            result.addEventListener(
                "click",
                () => {

                    loadChat(
                        Number(
                            result.dataset.chatId
                        )
                    );

                    closeAllOverlays();

                }
            );

        });

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    closeAllOverlays();

    settingsOverlay.classList.add(
        "show"
    );

}


function saveSettings() {

    const settings = {

        enterSend:
            document
                .getElementById("enterSend")
                .checked,

        animations:
            document
                .getElementById("animationsEnabled")
                .checked,

        darkMode:
            document
                .getElementById("darkMode")
                .checked

    };


    localStorage.setItem(
        "nova_settings",
        JSON.stringify(settings)
    );

}


function loadSettings() {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "nova_settings"
            ) || "null"
        );


    if (!saved) return;


    document
        .getElementById("enterSend")
        .checked =
        saved.enterSend;


    document
        .getElementById("animationsEnabled")
        .checked =
        saved.animations;


    document
        .getElementById("darkMode")
        .checked =
        saved.darkMode;


    state.darkMode =
        saved.darkMode;


    applyTheme();

}


/* =========================================================
   TEMA
========================================================= */

function toggleTheme() {

    state.darkMode =
        !state.darkMode;


    document
        .getElementById("darkMode")
        .checked =
        state.darkMode;


    applyTheme();

    saveSettings();

}


function applyTheme() {

    document.body.classList.toggle(
        "light",
        !state.darkMode
    );


    themeButton.textContent =
        state.darkMode
            ? "☾"
            : "☀";

}


/* =========================================================
   LIBRARY MODAL
========================================================= */

function openLibrary() {

    closeAllOverlays();

    renderLibrary();

    libraryOverlay.classList.add(
        "show"
    );

}


/* =========================================================
   OVERLAYS
========================================================= */

function closeAllOverlays() {

    document
        .querySelectorAll(".overlay")
        .forEach(overlay => {

            overlay.classList.remove(
                "show"
            );

        });

}


/* =========================================================
   TITULO
========================================================= */

function createTitle(text) {

    let title =
        text.trim();


    if (title.length > 35) {

        title =
            title.substring(0, 35) +
            "...";

    }


    return title;

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    setTimeout(() => {

        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        });

    }, 50);

}


/* =========================================================
   FORMATEAR TEXTO
========================================================= */

function formatText(text) {

    if (!text) return "";


    let safe =
        escapeHTML(text);


    /* CODE */

    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    /* NEGRITA */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* SALTOS */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   TAMAÑO ARCHIVO
========================================================= */

function formatBytes(bytes) {

    if (!bytes) return "0 B";


    const units =
        ["B", "KB", "MB", "GB"];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        (bytes /
            Math.pow(1024, index)
        ).toFixed(1)
        + " "
        + units[index]
    );

}
