# VideoPlatform — Frontend

A video-sharing platform frontend built with **Next.js, React, and TypeScript**, integrated with a Django REST Framework backend.

## Features

- **Authentication:** User registration, login, and JWT-based authentication.
- **Account Recovery:** Forgot-password and forgot-username workflows.
- **Video Discovery:** Browse videos, search by title or description, filter by category, and explore trending content.
- **Video Playback:** Watch videos and interact through likes, dislikes, comments, and replies.
- **Comment Interactions:** Like, dislike, edit, delete, and report comments, where supported.
- **User Profiles:** View profiles, explore uploaded videos, and manage subscriptions.
- **Creator Dashboard:** Upload videos, edit existing videos, and manage uploaded content.
- **Notifications:** View and manage notifications, including activity from subscribed channels.
- **Account Settings:** Update profile information and manage account preferences.
- **Admin Panel:** Access administrative functionality for managing reported content, where authorized.
- **Responsive Interface:** A component-based interface designed for a video-sharing experience.

## Tech Stack

- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS
- Django REST Framework
- JWT Authentication

## Related Repository

- **Backend:** [VideoPlatform-Backend](https://github.com/Mehr3had/VideoPlatform-Backend)

## Prerequisites

Make sure the following tools are installed:

- Node.js v24.21.0 (tested locally)
- npm 11.19.0 (tested locally)
- Git
- The [VideoPlatform backend](https://github.com/Mehr3had/VideoPlatform-Backend)

The backend must be configured and running for API-dependent features to work.

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

**Security note:** Variables prefixed with `NEXT_PUBLIC_` may be exposed to the browser. Never store passwords, secret keys, or other private credentials in them.

### 4. Start the backend

Follow the setup instructions in the [backend repository](https://github.com/Mehr3had/VideoPlatform-Backend).

Make sure the Django database migrations have been applied and the backend is running at:

```text
http://127.0.0.1:8000
```

### 5. Start the frontend

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

Make sure Django's CORS configuration allows requests from `http://localhost:3000`.

**Note:** The local database and uploaded media files are not included in this repository. You may need to create an account and upload sample videos to test all features.

## Production Build

Create an optimized production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

## Project Structure

```text
src/
├── app/
│   ├── admin/
│   ├── dashboard/
│   │   ├── edit/[id]/
│   │   └── upload/
│   ├── forgot-password/
│   ├── forgot-username/
│   ├── login/
│   ├── notifications/
│   ├── profile/
│   │   ├── [id]/
│   │   └── edit/
│   ├── register/
│   ├── reset-password/
│   ├── settings/
│   ├── videos/[id]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Navbar.tsx
└── lib/
    └── api.ts
```

## Backend Integration

The frontend communicates with the Django REST API. The API base URL is configured through `NEXT_PUBLIC_API_URL` and centralized in `src/lib/api.ts`.

For local development, the frontend and backend typically run on ports `3000` and `8000`, respectively.

The backend must be available for authentication, video operations, comments, subscriptions, notifications, and other API-dependent functionality.

## Project Status

This project is a full-stack learning and portfolio project that combines a Next.js frontend with a Django REST API backend.

The application is under active development.

## License

No license has been specified yet.