# DEIG CRS - Federal Integrity Framework
### Integrated Anti-Corruption Protocol & Institutional Oversight Portal

An institutional-grade, multilingual corruption reporting system with anonymous submission, end-to-end case tracking, real-time analytics, and investigator oversight.

---

## 🚀 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Recharts
- **Backend**: Node.js, Express, Socket.io (real-time telemetry)
- **Database**: MySQL (via `mysql2` connection pooling)
- **ORM / Schema**: Drizzle ORM (`drizzle-kit`) with auto-table initialization on startup
- **Deployment Ready**: GitHub CI/CD, Render (`render.yaml` Blueprint)

---

## 📋 Step 1: Push to GitHub

Follow these steps to publish your project to GitHub:

### 1. Initialize Git and Commit
```bash
git init
git add .
git commit -m "Initial commit: DEIG CRS with MySQL and Render support"
```

### 2. Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (for example: `deig-crs`).
3. Leave **"Initialize this repository with a README"** **unchecked** (we already have one).
4. Click **Create repository**.

### 3. Connect and Push
```bash
# Rename branch to main
git branch -M main

# Add your GitHub repository as remote (replace with your actual GitHub username and repo)
git remote add origin https://github.com/ayu-bit/deig-crs.git

# Push code to GitHub
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Render with MySQL

You can host the web application on **Render** (as a Web Service) connected to your **MySQL database**.

### Where to host your MySQL database:
Render offers managed PostgreSQL and Redis, but you can connect any MySQL database to your Render service. Popular free & managed cloud MySQL options include:
- **TiDB Cloud** (Free forever Serverless tier, 100% MySQL compatible)
- **Aiven for MySQL** (Free tier available)
- **Clever Cloud** (Free 20MB MySQL addon)
- **Railway** / **Amazon RDS** / **PlanetScale**

---

### Option A: 1-Click Blueprint Deploy on Render (Recommended)

1. Log into your account at [render.com](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Select your GitHub repository (`deig-crs`).
4. Render will automatically detect `render.yaml` and configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/api/health`
5. When prompted for environment variables, fill in:
   - `DATABASE_URL`: `mysql://username:password@hostname:port/database_name`
   - `MYSQL_SSL`: `true` (if your cloud provider requires SSL)
6. Click **Apply**. Render will build and deploy your app!

---

### Option B: Manual Web Service Setup on Render

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following fields:
   - **Name**: `deig-crs`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `mysql://<username>:<password>@<host>:<port>/<dbname>`
   - `MYSQL_SSL`: `true` (if using cloud MySQL)
6. Click **Create Web Service**.

> **Note on Special Characters:** If your MySQL password contains special characters such as `@`, `:`, or `/`, URL-encode them in `DATABASE_URL` (e.g. `@` becomes `%40`, `#` becomes `%23`).

---

## 🗄 Automatic Database Initialization

When the server starts on Render:
- It automatically verifies and executes `CREATE TABLE IF NOT EXISTS` for all tables:
  - `reports` (case tracking, descriptions, encrypted evidence, anonymous flags)
  - `users` (investigator authentication)
  - `categories` (corruption categories)
  - `industries` (target sectors)
  - `departments` (institutional departments)
- It seeds initial corruption categories and departments if the database is newly created.
- No manual SQL scripts or DDL migrations are required to get started!

---

## 🛠 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local MySQL connection string

# 3. Start development server (frontend + backend with HMR)
npm run dev

# 4. Optional: Push schema changes or open Drizzle Studio
npm run db:push
npm run db:studio
```

---

## 🧪 Verification & Build Check

```bash
# Verify TypeScript types and build
npm run lint
npm run build
```
# deig-crs
