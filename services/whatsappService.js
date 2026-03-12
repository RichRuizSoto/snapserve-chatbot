const axios = require("axios")

async function sendDocument(to, token, phoneId, url, filename) {

  await axios.post(
    `https://graph.facebook.com/v22.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        link: url,
        filename
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

async function sendText(to, message, token, phoneId) {

  try {

    console.log("======================================")
    console.log("📤 ENVIANDO MENSAJE WHATSAPP")
    console.log("👤 Destinatario:", to)
    console.log("📱 Phone Number ID:", phoneId)
    console.log("💬 Mensaje:")
    console.log(message)

    const response = await axios.post(
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

    console.log("✅ Mensaje enviado correctamente")
    console.log("📨 WhatsApp Message ID:", response.data?.messages?.[0]?.id)

    console.log("======================================")

  } catch (error) {

    console.error("======================================")
    console.error("❌ ERROR ENVIANDO MENSAJE WHATSAPP")
    console.error("👤 Destinatario:", to)

    if (error.response) {
      console.error("📡 Meta API Error:")
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error("📡 Error:", error.message)
    }

    console.error("======================================")

  }

}

async function sendMenu(to, token, phoneId) {

  try {

    console.log("======================================")
    console.log("📤 ENVIANDO MENÚ INTERACTIVO")
    console.log("👤 Destinatario:", to)
    console.log("📱 Phone Number ID:", phoneId)

    const response = await axios.post(
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

    console.log("✅ Menú enviado correctamente")
    console.log("📨 WhatsApp Message ID:", response.data?.messages?.[0]?.id)

    console.log("======================================")

  } catch (error) {

    console.error("======================================")
    console.error("❌ ERROR ENVIANDO MENÚ WHATSAPP")
    console.error("👤 Destinatario:", to)

    if (error.response) {
      console.error("📡 Meta API Error:")
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error("📡 Error:", error.message)
    }

    console.error("======================================")

  }

}

module.exports = { sendText, sendMenu, sendDocument }