---
title: Tooling
created: 2026-10-30
---

# Tooling

Lint, checks, and dev-server scripts.

## Key Takeaways

- **ESLint 10** with the agent-skills-and-rules frontend baseline. `eslint-plugin-react` is not used because 7.37 crashes on ESLint 10 (it calls the removed `context.getFilename`); its JSX formatting rules come from `@stylistic` (`jsx-indent-props`, `jsx-self-closing-comp`). `react-hooks/rules-of-hooks` is on.
- **`npm run check`** is the pre-merge gate: lint, typecheck, tests, locale drift check, build, and `npm audit --audit-level=moderate`. The audit level is moderate because the only findings are low-severity `deepmerge` advisories pulled in at build time by `workbox-build` (via `vite-plugin-pwa`) with no fixed version available.
- **Worktree picker.** `npm run dev` runs `tools/select-worktree.cjs`, which lists the main checkout plus every worktree under `.claude/worktrees/` and `.worktrees/` and starts `npm run dev:root` in the chosen one. Root detection uses `git rev-parse --git-common-dir`, so it works from inside a worktree. On Windows the spawn uses a single command string with `shell: true` to avoid Node's DEP0190 warning.

## Source

- `eslint.config.mts`
- `package.json`
- `tools/select-worktree.cjs`
