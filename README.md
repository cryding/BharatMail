# BharatMail 🇮🇳

**Indian-owned email service — national and international email, with a privacy-first approach.**

BharatMail is an open-source development starter for an India-focused email platform. This repository contains a responsive web inbox prototype, a native Android app starter, and a Node.js API scaffold.

## Current status — read before deploying

**This is not a production-ready email service.** The web and Android clients currently display sample messages. The API has an SMTP outbound-send endpoint, but it only works after valid SMTP credentials, a verified sender domain, and a configured database are supplied. It has not been deployed or tested against a real email provider in this repository.

Real inbound mail receiving, MIME parsing, user signup/login, mailbox ownership isolation, secure account recovery, attachment handling, spam filtering, abuse controls, and production security review are not complete.

No domain, hosting, database, or email provider has been purchased or provisioned by this commit. No paid plan or credit has been activated.

## Project structure

- `web/` — React + Vite responsive inbox prototype
- `android/` — native Kotlin + Jetpack Compose starter
- `server/` — Express API, SMTP outbound-send scaffold, PostgreSQL schema
- `cloudflare-inbound/` — inbound-email implementation requirements
- `.github/workflows/ci.yml` — build checks for web, API syntax, and Android

## Local development

### API

1. Install Node.js 20+ and PostgreSQL.
2. Open `server/`.
3. Copy `.env.example` to `.env` and fill in local database and SMTP settings.
4. Run `npm install`.
5. Apply `schema.sql` to your PostgreSQL database.
6. Run `npm run dev`.

The `/health` endpoint reports process health. The `/ready` endpoint reports whether database and SMTP configuration are present, sending is enabled, and a temporary server token is configured. A successful readiness check does not prove that delivery works.

### Outbound sending security gate

Sending is disabled by default: `SMTP_SEND_ENABLED=false`. The starter's temporary server-to-server gate requires `SMTP_SEND_ENABLED=true` and a `SEND_API_TOKEN` of at least 32 characters. Requests must include `Authorization: Bearer <token>`. A rate limit is also enabled.

**This token gate is not end-user authentication. Never place the token in a browser app, Android APK, or public repository.** The web UI does not include this secret and therefore will not send through this gate. Before public use, replace the temporary gate with verified accounts, per-user authorization, quotas, abuse prevention, and audit logging.

### Web

1. Open `web/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL=http://localhost:8080`.
5. Run `npm run dev`.

The UI's message list is sample data. Live inbox fetching and user authentication are not implemented.

### Android

Open `android/` in Android Studio with JDK 17 and a compatible Android SDK, sync Gradle, then run on an emulator. The default API URL points to the Android emulator host. Cleartext traffic is allowed only in the debug manifest; the main manifest disables it. Configure an HTTPS API endpoint before any remote or public testing. The current Compose UI is a prototype and does not yet authenticate users or fetch a live mailbox.

## CI

GitHub Actions is configured to attempt:
- Web dependency installation and production build
- API dependency installation and JavaScript syntax check
- Android debug APK compilation with JDK 17

A workflow being committed does not mean it has passed. Check the repository's Actions tab for the actual run result.

## Strict ₹0 budget

The code and local development workflow can be used without purchasing AI credits or paid plans. A custom domain usually costs money. Provider free tiers have restrictions and may prohibit bulk or public email services. Cloudflare Email Routing forwards inbound messages but is not a full mailbox or IMAP server; verify current pricing and limits before choosing an email provider. Do not claim that the production service is free until the complete provider stack and its limits have been checked.

## Production blockers

Before opening this to public users, implement and independently test:

- Account registration, login, email verification, password reset and recovery
- Server-enforced mailbox ownership and authorization for every message operation
- Inbound mail handling, robust RFC 5322/MIME parsing, recipient validation and safe attachment storage/scanning
- Rate limits, spam/abuse prevention, bounce processing, quotas and monitoring
- SPF, DKIM, DMARC, TLS, backup/restore, deletion/retention policies and incident response
- Privacy policy and applicable legal/compliance requirements
- Automated tests, dependency review and security audit

**Never commit** `.env` files, SMTP credentials, signing keys, database passwords, or production secrets. Do not use this starter to store real users' private email until the missing security controls are implemented and reviewed.

## License

MIT. See [LICENSE](LICENSE).
