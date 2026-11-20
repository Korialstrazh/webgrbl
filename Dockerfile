# Stage 1: build the PWA.
FROM node:24.14.1-alpine AS build
# The URL path the app is served under, with leading and trailing slash (the host proxy strips it).
ARG WEBGRBL_BASE_PATH=/webgrbl/
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build --base "$WEBGRBL_BASE_PATH"

# Stage 2: serve the static build with nginx.
FROM nginx:1.30.7-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
