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
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTelInputAutocomplete, PhoneInputValue } from 'ng-tel-input-autocomplete';

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
  readonly phone = new FormControl<PhoneInputValue>(null, {
    validators: [Validators.required],
  });
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

For typed forms, use `FormControl<PhoneInputValue>` when the control may emit strings, objects, or `null`. If your app fixes `outputFormat="string"`, `FormControl<string | null>` is also appropriate; with `outputFormat="object"`, use `FormControl<PhoneNumberValue | null>`.

The `required` input only forwards the native `required` attribute. Use Angular `Validators.required` in reactive forms or the Angular `required` validator in template-driven forms when the form control itself must be invalid while empty.

## Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `inputId` | `string` | generated | Native input ID; set it when using a visible label |
| `ariaLabel` | `string` | `International phone number` | Accessible label when no external label is present |
| `defaultCountry` | `string` | `US` | Default ISO alpha-2 country code |
| `allowedCountries` | `readonly string[]` | `[]` | Restrict the country list |
| `excludedCountries` | `readonly string[]` | `[]` | Remove countries from the list |
| `outputFormat` | `string \| object` | `string` | Form/output value representation |
| `name` | `string \| null` | `null` | Native input name |
| `autocomplete` | `string` | `tel` | Browser autofill hint |
| `inputMode` | `string` | `tel` | Mobile keyboard hint |
| `enterKeyHint` | `string \| null` | `null` | Mobile enter key hint |
| `pattern` | `string \| null` | `null` | Native pattern attribute |
| `minLength` | `number \| null` | `null` | Native minimum length |
| `maxLength` | `number \| null` | `null` | Native maximum length |
| `min` | `number \| null` | `null` | Native minimum value attribute |
| `max` | `number \| null` | `null` | Native maximum value attribute |
| `step` | `number \| 'any' \| null` | `null` | Native step attribute |
| `inputSize` | `number \| null` | `null` | Visible input width in characters |
| `readOnly` | `boolean` | `false` | Prevent user edits while allowing form writes |
| `readonly` | `boolean` | `false` | Alias for `readOnly` |
| `required` | `boolean` | `false` | Native required attribute; use Angular validators for form validity |
| `spellcheck` | `boolean` | `false` | Native spellcheck attribute |
| `disabled` | `boolean` | `false` | Disable without Angular Forms |
| `invalid` | `boolean` | `false` | Force invalid visual and ARIA state |
| `ariaDescribedBy` | `string \| null` | `null` | Extra `aria-describedby` IDs |
| `ariaLabelledBy` | `string \| null` | `null` | External label IDs for `aria-labelledby` |
| `placeholder` | `string \| null` | `null` | Custom input placeholder; selected country example number is shown by default |
| `countrySearchUrl` | `string \| null` | `null` | Optional paginated country endpoint |
| `suggestionsEnabled` | `boolean` | `true` | Enable external contact suggestions |
| `contactSearchEnabled` | `boolean` | `true` | Permit contact-name search text |
| `validationEnabled` | `boolean` | `true` | Enable phone validation |
| `minQueryLength` | `number \| null` | `null` | Minimum query length before suggestion search |
| `delay` | `number \| null` | `null` | Country search debounce in milliseconds |
| `completeOnFocus` | `boolean` | `true` | Search suggestions on input focus |
| `showClear` | `boolean` | `true` | Show the clear button when the input has a value |
| `fluid` | `boolean` | `false` | Full-width styling hook |
| `variant` | `filled \| outlined` | `outlined` | Input shell variant |
| `size` | `small \| large \| null` | `null` | Compact or large input sizing |
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
| `containerClass` | `NgTelInputClassValue \| null` | `null` | Adds classes to the outer input shell. |
| `containerStyle` | `NgTelInputStyleValue \| null` | `null` | Adds inline styles to the outer input shell. |
| `countryButtonClass` | `NgTelInputClassValue \| null` | `null` | Adds classes to the country trigger button. |
| `countryButtonStyle` | `NgTelInputStyleValue \| null` | `null` | Adds inline styles to the country trigger button. |
| `inputClass` | `NgTelInputClassValue \| null` | `null` | Adds classes to the native telephone input. |
| `inputStyle` | `NgTelInputStyleValue \| null` | `null` | Adds inline styles to the native telephone input. |
| `actionsClass` | `NgTelInputClassValue \| null` | `null` | Adds classes to the clear/status actions container. |
| `actionsStyle` | `NgTelInputStyleValue \| null` | `null` | Adds inline styles to the clear/status actions container. |
| `dropdownClass` | `NgTelInputClassValue \| null` | `null` | Adds classes to country and suggestion dropdown panels. |
| `dropdownStyle` | `NgTelInputStyleValue \| null` | `null` | Adds inline styles to country and suggestion dropdown panels. |

## Outputs

| Output | Payload | Purpose |
| --- | --- | --- |
| `suggestionSearch` | `string` | Request contact suggestions |
| `completeMethod` | `AutoCompleteCompleteEvent` | PrimeNG-style typed search event |
| `loadMoreSuggestions` | `void` | Request another suggestion page |
| `valueChange` | `string \| PhoneNumberValue \| null` | Observe values without Angular Forms |
| `countryLoadError` | `unknown` | Handle country endpoint failures |
| `suggestionSelect` | `AutoCompleteSelectEvent` | React when a contact suggestion is selected |
| `countrySelect` | `CountrySelectEvent` | React when a country is selected |
| `inputFocus` / `inputBlur` | `Event` | React to native input focus changes |
| `dropdownClick` | `AutoCompleteDropdownClickEvent` | React when the country trigger is clicked |
| `clear` | `void` | React when the clear button resets the value |
| `inputKeydown` / `inputKeyup` | `KeyboardEvent` | React to input keyboard events |
| `overlayShow` / `overlayHide` | `AutoCompleteOverlayEvent` | React when country or suggestion overlays open/close |
| `lazyLoad` | `AutoCompleteLazyLoadEvent` | React to country/suggestion infinite-scroll requests |

## Styling

Use the class/style inputs to customize the built-in UI while keeping the component behavior and accessibility intact.

```html
<ng-tel-input-autocomplete
  containerClass="rounded-phone"
  [containerStyle]="{ borderColor: '#2563eb' }"
  inputClass="phone-text"
  [dropdownStyle]="{ maxHeight: '18rem' }"
/>
```
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
