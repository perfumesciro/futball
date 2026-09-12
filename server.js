```js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

/* =========================================================
   ARCHIVOS DEL SITIO
========================================================= */

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================================================
   CHAT
========================================================= */

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            model,
            web,
            history
        } = req.body;

        if (!message) {

            return res.status(400).json({
                error: "Falta el mensaje."
            });

        }

        const input = [];

        if (Array.isArray(history)) {

            for (const item of history) {

                if (
                    item.role !== "user" &&
                    item.role !== "assistant"
                ) {
                    continue;
                }

                input.push({
                    role: item.role,

                    content: [
                        {
                            type:
                                item.role === "user"
                                    ? "input_text"
                                    : "output_text",

                            text: String(item.content)
                        }
                    ]
                });

            }

        }

        input.push({
            role: "user",

            content: [
                {
                    type: "input_text",
                    text: message
                }
            ]
        });

        const tools = [];

        if (web) {

            tools.push({
                type: "web_search"
            });

        }

        const instructions = `

Sos NOVA AI.

Tu objetivo es ser un asistente inteligente,
natural, claro y útil.

FORMA DE HABLAR:

- Hablá de forma natural.
- No repitas innecesariamente la pregunta.
- No digas "como inteligencia artificial" constantemente.
- Si el usuario no entiende algo, explicalo de una forma más sencilla.
- Adaptá la explicación al nivel del usuario.
- No inventes información.
- Si no estás seguro de algo, decilo.
- Cuando uses información obtenida de la web,
  diferenciá los datos encontrados de tus propias explicaciones.
- No afirmes que buscaste en internet si no se utilizó la herramienta web.
- Para programación, entregá código funcional y explicá dónde colocarlo.
- Para preguntas sencillas, respondé de forma sencilla.
- Para preguntas complejas, organizá la respuesta.

Tu nombre es NOVA.

El usuario quiere una experiencia parecida
a los asistentes modernos, pero con una conversación
natural y humana.

`;

        let realModel = "gpt-5.6-luna";

        if (model === "NOVA Pro") {
            realModel = "gpt-5.6-sol";
        }

        const response = await client.responses.create({

            model: realModel,

            instructions,

            input,

            tools,

            store: false

        });

        const text =
            response.output_text ||
            "No pude generar una respuesta.";

        const sources = [];

        if (Array.isArray(response.output)) {

            for (const item of response.output) {

                if (
                    item.type === "web_search_call"
                ) {

                    const action = item.action;

                    if (
                        action &&
                        Array.isArray(action.sources)
                    ) {

                        for (
                            const source
                            of action.sources
                        ) {

                            if (
                                source.url &&
                                !sources.some(
                                    s =>
                                        s.url === source.url
                                )
                            ) {

                                sources.push({

                                    title:
                                        source.title ||
                                        source.url,

                                    url:
                                        source.url

                                });

                            }

                        }

                    }

                }

            }

        }

        res.json({
            text,
            sources
        });

    } catch (error) {

        console.error(
            "NOVA ERROR:",
            error
        );

        res.status(500).json({

            error:
                "No se pudo procesar la solicitud."

        });

    }

});

/* =========================================================
   SERVIDOR
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `NOVA AI funcionando en http://localhost:${PORT}`
        );

    }
);
```
