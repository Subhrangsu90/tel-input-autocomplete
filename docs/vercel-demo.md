# Live Demo on Vercel

GitBook should host the written documentation. Vercel can still host the Angular live demo app.

## Vercel settings

| Setting | Value |
| ------- | ----- |
| Framework Preset | Angular |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist/demo/browser` |
| Root Directory | repository root |

## Local verification

```bash
npm run build
```

The static demo output is generated at:

```text
dist/demo/browser
```

## Suggested publishing model

- GitBook: product documentation and API reference from `docs/`
- Vercel: interactive Angular examples from `projects/demo`
- npm: installable package from `dist/ng-tel-input-autocomplete`
