FROM node:22-alpine AS build
WORKDIR /app
# Base URL baked into the share links copied from the dashboard
ARG VITE_PUBLIC_BASE_URL=https://fileshare.raphaelm22.net
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.http.conf /etc/nginx/conf.d/00-http.conf
EXPOSE 80
