# 🚀 Panduan Deploy ke Vercel

## Prerequisites
- ✅ Database sudah di Neon (PostgreSQL cloud)
- ✅ Directus sudah dihapus semua
- ✅ Prisma schema sudah update

---

## Opsi 1: Deploy Via Vercel Dashboard (Termudah)

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit - APM Portal"
git remote add origin https://github.com/username/apm-portal.git
git push -u origin main
```

### 2. Import di Vercel
1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik **"Add New Project"**
4. Import repository `apm-portal`
5. Framework akan terdeteksi otomatis: **Next.js**

### 3. Configure Environment Variables
Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

#### **Production & Preview & Development:**
```
DATABASE_URL=postgresql://username:password@ep-xxx-pooler.aws.neon.tech/apm_portal?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx.aws.neon.tech/apm_portal?sslmode=require
NEXTAUTH_SECRET=generate-random-32-char-string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=APM Portal
NODE_ENV=production
```

> ⚠️ **PENTING:**
> - `DATABASE_URL` = Neon **Pooled** connection (hostname ada `-pooler`)
> - `DIRECT_URL` = Neon **Direct** connection (tanpa `-pooler`)
> - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`

### 4. Deploy
Klik **"Deploy"** dan tunggu ~2-3 menit.

---

## Opsi 2: Deploy Via Vercel CLI (Untuk Developer)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
http://localhost:3000/
```

### 3. Deploy
```bash
# Dari root project
vercel

# Atau langsung production
vercel --prod
```

CLI akan:
- Otomatis detect Next.js
- Upload files
- Build di cloud
- Return deployment URL

### 4. Set Environment Variables via CLI
```bash
vercel env add DATABASE_URL production
# Paste value: postgresql://...pooler...

vercel env add DIRECT_URL production
# Paste value: postgresql://...

vercel env add NEXTAUTH_SECRET production
# Paste generated secret

# Ulangi untuk preview & development
```

### 5. Redeploy Setelah Add ENV
```bash
vercel --prod
```

---

## Cara Dapatkan Neon Connection Strings

### 1. Login ke Neon Console
https://console.neon.tech

### 2. Pilih Project & Database
Klik project `apm_portal` (atau nama lain)

### 3. Copy Connection Strings

#### Pooled (untuk DATABASE_URL):
```
postgresql://username:password@ep-xxx-pooler.us-east-1.aws.neon.tech/apm_portal?sslmode=require
```
Ciri: ada **`-pooler`** di hostname

#### Direct (untuk DIRECT_URL):
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/apm_portal?sslmode=require
```
Ciri: **tanpa** `-pooler`

---

## Troubleshooting Vercel + Neon

### 1. Build Error: "Can't reach database server"
**Penyebab:** Prisma migration jalan di build time tapi `DIRECT_URL` belum di-set.

**Fix:**
- Pastikan `DIRECT_URL` ada di Environment Variables
- Redeploy: `vercel --prod` atau trigger redeploy di dashboard

### 2. Runtime Error: "Connection pool timeout"
**Penyebab:** Pakai direct connection untuk app (harusnya pooled).

**Fix:**
- Pastikan `DATABASE_URL` pakai hostname yang **ada `-pooler`**
- Redeploy

### 3. "Environment variables not found"
**Penyebab:** ENV baru ditambahkan tapi deployment lama belum update.

**Fix:**
- Redeploy (vercel dashboard atau `vercel --prod`)
- ENV changes **tidak apply otomatis** ke deployment lama

### 4. Pages masih 404 setelah deploy
**Penyebab:** Build error atau ISR issue.

**Fix:**
- Cek build logs di Vercel dashboard
- Pastikan `next.config.js` output mode: `'standalone'` (sudah benar)
- Cek Vercel Functions tab untuk error logs

---

## Post-Deploy Checklist

### 1. Verify Deployment
```bash
curl https://your-app.vercel.app/api/lomba
```

### 2. Run Migrations (jika belum)
Di lokal dengan `DIRECT_URL`:
```bash
npx prisma migrate deploy
```

Atau setup Vercel Build Command:
```bash
prisma generate && prisma migrate deploy && next build
```

### 3. Test Critical Pages
- ✅ Homepage: `/`
- ✅ Lomba list: `/lomba`
- ✅ Prestasi list: `/prestasi`
- ✅ Admin login: `/admin/login`
- ✅ API health: `/api/lomba`

### 4. Setup Custom Domain (Opsional)
Vercel → Settings → Domains → Add `apm.polinema.ac.id`

---

## Monitoring & Logs

### 1. View Logs
```bash
vercel logs [deployment-url]
```

Atau di Vercel Dashboard → Deployments → [latest] → Runtime Logs

### 2. Performance
Vercel Analytics otomatis active untuk:
- Page load times
- Web Vitals
- API response times

---

## CI/CD Auto-Deploy

Setelah initial deploy, setiap `git push` ke GitHub akan:
1. Auto-trigger Vercel build
2. Deploy ke Preview URL (branch selain main)
3. Deploy ke Production (branch main)

**Setup:**
- Vercel otomatis setup GitHub integration
- Tidak perlu config tambahan

---

## Estimasi Biaya (Hobby Plan - Free)

✅ **Gratis untuk:**
- 100GB bandwidth/bulan
- Unlimited deployments
- Preview deployments
- Analytics

❌ **Tidak cocok kalau:**
- Traffic >100k visitors/bulan
- Perlu team collaboration (butuh Pro)

Untuk web prodi biasanya **masih free tier** karena traffic kecil.

---

## Kesimpulan Quick Commands

```bash
# 1. Deploy pertama kali
vercel

# 2. Deploy production
vercel --prod

# 3. Lihat logs
vercel logs

# 4. Set ENV
vercel env add VARIABLE_NAME production

# 5. Pull ENV ke local (untuk test)
vercel env pull
```

**Need help?** Cek status deployment di https://vercel.com/dashboard
