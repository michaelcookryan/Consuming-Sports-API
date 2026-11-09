# Team Pool

A React-based NFL team draft and standings application built with Firebase and the MySportsFeeds API.

Originally developed for a private football pool, the application supports NFL team drafting, season standings, and administrative draft management. This repository contains a **sanitized portfolio snapshot**: production configuration and original branding assets are not included.

## Features

- NFL team drafting and participant team assignments
- Season standings and team performance information
- Real-time updates using Cloud Firestore listeners
- Firebase Authentication for administrative access
- Draft administration and seasonal reset functionality
- NFL statistics retrieved through MySportsFeeds
- Responsive interface built with React and SCSS

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 16, JavaScript, React Router 6 |
| Styling | SCSS |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| NFL data | MySportsFeeds API |
| API integration | Axios, Node.js proxy |
| Deployment | Netlify, Netlify Functions |
| Build tooling | Create React App 5 |

## Architecture

The React frontend uses Firebase Authentication and Firestore for application data and real-time updates. NFL data is retrieved through a server-side proxy rather than directly from the browser.

```text
React application
    |
    +-- Firebase Authentication
    |
    +-- Cloud Firestore
    |
    +-- /api/mysportsfeeds
            |
            +-- Node.js server or Netlify Function
                    |
                    +-- MySportsFeeds API
```

The proxy keeps MySportsFeeds Basic Auth credentials on the server and avoids direct cross-origin requests from the browser. Firebase browser configuration is not a server-side secret; access to Firestore data must be protected through appropriate Authentication and Security Rules.

## Getting started

### Prerequisites

- Node.js and npm
- A separate Firebase project configured for this application
- MySportsFeeds API credentials

This snapshot compiled successfully with **Node.js 22.23.4**.

### Install dependencies

```bash
npm ci
```

### Configure the environment

Copy the supplied example configuration and replace its placeholders with values for your own development environment:

```bash
cp .env.example .env.development.local
```

The example includes Firebase browser settings, NFL season settings, and MySportsFeeds credentials used by the server-side proxy. **Do not use production credentials or commit local environment files.**

### Start the development server

```bash
npm start
```

Create React App uses `src/setupProxy.js` to forward `/api/mysportsfeeds` requests through the local development server. Data-dependent features require properly configured Firebase services and MySportsFeeds credentials.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Main application and standings |
| `/draft` | NFL team draft |
| `/signin` | Authentication |

## Season configuration

- `REACT_APP_SEASON` selects the NFL season used for API requests.
- `REACT_APP_SEASON_OPENS` supplies the season start timestamp in milliseconds.
- `draftDay` in `src/App.js` is a hardcoded draft timestamp.

The snapshot retains the original **September 4, 2025** draft timestamp to preserve the existing implementation. Review these values when configuring a different season.

The original seasonal `LoadTeams` administrative utility is retained but disabled. It is not a verified setup procedure for a new Firebase environment.

## Production build and deployment

Build the React application:

```bash
npm run build
```

### Standalone Node.js server

```bash
npm run start:prod
```

`server.js` serves the compiled React application and proxies MySportsFeeds requests. Configure `MYSPORTSFEEDS_API_KEY` and `MYSPORTSFEEDS_PASSWORD` in the server environment. If the proxy is hosted separately from the frontend, configure `REACT_APP_API_BASE_URL` in the frontend build and `CORS_ALLOW_ORIGIN` on the proxy.

### Netlify

The repository includes `netlify.toml` and `netlify/functions/mysportsfeeds.js`. Netlify serves `build/` and rewrites `/api/mysportsfeeds/*` requests to the serverless function. Set MySportsFeeds credentials as server-side environment variables in Netlify.

## Portfolio snapshot notes

This repository demonstrates an existing application's architecture and implementation; it is **not** a ready-to-use public NFL pool. The snapshot replaces original branding and proprietary fonts, excludes private configuration, and retains season-specific application logic. A separate Firebase environment and MySportsFeeds credentials are required for full functionality.

A production build completed successfully, but external integrations and Firebase security configuration have not been independently validated in a new environment.

## Disclaimer

This independently developed personal project is not affiliated with, endorsed by, or sponsored by the National Football League or any of its teams. NFL-related names and trademarks belong to their respective owners.
