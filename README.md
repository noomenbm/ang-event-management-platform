# AngEventManagementPlatform

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.19.

## Current Project Status

This course project is being built incrementally. The application currently has the shell, routing, placeholder pages, domain models, API base configuration, and json-server sample data. Event listing, search, filters, booking forms, cancellation, and theme behavior are not implemented yet.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Local API Server

To start json-server with the sample event and booking data, run:

```bash
npm run server
```

The API runs at `http://localhost:3000`.

Useful endpoints include:

```text
GET http://localhost:3000/events
GET http://localhost:3000/events/1
GET http://localhost:3000/bookings?userId=user1
```

## Run Frontend and API Together

To start Angular and json-server at the same time, run:

```bash
npm run dev
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
