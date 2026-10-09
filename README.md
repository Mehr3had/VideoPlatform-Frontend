# VideoPlatform — Frontend

A video-sharing platform frontend built with **Next.js, React, and TypeScript**, integrated with a Django REST API backend.

## Features

* **Authentication:** User registration and login with JWT-based authentication.
* **Video browsing:** Browse videos, search content, filter by category, and explore trending videos.
* **Video playback:** Watch videos and interact through likes, dislikes, and comments.
* **User profiles:** View user profiles, browse uploaded videos, and manage subscriptions.
* **Creator dashboard:** Upload videos, edit existing videos, and manage uploaded content.
* **Account settings:** Update profile information and manage account credentials.
* **Responsive interface:** A component-based UI designed for a video-sharing experience.

## Tech Stack

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Django REST Framework backend
* JWT authentication

## Prerequisites

Make sure the following tools are installed:

* Node.js and npm
* Git
* The [VideoPlatform backend](https://github.com/Mehr3had/VideoPlatform-Backend) or a compatible Django API server

> Replace the backend repository link above if your backend repository uses a different URL.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mehr3had/VideoPlatform-Frontend.git
cd VideoPlatform-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

This variable defines the base URL of the Django backend. Update it if your backend runs at a different address.

The frontend uses this variable to construct API endpoints and backend resource URLs.

**Note:** `NEXT_PUBLIC_` variables are exposed to the browser. Never store passwords, secret keys, or private tokens in them.

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Make sure the Django backend is running and its API, authentication, and media settings are configured correctly.

## Production Build

To create an optimized production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Project Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── edit/[id]/
│   │   └── upload/
│   ├── login/
│   ├── profile/
│   │   ├── [id]/
│   │   └── edit/
│   ├── register/
│   ├── settings/
│   └── videos/[id]/
├── components/
│   └── Navbar.tsx
└── lib/
    └── api.ts
```

## Backend Integration

The frontend communicates with a Django REST API. The API base URL is centralized in `src/lib/api.ts`, allowing the backend address to be configured through an environment variable.

For local development, the backend and frontend typically run on ports `8000` and `3000`, respectively. Django must allow requests from the frontend origin through its CORS configuration.

## Status

This project is under development and is intended as a full-stack learning and portfolio project.

## License

No license has been specified yet.
