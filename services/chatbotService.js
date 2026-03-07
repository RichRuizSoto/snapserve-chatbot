const { askGPT } = require("./gptService")
const { formatMessage } = require("../utils/messageFormatter")
const { searchProducts } = require("../repositories/productRepository")

const humanSupport = new Set()

async function processMessage(message, config) {

  const from = message.from
  const text = message.text?.body?.toLowerCase()?.trim()

  console.log("======================================")
  console.log("📩 MENSAJE RECIBIDO")
  console.log("👤 Usuario:", from)
  console.log("🏪 Restaurante:", config.establecimiento_id)
  console.log("💬 Texto:", text)

  if (humanSupport.has(from)) {
    console.log("⚠️ Conversación en modo humano, bot no responde.")
    console.log("======================================")
    return null
  }

  try {

    // 📭 Mensaje sin texto
    if (!text) {

      console.log("📭 Mensaje sin texto (imagen, ubicación, etc)")

      return {
        type: "text",
        message: "🙂 Puedes escribirme el nombre de un producto para ayudarte."
      }

    }

    // 👨‍💼 Solicitud de humano
    if (text.includes("humano") || text.includes("agente")) {

      console.log("👨‍💼 Usuario solicitó atención humana")

      humanSupport.add(from)

      return {
        type: "text",
        message: "👨‍💼 Perfecto, un agente humano continuará la conversación."
      }

    }

    // 🔎 Buscar productos similares
    console.log("🔎 Buscando productos en la base de datos...")

    const products = await searchProducts(
      config.establecimiento_id,
      text
    )

    console.log("📦 Productos encontrados:", products.length)

    if (products.length > 0) {

      console.log(
        "📦 Coincidencias:",
        products.map(p => p.nombre_producto).join(", ")
      )

      const suggestions = products
        .map(p => `• ${p.nombre_producto} — ₡${p.precio}`)
        .join("\n")

      console.log("✅ Respondiendo con productos encontrados")

      return {
        type: "text",
        message: formatMessage(`
Encontré estas opciones:

${suggestions}

¿Te gustaría ordenar alguno? 🙂
`)
      }

    }

    // 🧠 Usar GPT
    console.log("🧠 No se encontraron productos, consultando GPT...")

    const aiReply = await askGPT(
      config.establecimiento_id,
      from,
      text
    )

    console.log("🤖 Respuesta generada por GPT:")
    console.log(aiReply)

    console.log("======================================")

    return {
      type: "text",
      message: formatMessage(aiReply)
    }

  } catch (error) {

    console.error("======================================")
    console.error("❌ ERROR EN CHATBOT SERVICE")
    console.error("👤 Usuario:", from)
    console.error("💬 Texto:", text)
    console.error("📡 Error:", error.message)
    console.error("======================================")

    return {
      type: "text",
      message: "⚠️ Ocurrió un problema procesando tu mensaje."
    }

  }

}

module.exports = { processMessage }