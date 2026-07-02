import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  Country,
  CountryTemplateContext,
  FlagMode,
  FlagUrlResolver,
  StateTemplateContext,
  SuggestionTemplateContext,
  PhoneSuggestion,
  NgTelInputClassValue,
  NgTelInputStyleValue,
} from './ng-tel-input-autocomplete.types';
import { NgTelInputIcon } from './ng-tel-input-icons';

type DropdownItem = Country | PhoneSuggestion;

@Component({
  selector: 'ng-tel-input-dropdown',
  standalone: true,
  imports: [NgClass, NgStyle, NgTemplateOutlet, NgTelInputIcon],
  template: `
    <div
      class="dropdown"
      [ngClass]="panelClass()"
      [ngStyle]="panelStyle()"
      (keydown)="handleKeyDown($event)"
    >
      @if (type() === 'countries') {
        <div class="search">
          <lib-tel-icon name="search" class="search-icon" aria-hidden="true" />
          <input
            #searchInput
            type="search"
            [id]="searchInputId"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search country or dial code"
            aria-label="Search countries"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            [attr.aria-controls]="listboxId"
            [attr.aria-activedescendant]="activeOptionId"
            autocomplete="off"
          />
          @if (searchQuery()) {
            <button
              type="button"
              class="icon-button"
              (click)="clearSearch()"
              aria-label="Clear country search"
            >
              <lib-tel-icon name="close" aria-hidden="true" />
            </button>
          }
        </div>
      }

      <div
        #listContainer
        class="listbox"
        role="listbox"
        [id]="listboxId"
        [attr.aria-label]="type() === 'countries' ? 'Countries' : 'Phone suggestions'"
        [attr.aria-busy]="loading()"
        (scroll)="onScroll($event)"
      >
        @if (type() === 'countries') {
          @for (country of countriesCast; track country.code; let index = $index) {
            <button
              type="button"
              class="option"
              role="option"
              tabindex="-1"
              [id]="countryOptionId(country)"
              [class.active]="index === activeIndex()"
              [class.selected]="country.code === selectedCountry()?.code"
              [attr.aria-selected]="country.code === selectedCountry()?.code"
              (click)="selectItem(country)"
            >
              @if (countryTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{
                    $implicit: country,
                    country,
                    selected: country.code === selectedCountry()?.code
                  }"
                />
              } @else {
                <span class="option-leading">
                  @if (flagMode() === 'image') {
                    <img class="flag-image" [src]="getFlagUrl(country.code)" alt="" referrerpolicy="no-referrer" />
                  } @else {
                    <span class="flag-emoji" aria-hidden="true">{{ country.flag }}</span>
                  }
                  <span class="country-label">
                    <span class="primary" [innerHTML]="getHighlightedText(country.name, searchQuery())"></span>
                    <span class="secondary" [innerHTML]="getHighlightedText(country.dialCode, searchQuery())"></span>
                  </span>
                </span>
                @if (country.code === selectedCountry()?.code) {
                  <lib-tel-icon name="check" class="selected-icon" aria-hidden="true" />
                }
              }
            </button>
          } @empty {
            <div class="empty" role="status">
              @if (emptyTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{ $implicit: 'countries', type: 'countries' }"
                />
              } @else {
                No countries found
              }
            </div>
          }
        } @else {
          @for (suggestion of suggestionsCast; track suggestion.phoneNumber; let index = $index) {
            <button
              type="button"
              class="option suggestion"
              role="option"
              tabindex="-1"
              [id]="suggestionOptionId(index)"
              [class.active]="index === activeIndex()"
              [attr.aria-selected]="index === activeIndex()"
              (click)="selectItem(suggestion)"
            >
              @if (suggestionTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{
                    $implicit: suggestion,
                    suggestion,
                    index,
                    active: index === activeIndex()
                  }"
                />
              } @else {
                <span class="option-leading">
                  <span class="avatar" aria-hidden="true">{{ (suggestion.name || 'UN').substring(0, 2).toUpperCase() }}</span>
                  <span class="suggestion-copy">
                    <span class="primary" [innerHTML]="getHighlightedText(suggestion.name || 'Unknown contact', searchQuery())"></span>
                    <span class="secondary" [innerHTML]="getHighlightedText(suggestion.phoneNumber, searchQuery())"></span>
                    @if (suggestion.subtitle) {
                      <span class="subtitle" [innerHTML]="getHighlightedText(suggestion.subtitle, searchQuery())"></span>
                    }
                  </span>
                </span>
                @if (suggestion.countryCode) {
                  <span class="country-badge">
                    @if (flagMode() === 'image') {
                      <img class="flag-image small" [src]="getFlagUrl(suggestion.countryCode)" alt="" referrerpolicy="no-referrer" />
                    } @else {
                      <span aria-hidden="true">{{ flagEmoji(suggestion.countryCode) }}</span>
                    }
                    {{ suggestion.countryCode.toUpperCase() }}
                  </span>
                }
              }
            </button>
          } @empty {
            <div class="empty" role="status">
              @if (emptyTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{ $implicit: 'suggestions', type: 'suggestions' }"
                />
              } @else {
                No phone suggestions found
              }
            </div>
          }
        }

        @if (loading()) {
          <div class="loading" role="status" aria-live="polite">
            @if (loadingTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{ $implicit: type(), type: type() }"
              />
            } @else {
              <span class="spinner" aria-hidden="true"></span>
              Loading more…
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; font-family: inherit; color: #1f2937; }
    *, *::before, *::after { box-sizing: border-box; }
    .dropdown { display: flex; width: 100%; max-height: 20rem; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; border-radius: .875rem; background: #fff; box-shadow: 0 14px 35px rgb(15 23 42 / .16); font-size: .875rem; }
    .search { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: .5rem; padding: .5rem .75rem; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
    .search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #1f2937; font: inherit; }
    .search input::placeholder { color: #9ca3af; }
    .search input:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; border-radius: .25rem; }
    .search-icon { flex: none; color: #9ca3af; }
    .icon-button { display: inline-flex; flex: none; align-items: center; justify-content: center; padding: .2rem; border: 0; border-radius: .3rem; background: transparent; color: #6b7280; cursor: pointer; }
    .icon-button:hover { background: #e5e7eb; }
    .icon-button:focus-visible, .option:focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
    .listbox { flex: 1; max-height: 15rem; overflow-y: auto; }
    .option { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: .75rem; padding: .68rem 1rem; border: 0; border-bottom: 1px solid #f3f4f6; background: #fff; color: #374151; text-align: left; cursor: pointer; }
    .option:hover, .option.active { background: #f3f4f6; }
    .option.selected { background: #eff6ff; color: #1e3a8a; }
    .option-leading { display: flex; min-width: 0; align-items: center; gap: .75rem; }
    .country-label { display: flex; min-width: 0; align-items: baseline; gap: .4rem; }
    .primary { overflow: hidden; color: #374151; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .secondary { color: #6b7280; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; }
    .subtitle { overflow: hidden; color: #9ca3af; font-size: .7rem; text-overflow: ellipsis; white-space: nowrap; }
    .flag-emoji { width: 1.5rem; font-size: 1.2rem; line-height: 1; text-align: center; }
    .flag-image { width: 1.5rem; height: 1rem; flex: none; border: 1px solid #e5e7eb; border-radius: .15rem; object-fit: cover; }
    .flag-image.small { width: 1.15rem; height: .8rem; }
    .selected-icon { flex: none; color: #2563eb; }
    .suggestion-copy { display: flex; min-width: 0; flex-direction: column; gap: .15rem; }
    .avatar { display: inline-flex; width: 2rem; height: 2rem; flex: none; align-items: center; justify-content: center; border: 1px solid #dbeafe; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: .7rem; font-weight: 700; }
    .country-badge { display: inline-flex; flex: none; align-items: center; gap: .3rem; padding: .25rem .45rem; border: 1px solid #e5e7eb; border-radius: .5rem; background: #f9fafb; color: #6b7280; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .65rem; font-weight: 700; }
    .empty { padding: 1.5rem; color: #6b7280; text-align: center; }
    .loading { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: .75rem; background: #f9fafb; color: #4b5563; font-size: .75rem; }
    .spinner { width: 1rem; height: 1rem; border: 2px solid #bfdbfe; border-top-color: #2563eb; border-radius: 999px; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgTelInputDropdown implements OnChanges, AfterViewInit {
  readonly type = input.required<'countries' | 'suggestions'>();
  readonly items = input.required<readonly DropdownItem[]>();
  readonly idPrefix = input.required<string>();
  readonly selectedCountry = input<Country | null>(null);
  readonly searchQuery = input('');
  readonly loading = input(false);
  readonly hasMore = input(false);
  readonly activeIndex = input(0);
  readonly flagMode = input<FlagMode>('emoji');
  readonly flagUrl = input<FlagUrlResolver | null>(null);
  readonly countryTemplate = input<TemplateRef<CountryTemplateContext> | null>(null);
  readonly suggestionTemplate = input<TemplateRef<SuggestionTemplateContext> | null>(null);
  readonly emptyTemplate = input<TemplateRef<StateTemplateContext> | null>(null);
  readonly loadingTemplate = input<TemplateRef<StateTemplateContext> | null>(null);
  readonly panelClass = input<NgTelInputClassValue | null>(null);
  readonly panelStyle = input<NgTelInputStyleValue | null>(null);

  readonly itemSelected = output<DropdownItem>();
  readonly searchChanged = output<string>();
  readonly scrollEnd = output<void>();
  readonly closed = output<void>();
  readonly activeIndexChange = output<number>();

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly listContainer = viewChild<ElementRef<HTMLDivElement>>('listContainer');

  private readonly sanitizer = inject(DomSanitizer);

  get listboxId(): string { return `${this.idPrefix()}-${this.type()}-listbox`; }
  get searchInputId(): string { return `${this.idPrefix()}-country-search`; }
  get activeOptionId(): string | null {
    const item = this.items()[this.activeIndex()];
    if (!item) return null;
    return this.type() === 'countries'
      ? this.countryOptionId(item as Country)
      : this.suggestionOptionId(this.activeIndex());
  }
  get countriesCast(): readonly Country[] { return this.items() as readonly Country[]; }
  get suggestionsCast(): readonly PhoneSuggestion[] { return this.items() as readonly PhoneSuggestion[]; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['activeIndex']) this.scrollActiveIntoView();
  }

  ngAfterViewInit(): void {
    if (this.type() === 'countries') this.focusSearch();
  }

  countryOptionId(country: Country): string { return `${this.idPrefix()}-country-${country.code.toLowerCase()}`; }
  suggestionOptionId(index: number): string { return `${this.idPrefix()}-suggestion-${index}`; }
  getFlagUrl(countryCode: string): string { return this.flagUrl()?.(countryCode) ?? `https://flagcdn.com/${countryCode.toLowerCase()}.svg`; }

  flagEmoji(countryCode: string): string {
    if (!/^[a-z]{2}$/i.test(countryCode)) return '🌐';
    return countryCode.toUpperCase().split('').map(character => String.fromCodePoint(127397 + character.charCodeAt(0))).join('');
  }

  focusSearch(): void { setTimeout(() => this.searchInput()?.nativeElement.focus()); }
  onSearchInput(event: Event): void { this.searchChanged.emit((event.target as HTMLInputElement).value); }

  clearSearch(): void {
    this.searchChanged.emit('');
    const inputElement = this.searchInput()?.nativeElement;
    if (inputElement) { inputElement.value = ''; inputElement.focus(); }
  }

  selectItem(item: DropdownItem): void { this.itemSelected.emit(item); }

  onScroll(event: Event): void {
    const container = event.target as HTMLDivElement;
    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 30 && !this.loading() && this.hasMore()) {
      this.scrollEnd.emit();
    }
  }

  getHighlightedText(text: string, search: string): SafeHtml {
    const escapedText = this.escapeHtml(text || '');
    if (!search) return escapedText;
    const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const highlighted = escapedText.replace(new RegExp(`(${escapedSearch})`, 'gi'), '<mark style="background:#dbeafe;color:#172554;font-weight:700">$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  handleKeyDown(event: KeyboardEvent): void {
    const list = this.items();
    if (list.length === 0) return;
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); this.activeIndexChange.emit((this.activeIndex() + 1) % list.length); break;
      case 'ArrowUp': event.preventDefault(); this.activeIndexChange.emit((this.activeIndex() - 1 + list.length) % list.length); break;
      case 'Enter': event.preventDefault(); this.selectItem(list[this.activeIndex()]); break;
      case 'Escape': event.preventDefault(); this.closed.emit(); break;
      case 'Tab': this.closed.emit(); break;
    }
  }

  private scrollActiveIntoView(): void {
    setTimeout(() => {
      const listElement = this.listContainer()?.nativeElement;
      const item = this.items()[this.activeIndex()];
      if (!listElement || !item) return;
      const optionId = this.type() === 'countries' ? this.countryOptionId(item as Country) : this.suggestionOptionId(this.activeIndex());
      const activeElement = listElement.querySelector<HTMLElement>(`#${optionId}`);
      if (typeof activeElement?.scrollIntoView === 'function') {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}
