import { Injectable } from '@angular/core';
import sdk from '@stackblitz/sdk';

@Injectable({
  providedIn: 'root',
})
export class StackblitzService {
  openExample(title: string, html: string, ts: string, css: string = '') {
    sdk.openProject(
      {
        title: `${title} - ng-tel-input-autocomplete`,
        description: `Live interactive playground for: ${title}`,
        template: 'angular-cli',
        dependencies: {
          '@angular/common': '^21.0.0',
          '@angular/core': '^21.0.0',
          '@angular/compiler': '^21.0.0',
          '@angular/forms': '^21.0.0',
          '@angular/platform-browser': '^21.0.0',
          '@angular/router': '^21.0.0',
          '@angular/cdk': '^21.2.14',
          'rxjs': '~7.8.0',
          'tslib': '^2.3.0',
          'zone.js': '~0.15.0',
          'google-libphonenumber': '^3.2.44',
          'intl-tel-input': '^29.1.1',
          'ng-tel-input-autocomplete': '^0.0.1',
        },
        files: {
          'src/index.html': `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - ng-tel-input-autocomplete</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
  </style>
</head>
<body>
  <app-root></app-root>
</body>
</html>`,
          'src/main.ts': `import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { provideNgTelInputAutocomplete } from 'ng-tel-input-autocomplete';

bootstrapApplication(App, {
  providers: [
    provideNgTelInputAutocomplete({
      defaultCountry: 'US',
      flagMode: 'emoji',
      validationEnabled: true,
      size: 'small',
    })
  ]
}).catch(err => console.error(err));
`,
          'src/styles.css': `/* Global Styles */
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 2rem;
  background-color: #f4f9f5;
  color: #1a2e1f;
}

${css}`,
          'src/app/app.component.html': html,
          'src/app/app.component.ts': ts,
        },
      },
      { newWindow: true }
    );
  }
}
