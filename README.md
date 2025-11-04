# Reforming Education on Drugs (RED)

## Booking & Admin Features

- Booking submissions now land in a `pending` state and automatically email the requester their details plus a secure cancellation link.
- Requesters can cancel through the new `/cancel?token=…` page, which keeps availability in sync.
- Admins can sign in via `/login` to review requests, confirm or reject bookings (with appropriate emails), and manage presentation availability.

## Backend configuration

Spring Boot expects the following environment variables (for local development add them to your shell, `.env`, or IDE run configuration):

| Variable | Purpose |
| --- | --- |
| `SPRING_MAIL_USERNAME` | Gmail address used to send messages |
| `SPRING_MAIL_PASSWORD` | Gmail app password (not your main account password) |
| `APP_MAIL_FROM` | From address shown in emails (usually the same as `SPRING_MAIL_USERNAME`) |
| `APP_FRONTEND_BASE_URL` | Base URL for public links (default `http://localhost:3000`) |
| `APP_ADMIN_USERNAME` | Admin login username |
| `APP_ADMIN_PASSWORD` | Admin login password |
| `APP_ADMIN_SESSION_TTL_MINUTES` | Optional TTL for admin sessions (default 240) |

> **Gmail note:** enable 2FA on the account and generate an app password for SMTP access. Standard Gmail passwords are blocked by Google.

## Usage

1. Start the API (`./mvnw spring-boot:run` from `api/`) and the web app (`npm run dev` from `web/`).
2. Submit a booking through `/booking` → `/contact`; the requester receives an email with a cancellation link.
3. Admin visits `/login`, signs in, and manages requests/availability under `/admin`.
