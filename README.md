# NgheFlorist monorepo

Overview and quick commands for local development.

- 📄 **Tài liệu tổng hợp tính năng**: Xem chi tiết tại [docs/TINH_NANG_NGHE_FLORIST.md](docs/TINH_NANG_NGHE_FLORIST.md)

Backend (port 4000):

```bash
cd backend
# install
npm install
# copy .env and run dev server
cp .env.example .env
npm run dev
```

Frontend (port 3000):

```bash
cd frontend
npm install
npm run dev
```

Database:

Import `database/schema_and_seed.sql` into your MySQL database (see `database/README.md`).

Lint & format:

```bash
# backend
cd backend && npm run lint && npm run format
# frontend
cd frontend && npm run lint && npm run format
```
