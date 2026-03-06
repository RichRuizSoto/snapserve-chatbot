const { askGPT } = require("./gptService")
const { formatMessage } = require("../utils/messageFormatter")

const humanSupport = new Set()

async function processMessage(message, config) {
  const from = message.from
  const text = message.text?.body?.toLowerCase()
  const listReply = message.interactive?.list_reply?.id

  if (humanSupport.has(from)) return null

  let response = ""

  if (text === "hola") {
    return { type: "menu" }
  }

  if (listReply === "menu") {
    response = formatMessage(`
🍔 *MENÚ SNAP SERVE*

1️⃣ Hamburguesa clásica — ₡4500
2️⃣ Pizza personal — ₡5000
3️⃣ Papas fritas — ₡2000

✍️ Escribe el número del producto para ordenar.
`)
  }
  else if (listReply === "pedido") {
    response = formatMessage(`
🛒 *¿Qué deseas ordenar?*

1️⃣ Hamburguesa
2️⃣ Pizza
3️⃣ Papas

✍️ Escribe el número del producto.
`)
  }
  else if (listReply === "humano") {
    humanSupport.add(from)
    response = formatMessage("👨‍💼 Un agente humano continuará la conversación.")
  }
  else {
    response = formatMessage(await askGPT(config.establecimiento_id, from, text))
  }

  return { type: "text", message: response }
}

module.exports = { processMessage }