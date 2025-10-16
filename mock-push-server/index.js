import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const subs = new Set();

const PUB  = process.env.VAPID_PUBLIC_KEY;
const PRIV = process.env.VAPID_PRIVATE_KEY;
const SUBJ = process.env.VAPID_SUBJECT || 'mailto:admin@rentag.ru';

if (!PUB || !PRIV) {
  console.error('Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
  process.exit(1);
}
webpush.setVapidDetails(SUBJ, PUB, PRIV);

app.post('/api/push-subscriptions', (req, res) => { subs.add(req.body); res.json({ ok: true }); });

app.post('/api/push-test', async (req, res) => {
  const payload = {
    title: 'Rentag',
    body: 'Тестовое уведомление',
    icon: '/assets/icons/icon-192x192.png',
    url: req.body?.url || '/notifications',
    deeplink: req.body?.url || '/notifications',
    meta: { kind: 'test' }
  };
  const results = [];
  for (const s of subs) {
    try { await webpush.sendNotification(s, JSON.stringify(payload)); results.push({ ok: true }); }
    catch (e) { results.push({ ok: false, error: String(e) }); }
  }
  res.json({ sent: results.length, results });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Mock push server on :' + port));
