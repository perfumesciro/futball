// ==========================================
// NOVA AI - SERVIDOR
// ==========================================

require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();


// ==========================================
// CONFIGURACIÓN
// ==========================================

const PORT = process.env.PORT || 3001;

const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://127.0.0.1:11434";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "llama3.2";


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({
    limit: "10mb"
}));

app.use(express.static(
    path.join(__dirname)
));


// ==========================================
// PERSONALIDAD DE NOVA
// ==========================================

const SYSTEM_PROMPT = `
Sos NOVA AI, un asistente inteligente moderno.

Tu objetivo es ayudar al usuario de forma clara, natural y útil.

REGLAS:

- Respondé en español si el usuario habla español.
- Si el usuario habla otro idioma, podés responder en ese idioma.
- Sé natural y conversacional.
- No respondas de forma robótica.
- Explicá las cosas de manera sencilla cuando sea necesario.
- Podés ayudar con programación, matemáticas, escritura, ideas, tecnología, estudios y preguntas generales.
- Cuando el usuario pida código, entregá código completo y funcional.
- Si el usuario pide una página web, podés crear HTML, CSS y JavaScript.
- Usá Markdown cuando ayude a organizar la respuesta.
- Podés utilizar listas, títulos y bloques de código.
- Si no sabés algo, decilo claramente.
- No inventes datos.
- No afirmes tener acceso a Internet si no tenés una herramienta de búsqueda conectada.
- No afirmes haber realizado acciones que realmente no realizaste.
- Mantené el contexto de la conversación.
- Intentá entender la intención del usuario antes de responder.
- Si la pregunta es corta, respondé de forma directa.
- Si necesita una explicación, explicala paso a paso.
`;


// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ==========================================
// ESTADO DE NOVA
// ==========================================

app.get("/api/status", async (req, res) => {

    try {

        const response = await fetch(
            `${OLLAMA_URL}/api/tags`
        );


        if (!response.ok) {
            throw new Error(
                "Ollama no respondió correctamente."
            );
        }


        const data = await response.json();


        const models = Array.isArray(data.models)
            ? data.models
            : [];


        const modelExists =
            models.some(model =>
                model.name === OLLAMA_MODEL ||
                model.name.startsWith(
                    `${OLLAMA_MODEL}:`
                )
            );


        res.json({

            online: true,

            status: "online",

            model: OLLAMA_MODEL,

            modelInstalled: modelExists

        });


    } catch (error) {

        res.status(503).json({

            online: false,

            status: "offline",

            error: error.message

        });

    }

});


// ==========================================
// CHAT CON NOVA
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const incomingMessages =
            req.body.messages;


        // ==================================
        // VALIDACIÓN
        // ==================================

        if (!Array.isArray(incomingMessages)) {

            return res.status(400).json({
                error: "El formato de los mensajes no es válido."
            });

        }


        if (incomingMessages.length === 0) {

            return res.status(400).json({
                error: "No hay ningún mensaje."
            });

        }


        // ==================================
        // LIMPIAR MENSAJES
        // ==================================

        const messages =
            incomingMessages
                .filter(message =>
                    message &&
                    (
                        message.role === "user" ||
                        message.role === "assistant"
                    ) &&
                    typeof message.content === "string" &&
                    message.content.trim()
                )
                .slice(-30)
                .map(message => ({
                    role: message.role,
                    content: message.content.trim()
                }));


        if (messages.length === 0) {

            return res.status(400).json({
                error: "No hay mensajes válidos."
            });

        }


        // ==================================
        // AGREGAR PERSONALIDAD
        // ==================================

        const ollamaMessages = [

            {
                role: "system",
                content: SYSTEM_PROMPT
            },

            ...messages

        ];


        // ==================================
        // LLAMAR A OLLAMA
        // ==================================

        const response = await fetch(
            `${OLLAMA_URL}/api/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: OLLAMA_MODEL,

                    messages: ollamaMessages,

                    stream: false,

                    options: {

                        temperature: 0.7,

                        top_p: 0.9,

                        num_ctx: 8192

                    }

                })

            }
        );


        // ==================================
        // ERROR OLLAMA
        // ==================================

        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                `Ollama respondió ${response.status}: ${errorText}`
            );

        }


        // ==================================
        // RESPUESTA
        // ==================================

        const data =
            await response.json();


        const reply =
            data?.message?.content;


        if (
            !reply ||
            typeof reply !== "string"
        ) {

            throw new Error(
                "Ollama no devolvió una respuesta válida."
            );

        }


        // ==================================
        // DEVOLVER A LA WEB
        // ==================================

        res.json({

            reply: reply.trim(),

            model: OLLAMA_MODEL

        });


    } catch (error) {

        console.error(
            "❌ Error NOVA:",
            error
        );


        res.status(500).json({

            error:
                "No pude conectarme con el modelo de IA.",

            details:
                error.message

        });

    }

});


// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use((err, req, res, next) => {

    console.error(err);


    res.status(500).json({

        error: "Error interno del servidor."

    });

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(
    PORT,
    "127.0.0.1",
    () => {

        console.log("");
        console.log("================================");
        console.log("        NOVA AI INICIADO");
        console.log("================================");
        console.log("");
        console.log(
            `🌐 Web: http://localhost:${PORT}`
        );
        console.log(
            `🤖 Modelo: ${OLLAMA_MODEL}`
        );
        console.log(
            `🧠 Ollama: ${OLLAMA_URL}`
        );
        console.log("");
        console.log("================================");
        console.log("");

    }
);
