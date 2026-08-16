# Git Workflow — Personal Guide

> My one-page rulebook for shipping code on this repo. Read this before opening a PR.

## The only rules that matter

1. **One PR = one logical unit of work.** Many commits per PR is fine; unrelated features in one PR is not.
2. **After every squash-merge, reset `dev` to `master`. Never merge `master` into `dev`.**
3. **Squash-merge everything.** It keeps `master` history clean and forgiving of messy intermediate commits.

## Why rule 2 exists (the PR #16 lesson)

A squash-merge creates a **new** commit on `master` with the same content but a different object ID. The original commits stay on `dev`. If `dev` survives and you sync it with `git merge origin/master`, the next `dev → master` PR lists every consumed commit again — it looks like 7 commits when the diff is really just 1.

The diff is always correct; the commit list is just noise. The reset ritual below makes the noise disappear.

## My actual workflow (opportunistic batching)

I commit whatever I'm working on and open a PR when I hit a natural "this feature is done" boundary. That is a legitimate pattern. The loop:

```
work on dev → commit at natural boundaries → feature done?
  ↑                                            │ yes
  │                                            ▼
  └──── reset dev to master ←────── squash-merge the PR on GitHub
```

## The ritual (do this after EVERY merge)

```powershell
git checkout dev
git fetch origin
git reset --hard origin/master
git push --force-with-lease origin dev
```

`--force-with-lease` is safe solo — it refuses to run if the remote moved unexpectedly. `git reset --hard` does not touch untracked files (e.g. `.kilo/plans/`).

## Opening a PR

```powershell
gh pr create --base master --head dev --title "<title>" --body-file "<path to body file>"
```

- **Title:** `type(scope): imperative summary` — e.g. `feat(profile): redesign transaction filters and add profile page header actions`.
- **Types** seen in this repo's history: `feat`, `fix`, `refactor`, `chore`, `docs`.
- **`- #N` suffix:** append it only when the branch name (`feat/13-...` → `#13`) or a commit message carries the issue number. Omit it otherwise.
- **Body:** always write the description to a temp file and pass `--body-file` — avoids Windows shell escaping issues.

## When I can't focus on one feature

- **`git add -p <file>`** — stage only some hunks of a file so unrelated edits become separate commits.
- **`git worktree add ../bon-feat17 -b feat/17-dashboard`** — check out a second feature in a parallel folder. No stashing, no context-switching pain.
- **`git stash -m "message"`** — park uncommitted work as a last resort.

## Merge strategy — don't change it

| Strategy | Master history | Verdict |
|---|---|---|
| **Squash merge** | 1 commit per PR, clean and revertible | ✅ Use this. Always. |
| Rebase-and-merge | Keeps every intermediate commit | Messy with my commit-whatever style |
| Merge commit | Braided, noisy | No |

## Troubleshooting

**"Why does my PR list 7 commits but only change 3 files?"**
Consumed commits from earlier squash-merges are still on `dev`. The diff is correct — merge it with squash, then run the ritual. It self-corrects.

**"I forgot the ritual and the next PR is polluted."**
Still correct content-wise. Squash-merge, then run the ritual. If you want a pristine commit list, cherry-pick the real commit onto a fresh branch off `origin/master` and reopen the PR there.

**"Should I delete `dev` and only use feature branches?"**
Optional. Setup A (master + short feature branches, delete branch after merge) is the simplest and needs no ritual at all. Setup B (keep `dev` as the working branch) is also fine — it just requires the reset ritual after every merge. Either works solo.
