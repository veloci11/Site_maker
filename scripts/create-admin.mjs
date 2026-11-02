import { createAdminUser } from '../server/auth.mjs';
import { closeDb } from '../server/db.mjs';

function argumentsFor(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--email', '--name'].includes(argv[i]) || !argv[i + 1] || argv[i + 1].startsWith('--') || parsed[argv[i]]) throw new Error('Usage : node scripts/create-admin.mjs --email adresse --name "Nom"');
    parsed[argv[i]] = argv[i + 1];
  }
  if (!parsed['--email'] || !parsed['--name']) throw new Error('Indiquez --email et --name. Aucun mot de passe ne doit être passé en argument.');
  return { email: parsed['--email'], name: parsed['--name'] };
}

function hiddenPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Un terminal interactif est nécessaire, ou fournissez STUDIO_ADMIN_PASSWORD depuis votre gestionnaire de secrets.');
  process.stdout.write(prompt);
  const wasRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    function finish(error) {
      process.stdin.removeListener('data', read);
      process.stdin.setRawMode(wasRaw || false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error); else resolve(value);
    }
    function read(chunk) {
      for (const character of chunk) {
        if (character === '\u0003' || character === '\u0004') return finish(new Error('Création annulée.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') value = Array.from(value).slice(0, -1).join('');
        else if (character >= ' ' && character !== '\u001b') value += character;
      }
    }
    process.stdin.on('data', read);
  });
}

try {
  const identity = argumentsFor(process.argv.slice(2));
  let password = process.env.STUDIO_ADMIN_PASSWORD;
  delete process.env.STUDIO_ADMIN_PASSWORD;
  if (password === undefined) {
    password = await hiddenPassword('Mot de passe administrateur (12 caractères minimum) : ');
    const confirmation = await hiddenPassword('Confirmer le mot de passe : ');
    if (password !== confirmation) throw new Error('Les deux mots de passe sont différents.');
  }
  const user = await createAdminUser({ ...identity, password });
  password = undefined;
  process.stdout.write(`Compte administrateur créé : ${user.email}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
} finally { closeDb(); }
