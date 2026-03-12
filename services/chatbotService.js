const { askGPT } = require("./gptService");
const { formatMessage } = require("../utils/messageFormatter");
const { searchProducts } = require("../repositories/productRepository");
const { getConversation } = require("../repositories/chatRepository");
const { detectIntent } = require("./intentService");

const humanSupport = new Set();

async function processMessage(message, config) {
  const from = message.from;
  const text = message.text?.body?.toLowerCase()?.trim();

  console.log("======================================");
  console.log("📩 MENSAJE RECIBIDO");
  console.log("👤 Usuario:", from);
  console.log("🏪 Restaurante:", config.establecimiento_id);
  console.log("💬 Texto:", text);

  if (humanSupport.has(from)) {
    console.log("⚠️ Conversación en modo humano, bot no responde.");
    console.log("======================================");
    return null;
  }

  try {
    if (!text) {
      return {
        type: "text",
        message: "🙂 Puedes escribirme el nombre de un producto para ayudarte.",
      };
    }

    const history = await getConversation(config.establecimiento_id, from);
    const isFirstMessage = history.length === 0;

    if (isFirstMessage) {
      const welcome = `
👋 ¡Hola! Bienvenido a *${config.restaurante_nombre}*

Estoy aquí para ayudarte con:

🍔 Ver el menú
🛒 Hacer un pedido
📍 Ubicación
⏰ Horarios

Puedes escribirme algo como:

• "Quiero ver el menú"
• "Recomiéndame algo"
• "¿Dónde están ubicados?"

¿En qué puedo ayudarte hoy? 🙂
`;

      return {
        type: "text",
        message: formatMessage(welcome),
      };
    }

    const intent = detectIntent(text);

    console.log("🧠 Intent detectado:", intent);

    if (intent === "humano") {
      humanSupport.add(from);

      return {
        type: "text",
        message: "👨‍💼 Perfecto, un agente humano continuará la conversación.",
      };
    }

    if (intent === "saludo") {
      return {
        type: "text",
        message: formatMessage(`
👋 Hola, estás hablando con *${config.restaurante_nombre}*

¿En qué puedo ayudarte hoy?

🍔 Ver menú
📍 Ubicación
⏰ Horarios
🛒 Hacer pedido
`),
      };
    }

    if (intent === "horario") {
      return {
        type: "text",
        message: formatMessage(`
⏰ Nuestro horario es:

${config.horario_apertura || "No disponible"} - ${config.horario_cierre || "No disponible"}

¡Te esperamos! 🙂
`),
      };
    }

    if (intent === "ubicacion") {
      return {
        type: "text",
        message: formatMessage(`
📍 Estamos ubicados en:

${config.direccion || "Dirección no disponible"}
${config.ciudad || ""}

¡Será un gusto atenderte! 🙂
`),
      };
    }

    if (intent === "menu") {
      return {
        type: "pdf",
      };
    }

    const products = await searchProducts(config.establecimiento_id, text);

    console.log("📦 Productos encontrados:", products.length);

    if (products.length > 0) {
      const suggestions = products
        .map((p) => `• ${p.nombre_producto} — ₡${p.precio}`)
        .join("\n");

      return {
        type: "text",
        message: formatMessage(`
Encontré estas opciones:

${suggestions}

¿Te gustaría ordenar alguno? 🙂
`),
      };
    }

    const aiReply = await askGPT(config, from, text);

    console.log("🤖 Respuesta generada por GPT:");
    console.log(aiReply);

    console.log("======================================");

    return {
      type: "text",
      message: formatMessage(aiReply),
    };
  } catch (error) {
    console.error("======================================");
    console.error("❌ ERROR EN CHATBOT SERVICE");
    console.error("👤 Usuario:", from);
    console.error("💬 Texto:", text);
    console.error("📡 Error:", error.message);
    console.error("======================================");

    return {
      type: "text",
      message: "⚠️ Ocurrió un problema procesando tu mensaje.",
    };
  }
}

module.exports = { processMessage };
