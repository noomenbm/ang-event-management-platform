# Event Management Platform

Angular course project for browsing events, viewing event details, creating bookings, reviewing bookings, cancelling eligible bookings, and switching between light and dark themes.

## Project Overview

The application is a standalone Angular event management platform backed by JSON Server sample data. It demonstrates client-side routing, API services, reusable components, reactive forms, local UI state, loading and error states, and deployment preparation for a separate frontend and backend.

## Main Features

- Events listing loaded from the API
- Search by event title
- Category, date, and price filters
- Date and price sorting
- Favorite buttons saved in browser localStorage
- Event Details page with organizer and ticket information
- Three-step booking flow
- Ticket quantity selection with real-time totals
- Reactive attendee forms with validation
- Booking confirmation with reference number
- My Bookings page loaded from the API
- Upcoming and Past booking filters
- Cancellation confirmation dialog
- Booking cancellation through `PATCH /bookings/:id`
- Light and dark theme toggle with saved preference
- Loading, error, empty, and success states
- Responsive layouts for desktop, tablet, and mobile

## Technology Stack

- Angular 21
- Angular standalone components
- Angular Router
- Angular Reactive Forms
- Angular HttpClient
- Signals
- JSON Server
- Vitest through Angular test tooling
- CSS custom properties

## Architecture Overview

- `src/app/pages` contains route-level pages.
- `src/app/shared` contains reusable UI pieces such as event cards.
- `src/app/services` contains focused API and application services.
- `src/app/models` contains TypeScript domain models.
- `src/app/config` centralizes API configuration.
- `src/environments` contains local and production API URL settings.
- `backend/db.json` contains JSON Server sample data.

The Angular frontend is a client-side SPA, and the JSON Server backend is hosted separately. Local development uses `http://localhost:3000` for the API.

## Prerequisites

- Node.js compatible with the installed Angular version
- npm
- Git

## Installation

```bash
npm install
```

## Running Locally

Start the Angular frontend:

```bash
npm start
```

Start JSON Server:

```bash
npm run server
```

Start both together:

```bash
npm run dev
```

## Available npm Scripts

```text
npm start       Angular development server
npm run server  Local JSON Server on port 3000
npm run dev     Angular and JSON Server together
npm run build   Production Angular build
npm test        Unit tests
npm run server:prod  JSON Server for hosted backend environments
```

## Local URLs

- Frontend: `http://localhost:4200`
- JSON Server API: `http://localhost:3000`

## JSON Server Endpoints

```text
GET    /events
GET    /events/:id
GET    /bookings?userId=user1
POST   /bookings
PATCH  /bookings/:id
```

Sample user ID:

```text
user1
```

## Project Structure

```text
backend/
  db.json
src/
  app/
    config/
    layout/
    models/
    pages/
    services/
    shared/
  environments/
```

## Testing

Run the test suite:

```bash
npm test -- --watch=false
```

Tests cover API services, event discovery helpers, booking calculations, attendee form behavior, booking submission safeguards, My Bookings filtering and cancellation rules, theme behavior, and API configuration.

## Production Build

Run:

```bash
npm run build
```

Angular writes build output under:

```text
dist/ang-event-management-platform
```

For static frontend hosting, use the browser output:

```text
dist/ang-event-management-platform/browser
```

## Frontend Deployment on Vercel

The Angular frontend is deployed as a static client-side SPA on Vercel. SSR, SSG, and hybrid rendering are not used or required for this course project.

Suggested Vercel settings:

- Build command: `npm run build`
- Output directory: `dist/ang-event-management-platform/browser`
- Install command: `npm install`

The included `vercel.json` rewrites all frontend routes to `index.html` so direct refreshes such as `/events/1`, `/book/1`, and `/bookings` are handled by Angular Router.

After changing `vercel.json`, push the correction to trigger a new Vercel deployment. When the deployment finishes, directly open or refresh `/events/1`, `/book/1`, and `/bookings` to confirm Vercel serves the Angular app instead of a `404 NOT_FOUND` page.

## Backend Deployment on Render

JSON Server must be hosted separately from the Vercel frontend.

Suggested Render settings:

- Build command: `npm install`
- Start command: `npm run server:prod`
- Environment: Node

The production server script binds to `0.0.0.0` and uses the host-provided `PORT`.

Current production backend:

```text
https://ang-event-management-platform.onrender.com
```

## Production API URL

Local development uses:

```text
src/environments/environment.ts
```

Production builds use:

```text
src/environments/environment.production.ts
```

Production is currently configured to use:

```text
https://ang-event-management-platform.onrender.com
```

The app reads the API URL through `src/app/config/api.config.ts`, so API URLs are not scattered through the codebase.

## Screenshots

Screenshots are not included yet. Suggested captures:

- Events listing in light mode
- Events listing in dark mode
- Event Details page
- Booking confirmation
- My Bookings cancellation dialog

## Live Demo

Live demo: not deployed yet.

## Repository

GitHub repository:

```text
https://github.com/noomenbm/ang-event-management-platform
```

## Known Limitations

- No authentication
- Fixed demo user: `user1`
- JSON Server is a demonstration backend
- Ticket availability is not reduced after booking
- Favorite events are stored locally in the current browser only
- No payment processing
