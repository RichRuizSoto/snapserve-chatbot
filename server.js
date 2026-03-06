const express = require("express")
const webhookRoutes = require("./routes/webhook")

const app = express()

app.use(express.json())

app.use("/webhook", webhookRoutes)

const PORT = 4000

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
