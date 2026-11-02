import { createApp } from './app.mjs';
import { closeDb } from './db.mjs';
import { startInquiryWorker } from './inquiries.mjs';

const port = Number(process.env.PORT || process.env.API_PORT || 4174);
const host = process.env.HOST || '127.0.0.1';
const server = createApp().listen(port, host, () => console.log(`studio API: http://${host}:${port}`));
const outbox = startInquiryWorker();
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  if (stopping) return;
  stopping = true;
  const stopped = outbox.stop();
  server.close(async () => { await stopped; closeDb(); process.exit(0); });
});
