# Usar Node.js 22 Alpine como imagen base
FROM node:22-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
  git \
  bash \
  starship

# Starship prompt
RUN echo 'eval "$(starship init bash)"' >> ~/.bashrc

# Establece directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependecias
RUN npm install

# Limpiar cache de npm
RUN npm cache clean --force

# Copiar el resto de los archivos de la aplicación con permisos correctos
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "start:dev"]
