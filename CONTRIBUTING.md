# Contributing

Thanks for helping with webgrbl.

- **Bugs and ideas:** open an issue. For a laser problem, name the machine, the GRBL version and the browser.
- **Security problems:** see [SECURITY.md](SECURITY.md); please do not open a public issue.
- **Pull requests:** branch from `develop` and open the pull request against `develop`. Before you push, run
  `npm run check` (lint, typecheck, tests, locale check, build and audit); it must pass. Commit messages follow
  [Conventional Commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`, `docs: ...`).
- **Texts:** user-visible text goes in `tools/localization/default.csv`, then `npm run locales:update`.
- **Dependencies:** pin exact versions (no `^` or `~`) and do not add a release younger than 3 days.

By contributing you agree that your contribution is licensed under the Apache License 2.0 (see [LICENSE](LICENSE)).
