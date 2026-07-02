import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgTelInputAutocomplete } from './ng-tel-input-autocomplete';
import { PhoneNumberValue } from './ng-tel-input-autocomplete.types';

@Component({
  standalone: true,
  imports: [FormsModule, NgTelInputAutocomplete],
  template: `
    <label for="template-phone">Phone</label>
    <ng-tel-input-autocomplete
      inputId="template-phone"
      name="phone"
      [(ngModel)]="phone"
      [suggestionsEnabled]="false"
    />
  `,
})
class TemplateDrivenHost {
  phone = '+12025550143';
}

@Component({
  standalone: true,
  imports: [NgTelInputAutocomplete],
  template: `
    <ng-template #selected let-country>
      <span class="custom-selected">{{ country.code }}</span>
    </ng-template>
    <ng-template #country let-item let-selected="selected">
      <span class="custom-country">{{ item.code }}:{{ selected }}</span>
    </ng-template>
    <ng-template #suggestion let-item let-index="index">
      <span class="custom-suggestion">{{ index }}:{{ item.name }}</span>
    </ng-template>
    <ng-tel-input-autocomplete
      [selectedCountryTemplate]="selected"
      [countryTemplate]="country"
      [suggestionTemplate]="suggestion"
      [suggestions]="suggestions"
    />
  `,
})
class CustomTemplateHost {
  readonly telephoneInput = viewChild.required(NgTelInputAutocomplete);
  readonly suggestions = [{ name: 'Asha', phoneNumber: '+919876543210', countryCode: 'IN' }];
}

describe('NgTelInputAutocomplete', () => {
  let component: NgTelInputAutocomplete;
  let fixture: ComponentFixture<NgTelInputAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTelInputAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTelInputAutocomplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore the configured default country when the form value is reset', async () => {
    fixture.componentRef.setInput('defaultCountry', 'IN');
    await fixture.whenStable();

    component.writeValue({ countryCode: 'EG', number: '1012345678' });
    expect(component.selectedCountry()?.code).toBe('EG');

    component.writeValue(null);
    await fixture.whenStable();

    expect(component.inputValue()).toBe('');
    expect(component.selectedCountry()?.code).toBe('IN');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('');
  });

  it('should only suggest a country for an explicit international prefix', () => {
    component.updateSuggestedCountry('202-555-0123');
    expect(component.suggestedCountry()).toBeNull();

    component.updateSuggestedCountry('+20 10 1234 5678');
    expect(component.suggestedCountry()?.code).toBe('EG');

    component.updateSuggestedCountry('0044 20 7946 0958');
    expect(component.suggestedCountry()?.dialCode).toBe('+44');
  });

  it('should not add a click-blocking backdrop to the suggestions overlay', async () => {
    component.showSuggestions.set(true);
    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
  });

  it('should expose combobox semantics and an accessible country listbox', async () => {
    const input = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
    const trigger = fixture.nativeElement.querySelector('.country-trigger') as HTMLButtonElement;

    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-label')).toBe('International phone number');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');

    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-label')).toBe('Countries');
  });

  it('should generate unique IDs for separate component instances', async () => {
    const secondFixture = TestBed.createComponent(NgTelInputAutocomplete);
    await secondFixture.whenStable();

    const firstId = (fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement).id;
    const secondId = (secondFixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement).id;

    expect(firstId).not.toBe(secondId);
    secondFixture.destroy();
  });

  it('should use offline emoji flags by default', () => {
    expect(fixture.nativeElement.querySelector('.flag-emoji')?.textContent?.trim()).toBe('🇺🇸');
    expect(fixture.nativeElement.querySelector('img.flag-image')).toBeNull();
  });

  it('should emit null form values while alphabetic contact search text is entered', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    component.onInputChange({ target: { value: 'Asha' } } as unknown as Event);

    expect(component.inputValue()).toBe('Asha');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('should emit a typed object when object value format is configured', async () => {
    const onChange = vi.fn();
    fixture.componentRef.setInput('outputFormat', 'object');
    component.registerOnChange(onChange);
    await fixture.whenStable();

    component.onInputChange({ target: { value: '2025550143' } } as unknown as Event);

    const emitted = onChange.mock.lastCall?.[0] as PhoneNumberValue;
    expect(emitted.countryCode).toBe('US');
    expect(emitted.number).toBe('2025550143');
  });

  it('should support template-driven forms', async () => {
    const hostFixture = TestBed.createComponent(TemplateDrivenHost);
    await hostFixture.whenStable();

    const input = hostFixture.nativeElement.querySelector('#template-phone') as HTMLInputElement;
    expect(input.value).toContain('202');

    input.value = '4155550134';
    input.dispatchEvent(new Event('input'));
    await hostFixture.whenStable();

    expect(hostFixture.componentInstance.phone).toBe('+14155550134');
    hostFixture.destroy();
  });

  it('should render custom selected-country, country, and suggestion templates', async () => {
    const hostFixture = TestBed.createComponent(CustomTemplateHost);
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.custom-selected')?.textContent).toBe('US');

    hostFixture.componentInstance.telephoneInput().isOpen.set(true);
    await hostFixture.whenStable();
    const countryOptions = Array.from(document.querySelectorAll('.custom-country'));
    expect(countryOptions[0]?.textContent).toMatch(/^[A-Z]{2}:false$/);

    hostFixture.componentInstance.telephoneInput().showSuggestions.set(true);
    await hostFixture.whenStable();
    expect(document.querySelector('.custom-suggestion')?.textContent).toBe('0:Asha');

    hostFixture.destroy();
  });
});
