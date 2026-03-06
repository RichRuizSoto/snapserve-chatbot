const mysql = require("mysql2/promise")

let db

async function initDB() {
  db = await mysql.createPool({
    host: "restaurant_mysql",
    user: "RRSAdmin",
    password: "rsradmin29!!",
    database: "restaurant_db",
    waitForConnections: true,
    connectionLimit: 10
  })

  console.log("✅ Conectado a MySQL")
}

function getDB() {
  return db
}

module.exports = { initDB, getDB }
