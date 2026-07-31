<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Pull Requests

When creating a pull request, always use this format (also available via `/pr`):

**Title** (no space before the `- #N` suffix):
`<type>(<scope>): <imperative summary>- #N`

Use the issue number from the branch name (e.g. `feat/13-...` → `#13`) or the `(#N)` references in commit messages. Omit the suffix if there is no associated issue.

**Description**:

```md
## Description

<2-3 sentences introducing the feature and its user-facing purpose>

## Changes Made

- Added <server action / component> in <file> with <details>.
- Implemented <component> supporting <capabilities> with <UX details>.
- Created the <page> page (<path>) ...
- Integrated <x> into <y> ...
```

Use `gh pr create --base <base> --head <head> --title "<title>"` with the description written to a temp file passed via `--body-file` (avoids Windows shell escaping issues).
