# Help Center

Find answers to frequently asked questions and troubleshooting guides for `ng-tel-input-autocomplete`.

## FAQs

### How do I configure local flag icons instead of a remote CDN?
By default, the library uses native **emoji flags**, which are highly accessible, performant, and work offline. If you want to use SVG images instead, set `flagMode="image"` and configure the `flagUrl` resolver.
To host flag assets locally in your Angular application:
1. Copy the country flag SVGs into your application assets directory (e.g. `src/assets/flags/`).
2. Provide a resolver function via `flagUrl`:
```html
<ng-tel-input-autocomplete 
  flagMode="image" 
  [flagUrl]="localFlagResolver" 
/>
```
```ts
localFlagResolver = (countryCode: string) => `/assets/flags/${countryCode.toLowerCase()}.svg`;
```

### Can I use this library with Tailwind CSS?
Yes, absolutely! The library does not depend on any specific styling framework and does not ship with Tailwind classes. Its styling is fully encapsulated within the component itself. You can easily customize it by passing standard tailwind classes to `containerClass`, `inputClass`, or `dropdownClass`, or by targeting the host element's CSS variables.

### How do I handle country changes or phone queries programmatically?
The library exposes several event emitters:
- `(valueChange)`: Emitted whenever the final parsed value changes.
- `(countryChange)`: Emitted when the user selects a different country.
- `(suggestionSearch)`: Emitted when the user types in the autocomplete field, allowing you to query suggestions asynchronously.

---

## Troubleshooting

### SSR / Hydration mismatch errors (NG0500)
When using Angular Server-Side Rendering (SSR), the component generates a unique random ID for the telephone input if one is not provided. This can cause hydration mismatch errors (e.g., `NG0500: Hydration node mismatch`) because the ID generated on the server does not match the one generated in the browser.

**Solution:** Always provide a static, explicit `inputId` when rendering the component in SSR environments.
```html
<ng-tel-input-autocomplete inputId="registration-phone" />
```

### Country dropdown is cut off or hidden (Z-Index / Overflow clipping)
If `ng-tel-input-autocomplete` is inside a container with `overflow: hidden`, `overflow: scroll`, or a low `z-index`, the country select or suggestion dropdown listbox might be clipped or hidden entirely.

**Solution:**
You can adjust the max-height of the dropdown or apply utility styles to prevent parent overflow issues.
For example, customize the dropdown styling using component inputs:
```html
<ng-tel-input-autocomplete [dropdownStyle]="{ maxHeight: '200px' }" />
```
Or override the CSS variable globally in your stylesheet:
```css
ng-tel-input-autocomplete {
  --ngti-z-dropdown: 9999;
}
```

### Custom country API is not loading data
If you configure a custom search endpoint using `countrySearchUrl`, the library issues HTTP requests using Angular's `HttpClient`.

**Solution:**
Ensure you have set up and imported the HTTP provider in your application bootstrapper:
```ts
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(withFetch()),
  ]
};
```
Also verify that your backend returns the expected pagination and data structure:
```json
{
  "data": [
    { "name": "India", "code": "IN", "dialCode": "+91", "flag": "🇮🇳", "format": "", "placeholder": "98765 43210" }
  ],
  "meta": { "page": 1, "limit": 15, "total": 1, "hasMore": false }
}
```

---

## Support & Feedback

For bug reports, feature requests, or contribution guidelines:
- **GitHub Issues**: Submit issues on [GitHub Issues](https://github.com/Subhrangsu90/tel-input-autocomplete/issues)
- **Discussion Board**: Ask questions on [GitHub Discussions](https://github.com/Subhrangsu90/tel-input-autocomplete/discussions)
