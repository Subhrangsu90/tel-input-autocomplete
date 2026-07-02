# API reference

## NgTelInputAutocomplete

Standalone Angular component exported as `NgTelInputAutocomplete` and rendered with the `ng-tel-input-autocomplete` selector.

```ts
import { NgTelInputAutocomplete } from 'ng-tel-input-autocomplete';
```

### Properties

All component properties are signal-based Angular inputs.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `inputId` | `string` | generated | ID assigned to the native telephone input. Set this when connecting a `<label for>` element. |
| `ariaLabel` | `string` | `'International phone number'` | Accessible name assigned to the telephone input. |
| `defaultCountry` | `string` | `'US'` | Default ISO 3166-1 alpha-2 country code. |
| `allowedCountries` | `readonly string[]` | `[]` | Restricts the picker to these ISO alpha-2 codes. |
| `excludedCountries` | `readonly string[]` | `[]` | Removes these ISO alpha-2 codes from the picker. Applied after `allowedCountries`. |
| `outputFormat` | `'string' \| 'object'` | `'string'` | Selects the form value and `valueChange` payload format. |
| `placeholder` | `string` | `'Enter phone number...'` | Placeholder for the native telephone input. |
| `countrySearchUrl` | `string \| null` | `null` | Optional endpoint used for paginated country search in the browser. |
| `suggestionsEnabled` | `boolean` | `true` | Enables the external contact-suggestion overlay and query events. |
| `contactSearchEnabled` | `boolean` | `true` | Allows names to be entered as temporary contact-search queries. Alphabetic queries are not written to the form value. |
| `validationEnabled` | `boolean` | `true` | Enables libphonenumber validation and the `invalidPhoneNumber` error. |
| `suggestions` | `readonly PhoneSuggestion[]` | `[]` | Contact suggestions supplied by the consuming application. |
| `suggestionsLoading` | `boolean` | `false` | Displays the suggestion loading state and prevents duplicate `loadMoreSuggestions` emissions. |
| `suggestionsExhausted` | `boolean` | `false` | Indicates that no more contact suggestion pages are available. |
| `flagMode` | `'emoji' \| 'image'` | `'emoji'` | Uses offline emoji flags or image flags. |
| `flagUrl` | `FlagUrlResolver \| null` | `null` | Resolves image URLs when `flagMode="image"`. Defaults to FlagCDN when omitted. |
| `selectedCountryTemplate` | `TemplateRef<CountryTemplateContext> \| null` | `null` | Customizes the selected country inside the trigger. |
| `countryTemplate` | `TemplateRef<CountryTemplateContext> \| null` | `null` | Customizes every country option. |
| `suggestionTemplate` | `TemplateRef<SuggestionTemplateContext> \| null` | `null` | Customizes every contact suggestion option. |
| `emptyTemplate` | `TemplateRef<StateTemplateContext> \| null` | `null` | Customizes empty country and suggestion states. |
| `loadingTemplate` | `TemplateRef<StateTemplateContext> \| null` | `null` | Customizes country and suggestion loading states. |

### Emitters

Angular output events do not bubble through the DOM.

| Name | Payload | Emitted when |
| --- | --- | --- |
| `suggestionSearch` | `string` | The input receives focus or its contact-search query changes while suggestions are enabled. |
| `loadMoreSuggestions` | `void` | The suggestion list reaches its scroll boundary while it is not loading and `suggestionsExhausted` is false. |
| `valueChange` | `PhoneInputValue` | User input, country selection, suggestion selection, or clearing changes the component value. `writeValue()` does not emit it. |
| `countryLoadError` | `unknown` | Loading a configured country endpoint fails, including when `provideHttpClient()` is missing. |

### Templates

Templates are passed as `TemplateRef` inputs. Custom option templates are rendered inside the library's accessible option button, so they should contain presentation content only—not nested buttons, links, or form controls.

```html
<ng-template #selectedCountry let-country>
  <span>{{ country.flag }} {{ country.dialCode }}</span>
</ng-template>

<ng-template #country let-country let-selected="selected">
  <span>{{ country.flag }} {{ country.name }} ({{ country.dialCode }})</span>
  @if (selected) { <span aria-hidden="true">✓</span> }
</ng-template>

<ng-template #suggestion let-item let-index="index" let-active="active">
  <span>{{ index + 1 }}. {{ item.name }} — {{ item.phoneNumber }}</span>
  @if (active) { <span class="sr-only">Active</span> }
</ng-template>

<ng-template #empty let-type>
  <span>No {{ type }} available</span>
</ng-template>

<ng-template #loading let-type>
  <span>Loading {{ type }}…</span>
</ng-template>

<ng-tel-input-autocomplete
  [selectedCountryTemplate]="selectedCountry"
  [countryTemplate]="country"
  [suggestionTemplate]="suggestion"
  [emptyTemplate]="empty"
  [loadingTemplate]="loading"
/>
```

