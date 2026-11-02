import { createApp } from './app.mjs';
import { closeDb } from './db.mjs';

const port = Number(process.env.PORT || process.env.API_PORT || 4174);
const host = process.env.HOST || '127.0.0.1';
const server = createApp().listen(port, host, () => console.log(`studio API: http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { closeDb(); process.exit(0); }));
