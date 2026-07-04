import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTelInputDropdown } from './ng-tel-input-dropdown';
import { Country } from '../../models/ng-tel-input-autocomplete.types';

const COUNTRIES: Country[] = [
  {
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    format: '',
    placeholder: '(201) 555-0123',
  },
  {
    name: 'India',
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    format: '',
    placeholder: '081234 56789',
  },
  {
    name: 'Egypt',
    code: 'EG',
    dialCode: '+20',
    flag: '🇪🇬',
    format: '',
    placeholder: '010 12345678',
  },
];

async function waitForDeferredScroll(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
}

describe('NgTelInputDropdown', () => {
  let fixture: ComponentFixture<NgTelInputDropdown>;
  let component: NgTelInputDropdown;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    await TestBed.configureTestingModule({
      imports: [NgTelInputDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(NgTelInputDropdown);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'countries');
    fixture.componentRef.setInput('idPrefix', 'phone');
    fixture.componentRef.setInput('items', COUNTRIES.slice(0, 2));
    await fixture.whenStable();
    scrollIntoView.mockClear();
  });

  it('should not scroll back to the active country when more countries are appended', async () => {
    fixture.componentRef.setInput('items', COUNTRIES);
    await fixture.whenStable();
    await waitForDeferredScroll();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('should keep keyboard navigation scrolling the active option into view', async () => {
    fixture.componentRef.setInput('activeIndex', 1);
    await fixture.whenStable();
    await waitForDeferredScroll();

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('should scroll to the active option when the list is replaced', async () => {
    fixture.componentRef.setInput('items', [COUNTRIES[1]]);
    await fixture.whenStable();
    await waitForDeferredScroll();

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });
  it('should escape highlighted result text before rendering with innerHTML', async () => {
    fixture.componentRef.setInput('items', [
      {
        name: '<img src=x onerror=alert(1)>India',
        code: 'IN',
        dialCode: '+91',
        flag: '🇮🇳',
        format: '',
        placeholder: '081234 56789',
      },
    ]);
    fixture.componentRef.setInput('searchQuery', 'India');
    await fixture.whenStable();

    const label = fixture.nativeElement.querySelector('.ngti-primary') as HTMLElement;
    expect(label.querySelector('img')).toBeNull();
    expect(label.textContent).toContain('<img src=x onerror=alert(1)>India');
    expect(label.querySelector('mark')?.textContent).toBe('India');
  });
});

