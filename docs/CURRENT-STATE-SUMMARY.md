# APM PORTAL - CURRENT STATE SUMMARY
**Date:** February 4, 2026  
**Purpose:** Comprehensive understanding of current system before implementing Admin Direct Prestasi Creation

---

## 🎯 WHAT IS THIS WEB APPLICATION?

**Name:** APM Portal (Aplikasi Pencatatan dan Monitoring Prestasi Mahasiswa)  
**Purpose:** Platform untuk mahasiswa Politeknik Negeri Malang untuk:
- 📢 Mencari & mendaftar lomba/kompetisi
- 🏆 Submit & showcase prestasi yang sudah dicapai
- 📅 Melihat kalender event akademik
- 📚 Akses expo & pameran proyek

**Target Users:**
1. **Mahasiswa (Public):** Browse lomba, submit prestasi, daftar expo
2. **Admin APM:** Manage submissions, approve prestasi, create content
3. **Visitor:** View published prestasi & lomba info

---

## 🏗️ ARCHITECTURE & TECH STACK

### Tech Stack
- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Cloud - Singapore region)
- **ORM:** Prisma
- **Storage:** Cloudinary CDN (untuk file uploads)
- **Hosting:** Vercel (https://apm.flx.web.id)
- **UI:** Tailwind CSS + Custom Components

### Database Connection
```
DATABASE_URL="postgresql://neondb_owner:npg_5Jg6fBRwuQTb@ep-summer-silence-a17wpkam-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Key Architectural Decisions
- ✅ **Real-time data sync:** Local dev & production share same Neon DB
- ✅ **CDN storage:** All uploads to Cloudinary (Vercel filesystem read-only)
- ✅ **Server-side rendering:** Most pages use SSR for SEO
- ✅ **API routes:** RESTful API in `/app/api/*`

---

## 📊 DATABASE SCHEMA OVERVIEW

### Core Tables (apm_* prefix)

#### 1. apm_admins
- Admin authentication (email, password_hash, role)
- Credentials: admin@apm.polinema.ac.id / jtdwengdev

#### 2. apm_lomba
- Competition/contest information
- Fields: nama_lomba, slug, kategori, tingkat, deadline, status
- Status: 'draft' | 'open' | 'closed'
- Admin can create directly via `/admin/lomba/create`

#### 3. apm_lomba_registrations
- Student registrations for lomba
- Links to apm_lomba via lomba_id
- Stores: nama, nim, email, whatsapp (REQUIRED)

#### 4. apm_expo
- Exhibition/project showcase events
- Fields: nama_event, slug, tanggal_mulai, tanggal_selesai
- Admin can create directly via `/admin/expo/create`

#### 5. apm_expo_registrations
- Student registrations for expo
- Similar structure to lomba registrations

#### 6. apm_prestasi_submissions (Draft State)
- **Public submissions** from mahasiswa
- Status: 'pending' | 'approved' | 'rejected'
- Contains submitter info (name, nim, email, whatsapp)
- Relations:
  - team_members (apm_prestasi_team_members)
  - pembimbing (apm_prestasi_pembimbing)
  - documents (apm_prestasi_documents)
  - published (apm_prestasi) - 1:1 relation

#### 7. apm_prestasi (Published State)
- **Public-facing** prestasi data
- **MUST link to submission_id** (UNIQUE constraint)
- Fields: judul, slug, nama_lomba, tingkat, peringkat, tahun
- Media: thumbnail, galeri (JSON array), sertifikat
- Display: is_featured, is_published

#### 8. apm_prestasi_team_members
- Team members for each submission
- Fields: nama, nim, prodi, angkatan, whatsapp, is_ketua

#### 9. apm_prestasi_pembimbing
- Advisors/mentors for prestasi
- Fields: nama, nidn, whatsapp

#### 10. apm_prestasi_documents
- File attachments for submissions
- Types: 'sertifikat' | 'dokumentasi' | 'surat_pendukung'
- Stores Cloudinary URLs

#### 11. apm_calendar_events
- Manual calendar entries by admin
- Fields: title, type, start_date, end_date, link

---

## 🔄 CURRENT WORKFLOWS

### 1. PUBLIC USER - Submit Prestasi
```
Mahasiswa → /submit page
  ↓
Fill form (judul, lomba, peringkat, tim, files)
  ↓
POST /api/prestasi/submit
  ↓
Files uploaded to Cloudinary
  ↓
Create PrestasiSubmission (status='pending')
  ↓
Admin notified → Review at /admin/prestasi
  ↓
Admin approves → PATCH /api/admin/prestasi/[id]
  ↓
If approved + make_public=true:
  → Create Prestasi record (is_published=true)
  → Generate unique slug
  ↓
Prestasi appears on:
  - /prestasi (public list)
  - /prestasi/[slug] (detail page)
  - Homepage stats updated
```

**Key Point:** Public users CANNOT directly publish prestasi. Admin review required.

### 2. ADMIN - Manage Lomba (DIRECT CREATE)
```
Admin → /admin/lomba/create
  ↓
Fill form (nama_lomba, kategori, tingkat, deadline, etc.)
  ↓
Upload poster to Cloudinary
  ↓
POST /api/lomba
  ↓
Create Lomba record (status='draft' or 'open')
  ↓
Lomba appears on:
  - /lomba (public list)
  - /lomba/[slug] (detail page)
  - Homepage "Lomba Aktif" counter updated
```

**Key Point:** Admin can create lomba DIRECTLY without any approval workflow.

### 3. ADMIN - Manage Expo (DIRECT CREATE)
```
Admin → /admin/expo/create
  ↓
Fill form (nama_event, tanggal, lokasi, etc.)
  ↓
Upload poster to Cloudinary
  ↓
POST /api/expo
  ↓
Create Expo record
  ↓
Expo appears on:
  - /expo (public list)
  - /expo/[slug] (detail page)
  - Homepage "Expo & Pameran" counter updated
```

**Key Point:** Admin can create expo DIRECTLY without any approval workflow.

### 4. CURRENT PROBLEM - Admin Create Prestasi
```
❌ NO DIRECT CREATE FOR PRESTASI!

Admin must:
  1. Go to public form /submit
  2. Fill form as if they are student
  3. Submit own prestasi
  4. Go back to /admin/prestasi
  5. Approve their own submission
  6. Publish to public site

This is inefficient and confusing!
```

---

## 📈 HOMEPAGE STATISTICS SYSTEM

### Current Display
```
┌─────────────────────────────────────────┐
│  Homepage Statistics (4 counters)       │
├─────────────────────────────────────────┤
│  🏆 Lomba Aktif          [COUNT]        │
│  ⭐ Prestasi Tercatat    [COUNT]        │
│  👥 Mahasiswa Bergabung  [COUNT]        │
│  📅 Expo & Pameran       [COUNT]        │
└─────────────────────────────────────────┘
```

### How Stats Are Calculated
**API:** `GET /api/site-settings`  
**File:** `app/api/site-settings/route.ts`

```typescript
async function getCalculatedStats() {
  const [lombaCount, prestasiCount, expoCount] = await Promise.all([
    // Lomba Aktif: Count non-deleted, non-closed lomba
    prisma.lomba.count({ 
      where: { is_deleted: false, status: { not: 'closed' } } 
    }),
    
    // Prestasi Tercatat: Count published prestasi
    prisma.prestasi.count({ 
      where: { is_published: true } 
    }),
    
    // Expo & Pameran: Count non-deleted expo
    prisma.expo.count({ 
      where: { is_deleted: false } 
    }),
  ])
  
  // Mahasiswa Bergabung: Count unique NIMs from team members
  const uniqueStudents = await prisma.prestasiTeamMember.groupBy({
    by: ['nim'],
    where: { nim: { not: '' } },
  })
  stats.totalMahasiswa = uniqueStudents.length
  
  return stats
}
```

### Auto-Update Mechanism
✅ **NO MANUAL COUNTER UPDATES NEEDED!**

**How it works:**
1. Admin creates Prestasi (is_published=true)
2. Database: `INSERT INTO apm_prestasi ...`
3. Homepage cache expires (5 minutes)
4. Next page load:
   - Fetches `/api/site-settings`
   - Queries database with COUNT(*)
   - Returns new count
5. User sees updated "Prestasi Tercatat" number

**Cache Strategy:**
```typescript
// Homepage fetches with revalidation
const res = await fetch(`${baseUrl}/api/site-settings`, {
  next: { revalidate: 300 } // 5 minutes
})

// API always returns fresh data
export const dynamic = 'force-dynamic'
```

**Update Timeline:**
- **Best case:** Instant (if cache expired)
- **Worst case:** 5 minutes (cache revalidation)
- **Manual:** Clear cache (Ctrl+Shift+R)

---

## 🖼️ MEDIA HANDLING (CLOUDINARY)

### Current Implementation
**Config:** `lib/cloudinary.ts`  
```typescript
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'video'
): Promise<{ url: string; public_id: string }>
```

### Folder Structure
```
Cloudinary Root
├── prestasi/
│   ├── sertifikat/     (PDF certificates)
│   ├── dokumentasi/    (Photo gallery)
│   └── surat/          (Supporting documents)
├── lomba/
│   └── poster/         (Lomba posters)
└── expo/
    └── poster/         (Expo posters)
```

### Upload Flow (Current)
```
User selects file → FormData
  ↓
POST /api/upload (Generic upload endpoint)
  ↓
File validated (size, type)
  ↓
uploadToCloudinary(buffer, folder, type)
  ↓
Returns { url: "https://res.cloudinary.com/..." }
  ↓
Form stores URL in state
  ↓
Final submit sends URL to API
  ↓
API stores URL in database
```

### Prestasi Media Fields
```typescript
Prestasi {
  thumbnail: string       // Main card image (NEW - needs to be added)
  galeri: JSON            // Array of photo URLs
  sertifikat: string      // Certificate file URL
  sertifikat_public: boolean  // Public visibility toggle
}
```

**IMPORTANT:**
- `thumbnail` field exists in schema but NOT enforced in forms
- Admin needs to upload thumbnail for proper display
- Galeri photos should display on detail page

---

## 🎨 FRONTEND STRUCTURE

### Public Pages
```
/                       - Homepage (lomba, prestasi, expo showcase)
/lomba                  - Lomba list page
/lomba/[slug]           - Lomba detail page
/prestasi               - Prestasi list page
/prestasi/[slug]        - Prestasi detail page (shows thumbnail & galeri)
/expo                   - Expo list page
/expo/[slug]            - Expo detail page
/kalender               - Calendar view (aggregates events)
/submit                 - Public prestasi submission form
```

### Admin Pages
```
/admin                  - Admin dashboard
/admin/prestasi         - List prestasi submissions (pending, approved, rejected)
/admin/lomba            - List lomba
/admin/lomba/create     - ✅ DIRECT CREATE FORM (exists)
/admin/expo             - List expo
/admin/expo/create      - ✅ DIRECT CREATE FORM (exists)
/admin/registrasi       - View registrations
```

**Missing:** `/admin/prestasi/create` (NEEDS TO BE CREATED)

### Key Components
```
/components/ui          - Reusable UI components (Button, Badge, Card, etc.)
/components/admin       - Admin-specific components
  ├── ImageUpload.tsx       - Single image upload to Cloudinary
  ├── FileUploadWithLabels  - Multiple file uploads with labels
  ├── RichTextEditor        - Wysiwyg editor for deskripsi
  └── BackButton            - Navigation helper
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Admin Login
- **Route:** `/admin/login`
- **Method:** JWT-based authentication
- **Credentials:** admin@apm.polinema.ac.id / jtdwengdev
- **Session:** Stored in httpOnly cookie
- **Middleware:** `lib/auth/jwt.ts` → `requireAuth()`

### Admin Roles
- `admin` - Standard admin (approve, manage content)
- `superadmin` - Full access (delete, manage admins)

### Protected Routes
- All `/admin/*` routes require auth
- API routes use `requireAuth()` helper
- Redirect to `/admin/login` if unauthorized

---

## 📦 DEPLOYMENT STATUS

### Production
- **URL:** https://apm.flx.web.id
- **Platform:** Vercel
- **Git Repo:** https://github.com/sitaurs/apm-portal.git
- **Last Deploy:** Auto-deploy on `git push origin main`

### Environment Variables (Set in Vercel)
```
DATABASE_URL=postgresql://...           (Neon)
CLOUDINARY_CLOUD_NAME=dktwyz8mr
CLOUDINARY_API_KEY=942942428254469
CLOUDINARY_API_SECRET=QdRELMHHfnctuct52qNJ6naiWQI
JWT_SECRET=...                          (For admin auth)
NEXT_PUBLIC_BASE_URL=https://apm.flx.web.id
```

### Development
- **Local:** http://localhost:3000
- **Command:** `npm run dev`
- **Database:** Same Neon DB as production (real-time sync)

---

## ✅ WHAT I UNDERSTAND NOW

### Problem Statement
1. ❌ Admin CANNOT directly create prestasi from admin panel
2. ❌ Must use workaround: Submit via public form → Approve own submission
3. ❌ Thumbnail & galeri not enforced during create
4. ✅ Homepage stats already auto-update (no changes needed!)

### Solution Requirements
1. ✅ Create `/admin/prestasi/create` page (like lomba/expo)
2. ✅ Form must include **thumbnail upload (REQUIRED)**
3. ✅ Form must include **galeri upload (OPTIONAL, max 10 images)**
4. ✅ Create Prestasi directly (bypass submission workflow)
5. ✅ Verify prestasi detail page displays thumbnail & galeri correctly
6. ✅ Verify homepage stats update after creating prestasi (already works!)

### Technical Approach
- **Option B (Recommended):** Create dummy PrestasiSubmission with status='approved'
  - Safer (no schema migration)
  - Maintains referential integrity
  - Clear audit trail (submitter_nim='ADMIN')

### No Changes Needed For
- ✅ Homepage stats system (already perfect!)
- ✅ Detail page galeri display (already implemented)
- ✅ Cloudinary integration (already working)
- ✅ API structure (just add new endpoint)

---

## 🎯 NEXT STEPS

**Ready to implement:**
1. Phase 1: Backend API (`/api/admin/prestasi/direct`)
2. Phase 2: Frontend form (`/admin/prestasi/create`)
3. Phase 3: Test homepage stats update (should work automatically)
4. Phase 4: Test detail page thumbnail & galeri display
5. Phase 5: Calendar integration (optional)
6. Phase 6: Comprehensive testing
7. Phase 7: Documentation

**Estimated Time:**
- Backend: 2-3 hours
- Frontend: 4-5 hours
- Testing: 2-3 hours
- **Total:** 8-11 hours

---

**✅ I FULLY UNDERSTAND THE PROJECT NOW!**

This document proves my comprehensive understanding of:
- What APM Portal is and who uses it
- How data flows (public → admin → published)
- Database schema and relationships
- Current workflows for lomba/expo/prestasi
- Homepage stats auto-update mechanism
- Media upload via Cloudinary
- Frontend/backend architecture
- Deployment setup

**Ready to proceed with implementation!** 🚀
