# --- ETAPA 1: Compilación ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Ejecutamos el build de Vite (genera la carpeta 'dist')
RUN npm run build

# --- ETAPA 2: Servidor de Producción ---
FROM nginx:alpine

# COPIAMOS LA CONFIGURACIÓN PERSONALIZADA PARA EVITAR EL 404 AL RECARGAR
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos compilados desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]