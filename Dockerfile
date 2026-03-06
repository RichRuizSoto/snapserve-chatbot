# Usar Node.js LTS
FROM node:22-alpine

# Crear carpeta de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Puerto interno del contenedor
EXPOSE 4000

# Comando para iniciar la app
CMD ["node", "server.js"]
