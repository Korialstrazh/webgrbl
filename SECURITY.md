# Security

## Reporting a vulnerability

Please report security problems privately, not in a public issue: use **Report a vulnerability** on the
[Security tab](https://github.com/Korialstrazh/webgrbl/security/advisories/new) of this repository. Describe what you
found, how to reproduce it and what an attacker could do with it.

You will get an answer as soon as possible. Once a fix is released, the report can be published with credit to you if
you want.

## Scope

webgrbl runs entirely in the browser and talks to a laser over Web Serial; it has no server side and stores projects
in the browser only. Reports about the app, the Docker image (`Dockerfile`, `docker/`) and the CI pipeline are in
scope. A laser can cause fire and eye damage: problems where the app could start, keep or resume burning when the user
did not ask for it count as security problems too.

## Supported versions

Only the latest release gets fixes.
