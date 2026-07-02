import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-tel-icon',

  templateUrl: './ng-tel-input-icons.html',
  styleUrls: ['../../styles/ng-tel-input-theme.css', './ng-tel-input-icons.css'],
})
export class NgTelInputIcon {
  name = input.required<
    'search' | 'chevron-down' | 'check' | 'error' | 'close' | 'contact-phone'
  >();
}
