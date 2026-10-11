CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  mailbox_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL DEFAULT '{}',
  subject TEXT NOT NULL DEFAULT '',
  text_body TEXT NOT NULL DEFAULT '',
  message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_mailbox_created_idx
  ON messages(mailbox_address, created_at DESC);

-- This is only a starter schema. Before public use, add users, mailbox ownership,
-- server-enforced tenant isolation, retention rules, audit logs, and attachment storage.
