# Reforming Education on Drugs (RED)

## Prerequisites
- Node.js 18+ and npm (frontend dev server + builds)
- Docker Desktop / Docker Engine with Compose V2 enabled (local Postgres + full-stack containers)
- JDK 21 (or any Java 21 distribution) for running `./mvnw` outside Docker
- AWS CLI v2 (for App Runner deployment commands)
- Gmail account with 2FA + app password for SMTP delivery

## Local Development

### Frontend (Next.js 15 + React 19)
Copy the sample `.env` for the web app:
```bash
cp web/.env.local.example web/.env.local
```
```bash
cd web
npm install
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8080   # or use .env.local
npm run dev
```
App runs at http://localhost:3000.

### Backend (Spring Boot 3.5)
Spring profiles drive the configuration (the root `application.yml` simply sets the active profile and defaults to `dev`):
- `dev` (default): loaded from `application-dev.yml` whenever `SPRING_PROFILES_ACTIVE` is unset. Targets localhost Postgres and ships with sensible mail defaults for local testing and development.
- `prod`: loaded from `application-prod.yml` when `SPRING_PROFILES_ACTIVE=prod`. All settings are pulled from environment variables so you can point at managed infrastructure (RDS, SES/Gmail, etc.).

Optional helper: `cp .env.example .env` if you prefer exporting env vars via `envsubst`/IDE.

**Database only**
- Preferred (persistent volume): `docker compose -f docker/docker-compose.db.yml up -d`
- Quick, ephemeral alternative:
  ```bash
  docker run --rm -d --name red-postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=red_dev \
    -p 5432:5432 \
    postgres:16-alpine
  ```

**Dockerized backend stack (API + Postgres)**
- Build/run both containers with Compose when you want to exercise the app exactly how it will run in AWS (containerized API talking to Postgres). You can keep the default local database, or point `SPRING_DATASOURCE_URL` at an RDS instance if you need to test against cloud data.
  ```bash
  # from repo root
  docker compose -f docker/docker-compose.dev.yml up --build -d
  # view logs: docker compose -f docker/docker-compose.dev.yml logs -f api
  # tear down: docker compose -f docker/docker-compose.dev.yml down -v
  ```
  Compose forwards port `8080` on the host so the frontend can hit `http://localhost:8080`. It also passes through mail/admin env vars from your shell; export them first or copy `.env.example` to `docker/.env` so Compose can auto-load them.

**Environment variables**

| Variable | Purpose | Default (dev) |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | Selects `dev` or `prod` profile | `dev` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL the browser uses to call the API | `http://localhost:8080` |
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/red_dev` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `postgres` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Schema management | `update` |
| `SPRING_MAIL_HOST` / `SPRING_MAIL_PORT` | SMTP settings | `smtp.gmail.com` / `587` |
| `SPRING_MAIL_USERNAME` | Sender Gmail | `reducalgarybookings@gmail.com` |
| `SPRING_MAIL_PASSWORD` | Gmail app password | (set your own app password) |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH` | SMTP auth | `true` |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE/REQUIRED` | TLS | `true` |
| `APP_MAIL_FROM_ADDRESS` | From header | `reducalgarybookings@gmail.com` |
| `APP_MAIL_COPY_ADDRESS` | BCC copy recipient | `reducalgary@gmail.com` |
| `APP_FRONTEND_BASE_URL` | Used for cancel links | `http://localhost:3000` |
| `APP_ADMIN_USERNAME/PASSWORD` | Admin login | `admin` / `admin` |

> These defaults are already baked into `application.yml`; only override them via env vars when you need to point at different infrastructure (RDS, production SMTP, etc.).
>
> Production deployments must specify all of the env vars referenced in `application-prod.yml` (database, mail, admin credentials, etc.) and set `SPRING_PROFILES_ACTIVE=prod`.

> Enable 2FA on the Gmail account and generate an app password; ordinary passwords won’t work.

**Start Spring Boot**
```bash
cd api
./mvnw spring-boot:run
```
Now the API is available at http://localhost:8080 and the frontend can submit bookings locally.

## Deployment

### Frontend (Vercel)
1. Create a Vercel project pointing to the `web/` directory.
2. Set `NEXT_PUBLIC_API_BASE_URL=https://<app-runner-domain>` in Project Settings (Preview + Production scopes).
3. Deploy (`npm run build` / `.next` output).

### Backend (Docker → ECR → App Runner → RDS)
1. **Build & push image**
   ```bash
   AWS_ACCOUNT_ID=<your-account-id>
   AWS_REGION=<your-region>          # e.g., us-east-2
   docker build -t red-api:latest -f docker/Dockerfile.api .
   docker tag red-api:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/red-api:latest
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/red-api:latest
   ```
2. **App Runner service**
   - Source: ECR image above with auto deployments enabled.
   - Health check: HTTP `/availability`.
   - Environment variables & service metadata: copy the example spec and fill in the placeholders (the real file is gitignored so secrets stay local):
     ```bash
     cp apprunner-source-config.example.json apprunner-config.json
     # edit apprunner-config.json with your account ID, RDS URL, Gmail app password, etc.
     ```
   - CLI helper for first-time provisioning (pick your region):
     ```bash
     aws apprunner create-service \
       --cli-input-json file://apprunner-config.json \
       --region us-east-2
     ```
   - Authentication role: `arn:aws:iam::<your-account-id>:role/service-role/AppRunnerECRAccessRole` (or whichever IAM role grants App Runner access to ECR in your account).
3. **Database**
   - Provision RDS Postgres (db.t4g.micro). Ensure App Runner can reach it (public access or VPC connector).
   - Update the App Runner env vars with the RDS host/user/password.
4. **Verify & wire up**
   - Run `aws apprunner describe-service ... --query "Service.ServiceUrl"` to grab the HTTPS URL.
   - Plug that URL into Vercel’s `NEXT_PUBLIC_API_BASE_URL` and redeploy the frontend.

## Features (backend + frontend)
- Booking workflow stores requests in Postgres, emails the requester (and BCCs `reducalgary@gmail.com`), and provides a secure cancellation link.
- `/cancel?token=...` lets requesters cancel; admin portal (`/login`) manages approvals, rejections, availability slots, and status emails.
- App Runner deployment keeps the backend containerized; Vercel serves the React frontend with the correct API base URL baked in.
