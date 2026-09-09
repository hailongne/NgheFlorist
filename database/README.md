# Database import (MySQL)

To import the schema and seed data into MySQL:

```bash
# Create database first (if needed)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ngheflorist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import
mysql -u root -p ngheflorist < database/schema_and_seed.sql
```

Notes:

- Edit `backend/.env.example` to match your DB credentials.
- If using PostgreSQL you must convert AUTO_INCREMENT to SERIAL and adjust syntax (the SQL file includes notes).
