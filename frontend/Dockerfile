FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_CATALOG_URL=http://localhost:8082
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CATALOG_URL=$VITE_CATALOG_URL

COPY package.json package-lock.json* ./
RUN npm install

COPY index.html ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
