ARG NODE_VERSION=20
ARG NGINX_VERSION=1.27.1

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:${NGINX_VERSION}-alpine as nginx

COPY --from=builder /usr/src/app/out /usr/share/nginx/html
COPY docker/nginx/ /etc/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
