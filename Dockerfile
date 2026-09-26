FROM nginx:alpine

# Copy static files directly into nginx's HTML directory
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]