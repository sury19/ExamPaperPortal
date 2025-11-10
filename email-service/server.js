import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const {
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE = 'false',
  FROM_EMAIL
} = process.env;

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  
  // Use Resend SMTP if RESEND_API_KEY is available and no other SMTP is configured
  const useResendSMTP = !SMTP_HOST && process.env.RESEND_API_KEY;
  const host = SMTP_HOST || (useResendSMTP ? 'smtp.resend.com' : 'smtp.gmail.com');
  const port = Number(SMTP_PORT) || 587;
  const secure = String(SMTP_SECURE).toLowerCase() === 'true';
  
  // For Resend SMTP, use 'resend' as user and API key as password
  const user = useResendSMTP ? 'resend' : (SMTP_USER || process.env.SMTP_USER || process.env.GMAIL_USER);
  const pass = useResendSMTP ? process.env.RESEND_API_KEY : (SMTP_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS);
  
  console.log(`Email service configured: host=${host}, port=${port}, user=${user ? '***' : 'none'}`);
  
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: (user && pass) ? {
      user,
      pass
    } : undefined
  });
  return transporter;
}

app.get('/health', async (req, res) => {
  try {
    const trans = getTransporter();
    await trans.verify();
    res.json({ status: 'ok', message: 'Email service is ready' });
  } catch (e) {
    console.error('Health check failed:', e);
    res.status(500).json({ status: 'error', error: String(e) });
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const { to, from, subject, html, text } = req.body || {};
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, (html or text)' });
    }
    
    // Use provided 'from' or fall back to environment variable or default
    const mailFrom = from || FROM_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Paper Portal <no-reply@example.com>';
    
    console.log(`Sending email to: ${to}, from: ${mailFrom}, subject: ${subject}`);
    
    const trans = getTransporter();
    const info = await trans.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
      text
    });
    
    console.log(`Email sent successfully: ${info.messageId}`);
    res.json({ success: true, id: info.messageId });
  } catch (e) {
    console.error('Mailer error:', e);
    res.status(500).json({ error: String(e), details: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Email service listening on http://localhost:${port}`);
});


