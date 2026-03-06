const axios = require("axios")

async function sendText(to, message, token, phoneId) {

  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  )

  console.log("📤 enviado a", to)
}

async function sendMenu(to, token, phoneId) {

  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: "👋 Bienvenido a SnapServe" },
        footer: { text: "Selecciona una opción" },
        action: {
          button: "Ver opciones",
          sections: [
            {
              title: "Opciones",
              rows: [
                { id: "menu", title: "🍔 Ver menú", description: "Explorar productos" },
                { id: "pedido", title: "🛒 Hacer pedido", description: "Ordenar comida" },
                { id: "humano", title: "👨‍💼 Hablar con humano", description: "Atención personalizada" }
              ]
            }
          ]
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  )
}

module.exports = { sendText, sendMenu }
