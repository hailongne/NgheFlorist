# NgheFlorist backend (Node + TypeScript)

Quick start:

1. Install dependencies

```bash
cd backend
npm install
```

2. Copy env and configure DB

```bash
cp .env.example .env
# edit .env with your DB credentials
```

3. Start dev server

```bash
npm run dev
```

Notes:

- The server exposes `GET /api/health` and `GET /api/products` (reads from the `products` table).
- Replace auth stub with real bcrypt + JWT flow before production.
- Import the SQL schema in `../database/schema_and_seed.sql` into your MySQL instance.
