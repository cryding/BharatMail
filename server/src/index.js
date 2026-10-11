import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import pg from 'pg';
import { timingSafeEqual } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 8080);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

const pool = process.env.DATABASE_URL ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined
}) : null;

const smtpReady = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM']
  .every(key => Boolean(process.env[key]) && !String(process.env[key]).includes('CHANGE_ME'));
const sendEnabled = process.env.SMTP_SEND_ENABLED === 'true';
const sendToken = process.env.SEND_API_TOKEN || '';
const transporter = smtpReady ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
}) : null;

const sendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many send attempts. Try again later.' }
});

function hasValidToken(header) {
  if (!sendToken || typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(sendToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'bharatmail-api', mode: 'starter' }));
app.get('/ready', (_req, res) => {
  const ready = Boolean(pool && transporter && sendEnabled && sendToken.length >= 32);
  res.status(ready ? 200 : 503).json({
    ready,
    databaseConfigured: Boolean(pool),
    smtpConfigured: Boolean(transporter),
    sendingEnabled: sendEnabled,
    sendTokenConfigured: sendToken.length >= 32
  });
});

app.post('/v1/messages/send', sendLimiter, async (req, res) => {
  // This is a temporary server-to-server gate, not user authentication.
  // Never expose this endpoint to a public browser app using a shared secret.
  if (!sendEnabled) return res.status(503).json({ error: 'Sending is disabled until secure account authentication is implemented.' });
  if (!hasValidToken(req.get('authorization'))) return res.status(401).json({ error: 'Unauthorized.' });

  const { to, subject, text } = req.body || {};
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ||
      typeof subject !== 'string' || !subject.trim() ||
      typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Valid to, subject and text are required.' });
  }
  if (!transporter) return res.status(503).json({ error: 'SMTP is not configured. No email was sent.' });

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM, to,
      subject: subject.slice(0, 200), text: text.slice(0, 50000)
    });
    if (pool) {
      await pool.query(
        `INSERT INTO messages(direction, mailbox_address, from_address, to_addresses, subject, text_body, message_id)
         VALUES('outbound', $1, $2, $3, $4, $5, $6)`,
        [process.env.MAIL_FROM, process.env.MAIL_FROM, [to], subject.slice(0, 200), text.slice(0, 50000), info.messageId]
      );
    }
    res.status(202).json({ accepted: true, messageId: info.messageId });
  } catch {
    res.status(502).json({ error: 'SMTP provider rejected or failed the message.' });
  }
});

// Inbound receiving, MIME parsing, mailbox routing, user authentication and mailbox isolation
// are not implemented. Do not expose this API as a public email service.
app.listen(port, () => console.log(`BharatMail API listening on ${port}`));
