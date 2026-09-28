# 🌐 SQLite & Vercel Deployment Architecture Guide

## 1. Where does SQLite lie right now?

Right now, your application is running **locally on your machine**.
The SQLite database file is physically stored at:
```
progress-tracker/data/interview_command_center.db
```

Along with its Write-Ahead Log (WAL) performance files:
- `data/interview_command_center.db-wal` (uncommitted / fast concurrent writes)
- `data/interview_command_center.db-shm` (shared memory index)

### Key properties of your local SQLite database:
1. **Zero Network Latency**: Reads and writes happen in microseconds directly from your local NVMe SSD.
2. **Permanent Persistence**: The database survives application restarts, computer reboots, and browser refreshes.
3. **No External Account Needed**: You don't need AWS, Supabase, Docker, or any credit card to run the command center locally.

---

## 2. If I deploy to Vercel, where will SQLite lie?

### ⚠️ The Problem with Vercel's Serverless Filesystem
Vercel runs Next.js inside **Serverless Functions** (stateless AWS Lambda containers under the hood).
In serverless environments:
- The filesystem is **read-only** (except for `/tmp`).
- If you write a file to `/tmp`, it is **ephemeral**: as soon as your serverless function scales down or a cold start occurs, `/tmp` is wiped clean!
- Different users or requests hit different serverless instances, meaning they wouldn't share the same local `.db` file.

---

## 3. How to Deploy to Vercel: Three Proven Strategies

### Strategy A: Turso (Cloud SQLite via libSQL) — ⭐ Recommended for Vercel

**Turso** is modern SQLite built specifically for Vercel and Edge/Serverless environments. It uses **libSQL** (an open-source fork of SQLite).

- **Why it's perfect**:
  - Uses the **exact same SQLite schema and queries** as your local database.
  - 100% persistent across all Vercel serverless functions worldwide.
  - **Generous Free Tier**: 500 databases, 9 GB storage, 1 billion row reads/month.
  - Official Vercel integration (adds `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` automatically).

#### How to deploy with Turso on Vercel:
1. Create a free account at [turso.tech](https://turso.tech).
2. Install Turso CLI and create a database:
   ```bash
   turso auth signup
   turso db create interview-command-center
   turso db show interview-command-center --url
   turso db tokens create interview-command-center
   ```
3. Push your code to GitHub.
4. Import your GitHub repository into [Vercel](https://vercel.com).
5. Add Environment Variables in Vercel project settings:
   - `TURSO_DATABASE_URL` = `libsql://your-db-name.turso.io`
   - `TURSO_AUTH_TOKEN` = `your_auth_token_here`
6. Deploy! Your SQLite database is now persistent globally.

---

### Strategy B: Deploy as a Container (Railway / Render / Fly.io / VPS)

If you prefer keeping your exact local `interview_command_center.db` file without using any cloud database provider:

Deploy as a Docker container with a **Persistent Volume**:
- **Railway.app** or **Render.com** or **Fly.io**:
  - Mount a volume to `/app/data`.
  - Your SQLite file persists indefinitely on the attached SSD volume.
  - Cost: Free tier or ~$5/month.

#### Example `Dockerfile`:
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["npm", "run", "start"]
```

---

### Strategy C: Vercel Postgres / Supabase / Neon

If you want to stay strictly inside the Vercel ecosystem:
- Add the **Vercel Postgres** or **Supabase** storage integration from your Vercel Dashboard with 1 click.
- Tables match the same relational schema (`topics`, `reviews`, `daily_logs`, `app_settings`).

---

## 4. Local Development vs Production Matrix

| Environment | Database Engine | Location | Survives Restart? | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Local Machine (Now)** | `better-sqlite3` (WAL mode) | `./data/interview_command_center.db` | ✅ Yes (Permanent) | Free ($0) |
| **Vercel + Turso** | `libSQL` (Serverless SQLite) | Cloud SQLite URL (`libsql://...`) | ✅ Yes (Permanent) | Free ($0) |
| **Railway / Fly.io** | `better-sqlite3` (WAL mode) | Persistent SSD Volume (`/data`) | ✅ Yes (Permanent) | Free / $5/mo |
| **Vercel Standalone** | `/tmp` SQLite (Not advised) | Ephemeral serverless container | ❌ No (Wiped on cold start) | Free |
