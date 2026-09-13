const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));


/* =========================================================
   OPENAI
   ========================================================= */

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* =========================================================
   PÁGINA PRINCIPAL
   ========================================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/* =========================================================
   CHAT DE NOVA
   ========================================================= */

app.post("/chat", async (req, res) => {

    try {

        const mensaje = req.body.message;
        const modo = req.body.mode || "normal";


        if (!mensaje) {

            return res.status(400).json({
                reply: "Escribí un mensaje."
            });

        }


        /* =====================================================
           PERSONALIDAD DE NOVA
           ===================================================== */

        let instrucciones = `
Sos NOVA AI, un asistente inteligente creado para ayudar
al usuario.

Tu objetivo es ser útil, claro, rápido y fácil de entender.

Respondé en español salvo que el usuario pida otro idioma.

No inventes información cuando no estés seguro.

Cuando expliques algo difícil, dividilo en pasos simples.

Cuando ayudes a programar, explicá el código de manera
comprensible para alguien que está aprendiendo.

Tu estilo debe sentirse natural y humano, no robótico.

No digas constantemente que sos una inteligencia artificial.

Si el usuario pide una respuesta corta, sé breve.
Si necesita una explicación, desarrollala.
`;


        /* =====================================================
           MODOS
           ===================================================== */

        if (modo === "tutor") {

            instrucciones += `

MODO TUTOR:

No te limites a dar la respuesta.

Primero explicá el concepto de manera sencilla.

Después podés hacer preguntas para comprobar
si el usuario entendió.

Adaptá la dificultad al nivel del usuario.
`;

        }


        if (modo === "code") {

            instrucciones += `

MODO CODE:

Ayudá a programar.

Cuando haya un error:

1. Explicá qué significa.
2. Mostrá dónde está el problema.
3. Mostrá cómo solucionarlo.
4. Explicá por qué funciona la solución.

Preferí soluciones simples y fáciles de entender.
`;

        }


        if (modo === "ideas") {

            instrucciones += `

MODO IDEAS:

Ayudá al usuario a crear proyectos originales.

No te limites a dar nombres.

Explicá cómo podría construir cada idea y qué
funciones podría agregarle.
`;

        }


        /* =====================================================
           RESPUESTA DE OPENAI
           ===================================================== */

        const respuesta = await client.responses.create({

            model: "gpt-5-mini",

            instructions: instrucciones,

            input: mensaje

        });


        const texto =
            respuesta.output_text ||
            "No pude generar una respuesta.";


        res.json({

            reply: texto

        });


    } catch (error) {

        console.error(
            "Error de NOVA:",
            error
        );


        res.status(500).json({

            reply:
                "NOVA tuvo un problema al procesar tu mensaje. " +
                "Intentá nuevamente."

        });

    }

});


/* =========================================================
   SERVIDOR
   ========================================================= */

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `NOVA AI funcionando en http://localhost:${PORT}`
    );

});
