import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  signal,
  effect,
  forwardRef,
  inject,
  HostListener,
  DestroyRef,
  output,
  input,
  viewChild,
  ChangeDetectionStrategy,
  untracked
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { Subject, of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NgTelInputAutocompleteService } from './ng-tel-input-autocomplete.service';
import { NgTelInputDropdown } from './ng-tel-input-dropdown';
import { NgTelInputIcon } from './ng-tel-input-icons';
import {
  CountrySearchResponse,
  Country,
  CountryTemplateContext,
  FlagMode,
  FlagUrlResolver,
  PhoneInputValue,
  StateTemplateContext,
  SuggestionTemplateContext,
  PhoneNumberValue,
  PhoneSuggestion,
} from './ng-tel-input-autocomplete.types';

let nextUniqueId = 0;
type DropdownItem = Country | PhoneSuggestion;

@Component({
  selector: 'ng-tel-input-autocomplete',
  standalone: true,
  imports: [OverlayModule, NgTemplateOutlet, NgTelInputDropdown, NgTelInputIcon],
  templateUrl: './ng-tel-input-autocomplete.html',
  styleUrl: './ng-tel-input-autocomplete.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgTelInputAutocomplete),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NgTelInputAutocomplete),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgTelInputAutocomplete implements OnInit, ControlValueAccessor, Validator {
  private readonly phoneService = inject(NgTelInputAutocompleteService);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs
  readonly inputId = input(`ng-tel-input-${++nextUniqueId}`);
  readonly ariaLabel = input('International phone number');
  readonly defaultCountry = input('US');
  readonly allowedCountries = input<readonly string[]>([]);
  readonly excludedCountries = input<readonly string[]>([]);
  readonly outputFormat = input<'string' | 'object'>('string');
  readonly placeholder = input('Enter phone number...');
  readonly countrySearchUrl = input<string | null>(null);
  readonly suggestionsEnabled = input(true);
  readonly contactSearchEnabled = input(true);
  readonly validationEnabled = input(true);
  readonly flagMode = input<FlagMode>('emoji');
  readonly flagUrl = input<FlagUrlResolver | null>(null);
  readonly selectedCountryTemplate = input<TemplateRef<CountryTemplateContext> | null>(null);
  readonly countryTemplate = input<TemplateRef<CountryTemplateContext> | null>(null);
  readonly suggestionTemplate = input<TemplateRef<SuggestionTemplateContext> | null>(null);
  readonly emptyTemplate = input<TemplateRef<StateTemplateContext> | null>(null);
  readonly loadingTemplate = input<TemplateRef<StateTemplateContext> | null>(null);

  // Contact suggestion list inputs/outputs
  readonly suggestions = input<readonly PhoneSuggestion[]>([]);
  readonly suggestionsLoading = input(false);
  readonly suggestionsExhausted = input(false);

  readonly suggestionSearch = output<string>();
  readonly loadMoreSuggestions = output<void>();
  readonly valueChange = output<PhoneInputValue>();
  readonly countryLoadError = output<unknown>();

  // Element references
  phoneInput = viewChild<ElementRef<HTMLInputElement>>('phoneInput');
  containerEl = viewChild<ElementRef<HTMLDivElement>>('containerEl');

  // Reactive State (Signals)
  countries = signal<Country[]>([]);
  selectedCountry = signal<Country | null>(null);
  searchQuery = signal<string>('');
  loadingCountries = signal<boolean>(false);
  hasMoreCountries = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  suggestedCountry = signal<Country | null>(null);

  // Phone suggestion overlays state
  showSuggestions = signal<boolean>(false);
  activeCountryIndex = signal<number>(0);
  activeSuggestionIndex = signal<number>(0);

  // Component state
  inputValue = signal('');
  isFocused = signal(false);
  disabled = signal(false);
  hasError = signal(false);
  private justSelectedSuggestion = false;

  // Pagination for Country dropdown
  private currentCountryPage = 1;
  private readonly countriesPerPage = 15;

  // Debounce search stream for countries
  private searchSubject = new Subject<string>();

  // Form Control Value Accessor callbacks
  private onChange: (value: PhoneInputValue) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  private getDefaultCountry(): Country | null {
    const initialCode = this.defaultCountry();
    const allowedCountries = this.getFilteredStaticCountries('');
    return allowedCountries.find(
      country => country.code.toUpperCase() === initialCode.toUpperCase()
    ) ?? allowedCountries[0] ?? null;
  }

  private getFilteredStaticCountries(query: string): Country[] {
    let list = this.phoneService.getStaticCountries();

    const only = this.allowedCountries();
    if (only && only.length > 0) {
      const upperOnly = only.map(c => c.toUpperCase());
      list = list.filter(c => upperOnly.includes(c.code.toUpperCase()));
    }

    const exclude = this.excludedCountries();
    if (exclude && exclude.length > 0) {
      const upperExclude = exclude.map(c => c.toUpperCase());
      list = list.filter(c => !upperExclude.includes(c.code.toUpperCase()));
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.dialCode.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q)
      );
    }

    return list;
  }

  private getCountries(
    query: string,
    page: number,
    limit = this.countriesPerPage
  ): Observable<CountrySearchResponse> {
    const hasFilters = this.allowedCountries().length > 0 || this.excludedCountries().length > 0;
                        
    if (hasFilters || !this.countrySearchUrl()) {
      const filtered = this.getFilteredStaticCountries(query);
      const offset = (page - 1) * limit;
      return of({
        data: filtered.slice(offset, offset + limit),
        meta: {
          page,
          limit,
          total: filtered.length,
          hasMore: offset + limit < filtered.length
        }
      });
    }

    return this.phoneService.searchCountries(query, page, limit, this.countrySearchUrl());
  }

  constructor() {
    effect(() => {
      const defaultCountry = this.getDefaultCountry();
      if (defaultCountry && !untracked(this.inputValue)) {
        this.selectedCountry.set(defaultCountry);
      }
    });

    effect(() => {
      this.validationEnabled();
      this.onValidatorChange();
    });
  }

  ngOnInit(): void {
    // Initial seed of country dropdown list
    this.loadCountriesPage(1);

    // Setup debounced search subscription for countries
    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(query => {
        this.currentCountryPage = 1;
        this.searchQuery.set(query);
        this.loadingCountries.set(true);
        this.activeCountryIndex.set(0);
        return this.getCountries(query, 1, this.countriesPerPage);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        this.countries.set(res.data);
        this.hasMoreCountries.set(res.meta.hasMore);
        this.loadingCountries.set(false);
      },
      error: error => {
        this.loadingCountries.set(false);
        this.countryLoadError.emit(error);
      }
    });
  }

  private loadCountriesPage(page: number, append = false): void {
    this.loadingCountries.set(true);
    this.getCountries(this.searchQuery(), page, this.countriesPerPage).subscribe({
      next: (res) => {
        if (append) {
          this.countries.update(current => [...current, ...res.data]);
        } else {
          this.countries.set(res.data);
        }
        this.hasMoreCountries.set(res.meta.hasMore);
        this.loadingCountries.set(false);
      },
      error: error => {
        this.loadingCountries.set(false);
        this.countryLoadError.emit(error);
      }
    });
  }

  toggleOverlay(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closeOverlay();
    } else {
      this.isOpen.set(true);
      this.activeCountryIndex.set(0);
    }
  }

  closeOverlay(): void {
    this.isOpen.set(false);
    this.phoneInput()?.nativeElement.focus();
  }

  onCountrySelected(country: Country): void {
    this.selectedCountry.set(country);
    
    // Reformat existing digits to fit the new country's pattern
    const rawDigits = this.inputValue().replace(/\D/g, '');
    this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, country.code));
    
    this.propagateChanges();
    this.closeOverlay();
  }

  onCountryDropdownItem(item: DropdownItem): void {
    if (this.isCountry(item)) {
      this.onCountrySelected(item);
    }
  }

  onSuggestionDropdownItem(item: DropdownItem): void {
    if (this.isPhoneSuggestion(item)) {
      this.selectSuggestion(item);
    }
  }

  private isCountry(item: DropdownItem): item is Country {
    return 'dialCode' in item && 'placeholder' in item;
  }

  private isPhoneSuggestion(item: DropdownItem): item is PhoneSuggestion {
    return 'phoneNumber' in item;
  }

  onSearchChanged(query: string): void {
    this.searchSubject.next(query);
  }

  onScrollEndCountries(): void {
    if (!this.loadingCountries() && this.hasMoreCountries()) {
      this.currentCountryPage++;
      this.loadCountriesPage(this.currentCountryPage, true);
    }
  }

  updateSuggestedCountry(value: string): void {
    const isInternational = value.startsWith('+') || value.startsWith('00');
    if (!isInternational) {
      this.suggestedCountry.set(null);
      return;
    }

    const internationalValue = value.startsWith('00') ? value.slice(2) : value;
    const cleaned = internationalValue.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 1) {
      this.suggestedCountry.set(null);
      return;
    }

    const detected = this.phoneService.detectCountryByDialCode(cleaned);
    if (detected && detected.code !== this.selectedCountry()?.code) {
      this.suggestedCountry.set(detected);
    } else {
      this.suggestedCountry.set(null);
    }
  }

  selectSuggestedCountry(): void {
    const suggested = this.suggestedCountry();
    if (suggested) {
      this.selectedCountry.set(suggested);
      const rawDigits = this.inputValue().replace(/\D/g, '');
      const cleanDial = suggested.dialCode.replace('+', '');
      let remainingDigits = rawDigits;
      if (rawDigits.startsWith(cleanDial)) {
        remainingDigits = rawDigits.substring(cleanDial.length);
      }
      this.inputValue.set(this.phoneService.formatPhoneNumber(remainingDigits, suggested.code));
      this.suggestedCountry.set(null);
      this.propagateChanges();
      this.phoneInput()?.nativeElement.focus();
    }
  }

  updateSuggestionsState(value: string): void {
    if (!this.suggestionsEnabled()) {
      this.showSuggestions.set(false);
      return;
    }
    // Notify parent query has changed to trigger suggestion updates
    this.suggestionSearch.emit(value);
    // Open overlay suggestions if we are focused and have suggestion list
    this.activeSuggestionIndex.set(0);
    this.showSuggestions.set(this.suggestions().length > 0 && this.isFocused());
  }

  selectSuggestion(suggestion: PhoneSuggestion): void {
    this.justSelectedSuggestion = true;
    let foundCountry: Country | undefined;
    
    if (suggestion.countryCode) {
      foundCountry = this.phoneService.getStaticCountries().find(
        c => c.code.toUpperCase() === suggestion.countryCode!.toUpperCase()
      );
    } else {
      // Guess country from the suggested phone digits
      const detected = this.phoneService.detectCountryByDialCode(suggestion.phoneNumber);
      if (detected) foundCountry = detected;
    }

    if (foundCountry) {
      this.selectedCountry.set(foundCountry);
      const cleanDial = foundCountry.dialCode.replace('+', '');
      const digits = suggestion.phoneNumber.replace(/\D/g, '');
      let localDigits = digits;
      if (digits.startsWith(cleanDial)) {
        localDigits = digits.substring(cleanDial.length);
      }
      this.inputValue.set(this.phoneService.formatPhoneNumber(localDigits, foundCountry.code));
      this.propagateChanges();
    } else {
      this.inputValue.set(suggestion.phoneNumber);
      this.propagateChanges();
    }
    this.closeSuggestions();
    this.phoneInput()?.nativeElement.focus();
  }

  closeSuggestions(): void {
    this.showSuggestions.set(false);
  }

  onLoadMoreSuggestions(): void {
    if (!this.suggestionsLoading() && !this.suggestionsExhausted()) {
      this.loadMoreSuggestions.emit();
    }
  }

  handleInputKeyDown(event: KeyboardEvent): void {
    if (!this.contactSearchEnabled()) {
      const allowedRegex = /^[0-9\-\+\(\)\s]$/;
      const isControlKey = event.key.length > 1;
      const isClipboardOrSelect = event.ctrlKey || event.metaKey;
      
      if (!isControlKey && !isClipboardOrSelect && !allowedRegex.test(event.key)) {
        event.preventDefault();
        return;
      }
    }

    if (!this.suggestionsEnabled()) return;
    if (!this.showSuggestions()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.showSuggestions.set(this.suggestions().length > 0);
        event.preventDefault();
      }
      return;
    }

    const list = this.suggestions();
    if (!list || list.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (this.activeSuggestionIndex() + 1) % list.length;
        this.activeSuggestionIndex.set(nextIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (this.activeSuggestionIndex() - 1 + list.length) % list.length;
        this.activeSuggestionIndex.set(prevIndex);
        break;
      case 'Enter':
        event.preventDefault();
        if (list[this.activeSuggestionIndex()]) {
          this.selectSuggestion(list[this.activeSuggestionIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeSuggestions();
        break;
      case 'Tab':
        this.closeSuggestions();
        break;
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (value.startsWith('+') && !this.isOpen()) {
      this.isOpen.set(true);
      this.searchQuery.set(value);
      this.searchSubject.next(value);
    }

    if (value.startsWith('+') && value.length > 1) {
      const detected = this.phoneService.detectCountryByDialCode(value);
      if (detected) {
        this.selectedCountry.set(detected);
        const cleanInput = value.replace(detected.dialCode, '').replace('+', '');
        const rawDigits = cleanInput.replace(/\D/g, '');
        this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, detected.code));
        this.suggestedCountry.set(null);
        this.propagateChanges();
        this.updateSuggestionsState(this.inputValue());
        return;
      }
    }

    this.updateSuggestedCountry(value);

    if (this.contactSearchEnabled()) {
      // Allow letters, spaces, and numbers so users can type contact names or contact IDs.
      const hasLetters = /[a-zA-Z]/.test(value);
      if (hasLetters) {
        this.inputValue.set(value);
      } else {
        const rawDigits = value.replace(/\D/g, '');
        const activeCountry = this.selectedCountry();
        if (activeCountry) {
          this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, activeCountry.code));
        } else {
          this.inputValue.set(rawDigits);
        }
      }
    } else {
      // Reject letters and non-phone characters. Only allow digits and formatting symbols (+, -, (, ), spaces).
      const filteredValue = value.replace(/[^0-9\-\+\(\)\s]/g, '');
      const rawDigits = filteredValue.replace(/\D/g, '');
      const activeCountry = this.selectedCountry();
      if (activeCountry) {
        this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, activeCountry.code));
      } else {
        this.inputValue.set(rawDigits);
      }
    }

    this.propagateChanges();
    this.updateSuggestionsState(this.inputValue());
  }

  onFocus(): void {
    this.isFocused.set(true);
    if (this.justSelectedSuggestion) {
      this.justSelectedSuggestion = false;
      return;
    }
    this.updateSuggestionsState(this.inputValue());
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
    this.validateSelf();
    
    setTimeout(() => {
      if (!this.isFocused()) {
        this.closeSuggestions();
      }
    }, 200);
  }

  clearValue(): void {
    this.inputValue.set('');
    this.propagateChanges();
    this.updateSuggestionsState('');
    this.phoneInput()?.nativeElement.focus();
  }

  isValid(): boolean {
    if (!this.validationEnabled()) return true;
    const activeCountry = this.selectedCountry();
    if (!activeCountry || !this.inputValue()) return false;
    return this.phoneService.isValidNumber(this.inputValue(), activeCountry.code);
  }

  private validateSelf(): void {
    const isSearchQuery = this.contactSearchEnabled() && /[a-zA-Z]/.test(this.inputValue());
    if (this.inputValue() && !isSearchQuery && !this.isValid()) {
      this.hasError.set(true);
    } else {
      this.hasError.set(false);
    }
  }

  private propagateChanges(): void {
    this.validateSelf();
    const activeCountry = this.selectedCountry();

    if (!this.inputValue() || !activeCountry) {
      this.onChange(null);
      this.valueChange.emit(null);
      return;
    }

    if (this.suggestionsEnabled() && /[a-zA-Z]/.test(this.inputValue())) {
      this.onChange(null);
      this.valueChange.emit(null);
      return;
    }

    const valueObject = this.phoneService.parsePhoneNumber(this.inputValue(), activeCountry);
    const outputValue = this.outputFormat() === 'object' 
      ? valueObject 
      : (this.isValid() ? this.phoneService.formatE164(this.inputValue(), activeCountry.code) : this.inputValue());

    this.onChange(outputValue);
    this.valueChange.emit(outputValue);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Triggers change detection on window resize to reposition and resize overlay
  }

  getOverlayWidth(): number {
    const el = this.containerEl()?.nativeElement;
    if (el && typeof el.getBoundingClientRect === 'function') {
      return el.getBoundingClientRect().width;
    }
    return 320;
  }

  get countryListboxId(): string {
    return `${this.inputId()}-countries-listbox`;
  }

  get suggestionsListboxId(): string {
    return `${this.inputId()}-suggestions-listbox`;
  }

  get activeSuggestionId(): string | null {
    if (!this.showSuggestions() || !this.suggestions()[this.activeSuggestionIndex()]) return null;
    return `${this.inputId()}-suggestion-${this.activeSuggestionIndex()}`;
  }

  getFlagUrl(countryCode: string): string {
    return this.flagUrl()?.(countryCode) ?? `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
  }

  // --- ControlValueAccessor ---

  writeValue(value: unknown): void {
    if (!value) {
      this.inputValue.set('');
      this.selectedCountry.set(this.getDefaultCountry());
      this.suggestedCountry.set(null);
      this.validateSelf();
      return;
    }

    if (typeof value === 'object' && value !== null) {
      const phoneValue = value as Partial<PhoneNumberValue> & { code?: string };
      const countryCode = phoneValue.countryCode || phoneValue.code;
      const numberToFormat = phoneValue.number || phoneValue.formattedNumber || '';

      if (countryCode) {
        const found = this.phoneService.getStaticCountries().find(
          c => c.code.toUpperCase() === countryCode.toUpperCase()
        );
        if (found) {
          this.selectedCountry.set(found);
          const rawDigits = numberToFormat.replace(/\D/g, '');
          this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, found.code));
          this.validateSelf();
          return;
        }
      }
    }

    if (typeof value === 'string' && value.startsWith('+')) {
      const detected = this.phoneService.detectCountryByDialCode(value);
      if (detected) {
        this.selectedCountry.set(detected);
        const cleanInput = value.replace(detected.dialCode, '').replace('+', '');
        const rawDigits = cleanInput.replace(/\D/g, '');
        this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, detected.code));
        this.validateSelf();
        return;
      }
    }

    const currentCountry = this.selectedCountry();
    if (currentCountry) {
      const rawDigits = String(value).replace(/\D/g, '');
      this.inputValue.set(this.phoneService.formatPhoneNumber(rawDigits, currentCountry.code));
    } else {
      this.inputValue.set(String(value));
    }
    this.validateSelf();
  }

  registerOnChange(fn: (value: PhoneInputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
    fn();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // --- Validator ---

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    return this.isValid() ? null : { invalidPhoneNumber: true };
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen()) {
      this.closeOverlay();
    }
  }
}
