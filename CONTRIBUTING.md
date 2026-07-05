# Contributing to tel-input-autocomplete

Thank you for your interest in contributing to this project! Below are guidelines to help you get started with development, building, testing, and submitting code changes.

## Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Subhrangsu90/tel-input-autocomplete.git
   cd tel-input-autocomplete
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Demo Application:**
   ```bash
   npm start
   ```
   This starts the development server for the demo app at `http://localhost:4200/`.

## Project Structure

This is an Angular workspace:
- `projects/ng-tel-input-autocomplete/` contains the core library.
- `src/` (or project-specific demo folders) contains the demo application used to showcase and test the library.

## Available Scripts

- **`npm start`**: Run the demo application in development mode.
- **`npm run build`**: Build both the library and the demo application.
- **`npm run build:lib`**: Build only the `ng-tel-input-autocomplete` library.
- **`npm run test`**: Run tests for both the library and the demo application.
- **`npm run test:lib`**: Run unit tests for the library.
- **`npm run verify:lib`**: Runs tests, builds the library and demo, and dry-runs packaging to verify release readiness.

## Pull Request Guidelines

1. **Create a Branch**: Create a feature or bugfix branch off `master` or `main`.
2. **Write Tests**: Ensure any bugfix or new feature has corresponding unit tests under `projects/ng-tel-input-autocomplete/src/lib/**/*.spec.ts`.
3. **Verify Everything**: Run `npm run verify:lib` to ensure all tests pass and builds succeed.
4. **Submit PR**: Open a Pull Request on GitHub and describe your changes.
