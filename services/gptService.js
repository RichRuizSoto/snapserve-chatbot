const OpenAI = require("openai")
const { getConversation, saveMessage } = require("../repositories/chatRepository")
const { getTopProducts } = require("../repositories/productRepository")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function askGPT(estId, userNumber, userMessage) {

  try {

    const history = await getConversation(estId, userNumber)

    const products = await getTopProducts(estId)

    const menuText = products
      .map(p => `• ${p.nombre_producto} — ₡${p.precio}`)
      .join("\n")

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

EJEMPLO DE RESPUESTA

Tenemos estas opciones:

• Hamburguesa clásica — ₡4500
• Pizza personal — ₡5000
• Papas fritas — ₡2000

¿Te gustaría ordenar alguno? 🙂
`
      },

      ...history,

      {
        role: "user",
        content: userMessage
      }

    ]

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages
    })

    const reply = response.output_text

    await saveMessage(estId, userNumber, "user", userMessage)
    await saveMessage(estId, userNumber, "assistant", reply)

    return reply

  } catch (error) {

    console.error("❌ GPT Error:", error)

    return "Lo siento, ocurrió un problema procesando tu mensaje."

  }

}

module.exports = { askGPT }