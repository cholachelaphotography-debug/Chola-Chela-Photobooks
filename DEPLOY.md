# Deploy Chola Chela Photo Books to the Internet

This guide uses **Vercel** (website) + **Neon** (database). Both have free tiers.

---

## Step 1 — Create a Neon database (free)

1. Go to https://neon.tech and sign up (GitHub login is fine)
2. Create a new project (name it e.g. `chola-chela`)
3. Copy the **connection string** (it looks like):
   `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

---

## Step 2 — Prepare the project for Postgres

In `prisma/schema.prisma`, change only this part:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

(Change `sqlite` → `postgresql`)

---

## Step 3 — Push the code to GitHub

1. Create a new repository on GitHub (e.g. `chola-chela-photobooks`)
2. In your project folder, run:

```bash
git init
git add .
git commit -m "Ready for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chola-chela-photobooks.git
git push -u origin main
```

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com and sign up (GitHub login)
2. Click **Add New Project** → import your GitHub repo
3. Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` (you can update after first deploy) |
| `NEXTAUTH_SECRET` | Any long random string (e.g. run `openssl rand -base64 32`) |

4. Click **Deploy**

---

## Step 5 — Create the database tables

After the first deploy succeeds:

1. In your local project (with `DATABASE_URL` set to the Neon URL temporarily), run:

```bash
npx prisma db push
```

Or use Neon’s SQL editor to run migrations later.

2. Make yourself admin again on the production database:

```bash
# Set DATABASE_URL to Neon first, then:
node scripts/make-admin.js cholachelaphotography@gmail.com
```

---

## Step 6 — Update NEXTAUTH_URL

1. In Vercel → Project → Settings → Environment Variables  
2. Set `NEXTAUTH_URL` to your real URL, e.g. `https://chola-chela-photobooks.vercel.app`
3. Redeploy (Deployments → … → Redeploy)

---

## After deploy

- Your site will be live at `https://something.vercel.app`
- Clients can register, upload photos, create books, and place orders
- You manage orders at `/admin`

---

## Notes

- Free Vercel + Neon is enough to start
- Photos are still stored as data URLs until Cloudinary is added (fine for testing; switch later for production volume)
- Custom domain (e.g. cholachela.com) can be added in Vercel later
