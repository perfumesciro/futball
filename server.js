import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

/* Mostrar index.html */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* Chat */
app.post("/chat", (req, res) => {

    const mensaje = req.body.message;

    res.json({
        reply: "Recibí tu mensaje: " + mensaje
    });

});

app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});
