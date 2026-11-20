# CI and deployment

The GitHub Actions workflow `.github/workflows/ci.yml` checks every push and every pull request into `develop` or `main`, and deploys `main` to your own web server.

## What runs

1. **Check** (every push and PR): `npm ci`, then `npm run check`. That is lint, typecheck, the full test suite, the locales check, the production build and `npm audit`, the same command the pre-merge rule asks for.
2. **Deploy** (only pushes to `main`, and only when the check passed): the built `dist/` folder is copied to the server with rsync over SSH. You can also start a run by hand from the Actions tab (**Run workflow**).

Assets and the service worker are uploaded before `index.html`, and old files are removed last, so a visitor never loads a page whose files are missing.

## One-time setup

### On the server

- Create a deploy user with write access to the web root, for example `/var/www/webgrbl`, and install `rsync`.
- Create an SSH key pair for the pipeline only (`ssh-keygen -t ed25519 -f webgrbl_deploy -N ""`) and add the public key to the deploy user's `~/.ssh/authorized_keys`.
- Serve the folder over **HTTPS**. Web Serial only works on secure pages.
- Do not let browsers cache `index.html`, `sw.js` or `manifest.webmanifest`, or users can be stuck on an old version. Files under `assets/` have hashed names and can be cached for a year. An nginx example:

```nginx
location = /index.html { add_header Cache-Control "no-cache"; }
location = /sw.js { add_header Cache-Control "no-cache"; }
location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location / { try_files $uri $uri/ /index.html; }
```

### In GitHub

Under **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | The server's host name or IP |
| `DEPLOY_USER` | The deploy user |
| `DEPLOY_PATH` | The web root, for example `/var/www/webgrbl` (no trailing slash) |
| `DEPLOY_SSH_KEY` | The whole private key file `webgrbl_deploy` |
| `DEPLOY_KNOWN_HOSTS` | The output of `ssh-keyscan -t ed25519 <host>`, checked against the server's real key |

Under **Settings → Environments**, a `production` environment is created on the first deploy. Add required reviewers there if a person should approve each deploy.

## Notes

- The app is served from the site root. Serving it from a sub-path would need Vite's `base` option set.
- Old deploy runs are never cancelled half-way; a newer deploy waits for the running one.
