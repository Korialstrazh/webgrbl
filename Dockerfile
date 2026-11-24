# Stage 1: build the PWA.
# Images are pinned by digest (a tag can be moved); Dependabot proposes updates.
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
# The URL path the app is served under, with leading and trailing slash (the host proxy strips it).
ARG WEBGRBL_BASE_PATH=/webgrbl/
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build --base "$WEBGRBL_BASE_PATH"

# Stage 2: serve the static build with nginx, as the unprivileged nginx user rather than root.
FROM nginx:1.30.7-alpine@sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3
# Without root, nginx cannot switch users or write to /run and /var/cache: its pid file and temp files go to /tmp.
RUN sed -i -e '/^user /d' -e 's#^pid .*#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
