# Handoff: machine control (roadmap item 2), 2026-10-31

Continue on another machine from branch `feature/machine-control`. Everything needed is in git; the local SDD workspace (`.superpowers/`, git-ignored) and Claude's local memory do not travel, so their contents are copied below.

## Where things stand

- Spec: `docs/superpowers/specs/2026-10-31_(04)_machine-control.spec.md` (user skipped the questions; decisions are controller calls listed there).
- Plan: `docs/superpowers/plans/2026-10-31_(05)_machine-control.plan.md` — execution method: subagent-driven, one sub-branch PR per group, user approves each PR.
- Done and merged into `feature/machine-control`: sub-branch A (Tasks 1-2, machine profiles) — Gitea PR #20 (closed after merge).
- Open: feature PR #21 `feature/machine-control` -> `develop` (integration view, reviewed last).
- Next: sub-branch B `feature/machine-control--machine-commands` (Task 3 command builders + `MachineLineRequested`, Task 4 laser pointer safety saga), then sub-branch C `--machine-ui` (Tasks 5-8), final whole-branch review, PR #21.

## Workflow rules in force (from AGENTS.md / docs/rulesets)

- Work in a worktree `.claude/worktrees/machine-control` on `feature/machine-control`; sub-branches `feature/machine-control--<name>` created inside it.
- Gitea review surface (`.gitea-local`, gitignored, must be recreated on the new machine: `use_gitea=true`, `gitea_host`, `gitea_owner=cc`, `gitea_repo=webgrbl`, `gitea_remote=gitea`, `upstream_remote=origin`, `codestyle_file=docs/rulesets/codestyles/typescript/_index.md`). The agent never pushes to `origin`; the user does.
- Before each sub-branch PR: `npm run lint:fix` (never prettier), full codestyle pass (read every codestyle file), `npm run check` (only `npm audit` may fail: known dev-tooling advisories, separate task by user decision).
- antd for all UI controls, SCSS modules for own styling (user decisions). Strings only via `tools/localization/default.csv` + `npm run locales:update`.

## Rulings made so far (keep consistent)

- - Ruling: one export per file; constants modules/state files may export several — cost if wrong: renames.
- - Ruling: stop after each sub-branch PR for user approval (GITEA.md).
- - Ruling: user skipped brainstorm questions; spec decisions are controller calls (listed in spec) — cost if wrong: rework on user feedback.
- Task 1: Ruling: sValueMax must be an integer 1..100000; maxPowerWatts 0 < w <= 500 — covers common diode/CO2 lasers and GRBL $30 values (255, 1000, 10000) — cost if wrong: an exotic machine needs a bigger bound
- Task 1: Ruling: storage read drops profiles failing range validation and clears a dangling/empty activeProfileId (minor #1 folded in); error texts interpolate the bound constants instead of hard-coding them (minor #4) — cost if wrong: small diff
- Task 2: Ruling: only validly-reported laser values are used — differs check skipped without valid $130/$131; update-from-laser keeps the profile's own value for any field not validly reported (esp. sValueMax); first-connect creation only when the work area was reported; laser-mode warning only when $32 is reported — prevents fabricated values reaching the pointer power cap — cost if wrong: small diff
- Task 2: Ruling: first-connect "My laser" is created only when NO profiles exist (not merely none active) — avoids duplicate profiles — cost if wrong: user with profiles but none active gets no auto profile
- Task 2: Ruling: clear localStorage after each test in vitest.setup.ts (test isolation); add import persistence test — cost if wrong: none

## Deferred minor findings (for the final whole-branch review)

- Task 1: minor (deferred): whole import rejected without saying which profile failed; export test relies on toEqual ignoring undefined
- Task 1: minor (deferred): one shape-invalid stored profile rejects the whole document; no de-duplication of same-id profiles on read
- Task 2: minor (deferred): docblock placement in get.profile.values.from.settings.ts; setting numbers split across grbl.constants/bed.constants; pre-existing jsdom getComputedStyle noise in StopHotkey tests
- Task 2: minor (deferred): getMachineProfileErrors ~55 lines (over 30-line guideline)

## Setup on the new machine

1. Get the branch: if this machine's Gitea (`http://localhost:3020`) is not reachable from the new one, the user pushes `feature/machine-control` (and `develop`) to `origin` first, or copies the repo.
2. `git worktree add .claude/worktrees/machine-control feature/machine-control`, then `npm ci` in the worktree.
3. Recreate `.gitea-local` (or set `use_gitea=false` if Gitea is not available there).
4. Optional reference clone: `git clone --depth 1 https://github.com/arkypita/LaserGRBL.git .reference/LaserGRBL` (pinned commit in `docs/wiki/lasergrbl/_index.md`).
5. Tell Claude: "continue the machine control plan from `.claude/various/2026-10-31_machine-control-handoff.md`".

## Facts about the user's setup (from local memory)

- Laser: ACMER S2, USB only; startup line `Grbl 1.1h ['$' for help]`; `$I` gives `[VER:1.0.1,20250515:]`, `[OPT:VMP,31,511]`.
- Chrome/Edge work; Firefox's Web Serial ends the read stream right after open (follow-up).
- Hardware checks are done by the user in Chrome.
