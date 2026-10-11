# Inbound email — not implemented yet

This directory documents future inbound mail work. The current repository does **not** receive and store email into user mailboxes.

Before enabling inbound delivery, implement:
1. Domain MX configuration and a trusted inbound provider.
2. RFC 5322/MIME parsing, multipart bodies and attachment handling.
3. Recipient validation and verified mailbox routing.
4. Server-side mailbox ownership checks, spam/malware scanning and size limits.
5. Authenticated provider-to-API delivery, retries, bounce handling and observability.

Cloudflare Email Routing forwards inbound messages; it is not a full mailbox or IMAP server. Verify current provider pricing and limitations before choosing any service for a strict ₹0 budget.
