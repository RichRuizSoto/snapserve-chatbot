const { askGPT } = require("./gptService");
const { formatMessage } = require("../utils/messageFormatter");
const { searchProducts } = require("../repositories/productRepository");
const { getConversation } = require("../repositories/chatRepository");
const { detectIntent } = require("./intentService");
const {
  addItem,
  getOrder,
  clearOrder,
  calculateTotal,
} = require("./orderService");
const { sendOrder } = require("./backendOrderService");

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
        👋 ¡Hola! Bienvenido a *${config.restaurante_nombre}*.

        ¡Qué bueno tenerte por aquí! 😊  
        Si te gustaría ver el menú o hacer un pedido, con gusto te ayudo.

        Solo dime qué te gustaría.
        `;

      return {
        type: "text",
        message: formatMessage(welcome),
      };
    }
    
    const intent = detectIntent(text);

    if (
      text.includes("confirmar") ||
      text.includes("listo") ||
      text.includes("eso es")
    ) {
      const order = getOrder(from);

      if (order.items.length === 0) {
        return {
          type: "text",
          message: "Tu carrito está vacío 🙂",
        };
      }

      const total = calculateTotal(order);

      const payload = {
        id_restaurante: config.establecimiento_id,
        tipo_servicio: "pickup",
        total,
        productos: order.items.map((p) => ({
          id_producto: p.id_producto,
          cantidad: 1,
          precio: p.precio,
          tipo_producto: "producto",
          extras: [],
        })),
        nombre: "Cliente WhatsApp",
        telefono: from,
        metodo_pago: "efectivo",
        estado: "solicitado",
        imprimir_factura: false,
      };

      const result = await sendOrder(payload);

      clearOrder(from);

      if (result) {
        return {
          type: "text",
          message: `✅ Pedido confirmado

🧾 Orden #${result.numero_orden}

🍽️ Ya lo estamos preparando`,
        };
      }

      return {
        type: "text",
        message: "⚠️ No pude crear el pedido.",
      };
    }

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
      const product = products[0];

      addItem(from, product);

      const order = getOrder(from);

      return {
        type: "text",
        message: formatMessage(`
Agregué *${product.nombre_producto}* a tu pedido.

Tu carrito ahora tiene ${order.items.length} producto(s).

Escribe *confirmar* para enviar el pedido o agrega otro producto 🙂
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
