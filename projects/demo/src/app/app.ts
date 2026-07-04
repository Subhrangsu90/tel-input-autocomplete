import { Component, signal, OnInit, DestroyRef, inject } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgTelInputAutocomplete } from 'ng-tel-input-autocomplete';
import { PhoneInputValue, PhoneSuggestion } from 'ng-tel-input-autocomplete';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CodeExampleComponent } from './code-example';

type DemoTab = 'playground' | 'forms' | 'styling' | 'autocomplete' | 'advanced';

const MOCK_CONTACTS: PhoneSuggestion[] = [
  { name: 'John Doe', phoneNumber: '+12025550143', subtitle: 'Google - Software Engineer (US)' },
  { name: 'Jane Smith', phoneNumber: '+12025550189', subtitle: 'Microsoft - Product Manager (US)' },
  {
    name: 'Alice Johnson',
    phoneNumber: '+447911123456',
    subtitle: 'London Office - HR Director (UK)',
  },
  {
    name: 'Bob Williams',
    phoneNumber: '+447911654321',
    subtitle: 'London Office - Lead Architect (UK)',
  },
  {
    name: 'Charlie Brown',
    phoneNumber: '+491701234567',
    subtitle: 'Berlin Office - Managing Director (DE)',
  },
  { name: 'Diana Prince', phoneNumber: '+491709876543', subtitle: 'Berlin Office - QA Lead (DE)' },
  {
    name: 'Ethan Hunt',
    phoneNumber: '+33612345678',
    subtitle: 'Paris Office - Security Advisor (FR)',
  },
  {
    name: 'Fiona Gallagher',
    phoneNumber: '+33687654321',
    subtitle: 'Paris Office - Lead Designer (FR)',
  },
  {
    name: 'George Clark',
    phoneNumber: '+919876543210',
    subtitle: 'Mumbai Office - Engineering Manager (IN)',
  },
  {
    name: 'Hannah Abbott',
    phoneNumber: '+919999888877',
    subtitle: 'Mumbai Office - Project Coordinator (IN)',
  },
  {
    name: 'Ian Malcolm',
    phoneNumber: '+13105550122',
    subtitle: 'LA Office - Chief Scientist (US)',
  },
  {
    name: 'Julia Roberts',
    phoneNumber: '+13105550144',
    subtitle: 'LA Office - Public Relations (US)',
  },
  {
    name: 'Kevin Bacon',
    phoneNumber: '+14155550199',
    subtitle: 'SF Office - Security Specialist (US)',
  },
  { name: 'Laura Croft', phoneNumber: '+442079460192', subtitle: 'London - Senior Inspector (UK)' },
  { name: 'Mike Tyson', phoneNumber: '+17025550155', subtitle: 'Vegas - Sports Consultant (US)' },
  {
    name: 'Nancy Wheeler',
    phoneNumber: '+13175550172',
    subtitle: 'Indiana Office - Investigative Journalist (US)',
  },
  {
    name: 'Oliver Queen',
    phoneNumber: '+12065550163',
    subtitle: 'Seattle Head - Chief Executive (US)',
  },
  { name: 'Peter Parker', phoneNumber: '+17185550188', subtitle: 'NY Office - Photographer (US)' },
  {
    name: 'Quentin Tarantino',
    phoneNumber: '+13105550177',
    subtitle: 'LA Office - Creative Director (US)',
  },
  { name: 'Rachel Green', phoneNumber: '+12125550198', subtitle: 'NY - Senior Buyer (US)' },
];

const DEMO_TABS: { id: DemoTab; label: string; description: string }[] = [
  {
    id: 'playground',
    label: 'Playground',
    description: 'Interactive reactive forms with live state',
  },
  {
    id: 'forms',
    label: 'Form integrations',
    description: 'Reactive, template-driven, and object output',
  },
  {
    id: 'styling',
    label: 'Styling & theming',
    description: 'Sizes, variants, flags, and design tokens',
  },
  {
    id: 'autocomplete',
    label: 'Autocomplete',
    description: 'Contact search, templates, and pagination',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Country filters, events, and edge cases',
  },
];

