# Dev Server Worktree Picker

`npm run dev` asks which checkout to start the Vite dev server in: the main checkout (`<root>`, entry 0) or any worktree under `.claude/worktrees/` or `.worktrees/`.

```
Where should the client dev server run?

  0) <root> (develop)
  1) .claude/worktrees/jog-panel (feature/jog-panel)

Select 0-1 [0]:
```

- Enter, three invalid answers, or a non-interactive shell all start in `<root>`.
- The server listens on the local network in every checkout, so a phone on the same network can open the `Network:` URL Vite prints. Each running server shows its own port.
- `npm run dev -- --host localhost` keeps it on this machine. Other flags after `--` also go to Vite.
- `npm run dev:root` skips the picker and starts Vite in the current checkout, reachable from this machine only. Use it from scripts and other tools.
- A worktree without `node_modules` gets a warning; run `npm install` in it first.

Over plain HTTP a phone is not a secure context: the app loads, but the Web Serial API and the service worker are unavailable there.

Source: `tools/select-worktree.cjs`.
