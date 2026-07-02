import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTelInputAutocomplete } from './ng-tel-input-autocomplete';

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
});
