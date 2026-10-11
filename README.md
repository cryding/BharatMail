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

## Local development

### API

1. Install Node.js 20+ and PostgreSQL.
2. Open `server/`.
3. Copy `.env.example` to `.env` and fill in local database and SMTP settings.
4. Run `npm install`.
5. Apply `schema.sql` to your PostgreSQL database.
6. Run `npm run dev`.

The `/health` endpoint reports process health. The `/ready` endpoint reports whether database and SMTP configuration are present. A successful readiness check does not by itself prove that email delivery works.

### Web

1. Open `web/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL=http://localhost:8080`.
5. Run `npm run dev`.

The UI's message list is sample data. The compose screen can call the API endpoint, but actual sending requires valid SMTP configuration.

### Android

Open `android/` in Android Studio with JDK 17 and a compatible Android SDK, sync Gradle, then run on an emulator. The default API URL points to the Android emulator host. Configure an HTTPS API endpoint before any remote or public testing. The current compose UI is a prototype and does not yet authenticate users or fetch a live mailbox.

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
