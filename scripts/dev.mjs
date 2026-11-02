import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const children = [];
const close = (code = 0) => { for (const child of children) if (!child.killed) child.kill('SIGTERM'); process.exit(code); };
children.push(spawn(process.execPath, ['--watch', 'server/index.mjs'], { cwd: root, stdio: 'inherit', env: { ...process.env, API_PORT: process.env.API_PORT || '4174' } }));
children.push(spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(args.length ? args : ['--host', '127.0.0.1', '--port', '4173', '--strictPort'])], { cwd: root, stdio: 'inherit', env: process.env }));
for (const child of children) child.on('error', () => close(1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => close());
for (const child of children) child.on('exit', code => { if (code) close(code); });
