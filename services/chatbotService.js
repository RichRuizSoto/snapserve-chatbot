const { askGPT } = require("./gptService")
const { formatMessage } = require("../utils/messageFormatter")
const { searchProducts } = require("../repositories/productRepository")

const humanSupport = new Set()

async function processMessage(message, config) {

  const from = message.from
  const text = message.text?.body?.toLowerCase()?.trim()

  if (humanSupport.has(from)) return null

  try {

    if (!text) {

      return {
        type: "text",
        message: "🙂 Puedes escribirme el nombre de un producto para ayudarte."
      }

    }

    if (text.includes("humano") || text.includes("agente")) {

      humanSupport.add(from)

      return {
        type: "text",
        message: "👨‍💼 Perfecto, un agente humano continuará la conversación."
      }

    }

    const products = await searchProducts(
      config.establecimiento_id,
      text
    )

    if (products.length > 0) {

      const suggestions = products
        .map(p => `• ${p.nombre_producto} — ₡${p.precio}`)
        .join("\n")

      return {
        type: "text",
        message: formatMessage(`
Encontré estas opciones:

${suggestions}

¿Te gustaría ordenar alguno? 🙂
`)
      }

    }

    const aiReply = await askGPT(
      config.establecimiento_id,
      from,
      text
    )

    return {
      type: "text",
      message: formatMessage(aiReply)
    }

  } catch (error) {

    console.error("❌ chatbotService error:", error)

    return {
      type: "text",
      message: "⚠️ Ocurrió un problema procesando tu mensaje."
    }

  }

}

module.exports = { processMessage }