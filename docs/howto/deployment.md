# CI and deployment

The GitHub Actions workflow `.github/workflows/ci.yml` checks every push and every pull request into `develop` or `main`, and deploys `main` to your own server as a Docker container.

## What runs

1. **Check** (every push and PR): `npm ci`, then `npm run check`. That is lint, typecheck, the full test suite, the locales check, the production build and `npm audit`, the same command the pre-merge rule asks for.
2. **Image** (only pushes to `main`, after the check passed): builds the `Dockerfile` and pushes it to the GitHub container registry as `ghcr.io/korialstrazh/webgrbl:<commit sha>` and `:latest`.
3. **Deploy** (after the image): copies `deploy/docker-compose.yml` to the server over SSH and runs `docker compose pull` and `docker compose up -d` there with that commit's image, then removes unused images.

You can also start a run by hand from the Actions tab (**Run workflow**).

## The image

- Stage 1 builds the app with Node 24 (`npm ci`, `npm run build`).
- Stage 2 serves `dist/` with nginx on port 8080 (`docker/nginx.conf`):
  - `index.html`, `sw.js` and `manifest.webmanifest` are sent with `Cache-Control: no-cache`, so users never get stuck on an old version;
  - files under `assets/` have hashed names and are cached for a year;
  - unknown paths fall back to `index.html`.
- The container has a health check on `/`.

Try it locally: `docker build -t webgrbl . && docker run --rm -p 8080:8080 webgrbl`, then open http://localhost:8080 (Web Serial works on localhost without HTTPS).

## One-time setup

### On the server

1. Install Docker with the compose plugin.
2. Create a deploy user that may run Docker (member of the `docker` group) and a folder for the compose file, for example `/opt/webgrbl`.
3. Create an SSH key pair for the pipeline only (`ssh-keygen -t ed25519 -f webgrbl_deploy -N ""`) and add the public key to the deploy user's `~/.ssh/authorized_keys`.
4. Let the server pull the image. Either make the package public on GitHub (**Packages → webgrbl → Package settings → Change visibility**), or log in once as the deploy user: `docker login ghcr.io -u <github user>` with a personal access token that has `read:packages`.
5. Serve it over **HTTPS**: Web Serial only works on secure pages. The container listens on `127.0.0.1:8080` only, so put your reverse proxy in front, for example nginx:

```nginx
server {
    listen 443 ssl;
    server_name webgrbl.example.com;
    # ssl_certificate ... (for example from certbot)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }
}
```

   or Caddy, which gets certificates by itself: `webgrbl.example.com { reverse_proxy 127.0.0.1:8080 }`.

### In GitHub

Under **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | The server's host name or IP |
| `DEPLOY_USER` | The deploy user |
| `DEPLOY_PATH` | The folder for the compose file, for example `/opt/webgrbl` |
| `DEPLOY_SSH_KEY` | The whole private key file `webgrbl_deploy` |
| `DEPLOY_KNOWN_HOSTS` | The output of `ssh-keyscan -t ed25519 <host>`, checked against the server's real key |

The image push uses the workflow's own `GITHUB_TOKEN`, so it needs no secret. Under **Settings → Environments**, a `production` environment is created on the first deploy; add required reviewers there if a person should approve each deploy.

## Rolling back

On the server: `cd /opt/webgrbl && WEBGRBL_TAG=<older commit sha> docker compose up -d`. Every deployed commit stays in the registry under its sha.
