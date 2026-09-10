const textarea = document.querySelector("textarea");
const sendButton = document.querySelector(".send");
const chat = document.querySelector(".chat");
const welcome = document.querySelector(".welcome");
const cards = document.querySelectorAll(".card");


// ENVIAR MENSAJE
function sendMessage() {

    const text = textarea.value.trim();

    if (text === "") {
        return;
    }

    // Ocultar bienvenida
    welcome.style.display = "none";

    // Ocultar tarjetas
    cards.forEach(card => {
        card.style.display = "none";
    });

    // Crear mensaje del usuario
    const userMessage = document.createElement("div");

    userMessage.className = "message";

    userMessage.innerHTML = `
        <div class="avatar user-avatar">
            Tú
        </div>

        <div class="message-content">
            ${text}
        </div>
    `;

    chat.appendChild(userMessage);


    // Limpiar caja
    textarea.value = "";


    // Crear respuesta de NOVA
    setTimeout(() => {

        const aiMessage = document.createElement("div");

        aiMessage.className = "message";

        aiMessage.innerHTML = `
            <div class="avatar ai-avatar">
                N
            </div>

            <div class="message-content">
                Hola 👋 Soy NOVA. Recibí tu mensaje:
                <br><br>
                <strong>${text}</strong>
                <br><br>
                Todavía estoy en desarrollo, pero pronto voy a poder responder de forma mucho más inteligente.
            </div>
        `;

        chat.appendChild(aiMessage);

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });

    }, 700);
}


// BOTÓN ENVIAR
sendButton.addEventListener("click", sendMessage);


// ENTER PARA ENVIAR
textarea.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }

});
