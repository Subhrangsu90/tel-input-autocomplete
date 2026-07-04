# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 - 2026-07-04

- **Preferred Countries list (`preferredCountries`)**: Added support to prioritize specific countries at the top of the dropdown, separated by a separator line, for quicker navigation.
- **Detailed Validation Errors**: Enhanced ControlValueAccessor validator to return detailed reason codes (`TOO_SHORT`, `TOO_LONG`, `INVALID_COUNTRY_CODE`, `INVALID_LENGTH`) along with a boolean `invalid: true` status flag.
- **Auto-Formatting Toggle (`formatOnInput`)**: Introduced `[formatOnInput]` option to disable formatting during typing to allow raw input.
- **DX & UX Polishes**: Enabled copying code snippets directly from the code viewer even when collapsed, added playground controls for testing new features, and improved responsiveness.

## 0.1.2 - 2026-07-04

- Fixed duplicate country dial code prefixing when parsing or validating raw subscriber numbers that start with a dial code.
- Enhanced `writeValue()` to support fallback value extraction from `e164Number` and `internationalNumber` object fields.
- Fixed `writeValue()` to cleanly strip dial code prefixes before formatting subscriber numbers.

## 0.1.1 - 2026-07-04

- Renamed repository to `tel-input-autocomplete` and updated all repository, issue tracker, and documentation URL references.
- Added project funding configuration (`.github/FUNDING.yml`).

## 0.1.0 - 2026-07-03

- Restructured `PhoneNumberValue` properties to use standard, professional names:
  - Added `internationalNumber`, `nationalNumber`, and `e164Number`.
  - Removed `formattedNumber` and `fullNumber` from type definitions (while maintaining temporary fallback compatibility in `writeValue`).
- Removed Tailwind dependency from service `highlightMatch()` to rely on css variables.
- Fixed `NG0953` output ref leak on component destruction in tests.
- Simplified and strengthened type guards for countries and suggestions.
- Avoided unnecessary change detection cycles on window resize events.
- Extracted common utilities (`escapeHtml` and `getFlagEmoji`) to eliminate duplicate logic.
- Supported static SPA hosting mode by moving demo project outputMode to static.
- Configured secret authentication token for library publishing.
- Widen Angular peer dependency ranges to `^21.0.0`.

## 0.0.1 - 2026-07-02

- Added a standalone Angular telephone input with Reactive Forms and template-driven forms support.
- Added international formatting, validation, country filtering, contact suggestions, and pagination.
- Added self-contained component styling and offline emoji flags.
- Added accessible combobox/listbox semantics and keyboard navigation.
- Added SSR-safe country fallback behavior and public package documentation.
- Added customizable country, suggestion, empty, and loading templates.
- Added a structured API reference for properties, emitters, templates, interfaces, and service methods.
