'use strict';

const readline = require('readline');
const { signToken } = require('../api/admin');

// Validity per role, in days (02-§91.30).
const ROLE_DAYS = { admin: 60, superadmin: 180 };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  const secret = process.env.ADMIN_TOKEN_SECRET || '';

  console.log('');
  console.log('Skapa admin-token');
  console.log('─────────────────');
  console.log('');

  if (!secret) {
    console.error('Fel: ADMIN_TOKEN_SECRET är inte satt.');
    console.error('');
    console.error('Generera en hemlighet en gång och lägg den i .env (samt på servern');
    console.error('och i GitHub Environments för QA/Produktion):');
    console.error('');
    console.error('  openssl rand -base64 48');
    console.error('');
    rl.close();
    process.exit(1);
  }
  if (secret.length < 32) {
    console.warn('Varning: ADMIN_TOKEN_SECRET är kortare än 32 tecken — använd ett');
    console.warn('långt slumpmässigt värde för att skydda tokensignaturerna.');
    console.warn('');
  }

  const rawName = await ask('Namn på admin: ');
  // Hyphen-separated identifier, no underscores (underscore is the token
  // field delimiter, so the name must never contain one).
  const name = rawName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-zåäö0-9-]/g, '');
  if (!name) {
    console.error('\nFel: namn krävs (a-ö, siffror, bindestreck).');
    rl.close();
    process.exit(1);
  }

  const rawRole = (await ask('Roll [admin/superadmin] (admin): ')).trim().toLowerCase();
  rl.close();
  const role = rawRole || 'admin';
  if (!Object.prototype.hasOwnProperty.call(ROLE_DAYS, role)) {
    console.error(`\nFel: okänd roll "${role}". Välj admin eller superadmin.`);
    console.error('(Rollen "early" delas ut separat; superadmin skapas bara här, aldrig i webb-UI.)');
    process.exit(1);
  }

  const days = ROLE_DAYS[role];
  const expirySeconds = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
  const token = signToken(name, role, expirySeconds, secret);
  const expiryDate = new Date(expirySeconds * 1000).toISOString().slice(0, 10);

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`  Token: ${token}`);
  console.log('');
  console.log('  SPARA DENNA TOKEN NU — den visas inte igen.');
  console.log(`  Roll: ${role} — giltig till ${expiryDate} (${days} dagar)`);
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Inget behöver läggas till i miljövariabler — token valideras mot');
  console.log('ADMIN_TOKEN_SECRET. Ge bara tokenen till rätt person.');
  console.log('');
  console.log(`Ge tokenen till ${rawName.trim()} — hen aktiverar den på /token.html`);
  console.log('');
}

main();
