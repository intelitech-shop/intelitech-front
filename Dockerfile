FROM node:22-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

# Imagem base - Ngxin apline
FROM nginx:alpine AS production

COPY --from=build /app/dist/lista-de-tarefa/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]