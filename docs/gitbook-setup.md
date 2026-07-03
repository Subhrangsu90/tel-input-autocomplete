# GitBook Setup

This repository is ready for GitBook Git Sync.

## Files GitBook should use

GitBook is configured through `.gitbook.yaml` at the repository root:

```yaml
root: ./docs/

structure:
  readme: README.md
  summary: SUMMARY.md
```

That means GitBook will use:

- `docs/README.md` as the first page
- `docs/SUMMARY.md` as the sidebar table of contents
- every linked Markdown file in `docs/` as synced documentation content

## Connect GitBook to GitHub

1. Open GitBook and create or open a space.
2. Enable Git Sync for GitHub.
3. Select `Subhrangsu90/my-workspace` as the repository.
4. Keep the project directory as the repository root so GitBook can find `.gitbook.yaml`.
5. Sync the space.

## Editing workflow

Recommended source of truth:

- Edit docs in this repository when working as a developer.
- Let GitBook sync the Markdown into the published docs site.
- If editing inside GitBook, review the synced commit or change request before merging.

## Updating copied library docs

The GitBook docs currently mirror these package docs:

| GitBook file | Source file |
| ------------ | ----------- |
| `docs/getting-started.md` | `projects/ng-tel-input-autocomplete/README.md` |
| `docs/api-reference.md` | `projects/ng-tel-input-autocomplete/API.md` |
| `docs/changelog.md` | `projects/ng-tel-input-autocomplete/CHANGELOG.md` |

After changing the package README, API reference, or changelog, copy the updated content into `docs/` before syncing GitBook.
