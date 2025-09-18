import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = new Database('tiny.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TRIGGER IF NOT EXISTS trg_items_updated_at
  AFTER UPDATE ON items
  FOR EACH ROW
  BEGIN
    UPDATE items SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`);

const rowToDto = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// GET /items - list all
app.get('/items', (req, res) => {
  const stmt = db.prepare('SELECT * FROM items ORDER BY id DESC');
  const rows = stmt.all().map(rowToDto);
  res.json(rows);
});

// GET /items/:id - get by ID
app.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  const row = stmt.get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(rowToDto(row));
});

// POST /items - create
app.post('/items', (req, res) => {
  const { name, description = '' } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Field "name" is required (string).' });
  }
  const insert = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
  const info = insert.run(name, description);
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(rowToDto(row));
});

// PUT /items/:id - full update
app.put('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description = '' } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Field "name" is required (string).' });
  }
  const exists = db.prepare('SELECT 1 FROM items WHERE id = ?').get(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });

  const update = db.prepare('UPDATE items SET name = ?, description = ? WHERE id = ?');
  update.run(name, description, id);
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  res.json(rowToDto(row));
});

// DELETE /items/:id - delete
app.delete('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const del = db.prepare('DELETE FROM items WHERE id = ?');
  const info = del.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Health
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'tiny-crud-sqlite', endpoints: ['/items'] });
});

app.listen(PORT, () => {
  console.log(`Tiny CRUD running on http://localhost:${PORT}`);
});