@Component({
  selector: 'app-root',

  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgTelInputAutocomplete, CodeExampleComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly demoTabs = DEMO_TABS;

  protected readonly testForm = this.fb.group({
    phoneAutocomplete: ['', [Validators.required]],
    phoneNormal: ['', [Validators.required]],
  });

  protected readonly playgroundHtml = `<form [formGroup]="testForm">
  <ng-tel-input-autocomplete
    formControlName="phoneAutocomplete"
    [suggestions]="suggestions()"
    [suggestionsLoading]="loading()"
    [suggestionsExhausted]="suggestionsExhausted()"
    (suggestionSearch)="onQueryChange($event)"
    (loadMoreSuggestions)="onLoadMore()"
    [preferredCountries]="['US', 'IN']"
    [formatOnInput]="formatOnInput()"
    size="small"
  />
</form>`;

  protected readonly playgroundTs = `import { Component, signal, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTelInputAutocomplete, PhoneSuggestion } from 'ng-tel-input-autocomplete';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgTelInputAutocomplete],
  templateUrl: './app.component.html'
})
export class App implements OnInit {
  protected readonly testForm = new FormGroup({
    phoneAutocomplete: new FormControl('', [Validators.required])
  });

  protected readonly suggestions = signal<PhoneSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly suggestionsExhausted = signal(false);
  protected readonly formatOnInput = signal(true);

  protected onLoadMore() {
    // Load more suggestions if paginated...
  }
  
  private readonly querySubject = new Subject<string>();

  ngOnInit() {
    this.querySubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.fetchSuggestions(query);
    });
  }

  protected onQueryChange(query: string) {
    this.loading.set(true);
    this.querySubject.next(query);
  }

  private fetchSuggestions(query: string) {
    setTimeout(() => {
      this.suggestions.set([
        { name: 'John Doe', phoneNumber: '+12025550143', subtitle: 'US Office' }
      ]);
      this.loading.set(false);
      this.suggestionsExhausted.set(true);
    }, 500);
  }
}`;

  protected readonly formsHtml = `<ng-tel-input-autocomplete
  outputFormat="object"
  defaultCountry="GB"
  [suggestionsEnabled]="false"
  (valueChange)="onValueChange($event)"
/>`;

  protected readonly formsTs = `import { Component } from '@angular/core';
import { NgTelInputAutocomplete, PhoneInputValue } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgTelInputAutocomplete],
  templateUrl: './app.component.html'
})
export class App {
  onValueChange(value: PhoneInputValue) {
    // Update component state, analytics, or a preview panel here.
  }
}`;

  protected readonly stylingHtml = `<ng-tel-input-autocomplete
  class="custom-theme-phone"
  defaultCountry="DE"
  variant="filled"
  fluid
/>`;

  protected readonly stylingTs = `import { Component } from '@angular/core';
import { NgTelInputAutocomplete } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgTelInputAutocomplete],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App {}`;

  protected readonly stylingCss = `.custom-theme-phone {
  --ngti-color-surface: #1e3324;
  --ngti-color-surface-muted: #243828;
  --ngti-color-text: #edf5ef;
  --ngti-color-border: #3d5c48;
  --ngti-color-primary: #6b9a78;
  --ngti-color-primary-strong: #8bb896;
}`;

  protected readonly autocompleteHtml = `<ng-tel-input-autocomplete
  defaultCountry="GB"
  [suggestions]="suggestions()"
  [suggestionsLoading]="loading()"
  [suggestionsExhausted]="true"
  [suggestionTemplate]="suggestionRow"
  (suggestionSearch)="onQueryChange($event)"
/>

<ng-template #suggestionRow let-item let-index="index" let-active="active">
  <span class="suggestion-row" [class.suggestion-row--active]="active">
    <span class="suggestion-row__index">{{ index + 1 }}</span>
    <span class="suggestion-row__body">
      <strong>{{ item.name }}</strong>
      <span>{{ item.phoneNumber }}</span>
    </span>
    @if (item.subtitle) {
      <span class="suggestion-row__meta">{{ item.subtitle }}</span>
    }
  </span>
</ng-template>`;

  protected readonly autocompleteTs = `import { Component, signal } from '@angular/core';
import { NgTelInputAutocomplete, PhoneSuggestion } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgTelInputAutocomplete],
  templateUrl: './app.component.html'
})
export class App {
  protected readonly suggestions = signal<PhoneSuggestion[]>([
    { name: 'Asha Rao', phoneNumber: '+919876543210', subtitle: 'Mumbai Office' }
  ]);
  protected readonly loading = signal(false);

  protected onQueryChange(query: string) {
    // Perform search...
  }
}`;


  protected readonly activeTab = signal<DemoTab>('playground');
  protected readonly suggestions = signal<PhoneSuggestion[]>([]);
  protected readonly miniSuggestions = signal<PhoneSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly miniLoading = signal(false);
  protected readonly suggestionsExhausted = signal(false);
  protected readonly isFormDisabled = signal(false);
  protected readonly defaultCountry = signal('IN');
  protected readonly contactSearchEnabled = signal(false);
  protected readonly validationEnabled = signal(true);
  protected readonly formatOnInput = signal(true);
  protected readonly preferredCountries = signal<string[]>(['US', 'IN']);
  protected readonly templatePhone = signal('+919876543210');
  protected readonly objectValue = signal<PhoneInputValue>(null);
  protected readonly darkPhone = signal<PhoneInputValue>(null);
  protected readonly outlinedPhone = signal<PhoneInputValue>(null);
  protected readonly filledPhone = signal<PhoneInputValue>(null);
  protected readonly largePhone = signal<PhoneInputValue>(null);
  protected readonly imageFlagPhone = signal<PhoneInputValue>(null);
  protected readonly noValidationPhone = signal<PhoneInputValue>(null);
  protected readonly readOnlyPhone = signal('+447911123456');
  protected readonly eventLog = signal<string[]>([]);

  private readonly querySubject = new Subject<string>();
  private currentQuery = '';
  private currentPage = 0;
  private readonly pageSize = 5;

  ngOnInit() {
    this.querySubject
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.currentQuery = query;
        this.currentPage = 0;
        this.suggestionsExhausted.set(false);
        this.fetchSuggestions(query, true, this.suggestions, this.loading);
      });
  }

  protected setActiveTab(tab: DemoTab) {
    this.activeTab.set(tab);
  }

  protected isActiveTab(tab: DemoTab) {
    return this.activeTab() === tab;
  }

  protected onQueryChange(query: string) {
    this.loading.set(true);
    this.querySubject.next(query);
  }

  protected onMiniQueryChange(query: string) {
    this.miniLoading.set(true);
    setTimeout(() => {
      const normalizedQuery = query.replace(/[\s\-\+\(\)]/g, '').toLowerCase();
      const filtered = MOCK_CONTACTS.filter((contact) => {
        const phoneClean = contact.phoneNumber.replace(/[\s\-\+\(\)]/g, '').toLowerCase();
        const nameClean = (contact.name || '').toLowerCase();
        return phoneClean.includes(normalizedQuery) || nameClean.includes(normalizedQuery);
      }).slice(0, 4);
      this.miniSuggestions.set(filtered);
      this.miniLoading.set(false);
    }, 400);
  }

  protected onDefaultCountryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.defaultCountry.set(value);
  }

  protected onAlphanumericChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.contactSearchEnabled.set(checked);
  }

  protected onValidationChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.validationEnabled.set(checked);
  }

  protected onFormatChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.formatOnInput.set(checked);
  }

  protected onLoadMore() {
    if (this.loading() || this.suggestionsExhausted()) return;

    this.currentPage++;
    this.loading.set(true);
    this.fetchSuggestions(this.currentQuery, false, this.suggestions, this.loading);
  }

  protected toggleDisabledState() {
    this.isFormDisabled.update((val) => !val);
    if (this.isFormDisabled()) {
      this.testForm.controls.phoneAutocomplete.disable();
      this.testForm.controls.phoneNormal.disable();
    } else {
      this.testForm.controls.phoneAutocomplete.enable();
      this.testForm.controls.phoneNormal.enable();
    }
  }

  protected resetForm() {
    this.testForm.controls.phoneAutocomplete.reset();
    this.testForm.controls.phoneNormal.reset();
  }

  protected setSampleValue() {
    this.testForm.controls.phoneAutocomplete.setValue('+447911123456');
    this.testForm.controls.phoneNormal.setValue('+447911123456');
  }

  protected logEvent(label: string, detail?: string) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = detail ? `[${timestamp}] ${label}: ${detail}` : `[${timestamp}] ${label}`;
    this.eventLog.update((entries) => [entry, ...entries].slice(0, 8));
  }

  protected logValueChange(value: PhoneInputValue) {
    const detail =
      value === null ? 'null' : typeof value === 'string' ? value : JSON.stringify(value);
    this.logEvent('valueChange', detail);
  }

  protected clearEventLog() {
    this.eventLog.set([]);
  }

  private fetchSuggestions(
    query: string,
    reset: boolean,
    target: ReturnType<typeof signal<PhoneSuggestion[]>>,
    loadingSignal: ReturnType<typeof signal<boolean>>,
  ) {
    setTimeout(() => {
      const normalizedQuery = query.replace(/[\s\-\+\(\)]/g, '').toLowerCase();

      const filtered = MOCK_CONTACTS.filter((contact) => {
        const phoneClean = contact.phoneNumber.replace(/[\s\-\+\(\)]/g, '').toLowerCase();
        const nameClean = (contact.name || '').toLowerCase();
        const subtitleClean = (contact.subtitle || '').toLowerCase();

        return (
          phoneClean.includes(normalizedQuery) ||
          nameClean.includes(normalizedQuery) ||
          subtitleClean.includes(normalizedQuery)
        );
      });

      const startIndex = this.currentPage * this.pageSize;
      const paginatedResults = filtered.slice(startIndex, startIndex + this.pageSize);

      if (reset) {
        target.set(paginatedResults);
      } else {
        target.update((curr) => [...curr, ...paginatedResults]);
      }

      if (startIndex + this.pageSize >= filtered.length) {
        this.suggestionsExhausted.set(true);
      }

      loadingSignal.set(false);
    }, 600);
  }
}

