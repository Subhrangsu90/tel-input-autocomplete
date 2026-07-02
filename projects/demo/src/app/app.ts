import { Component, signal } from '@angular/core';
import { NgTelInputAutocomplete } from 'ng-tel-input-autocomplete';

@Component({
  selector: 'app-root',
  imports: [NgTelInputAutocomplete],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('demo');
}
