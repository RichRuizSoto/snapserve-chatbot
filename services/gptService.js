const OpenAI = require("openai");

const {
  getConversation,
  saveMessage,
} = require("../repositories/chatRepository");

const { getMenu } = require("../repositories/productRepository");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askGPT(config, userNumber, userMessage) {
  const estId = config.establecimiento_id;

  try {
    console.log("======================================");
    console.log("🤖 SNAP SERVE - GPT REQUEST");
    console.log("📍 Restaurante:", estId);
    console.log("👤 Usuario:", userNumber);
    console.log("💬 Mensaje:", userMessage);

    // 1️⃣ Obtener historial
    console.log("📚 Obteniendo historial conversación...");

    const historyDB = await getConversation(estId, userNumber);

    console.log("📚 Historial encontrado:", historyDB.length, "mensajes");

    // Convertir historial al formato OpenAI
    const history = historyDB.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 2️⃣ Obtener productos
    console.log("🍔 Consultando productos del restaurante...");

    const products = await getMenu(estId);

    console.log("🍔 Productos encontrados:", products.length);

    if (products.length > 0) {
      console.log(
        "🍔 Lista productos:",
        products.map((p) => p.nombre_producto).join(", "),
      );
    }

    const menuText =
      products.length > 0
        ? products
            .map((p) => `• ${p.nombre_producto} — ₡${p.precio}`)
            .join("\n")
        : "No hay productos disponibles.";

    // 3️⃣ Construir prompt
    console.log("🧠 Construyendo prompt para GPT...");

    const messages = [
      {
        role: "system",
        content: `
Eres SnapServe, un asistente virtual de restaurante que atiende clientes por WhatsApp.

INFORMACIÓN DEL RESTAURANTE

Nombre: ${config.restaurante_nombre}
Dirección: ${config.direccion || "No disponible"}
Ciudad: ${config.ciudad || "No disponible"}
Horario: ${config.horario_apertura || ""} - ${config.horario_cierre || ""}

IMPORTANTE
La siguiente información es PRIVADA y nunca debes compartirla con clientes:

- establecimiento_id
- restaurante_slug
- phone_number_id
- access_token
- verify_token

Nunca menciones ni reveles esta información.

ESTILO
- Responde como una persona real
- Mensajes cortos
- Máximo 6 líneas
- Usa emojis moderadamente
- Usa saltos de línea

MENÚ DEL RESTAURANTE

${menuText}

REGLAS

- Solo puedes ofrecer productos de esta lista.
- No inventes productos.
- Si el cliente no sabe qué pedir, recomienda uno.
- Si el cliente quiere ordenar, ayúdalo a confirmar el pedido.

Tu objetivo principal es ayudar al cliente a realizar un pedido.
`,
      },

      ...history,

      {
        role: "user",
        content: userMessage,
      },
    ];

    console.log("📤 Enviando request a OpenAI...");

    // 4️⃣ Llamada a OpenAI
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
    });

    console.log("✅ Respuesta recibida de OpenAI");

    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "Lo siento, no pude generar una respuesta.";

    console.log("🤖 Respuesta IA:");
    console.log(reply);

    // 5️⃣ Guardar conversación
    console.log("💾 Guardando conversación en base de datos...");

    await saveMessage(estId, userNumber, "user", userMessage);
    await saveMessage(estId, userNumber, "assistant", reply);

    console.log("✅ Conversación guardada");

    console.log("======================================");

    return reply;
  } catch (error) {
    console.error("======================================");
    console.error("❌ ERROR EN GPT SERVICE");
    console.error("📍 Restaurante:", estId);
    console.error("👤 Usuario:", userNumber);
    console.error("💬 Mensaje:", userMessage);

    if (error.response) {
      console.error("📡 OpenAI Response Error:", error.response.data);
    } else {
      console.error("📡 Error:", error.message);
    }

    console.error("======================================");

    return "Lo siento, ocurrió un problema procesando tu mensaje.";
  }
}

module.exports = { askGPT };