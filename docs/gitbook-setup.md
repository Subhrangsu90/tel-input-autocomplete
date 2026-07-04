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
3. Select `Subhrangsu90/tel-input-autocomplete` as the repository.
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
| `docs/documentation.md` | `projects/ng-tel-input-autocomplete/README.md` |
| `docs/api-reference.md` | `projects/ng-tel-input-autocomplete/API.md` |
| `docs/changelog.md` | `projects/ng-tel-input-autocomplete/CHANGELOG.md` |

After changing the package README, API reference, or changelog, copy the updated content into `docs/` before syncing GitBook.

## Configuring GitBook UI Navigation (Removing Custom Header Tabs)

Since we are using a **Single Space with a Unified Sidebar**, you should disable or remove any custom navigation header tabs/links (like `Documentation`, `API Reference`, `Changelog`, or `Help Center`) configured in the GitBook dashboard. This prevents the sidebar from containing duplicate pages or appearing confusingly.

To do this:
1. Log in to your GitBook organization dashboard.
2. Open your target Docs Space or Docs Site.
3. In the sidebar, click on **Settings** > **Layout** (or **Structure**).
4. Look for the **Header** or **Top Navigation** section.
5. Delete any custom page links or tabs that you added manually.
6. Save the settings. 

All pages will now be cleanly accessible directly from the sidebar.
