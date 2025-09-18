# REST
Super kleine Express + SQLite CRUD-App (eine Entity: `items`).

## Setup
```bash
npm install
npm start
```

Läuft standardmäßig auf `http://localhost:3000` und erstellt eine `tiny.db` im Projektordner.

## Endpunkte
- `GET /items` – Liste aller Items
- `GET /items/:id` – Ein Item
- `POST /items` – Neues Item anlegen
  - Body (JSON): `{ "name": "Apfel", "description": "Grün" }`
- `PUT /items/:id` – Item vollständig aktualisieren
  - Body (JSON): `{ "name": "Birne", "description": "Saftig" }`
- `DELETE /items/:id` – Item löschen