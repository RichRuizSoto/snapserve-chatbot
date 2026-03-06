const OpenAI = require("openai")
const { getConversation, saveMessage } = require("../repositories/chatRepository")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function askGPT(estId, userNumber, userMessage) {
  try {

    const history = await getConversation(estId, userNumber)

    const messages = [
      {
        role: "system",
        content: `
Eres SnapServe, un asistente de restaurante que atiende clientes por WhatsApp.

MENÚ:
Hamburguesa clásica ₡4500
Pizza personal ₡5000
Papas fritas ₡2000

Reglas:
- Responde corto
- Sé amable
- Usa emojis cuando tenga sentido
- Ayuda a los clientes a ordenar comida
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
