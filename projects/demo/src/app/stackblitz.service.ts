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
        template: 'node',
        files: {
          'package.json': `{
  "name": "ng-tel-input-autocomplete-playground",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "ng serve"
  },
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/router": "^21.0.0",
    "@angular/cdk": "^21.2.14",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.15.0",
    "google-libphonenumber": "^3.2.44",
    "intl-tel-input": "^29.1.1",
    "ng-tel-input-autocomplete": "latest"
  },
  "devDependencies": {
    "@angular/build": "^21.2.18",
    "@angular/cli": "^21.0.4",
    "@angular/compiler-cli": "^21.0.0",
    "typescript": "~5.9.2"
  }
}`,
          'angular.json': `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "projects": {
    "demo": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": "dist/demo",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "styles": [
              "src/styles.css"
            ],
            "allowedCommonJsDependencies": [
              "google-libphonenumber"
            ]
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "buildTarget": "demo:build"
          }
        }
      }
    }
  }
}`,
          'tsconfig.json': `{
  "compileOnSave": false,
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "preserve",
    "skipLibCheck": true
  }
}`,
          'tsconfig.app.json': `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts",
    "src/**/*.ts"
  ]
}`,
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
          'src/app/app.component.css': css || '',
        },
      },
      { newWindow: true }
    );
  }
}
