import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import pg from 'pg';

const app = express();
const port = Number(process.env.PORT || 8080);
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
const transporter = smtpReady ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
}) : null;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'bharatmail-api', mode: 'starter' }));
app.get('/ready', (_req, res) => {
  const ready = Boolean(pool && transporter);
  res.status(ready ? 200 : 503).json({ ready, databaseConfigured: Boolean(pool), smtpConfigured: Boolean(transporter) });
});

app.post('/v1/messages/send', async (req, res) => {
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
    res.status(202).json({ accepted: true, messageId: info.messageId, response: info.response });
  } catch (error) {
    res.status(502).json({
      error: 'SMTP provider rejected or failed the message.',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Inbound receiving, MIME parsing, mailbox routing, account authentication and user isolation
// are intentionally not claimed as implemented. Do not expose this API to public users yet.
app.listen(port, () => console.log(`BharatMail API listening on ${port}`));
