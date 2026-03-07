const OpenAI = require("openai")
const { getConversation, saveMessage } = require("../repositories/chatRepository")
const { getTopProducts } = require("../repositories/productRepository")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function askGPT(estId, userNumber, userMessage) {

  try {

    console.log("======================================")
    console.log("🤖 SNAP SERVE - GPT REQUEST")
    console.log("📍 Restaurante:", estId)
    console.log("👤 Usuario:", userNumber)
    console.log("💬 Mensaje:", userMessage)

    // 1️⃣ Obtener historial
    console.log("📚 Obteniendo historial conversación...")

    const history = await getConversation(estId, userNumber)

    console.log("📚 Historial encontrado:", history.length, "mensajes")

    // 2️⃣ Obtener productos
    console.log("🍔 Consultando productos del restaurante...")

    const products = await getTopProducts(estId)

    console.log("🍔 Productos encontrados:", products.length)

    if (products.length > 0) {
      console.log(
        "🍔 Lista productos:",
        products.map(p => p.nombre_producto).join(", ")
      )
    }

    const menuText = products
      .map(p => `• ${p.nombre_producto} — ₡${p.precio}`)
      .join("\n")

    // 3️⃣ Construir prompt
    console.log("🧠 Construyendo prompt para GPT...")

    const messages = [

      {
        role: "system",
        content: `
Eres SnapServe, un asistente virtual de restaurante que atiende clientes por WhatsApp.

Debes responder siempre de forma amable, clara y natural.

ESTILO
- Escribe como una persona real.
- Usa mensajes cortos.
- Usa saltos de línea para que el mensaje sea limpio.
- Usa emojis solo cuando tengan sentido.

PRODUCTOS DEL RESTAURANTE

${menuText}

REGLAS

- Solo puedes ofrecer productos de esta lista.
- No inventes productos.
- Si el cliente no sabe qué pedir, recomienda uno de los productos.
- Mantén respuestas cortas (máximo 6 líneas).
- Ayuda siempre a que el cliente pueda hacer un pedido.
`
      },

      ...history,

      {
        role: "user",
        content: userMessage
      }

    ]

    console.log("📤 Enviando request a OpenAI...")

    // 4️⃣ Llamada a OpenAI
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages
    })

    console.log("✅ Respuesta recibida de OpenAI")

    const reply = response.output_text

    console.log("🤖 Respuesta IA:")
    console.log(reply)

    // 5️⃣ Guardar conversación
    console.log("💾 Guardando conversación en base de datos...")

    await saveMessage(estId, userNumber, "user", userMessage)
    await saveMessage(estId, userNumber, "assistant", reply)

    console.log("✅ Conversación guardada")

    console.log("======================================")

    return reply

  } catch (error) {

    console.error("======================================")
    console.error("❌ ERROR EN GPT SERVICE")
    console.error("📍 Restaurante:", estId)
    console.error("👤 Usuario:", userNumber)
    console.error("💬 Mensaje:", userMessage)

    if (error.response) {
      console.error("📡 OpenAI Response Error:", error.response.data)
    } else {
      console.error("📡 Error:", error.message)
    }

    console.error("======================================")

    return "Lo siento, ocurrió un problema procesando tu mensaje."

  }

}

module.exports = { askGPT }