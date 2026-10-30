# Dev Server Worktree Picker

`npm run dev` asks which checkout to start the Vite dev server in: the main checkout (`<root>`, entry 0) or any worktree under `.claude/worktrees/` or `.worktrees/`.

```
Where should the client dev server run?

  0) <root> (develop)
  1) .claude/worktrees/jog-panel (feature/jog-panel)

Select 0-1 [0]:
```

- Enter, three invalid answers, or a non-interactive shell all start in `<root>`.
- Flags after `--` go to Vite: `npm run dev -- --host`.
- `npm run dev:root` skips the picker and starts Vite in the current checkout. Use it from scripts and other tools.
- A worktree without `node_modules` gets a warning; run `npm install` in it first.

Source: `tools/select-worktree.cjs`.
