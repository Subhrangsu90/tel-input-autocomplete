# ng-tel-input-autocomplete

Accessible international telephone input and contact autocomplete for Angular 21. The standalone component supports Reactive Forms, template-driven forms, country filtering, validation, formatting, keyboard navigation, asynchronous suggestions, and optional paginated country APIs.

## Compatibility

| Library | Angular | Node.js |
| --- | --- | --- |
| 0.0.x | 21.2.x | 20.19+, 22.12+, or 24+ |

## Installation

```bash
npm install ng-tel-input-autocomplete @angular/cdk
```

Angular, Angular Forms, CDK, and RxJS are peer dependencies. The package installs `google-libphonenumber` and `intl-tel-input` for phone metadata, formatting, and validation.

No Tailwind, global stylesheet, or external flag service is required. Styles are encapsulated in the components and emoji flags are the default.

For the complete properties, emitters, templates, interfaces, keyboard behavior, and service methods, see the [API reference](./API.md).

## Reactive Forms

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgTelInputAutocomplete } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgTelInputAutocomplete],
  template: `
    <label for="work-phone">Work phone</label>
    <ng-tel-input-autocomplete
      inputId="work-phone"
      [formControl]="phone"
      defaultCountry="IN"
      [suggestionsEnabled]="false"
    />
  `,
})
export class ContactForm {
  readonly phone = new FormControl<string | null>(null);
}
```

## Template-driven Forms

```html
<ng-tel-input-autocomplete
  inputId="mobile-phone"
  ariaLabel="Mobile phone"
  [(ngModel)]="phone"
  name="phone"
/>
```

Import `FormsModule` in the consuming component.

## Contact autocomplete

The library emits the current query; your application owns the contact source and passes matching suggestions back.

```html
<ng-tel-input-autocomplete
  [formControl]="phone"
  [suggestions]="suggestions"
  [suggestionsLoading]="loading"
  [suggestionsExhausted]="suggestionsExhausted"
  (suggestionSearch)="searchContacts($event)"
  (loadMoreSuggestions)="loadNextPage()"
/>
```

```ts
import { PhoneSuggestion } from 'ng-tel-input-autocomplete';

suggestions: PhoneSuggestion[] = [
  { name: 'Asha Rao', phoneNumber: '+919876543210', countryCode: 'IN' },
];
```

Alphabetic search text is emitted through `suggestionSearch` but is not written to the form control. Selecting a suggestion writes its phone value.

## Values and validation

The default `outputFormat="string"` emits a valid E.164 value such as `+919876543210`. While an incomplete number is being edited, the current display value is emitted. Set `outputFormat="object"` for:

```ts
interface PhoneNumberValue {
  countryCode: string;
  dialCode: string;
  number: string;
  formattedNumber: string;
  fullNumber: string;
}
```

Invalid non-empty values produce `{ invalidPhoneNumber: true }`. Set `[validationEnabled]="false"` to disable the library validator.

## Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `inputId` | `string` | generated | Native input ID; set it when using a visible label |
| `ariaLabel` | `string` | `International phone number` | Accessible label when no external label is present |
| `defaultCountry` | `string` | `US` | Default ISO alpha-2 country code |
| `allowedCountries` | `readonly string[]` | `[]` | Restrict the country list |
| `excludedCountries` | `readonly string[]` | `[]` | Remove countries from the list |
| `outputFormat` | `string \| object` | `string` | Form/output value representation |
| `placeholder` | `string` | `Enter phone number...` | Input placeholder |
| `countrySearchUrl` | `string \| null` | `null` | Optional paginated country endpoint |
| `suggestionsEnabled` | `boolean` | `true` | Enable external contact suggestions |
| `contactSearchEnabled` | `boolean` | `true` | Permit contact-name search text |
| `validationEnabled` | `boolean` | `true` | Enable phone validation |
| `suggestions` | `readonly PhoneSuggestion[]` | `[]` | Current suggestion page |
| `suggestionsLoading` | `boolean` | `false` | Show suggestion loading state |
| `suggestionsExhausted` | `boolean` | `false` | Prevent further `loadMoreSuggestions` events |
| `flagMode` | `emoji \| image` | `emoji` | Offline emoji flags or image flags |
| `flagUrl` | `(code: string) => string` | `null` | Custom flag image URL resolver |
| `selectedCountryTemplate` | `TemplateRef<CountryTemplateContext> \| null` | `null` | Custom selected-country content |
| `countryTemplate` | `TemplateRef<CountryTemplateContext> \| null` | `null` | Custom country option content |
| `suggestionTemplate` | `TemplateRef<SuggestionTemplateContext> \| null` | `null` | Custom suggestion option content |
| `emptyTemplate` | `TemplateRef<StateTemplateContext> \| null` | `null` | Custom empty state |
| `loadingTemplate` | `TemplateRef<StateTemplateContext> \| null` | `null` | Custom loading state |

## Outputs

| Output | Payload | Purpose |
| --- | --- | --- |
| `suggestionSearch` | `string` | Request contact suggestions |
| `loadMoreSuggestions` | `void` | Request another suggestion page |
| `valueChange` | `string \| PhoneNumberValue \| null` | Observe values without Angular Forms |
| `countryLoadError` | `unknown` | Handle country endpoint failures |

## Country API

Call `provideHttpClient()` in the application when `countrySearchUrl` is used:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch())],
};
```

The endpoint receives `q`, `page`, and `limit` query parameters and must return:

```json
{
  "data": [{ "name": "India", "code": "IN", "dialCode": "+91", "flag": "🇮🇳", "format": "", "placeholder": "98765 43210" }],
  "meta": { "page": 1, "limit": 15, "total": 1, "hasMore": false }
}
```

During server rendering, the local country dataset is used to keep rendering deterministic.

## Image flags

Emoji flags avoid network requests and work with strict Content Security Policies. To use images:

```html
<ng-tel-input-autocomplete
  flagMode="image"
  [flagUrl]="flagUrl"
/>
```

```ts
readonly flagUrl = (code: string) => `/assets/flags/${code.toLowerCase()}.svg`;
```

If image mode is selected without a resolver, the component falls back to `https://flagcdn.com/{code}.svg`.

## Development and publishing

```bash
npm run test:lib
npm run build:lib
npm run verify:lib
```

`verify:lib` tests the library, builds the production package and demo against `dist`, and performs an npm package dry run. Publishing should be performed from `dist/ng-tel-input-autocomplete` through the release workflow.

## License

MIT
