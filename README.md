# VideoPlatform — Frontend

A modern video-sharing platform frontend built with **Next.js, React, and TypeScript**, integrated with a Django REST Framework backend.

VideoPlatform is a full-stack learning and portfolio project inspired by platforms such as YouTube and Aparat. It provides video discovery, playback, creator tools, user interactions, notifications, and administrative features.

## Features

### Authentication & Account Management
- User registration and login.
- JWT-based authentication.
- Forgot-password and account recovery workflows.
- Password and username management.
- Account deletion.
- Profile editing and account settings.

### Video Discovery & Playback
- Browse and search videos.
- Filter videos by category.
- Explore trending content.
- Custom video player with playback controls.
- Selectable video quality options (480p, 720p, and 1080p when available).
- Playback speed controls.
- Subtitle support.
- Double-tap seeking and playback controls.
- Persistent playback progress.
- Remaining-time and elapsed-time display.

### User Interaction
- Like and dislike videos.
- Write comments and nested replies.
- Like and dislike comments.
- Edit and delete comments.
- Report inappropriate comments.
- Subscribe to channels and manage subscriptions.

### Creator Dashboard
- Upload videos and thumbnails.
- Edit video information.
- Manage uploaded videos.
- Dedicated success pages for completed actions.

### Notifications
- Notifications for subscriptions and channel activity.
- Video likes and comment interactions.
- Reply and comment-like notifications.
- Notification management and read status.

### Administration
- Admin dashboard.
- View and manage reported comments.
- Review, dismiss, or take action on reports.
- Report statistics and filtering.

### Interface & Architecture
- Responsive user interface.
- Light and dark appearance modes.
- Appearance preferences.
- Component-based architecture.
- Custom React hooks for separating UI and application logic.
- Centralized API communication.
- State management for shared application features.

## Tech Stack

- **Next.js 16** — App Router
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios** — HTTP requests
- **TanStack Query** — Server-state management
- **Zustand** — Client-state management
- **Video.js** — Video playback
- **Django REST Framework** — Backend API
- **JWT** — Authentication

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

This variable defines the base URL of the Django backend.

Update it if your backend runs at a different address.

**Security note:** Variables prefixed with `NEXT_PUBLIC_` may be exposed to the browser. Never store passwords, secret keys, or private credentials in them.

### 4. Start the backend

Follow the setup instructions in the [backend repository](https://github.com/Mehr3had/VideoPlatform-Backend).

Make sure database migrations have been applied and the backend is running at:

```text
http://127.0.0.1:8000
```

### 5. Start the frontend

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

Make sure the Django CORS configuration allows requests from `http://localhost:3000`.

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
│   │   ├── edit/
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
│   └── videos/
│       └── [id]/
├── components/
│   ├── admin/
│   ├── auth/
│   ├── comments/
│   ├── dashboard/
│   ├── notifications/
│   ├── profile/
│   ├── providers/
│   ├── settings/
│   └── videos/
├── context/
├── hooks/
├── i18n/
├── lib/
├── stores/
└── types/
```

### Architecture Overview

- **app/** — Next.js routes and pages.
- **components/** — Reusable UI components organized by feature.
- **hooks/** — Custom hooks for application logic and data fetching.
- **context/** — Shared React context.
- **i18n/** — Translation resources.
- **lib/** — API clients and shared utilities.
- **stores/** — Zustand stores for shared client-side state.
- **types/** — TypeScript interfaces and types.

## Backend Integration

The frontend communicates with the Django REST API.

The API base URL is configured through `NEXT_PUBLIC_API_URL` and centralized in `src/lib/api.ts`.

For local development, the frontend and backend typically run on ports `3000` and `8000`, respectively.

The backend must be available for authentication, video operations, comments, subscriptions, notifications, and other API-dependent functionality.

---

This project is a full-stack learning and portfolio project combining a Next.js frontend with a Django REST API backend.

The application is under active development.

## License

No license has been specified yet.