| Template input | Context variables |
| --- | --- |
| `selectedCountryTemplate` | `$implicit`, `country`, `selected` |
| `countryTemplate` | `$implicit`, `country`, `selected` |
| `suggestionTemplate` | `$implicit`, `suggestion`, `index`, `active` |
| `emptyTemplate` | `$implicit`, `type` (`'countries'` or `'suggestions'`) |
| `loadingTemplate` | `$implicit`, `type` (`'countries'` or `'suggestions'`) |

### Forms and validation

The component implements `ControlValueAccessor` and `Validator`, so it works with Reactive Forms and template-driven forms.

| Configuration | Form value |
| --- | --- |
| `outputFormat="string"` and valid | E.164 string such as `+12025550143` |
| `outputFormat="string"` and incomplete | Current formatted display string |
| `outputFormat="object"` | `PhoneNumberValue` |
| Empty value or alphabetic contact query | `null` |

A non-empty invalid phone value produces:

```ts
{ invalidPhoneNumber: true }
```

### Keyboard support

| Key | Behavior |
| --- | --- |
| `ArrowDown` | Opens suggestions when available or moves to the next option. |
| `ArrowUp` | Opens suggestions when available or moves to the previous option. |
| `Enter` | Selects the active option. |
| `Escape` | Closes the active overlay. |
| `Tab` | Closes the overlay and continues normal focus navigation. |

### Accessibility

The phone input uses the `combobox` role with `aria-autocomplete`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, and `aria-invalid`. Country and suggestion overlays use `listbox`; each result uses `option`. Use a visible `<label>` connected through `inputId`, or provide a meaningful `ariaLabel`.

## Interfaces

### Country

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Display name. |
| `code` | `string` | ISO 3166-1 alpha-2 code. |
| `dialCode` | `string` | International dialing prefix including `+`. |
| `flag` | `string` | Emoji flag. |
| `format` | `string` | Optional formatting metadata. Live formatting is handled by libphonenumber. |
| `placeholder` | `string` | Example national number or fallback prompt. |

### PhoneSuggestion

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phoneNumber` | `string` | Yes | Number written when the suggestion is selected. |
| `name` | `string` | No | Contact display name. |
| `subtitle` | `string` | No | Secondary descriptive text. |
| `countryCode` | `string` | No | ISO alpha-2 code used for the flag and country selection. |
| `avatar` | `string` | No | Reserved avatar value for custom suggestion templates. |

### PhoneNumberValue

| Field | Type | Description |
| --- | --- | --- |
| `countryCode` | `string` | Selected ISO alpha-2 country code. |
| `dialCode` | `string` | Selected international dialing prefix. |
| `number` | `string` | National number digits without the dialing prefix. |
| `formattedNumber` | `string` | Nationally formatted number. |
| `fullNumber` | `string` | Internationally formatted number. |

### CountrySearchResponse

```ts
interface CountrySearchResponse {
  data: Country[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

### Template contexts

```ts
interface CountryTemplateContext {
  $implicit: Country;
  country: Country;
  selected: boolean;
}

interface SuggestionTemplateContext {
  $implicit: PhoneSuggestion;
  suggestion: PhoneSuggestion;
  index: number;
  active: boolean;
}

interface StateTemplateContext {
  $implicit: 'countries' | 'suggestions';
  type: 'countries' | 'suggestions';
}
```

### Type aliases

```ts
type PhoneInputValue = PhoneNumberValue | string | null;
type FlagMode = 'emoji' | 'image';
type FlagUrlResolver = (countryCode: string) => string;
```

## NgTelInputAutocompleteService

The root-provided service is public for applications that need the same parsing and formatting behavior outside the component.

| Method | Returns | Description |
| --- | --- | --- |
| `getStaticCountries()` | `Country[]` | Returns country metadata used by the component. |
| `searchCountries(query, page?, limit?, apiUrl?)` | `Observable<CountrySearchResponse>` | Filters local countries or calls the configured endpoint. |
| `formatPhoneNumber(rawNumber, countryCode)` | `string` | Formats digits while typing. |
| `parsePhoneNumber(input, country)` | `PhoneNumberValue` | Creates the library's object value. |
| `detectCountryByDialCode(input)` | `Country \| null` | Detects a country from an international prefix. |
| `isValidNumber(phoneNumber, countryCode)` | `boolean` | Validates a number. |
| `formatE164(phoneNumber, countryCode)` | `string` | Formats as E.164. |
| `formatNational(phoneNumber, countryCode)` | `string` | Formats in national form. |
| `formatInternational(phoneNumber, countryCode)` | `string` | Formats in international display form. |
| `highlightMatch(text, query)` | `string` | Escapes text and wraps matching content for highlighted display. |
