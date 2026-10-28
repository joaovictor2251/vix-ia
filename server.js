
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const allowedOrigins = [
  "https://joaovictor2251.github.io"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "10kb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Configure a variável GEMINI_API_KEY.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/", (req, res) => {
  res.json({ status: "Vix AI servidor online" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Digite uma mensagem."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "A mensagem deve ter até 4000 caracteres."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim(),
      config: {
        systemInstruction:
          "Você é a Vix AI, uma assistente útil, clara e educada. Responda em português brasileiro por padrão."
      }
    });

    res.json({
      reply: response.text || "Não consegui gerar uma resposta."
    });
  } catch (error) {
    console.error("Erro ao consultar a IA:", error.message);
    res.status(500).json({
      error: "Não consegui responder agora. Tente novamente."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Vix AI rodando na porta ${port}`);
});
