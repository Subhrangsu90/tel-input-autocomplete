# Overview

Accessible international telephone input and contact autocomplete for modern Angular applications.

`ng-tel-input-autocomplete` gives Angular teams a production-ready phone input with country selection, live formatting, validation, contact suggestions, keyboard navigation, and design-system-friendly styling.

## Why use it?

* Standalone Angular component for Angular 21+
* Works with Reactive Forms and template-driven forms
* Supports typed `PhoneInputValue` output
* Validates phone numbers with `google-libphonenumber`
* Uses `intl-tel-input` country metadata
* Includes accessible combobox and listbox behavior
* Supports country filtering, remote country search, and lazy loading
* Offers emoji or image flags
* Exposes CSS variables and class/style hooks for product design systems

## Install

```bash
npm install ng-tel-input-autocomplete @angular/cdk
```

## Minimal Angular usage

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgTelInputAutocomplete, PhoneInputValue } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-phone-field',
  imports: [ReactiveFormsModule, NgTelInputAutocomplete],
  template: `
    <label for="customer-phone">Phone</label>
    <ng-tel-input-autocomplete
      inputId="customer-phone"
      [formControl]="phone"
      defaultCountry="IN"
    />
  `,
})
export class PhoneFieldComponent {
  readonly phone = new FormControl<PhoneInputValue>(null);
}
```

## Documentation sections

| Page                                        | Use it for                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Documentation](core-docs/documentation.md) | Installation, app-wide defaults, forms, autocomplete, styling, accessibility, and publishing notes. |
| [API Reference](core-docs/api-reference.md) | Full component input/output table, events, templates, public types, and service methods.            |
| [Changelog](core-docs/changelog.md)         | Release history.                                                                                    |
| [Help Center](support/help-center.md)       | FAQs, SSR hydration issues, dropdown overflow clipping, and troubleshooting.                        |
| [Live Demo](core-docs/vercel-demo.md)       | How to deploy the Angular demo app separately.                                                      |

## Repository

* GitHub: [Subhrangsu90/my-workspace](https://github.com/Subhrangsu90/my-workspace)
* npm: [ng-tel-input-autocomplete](https://www.npmjs.com/package/ng-tel-input-autocomplete)
