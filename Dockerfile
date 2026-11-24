# Stage 1: build the PWA.
# Images are pinned by digest (a tag can be moved); Dependabot proposes updates.
FROM node:24.14.1-alpine@sha256:8510330d3eb72c804231a834b1a8ebb55cb3796c3e4431297a24d246b8add4d5 AS build
# The URL path the app is served under, with leading and trailing slash (the host proxy strips it).
ARG WEBGRBL_BASE_PATH=/webgrbl/
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build --base "$WEBGRBL_BASE_PATH"

# Stage 2: serve the static build with nginx, as the unprivileged nginx user rather than root.
FROM nginx:1.31.0-alpine@sha256:2f07d83bf561b506400dc183b1b2003803e39efbd22451f848adaba14d28c7c7
# Without root, nginx cannot switch users or write to /run and /var/cache: its pid file and temp files go to /tmp.
RUN sed -i -e '/^user /d' -e 's#^pid .*#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
