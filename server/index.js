import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PHONE_ID = process.env.WHATSAPP_PHONE_ID?.trim();
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
const RECIPIENTS = process.env.WHATSAPP_RECIPIENTS
  ?.split(",")
  .map((item) => item.trim())
  .filter(Boolean) ?? [];
const API_KEY = process.env.WHATSAPP_API_KEY?.trim();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
const SENDER_EMAIL = process.env.SENDER_EMAIL?.trim();

if (!PHONE_ID || !ACCESS_TOKEN) {
  console.warn("WHATSAPP_PHONE_ID or WHATSAPP_ACCESS_TOKEN is not configured.");
}

if (SENDGRID_API_KEY && SENDER_EMAIL) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else if (SENDGRID_API_KEY && !SENDER_EMAIL) {
  console.warn("SENDGRID_API_KEY is set but SENDER_EMAIL is missing.");
}

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    return next();
  }

  const headerKey = req.header("x-api-key");
  if (!headerKey || headerKey !== API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
}

async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    text: { body: text },
  };
  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

app.post("/api/send-whatsapp", requireApiKey, async (req, res) => {
  const { text, recipients } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  const targets = Array.isArray(recipients) && recipients.length ? recipients : RECIPIENTS;
  if (!targets.length) {
    return res.status(400).json({ error: "No recipient numbers configured" });
  }

  try {
    const results = [];
    for (const to of targets) {
      const data = await sendWhatsAppMessage(to, text);
      results.push({ to, data });
    }
    res.json({ ok: true, results });
  } catch (error) {
    const details = error?.response?.data || error?.message || String(error);
    console.error("WhatsApp send failed:", details);
    res.status(500).json({ error: "send_failed", details });
  }
});

app.post('/api/subscribe', requireApiKey, async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'missing_email' });

  // Optionally send a welcome email via SendGrid if configured
  if (SENDGRID_API_KEY && SENDER_EMAIL) {
    try {
      await sgMail.send({
        to: email,
        from: SENDER_EMAIL,
        subject: 'Welcome to The Sunday Reset',
        html: `<p>Thanks for subscribing to The Sunday Reset. You're in.</p>`,
      });
      return res.json({ ok: true, sent: true });
    } catch (err) {
      console.error('SendGrid send failed:', err?.response?.body || err);
      // still return ok so frontend can fallback to local storage
      return res.status(502).json({ error: 'send_failed' });
    }
  }

  // If SendGrid not configured, return ok so frontend can proceed with local save
  res.json({ ok: true, sent: false });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
