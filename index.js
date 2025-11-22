const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cors = require('cors');

const ADMIN_KEY = process.env.STEIN_ADMIN_KEY || 'Stein23912387aaaas';
const PORT = process.env.PORT || 3000;

const db = new Database('./steinauth.sqlite');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Cria tabela
db.prepare(`
CREATE TABLE IF NOT EXISTS invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  used INTEGER DEFAULT 0,
  created_at TEXT,
  used_at TEXT
)
`).run();

// Gerar código aleatório
function genCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Verificar invite
app.get('/check', (req, res) => {
  const code = req.query.invite;
  if (!code) return res.send('INVALIDO');

  const row = db.prepare('SELECT * FROM invites WHERE code = ?').get(code);
  if (!row) return res.send('INVALIDO');
  if (row.used) return res.send('USADO');
  return res.send('VALIDO');
});

// Marcar invite como usado
app.post('/use', (req, res) => {
  const { invite } = req.body || {};
  if (!invite) return res.json({ error: 'missing' });

  const row = db.prepare('SELECT * FROM invites WHERE code = ?').get(invite);
  if (!row) return res.json({ error: 'INVALIDO' });
  if (row.used) return res.json({ error: 'USADO' });

  const now = new Date().toISOString();
  db.prepare('UPDATE invites SET used = 1, used_at = ? WHERE code = ?').run(now, invite);

  return res.json({ ok: true });
});

// Criar invite (admin)
app.post('/create', (req, res) => {
  const { admin } = req.body || {};
  if (admin !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });

  let code;
  const insert = db.prepare('INSERT INTO invites (code, created_at) VALUES (?, ?)');

  while (true) {
    code = genCode();
    try {
      insert.run(code, new Date().toISOString());
      break;
    } catch (e) {
      continue;
    }
  }

  return res.json({ invite: code });
});

// Listar invites
app.get('/list', (req, res) => {
  const { admin } = req.query;
  if (admin !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });

  const rows = db.prepare('SELECT * FROM invites ORDER BY id DESC').all();
  return res.json(rows);
});

// Teste
app.get('/', (req, res) => res.send('SteinAuth OK'));

app.listen(PORT, () => console.log(`API Stein rodando na porta ${PORT}`));
