---
description: "Create a pull request using the repo PR format"
---

Create a pull request for the current branch into the base branch (default `master`) using the GitHub CLI.

Steps:

1. Check auth: run `gh auth status`; if not logged in, authenticate with `gh auth login` before continuing.
2. Determine the base branch (default `master`) and head branch (current branch).
3. Inspect the commits in `git log --oneline <base>..HEAD` to summarize the actual changes.
4. Determine the issue number: extract it from the branch name (e.g. `feat/13-...` -> `#13`) or the `(#N)` reference in commit messages. If the work has no associated issue number, omit the `- #N` suffix entirely.

Title format (no space before the `- #N` suffix):
Use existing conventions for type/scope from the commit history, e.g. `feat(profile)`, `feat(transactions)`, `fix(transactions)`, `refactor(profile)`, `docs(skills)`.

Description format:

- Added `actionName` server action in `app/actions.ts` with <validation/behavior details>.
- Implemented the `<ComponentName>` supporting <capabilities> with <UX/loading/toast details>.
- Created the <page> page (`/path`) ...
- Integrated ... into ...
- <additional bullets for refactors/docs only if those commits are actually in this PR>

Create the PR with `gh pr create --base <base> --head <head> --title "<title>"`. Write the description to a temp file and pass `--body-file` to avoid shell escaping issues on Windows. Verify with `gh pr view`.
