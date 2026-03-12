const axios = require("axios")

async function sendOrder(payload) {

  try {

    console.log("======================================")
    console.log("📦 ENVIANDO PEDIDO AL BACKEND")
    console.log(JSON.stringify(payload, null, 2))

    const response = await axios.post(
      "https://snapserveconnect.com/api/menu",
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    console.log("✅ Pedido creado:", response.data.numero_orden)

    console.log("======================================")

    return response.data

  } catch (error) {

    console.error("❌ ERROR ENVIANDO PEDIDO")

    if (error.response) {
      console.error(error.response.data)
    } else {
      console.error(error.message)
    }

    return null
  }

}

module.exports = { sendOrder }