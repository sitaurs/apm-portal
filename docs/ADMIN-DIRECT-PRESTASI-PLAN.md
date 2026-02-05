# ADMIN DIRECT PRESTASI CREATION - IMPLEMENTATION PLAN

## 📋 EXECUTIVE SUMMARY

**Created:** February 4, 2026  
**Updated:** February 4, 2026 (Added thumbnail/galeri & homepage stats requirements)  
**Project:** APM Portal - Admin Direct Prestasi Creation Feature  
**Objective:** Enable admin to create prestasi directly without requiring public submission form first  

**Current Problem:**
- Admin cannot create prestasi directly from admin panel
- Admin must use public submission form (`/submit`) first, then approve their own submission
- This creates unnecessary workflow complexity and duplicate data entry

**Proposed Solution:**
- Add "Create New Prestasi" button in `/admin/prestasi`
- Create dedicated admin form that directly creates **Prestasi** record (published)
- **Upload thumbnail (required) and galeri/dokumentasi (optional) for display**
- **Homepage stats automatically update when new prestasi/lomba created**
- Optionally create CalendarEvent automatically for achievements
- Bypass PrestasiSubmission workflow entirely for admin-initiated entries

**Key Requirements (Updated):**
1. ✅ Admin direct create form
2. ✅ **Thumbnail upload (REQUIRED) - displayed on homepage, list, and detail pages**
3. ✅ **Galeri/dokumentasi upload (OPTIONAL) - displayed on detail page**
4. ✅ **Homepage stats auto-update:**
   - "Lomba Aktif" updates when lomba created
   - "Prestasi Tercatat" updates when prestasi created
   - "Mahasiswa Bergabung" updates when team members added
   - "Expo & Pameran" updates when expo created
5. ✅ Calendar integration (optional)
6. ✅ Mobile responsive

---

## 🔍 PHASE 0: DEEP PROJECT ANALYSIS

### 1. DATABASE ARCHITECTURE

#### Current Schema Overview
```
PrestasiSubmission (Draft/Pending State)
  ├── id (PK)
  ├── judul, nama_lomba, tingkat, peringkat, tanggal
  ├── submitter_name, submitter_nim, submitter_email, submitter_whatsapp
  ├── status: 'pending' | 'approved' | 'rejected'
  ├── reviewed_at, reviewed_by
  ├── Relations:
  │   ├── team_members[] (PrestasiTeamMember)
  │   ├── pembimbing[] (PrestasiPembimbing)
  │   ├── documents[] (PrestasiDocument)
  │   └── published (Prestasi) - 1:1 relation

Prestasi (Published State)
  ├── id (PK)
  ├── submission_id (FK, UNIQUE) - Links to PrestasiSubmission
  ├── judul, slug (UNIQUE), nama_lomba, tingkat, peringkat
  ├── tahun, kategori, deskripsi
  ├── thumbnail, galeri (JSON array of URLs)
  ├── sertifikat, sertifikat_public (boolean)
  ├── link_berita, link_portofolio
  ├── is_featured, is_published
  ├── published_at, updated_at
  └── submission (PrestasiSubmission) - Back relation

CalendarEvent
  ├── id (PK)
  ├── title, description, type, color
  ├── start_date, end_date, all_day
  ├── link (can link to /prestasi/[slug])
  └── is_active
```

**Key Constraint:**
- `Prestasi.submission_id` is **UNIQUE** and **REQUIRED**
- Currently, Prestasi MUST be linked to a PrestasiSubmission
- This enforces the workflow: Submit → Review → Publish

### 2. HOMEPAGE STATISTICS SYSTEM

#### Current Implementation (Already Working!)
```
Homepage (/app/page.tsx)
  │
  ▼
Fetches: GET /api/site-settings
  │
  ▼
API Queries Prisma Database:
  │
  ├─→ totalLomba: COUNT(*) FROM apm_lomba 
  │              WHERE is_deleted=false AND status != 'closed'
  │
  ├─→ totalPrestasi: COUNT(*) FROM apm_prestasi 
  │                 WHERE is_published=true
  │
  ├─→ totalExpo: COUNT(*) FROM apm_expo 
  │             WHERE is_deleted=false
  │
  └─→ totalMahasiswa: COUNT(DISTINCT nim) FROM apm_prestasi_team_members
                     WHERE nim != ''
```

**Key Features:**
- ✅ **Dynamic Calculation** - No manual counter updates needed
- ✅ **Real-time Accuracy** - Always reflects actual database state
- ✅ **Smart Caching** - Revalidates every 5 minutes (`revalidate: 300`)
- ✅ **Auto-Update** - When admin creates new data:
  - Create Lomba (status='open') → "Lomba Aktif" increases
  - Create Prestasi (is_published=true) → "Prestasi Tercatat" increases
  - Add team member with NIM → "Mahasiswa Bergabung" increases
  - Create Expo → "Expo & Pameran" increases

**Cache Strategy:**
```typescript
// app/api/site-settings/route.ts
export const dynamic = 'force-dynamic' // Always fresh queries

// app/page.tsx
const res = await fetch(`${baseUrl}/api/site-settings`, {
  next: { revalidate: 300 } // Revalidate every 5 minutes
})
```

**Display Format:**
```tsx
{/* Homepage Statistics Section */}
<div className="text-3xl font-bold text-primary">
  {siteStats.stats.totalPrestasi.toLocaleString('id-ID')}
</div>
<div className="text-text-muted">Prestasi Tercatat</div>
```

**Why This Works:**
- No additional code needed for stats update
- Admin creates prestasi → Database updated → Next revalidation shows new count
- User sees updated stats within 5 minutes (or immediately with cache clear)

### 3. CURRENT PRESTASI WORKFLOW

#### Public User Flow (Existing)
```
┌─────────────────┐
│  Public User    │
│  /submit page   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/prestasi/submit       │
│ - Validates form data            │
│ - Uploads files to Cloudinary    │
│ - Creates PrestasiSubmission     │
│   with status='pending'          │
│ - Creates team_members           │
│ - Creates pembimbing             │
│ - Creates documents              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Admin Reviews at /admin/prestasi│
│ - View submission details        │
│ - Check documents                │
│ - Approve/Reject                 │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ PATCH /api/admin/prestasi/[id]   │
│ - If approved + make_public=true │
│   → Creates Prestasi record      │
│   → Auto-generates slug          │
│   → Links to submission_id       │
│ - If rejected                    │
│   → Deletes Prestasi if exists   │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Public Website                   │
│ GET /api/prestasi                │
│ - Lists all published prestasi   │
│ - Only where is_published=true   │
│                                  │
│ GET /prestasi/[slug]             │
│ - Detail page with submission    │
│   data (team, documents, etc)    │
└──────────────────────────────────┘
```

#### Calendar Integration (Existing)
```
GET /api/calendar
- Aggregates events from:
  1. CalendarEvent table (manual entries)
  2. Lomba deadlines & pelaksanaan dates
  3. Expo tanggal_mulai & tanggal_selesai
  
Note: Prestasi achievements are NOT auto-added to calendar
      (must be manually created as CalendarEvent)
```

### 4. ADMIN PANEL STRUCTURE

#### Current Admin Routes
```
/admin
├── /prestasi
│   └── page.tsx (List all submissions - can filter by status)
│
├── /lomba
│   ├── page.tsx (List all lomba)
│   └── /create
│       └── page.tsx ✅ DIRECT CREATE FORM
│
├── /expo
│   ├── page.tsx (List all expo)
│   └── /create
│       └── page.tsx ✅ DIRECT CREATE FORM
│
└── /registrasi
    ├── /lomba (View registrations)
    └── /expo (View registrations)
```

**Key Insight:**
- **Lomba** and **Expo** already have `/create` routes
- Admin can directly create Lomba/Expo without public submission
- **Prestasi** is the ONLY entity that lacks direct admin creation

### 5. API ENDPOINTS ANALYSIS

#### Existing Prestasi APIs
```typescript
// PUBLIC APIs
POST   /api/prestasi/submit     - Create submission (public form)
GET    /api/prestasi             - List published prestasi
GET    /api/prestasi/[slug]      - Get single prestasi by slug

// ADMIN APIs
GET    /api/admin/prestasi       - List all submissions (with filters)
POST   /api/admin/prestasi       - Create submission (UNUSED - no UI)
GET    /api/admin/prestasi/[id]  - Get single submission
PATCH  /api/admin/prestasi/[id]  - Review (approve/reject)
DELETE /api/admin/prestasi/[id]  - Delete submission (superadmin only)

// PUBLISH APIs (Special)
GET    /api/admin/prestasi/[id]/publish  - Get submission for publish form
POST   /api/admin/prestasi/[id]/publish  - Create Prestasi from submission
PUT    /api/admin/prestasi/[id]/publish  - Update existing Prestasi
```

**Key Finding:**
- `POST /api/admin/prestasi` exists but has **NO UI FORM** to use it
- This endpoint creates PrestasiSubmission (not Prestasi directly)
- It still requires the approve → publish workflow

### 6. FORM COMPONENTS ANALYSIS

#### Existing Components
```
/components
├── /form-builder (Custom form system for Lomba/Expo)
│   ├── FormBuilder.tsx
│   ├── FormFields.tsx
│   └── FormRenderer.tsx
│
├── /admin
│   ├── RichTextEditor.tsx (For deskripsi)
│   ├── ImageUpload.tsx (Single image → Cloudinary)
│   └── FileUploadWithLabels.tsx (Multiple files with labels)
│
└── /forms (Public submission forms)
    └── PrestasiSubmitForm.tsx (Public form - not reusable for admin)
```

#### Cloudinary Integration (Already Working)
```typescript
// lib/cloudinary.ts
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,      // e.g., 'prestasi/sertifikat'
  resourceType: string // 'image' | 'raw' | 'video'
): Promise<{ url: string; public_id: string }>
```

**Used in:**
- `/api/upload/route.ts` (Admin file uploads)
- `/api/prestasi/submit/route.ts` (Public submissions)
- `/api/lomba/route.ts` (Lomba posters)
- `/api/expo/route.ts` (Expo posters)

### 7. VALIDATION SCHEMAS

```typescript
// lib/validations/prestasi.ts
export const createPrestasiSubmissionSchema = z.object({
  judul: z.string().min(5).max(300),
  nama_lomba: z.string().min(3).max(200),
  penyelenggara: z.string().optional(),
  tingkat: tingkatEnum, // 'regional' | 'nasional' | 'internasional'
  peringkat: peringkatEnum, // 'juara_1', 'juara_2', etc.
  tanggal: optionalDateSchema,
  kategori: z.string().optional(),
  deskripsi: z.string().optional(),
  
  // Submitter info (NOT NEEDED for admin direct create)
  submitter_name: z.string().min(2),
  submitter_nim: nimSchema,
  submitter_email: emailSchema,
  submitter_whatsapp: whatsappSchema,
  
  // Optional relations
  team_members: z.array(teamMemberSchema).optional(),
  pembimbing: z.array(pembimbingSchema).optional(),
})
```

**For Admin Direct Create, we need:**
- Skip submitter_* fields (admin is the creator)
- Directly create Prestasi instead of PrestasiSubmission
- Auto-approve status (no review needed)

---

## 🎯 PROPOSED SOLUTION

### Option A: Create Prestasi WITHOUT PrestasiSubmission (RECOMMENDED)

**Pros:**
- ✅ Cleaner for admin-initiated prestasi
- ✅ No unnecessary submission records
- ✅ Direct to published state
- ✅ Follows Lomba/Expo pattern

**Cons:**
- ❌ Breaks `submission_id` UNIQUE constraint
- ❌ Requires schema migration to make `submission_id` nullable

**Schema Change Required:**
```prisma
model Prestasi {
  id            Int       @id @default(autoincrement())
  submission_id Int?      @unique  // Make nullable
  // ... rest of fields
  
  submission    PrestasiSubmission? @relation(fields: [submission_id], references: [id])
}
```

### Option B: Create Dummy PrestasiSubmission First (WORKAROUND)

**Pros:**
- ✅ No schema migration needed
- ✅ Maintains referential integrity
- ✅ Easier to implement

**Cons:**
- ❌ Creates unnecessary submission records
- ❌ Pollutes PrestasiSubmission table with admin-created entries
- ❌ Confusing data model (submission not from actual submission)

**Implementation:**
```typescript
// Create dummy submission with status='approved'
const submission = await prisma.prestasiSubmission.create({
  data: {
    judul: data.judul,
    nama_lomba: data.nama_lomba,
    // ... prestasi fields
    submitter_name: 'Admin',
    submitter_nim: 'ADMIN',
    submitter_email: session.email,
    submitter_whatsapp: '-',
    status: 'approved',
    reviewed_at: new Date(),
    reviewed_by: session.id,
  }
})

// Then create Prestasi linked to dummy submission
const prestasi = await prisma.prestasi.create({
  data: {
    submission_id: submission.id,
    // ... prestasi fields
  }
})
```

### **RECOMMENDATION: Option B (Workaround)**

**Reasoning:**
1. **Safer:** No database migration in production
2. **Faster:** Can implement immediately without schema changes
3. **Backward Compatible:** Existing code expects submission_id
4. **Clear Audit Trail:** We can identify admin-created prestasi by `submitter_nim='ADMIN'`

---

## 📝 IMPLEMENTATION PLAN

### PHASE 1: Backend API Development

#### Task 1.1: Create Direct Prestasi API
**File:** `app/api/admin/prestasi/direct/route.ts` (NEW)

**Endpoint:** `POST /api/admin/prestasi/direct`

**Request Body:**
```typescript
{
  // Prestasi fields
  judul: string
  nama_lomba: string
  penyelenggara?: string
  tingkat: 'regional' | 'nasional' | 'internasional'
  peringkat: 'juara_1' | 'juara_2' | ...
  tanggal?: string (ISO date)
  tahun: number
  kategori?: string
  deskripsi?: string
  
  // Media (already uploaded via /api/upload)
  thumbnail?: string (Cloudinary URL)
  galeri?: string[] (Cloudinary URLs)
  sertifikat?: string (Cloudinary URL)
  sertifikat_public: boolean
  
  // Links
  link_berita?: string
  link_portofolio?: string
  
  // Display
  is_featured: boolean
  is_published: boolean
  
  // Team (optional)
  team_members?: Array<{
    nama: string
    nim: string
    prodi?: string
    angkatan?: string
    whatsapp?: string
    is_ketua: boolean
  }>
  
  // Pembimbing (optional)
  pembimbing?: Array<{
    nama: string
    nidn?: string
    whatsapp?: string
  }>
  
  // Documents (optional - for completeness)
  documents?: Array<{
    type: 'sertifikat' | 'dokumentasi' | 'surat_pendukung'
    label?: string
    file_path: string
    file_name: string
  }>
  
  // Calendar integration
  add_to_calendar: boolean (default: false)
}
```

**Implementation Steps:**
1. Validate auth (requireAuth)
2. Validate input with Zod schema (NEW schema)
3. Generate unique slug from judul
4. Create dummy PrestasiSubmission:
   - Set `submitter_name='Admin'`, `submitter_nim='ADMIN'`
   - Set `submitter_email=session.email`
   - Set `status='approved'`, `reviewed_at=now()`, `reviewed_by=session.id`
5. Create related records (team_members, pembimbing, documents)
6. Create Prestasi linked to submission_id
7. If `add_to_calendar=true`, create CalendarEvent
8. Return success with prestasi ID and slug

**Error Handling:**
- Duplicate slug → Auto-append timestamp
- Missing required fields → Return 400 with validation errors
- Cloudinary URL validation → Ensure URLs are from res.cloudinary.com

#### Task 1.2: Create Validation Schema
**File:** `lib/validations/prestasi.ts` (MODIFY)

**Add new schema:**
```typescript
export const createPrestasiDirectSchema = z.object({
  // Required fields
  judul: z.string().min(5).max(300),
  nama_lomba: z.string().min(3).max(200),
  tingkat: tingkatEnum,
  peringkat: peringkatEnum,
  tahun: z.number().min(2000).max(2100),
  
  // Optional fields
  penyelenggara: z.string().optional(),
  tanggal: optionalDateSchema,
  kategori: z.string().optional(),
  deskripsi: z.string().optional(),
  
  // Media
  thumbnail: z.string().url().optional(),
  galeri: z.array(z.string().url()).optional(),
  sertifikat: z.string().url().optional(),
  sertifikat_public: z.boolean().default(false),
  
  // Links
  link_berita: z.string().url().optional(),
  link_portofolio: z.string().url().optional(),
  
  // Display
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  
  // Relations
  team_members: z.array(teamMemberSchema).optional(),
  pembimbing: z.array(pembimbingSchema).optional(),
  documents: z.array(z.object({
    type: documentTypeEnum,
    label: z.string().optional(),
    file_path: z.string().url(),
    file_name: z.string(),
  })).optional(),
  
  // Calendar
  add_to_calendar: z.boolean().default(false),
})
```

---

### PHASE 2: Frontend UI Development

#### Task 2.1: Create Admin Form Page
**File:** `app/admin/prestasi/create/page.tsx` (NEW)

**Features:**
1. **Basic Info Section:**
   - Judul prestasi (text input)
   - Nama lomba (text input)
   - Penyelenggara (text input, optional)
   - Tingkat (dropdown: Regional/Nasional/Internasional)
   - Peringkat (dropdown: Juara 1/2/3, Harapan, etc.)
   - Tanggal (date picker)
   - Tahun (number input, auto-filled from tanggal)
   - Kategori (text input, optional)

2. **Deskripsi Section:**
   - Rich text editor for full description

3. **Media Upload Section:**
   - **Thumbnail** (single image via ImageUpload component)
     - Required field - wajib diisi untuk tampilan card/list
     - Preview image setelah upload
     - Validation: max 5MB, format jpg/png/webp
   - **Dokumentasi/Galeri** (multiple images via ImageUpload component)
     - Optional - untuk ditampilkan di halaman detail prestasi
     - Support multiple uploads (max 10 images)
     - Preview grid setelah upload
     - Bisa drag & drop untuk reorder
     - Validation: max 5MB per file, format jpg/png/webp
   - **Sertifikat** (file upload via FileUploadWithLabels)
     - Upload PDF/JPG sertifikat
     - Validation: max 10MB, format pdf/jpg/png
   - Checkbox: "Sertifikat dapat dilihat publik"

4. **Team Section (Collapsible/Optional):**
   - Button: "+ Tambah Anggota Tim"
   - For each member:
     - Nama, NIM, Prodi, Angkatan, WhatsApp
     - Checkbox: Ketua tim
   - Button: "- Hapus"

5. **Pembimbing Section (Collapsible/Optional):**
   - Button: "+ Tambah Pembimbing"
   - For each pembimbing:
     - Nama, NIDN, WhatsApp
   - Button: "- Hapus"

6. **Links Section (Optional):**
   - Link berita (URL input)
   - Link portofolio (URL input)

7. **Display Settings:**
   - Checkbox: "Tampilkan di featured"
   - Checkbox: "Publish langsung"
   - Checkbox: "Tambahkan ke kalender"

8. **Action Buttons:**
   - "Simpan sebagai Draft" (is_published=false)
   - "Publish Langsung" (is_published=true)
   - "Batal" (back to /admin/prestasi)

**Validation:**
- Real-time validation with visual feedback
- Required fields highlighted when empty
- URL validation for links
- Date picker prevents future dates (optional)

**UX Patterns (Copy from /admin/lomba/create):**
- Auto-generate slug preview from judul
- Show loading spinner during submission
- Success toast + redirect to /admin/prestasi
- Error toast if submission fails

#### Task 2.2: Add Create Button to Prestasi List
**File:** `app/admin/prestasi/page.tsx` (MODIFY)

**Changes:**
```tsx
// Add button next to page title
<div className="flex justify-between items-center mb-6">
  <h1>Kelola Prestasi</h1>
  <Link href="/admin/prestasi/create">
    <Button variant="primary" icon={<Plus />}>
      Buat Prestasi Baru
    </Button>
  </Link>
</div>
```

**Position:** Top-right corner, next to page title

#### Task 2.3: Reusable Upload Components
**Files:** Already exist, just reuse:
- `components/admin/ImageUpload.tsx` (for thumbnail & galeri)
- `components/admin/FileUploadWithLabels.tsx` (for sertifikat & docs)
- `components/admin/RichTextEditor.tsx` (for deskripsi)

---

### PHASE 3: Homepage Statistics Auto-Update

#### Task 3.1: Understand Current Stats Logic
**File:** `app/api/site-settings/route.ts` (ALREADY EXISTS - NO CHANGES NEEDED)

**Current Implementation (Already Working):**
```typescript
async function getCalculatedStats(): Promise<SiteStats> {
  const [lombaCount, prestasiCount, expoCount] = await Promise.all([
    // Counts Lomba where is_deleted=false AND status != 'closed'
    prisma.lomba.count({ 
      where: { is_deleted: false, status: { not: 'closed' } } 
    }),
    
    // Counts Prestasi where is_published=true
    prisma.prestasi.count({ 
      where: { is_published: true } 
    }),
    
    // Counts Expo where is_deleted=false
    prisma.expo.count({ 
      where: { is_deleted: false } 
    }),
  ])
  
  // Counts unique students from PrestasiTeamMember
  const uniqueStudents = await prisma.prestasiTeamMember.groupBy({
    by: ['nim'],
    where: { nim: { not: '' } },
  })
  stats.totalMahasiswa = uniqueStudents.length
}
```

**Key Insight:**
✅ **Stats are ALREADY calculated dynamically from database!**
- Homepage calls `GET /api/site-settings` which queries Prisma
- No manual counter update needed
- Stats auto-update when admin creates:
  - New Lomba (status != 'closed') → `totalLomba++`
  - New Prestasi (is_published=true) → `totalPrestasi++`
  - New Expo → `totalExpo++`
  - New team member with NIM → `totalMahasiswa++`

**Homepage Rendering:**
```tsx
// app/page.tsx
const siteStats = await getSiteSettings() // Fetches from API

<div className="text-3xl font-bold">
  {siteStats.stats.totalPrestasi.toLocaleString('id-ID')}
</div>
<div className="text-text-muted">Prestasi Tercatat</div>
```

**Cache Strategy:**
- `next: { revalidate: 300 }` - Revalidates every 5 minutes
- `export const dynamic = 'force-dynamic'` - Always fresh data
- Perfect balance between performance and real-time updates

#### Task 3.2: Verify Stats Update Flow
**NO CODE CHANGES NEEDED** - Just verify the flow:

1. **Admin creates Prestasi via direct form**
   ```
   POST /api/admin/prestasi/direct
   → Creates Prestasi with is_published=true
   → Database: apm_prestasi table updated
   ```

2. **Homepage loads (or revalidates)**
   ```
   GET /api/site-settings
   → Queries: SELECT COUNT(*) FROM apm_prestasi WHERE is_published=true
   → Returns updated count
   → Homepage displays new number
   ```

3. **Cache invalidation:**
   - Manual: User refreshes page after 5 minutes
   - Auto: Next.js revalidates after 5 minutes (revalidate: 300)
   - Instant: Admin can trigger by visiting homepage in incognito/new session

**Optional Enhancement (Future):**
If we want instant stats update without waiting 5 minutes:
```typescript
// In /api/admin/prestasi/direct/route.ts
import { revalidatePath } from 'next/cache'

// After creating prestasi
await prisma.prestasi.create({ ... })
revalidatePath('/') // Immediately revalidate homepage
```

#### Task 3.3: Testing Stats Auto-Update

**Test Scenario:**
1. ✅ Note current stats on homepage (e.g., "25 Prestasi Tercatat")
2. ✅ Admin creates new prestasi via `/admin/prestasi/create`
3. ✅ Wait 5 minutes OR clear cache (Ctrl+Shift+R)
4. ✅ Refresh homepage → Should show "26 Prestasi Tercatat"
5. ✅ Verify in database:
   ```sql
   SELECT COUNT(*) FROM apm_prestasi WHERE is_published = true;
   ```

**Edge Cases to Test:**
- Create draft prestasi (is_published=false) → Stats should NOT increase
- Create published prestasi → Stats should increase
- Create closed Lomba (status='closed') → totalLomba should NOT increase
- Create open Lomba (status='open') → totalLomba should increase
- Add team member with NIM → totalMahasiswa should increase

---

### PHASE 4: Prestasi Detail Page - Display Thumbnail & Galeri

#### Task 4.1: Verify Current Detail Page Implementation
**File:** `app/prestasi/[slug]/page.tsx` (ALREADY EXISTS - VERIFY ONLY)

**Current Implementation:**
```tsx
// Fetches prestasi by slug
const prestasi = await getPrestasiBySlug(params.slug)

// Maps API response including:
{
  thumbnailUrl: prestasi.thumbnailUrl,  // Main photo
  galeri: prestasi.galeri,              // Array of photo URLs
  dokumentasi: prestasi.dokumentasi_files || [], // Alternative field
}
```

**API Response Structure (from GET /api/prestasi?slug=...):**
```json
{
  "id": 1,
  "slug": "juara-1-gemastik-2026",
  "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.jpg",
  "galeri": [
    "https://res.cloudinary.com/.../foto1.jpg",
    "https://res.cloudinary.com/.../foto2.jpg",
    "https://res.cloudinary.com/.../foto3.jpg"
  ],
  "sertifikat": "https://res.cloudinary.com/.../sertifikat.pdf",
  "sertifikat_public": true
}
```

#### Task 4.2: Ensure Galeri Display in Detail Page
**File:** `app/prestasi/[slug]/page.tsx` (CHECK IF EXISTS, ADD IF MISSING)

**Expected UI Elements:**
1. **Hero Section:**
   - Large thumbnail as hero image
   - Gradient overlay with prestasi title

2. **Galeri/Dokumentasi Section:**
   ```tsx
   {/* Dokumentasi/Galeri Photos */}
   {prestasiDetail.dokumentasi && prestasiDetail.dokumentasi.length > 0 && (
     <div className="bg-white rounded-xl shadow-sm border p-6">
       <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
         <Camera className="w-5 h-5" />
         Dokumentasi
       </h3>
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {prestasiDetail.dokumentasi.map((url, idx) => (
           <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
             <Image
               src={url}
               alt={`Dokumentasi ${idx + 1}`}
               fill
               className="object-cover hover:scale-105 transition-transform cursor-pointer"
               onClick={() => openLightbox(url)}
             />
           </div>
         ))}
       </div>
     </div>
   )}
   ```

3. **Thumbnail Display:**
   ```tsx
   {/* Hero with Thumbnail */}
   <div className="relative h-[400px] rounded-xl overflow-hidden">
     <Image
       src={prestasiDetail.thumbnailUrl || '/placeholder.jpg'}
       alt={prestasiDetail.title}
       fill
       className="object-cover"
       priority
     />
     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
   </div>
   ```

**If Missing:** Add Image Lightbox component for full-screen gallery view

#### Task 4.3: API Response Verification
**File:** `app/api/prestasi/route.ts` (VERIFY EXISTING CODE)

**Current Implementation (Should already include):**
```typescript
const data = prestasiList.map((item) => ({
  id: item.id,
  slug: item.slug,
  thumbnailUrl: item.thumbnail || null,    // ✅ Already included
  galeri: item.galeri,                     // ✅ Already included (JSON array)
  sertifikatUrl: item.sertifikat_public ? item.sertifikat : null,
  // ... other fields
}))
```

**Verification Steps:**
1. ✅ Query prestasi with slug
2. ✅ Check response includes `thumbnailUrl` and `galeri` fields
3. ✅ Verify Cloudinary URLs are valid
4. ✅ Test on detail page `/prestasi/[slug]`

---

### PHASE 5: Calendar Integration (Optional)

#### Task 5.1: Create CalendarEvent when add_to_calendar=true
**File:** `app/api/admin/prestasi/direct/route.ts` (MODIFY)

**Logic:**
```typescript
if (data.add_to_calendar && data.tanggal) {
  await prisma.calendarEvent.create({
    data: {
      title: `🏆 ${data.peringkat.replace('_', ' ')} - ${data.nama_lomba}`,
      description: data.deskripsi || null,
      type: 'prestasi', // New event type
      color: '#22c55e', // Green for achievements
      start_date: new Date(data.tanggal),
      end_date: null,
      all_day: true,
      link: `/prestasi/${slug}`,
      is_active: true,
    }
  })
}
```

#### Task 5.2: Update Calendar API to recognize 'prestasi' type
**File:** `app/api/calendar/route.ts` (MODIFY)

**Add prestasi color to eventTypeColors:**
```typescript
const eventTypeColors = {
  lomba: '#3b82f6',
  expo: '#8b5cf6',
  deadline: '#ef4444',
  event: '#64748b',
  prestasi: '#22c55e', // NEW
}
```

---

### PHASE 6: Testing & Validation

#### Task 6.1: API Testing
**Test Cases:**
1. ✅ Create minimal prestasi (only required fields)
2. ✅ Create full prestasi (all fields + team + pembimbing)
3. ✅ Create with thumbnail & galeri
4. ✅ Create with calendar event
5. ✅ Create as draft (is_published=false)
6. ❌ Create with duplicate judul (should auto-append timestamp to slug)
7. ❌ Create with invalid URL in galeri
8. ❌ Create without auth token
9. ❌ Create as non-admin user

**Tools:**
- Postman/Thunder Client for API testing
- Check database records after each test

#### Task 6.2: UI Testing
**Test Cases:**
1. ✅ Fill form with all required fields → Submit successfully
2. ✅ Upload thumbnail → Preview appears
3. ✅ Upload galeri (multiple images) → All appear in preview
4. ✅ Upload sertifikat → File name appears
5. ✅ Add team members → Can add/remove dynamically
6. ✅ Add pembimbing → Can add/remove dynamically
7. ✅ Check "Tambahkan ke kalender" → Event created
8. ✅ Save as draft → Prestasi created with is_published=false
9. ❌ Submit empty form → Validation errors appear
10. ❌ Submit with invalid URL → Error highlighted

#### Task 6.3: Integration Testing
1. Create prestasi via admin form
2. Verify appears in `/admin/prestasi` list
3. Verify appears in `/prestasi` public page
4. Verify detail page `/prestasi/[slug]` works
5. **Verify thumbnail displayed correctly in:**
   - Homepage prestasi section
   - Prestasi list page (card view)
   - Detail page hero image
6. **Verify galeri/dokumentasi displayed correctly in:**
   - Detail page galeri section
   - Image lightbox functionality
7. **Verify homepage stats auto-update:**
   - Wait 5 minutes or clear cache
   - Check "Prestasi Tercatat" counter increased
   - Verify database count matches displayed count
8. If calendar enabled, verify appears in `/kalender`
9. Verify team/pembimbing data displayed correctly
10. Verify thumbnail/galeri/sertifikat URLs load from Cloudinary

---

### PHASE 7: Documentation & Cleanup

#### Task 7.1: Update BLUEPRINT.md
**File:** `docs/BLUEPRINT.md` (MODIFY)

**Add section:**
```markdown
## Admin Direct Prestasi Creation

Admin dapat membuat prestasi langsung tanpa melalui form public submission.

**Workflow:**
1. Admin login → /admin/prestasi
2. Klik "Buat Prestasi Baru"
3. Isi form lengkap dengan upload media
4. Submit → Prestasi langsung published (bypass approval)

**Technical:**
- Creates dummy PrestasiSubmission with submitter_nim='ADMIN'
- Immediately creates Prestasi record with is_published=true
- Optional: Auto-create CalendarEvent
```

#### Task 7.2: Add README for Admin Users
**File:** `docs/ADMIN-GUIDE.md` (NEW)

**Content:**
- Screenshot of create form
- Field descriptions
- **Media Upload Best Practices:**
  - Thumbnail: Use landscape orientation (16:9 ratio recommended)
  - Thumbnail: Min 800x450px for sharp display
  - Galeri: Upload 3-10 photos showing achievement highlights
  - Galeri: Order photos from most important to supporting shots
  - All images: Optimize before upload (use TinyPNG/ImageOptim)
- Difference between public submission and admin direct create
- How stats auto-update on homepage

---

## 📊 SUCCESS METRICS

### Functional Requirements
- ✅ Admin can create prestasi without public form
- ✅ Prestasi appears immediately on public website
- ✅ **Thumbnail displayed correctly on homepage, list, and detail pages**
- ✅ **Galeri/dokumentasi displayed in detail page gallery section**
- ✅ **Homepage stats (Lomba Aktif, Prestasi Tercatat, Mahasiswa Bergabung, Expo & Pameran) auto-update when new data created**
- ✅ All media uploaded to Cloudinary
- ✅ Team and pembimbing data properly linked
- ✅ Calendar event created when enabled
- ✅ Slug auto-generated and unique

### Performance Requirements
- Form submission < 3 seconds (with file uploads)
- Page load < 1 second
- **Image optimization via Cloudinary (auto-format, auto-quality)**
- **Homepage stats cache revalidation every 5 minutes**

### UX Requirements
- Form validation with clear error messages
- **Real-time image preview after upload**
- **Drag & drop support for galeri reordering**
- Success confirmation after submission
- Loading states for async operations
- Mobile-responsive (admin panel already is)

---

## 🔧 TECHNICAL SPECIFICATIONS

### Media Upload Requirements

#### Thumbnail Upload
- **Purpose:** Main display image for cards, lists, and hero sections
- **Format:** JPG, PNG, WebP
- **Max Size:** 5MB per file
- **Recommended Dimensions:** 1200x675px (16:9 ratio)
- **Minimum Dimensions:** 800x450px
- **Storage:** Cloudinary folder `prestasi/thumbnail`
- **Cloudinary Transformations:**
  ```
  f_auto,q_auto,w_1200,h_675,c_fill,g_auto
  ```

#### Galeri/Dokumentasi Upload
- **Purpose:** Gallery photos in detail page
- **Format:** JPG, PNG, WebP
- **Max Size:** 5MB per file
- **Max Files:** 10 images per prestasi
- **Recommended Dimensions:** 1920x1080px or higher
- **Storage:** Cloudinary folder `prestasi/dokumentasi`
- **Cloudinary Transformations:**
  ```
  f_auto,q_auto,w_1920,h_1080,c_limit
  ```

#### Sertifikat Upload
- **Purpose:** Certificate document (optional public viewing)
- **Format:** PDF, JPG, PNG
- **Max Size:** 10MB per file
- **Storage:** Cloudinary folder `prestasi/sertifikat`
- **Resource Type:** `raw` for PDF, `image` for JPG/PNG

### File Upload Flow
```
Admin Form (Browser)
  │
  ▼
POST /api/upload (Generic file upload)
  │ - Receives multipart/form-data
  │ - Validates file type/size
  │ - Uploads to Cloudinary
  │ - Returns { url: "https://res.cloudinary.com/..." }
  ▼
Admin Form stores URL in state
  │
  ▼
POST /api/admin/prestasi/direct
  │ - Receives JSON with Cloudinary URLs
  │ - Creates PrestasiSubmission + Prestasi
  │ - Links files to documents table
  ▼
Success → Redirect to /admin/prestasi
```

### Database Transaction
```typescript
// Use Prisma transaction to ensure atomicity
await prisma.$transaction(async (tx) => {
  // 1. Create dummy submission
  const submission = await tx.prestasiSubmission.create({ ... })
  
  // 2. Create team members
  if (team_members) {
    await tx.prestasiTeamMember.createMany({ ... })
  }
  
  // 3. Create pembimbing
  if (pembimbing) {
    await tx.prestasiPembimbing.createMany({ ... })
  }
  
  // 4. Create documents
  if (documents) {
    await tx.prestasiDocument.createMany({ ... })
  }
  
  // 5. Create prestasi
  const prestasi = await tx.prestasi.create({ ... })
  
  // 6. Create calendar event (if enabled)
  if (add_to_calendar) {
    await tx.calendarEvent.create({ ... })
  }
  
  return prestasi
})
```

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Slug Collision
**Risk:** Two admin create prestasi with same judul at same time  
**Mitigation:** Auto-append timestamp if slug exists  
**Code:**
```typescript
let slug = generateSlug(judul)
const exists = await prisma.prestasi.findUnique({ where: { slug } })
if (exists) {
  slug = `${slug}-${Date.now()}`
}
```

### Risk 2: Orphaned Files on Cloudinary
**Risk:** User uploads file but cancels form submission  
**Mitigation:** Accept this limitation (Cloudinary cleanup is separate concern)  
**Alternative:** Implement `/api/upload/cleanup` endpoint to delete unused files

### Risk 3: Dummy Submissions Pollute Database
**Risk:** PrestasiSubmission table filled with admin-created dummy records  
**Impact:** Minimal - can be filtered by `submitter_nim='ADMIN'`  
**Long-term Solution:** Phase 6 - Make submission_id nullable (schema migration)

### Risk 4: Calendar Event Duplication
**Risk:** Admin creates same prestasi twice with calendar enabled  
**Mitigation:** Check if event already exists before creating  
**Code:**
```typescript
const existingEvent = await prisma.calendarEvent.findFirst({
  where: {
    title: { contains: nama_lomba },
    start_date: tanggal,
    type: 'prestasi'
  }
})
if (!existingEvent && add_to_calendar) {
  // Create event
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All phases completed and tested locally
- [ ] API endpoints tested with Postman
- [ ] UI tested on Chrome, Firefox, Safari
- [ ] Mobile responsive verified
- [ ] Database queries optimized (check EXPLAIN)
- [ ] Error handling for all edge cases
- [ ] Success/error messages user-friendly

### Deployment Steps
1. [ ] Push code to GitHub
2. [ ] Vercel auto-deploys to production
3. [ ] Verify production ENV variables:
   - `DATABASE_URL` (Neon)
   - `CLOUDINARY_*` credentials
   - `JWT_SECRET`
4. [ ] Test in production:
   - Create prestasi via admin form
   - Verify appears on public site
   - Verify calendar event created
   - Check Cloudinary uploads
5. [ ] Monitor logs for errors
6. [ ] Test on mobile device

### Post-Deployment
- [ ] Document for other admins (add to ADMIN-GUIDE.md)
- [ ] Train admin users on new feature
- [ ] Monitor for 24h for unexpected issues
- [ ] Collect feedback from admin users

---

## 📈 FUTURE ENHANCEMENTS (Phase 6+)

### Schema Migration Option
If we want to fully remove PrestasiSubmission dependency:

**Migration SQL:**
```sql
-- Make submission_id nullable
ALTER TABLE apm_prestasi 
  ALTER COLUMN submission_id DROP NOT NULL;

-- Add source column to distinguish origin
ALTER TABLE apm_prestasi 
  ADD COLUMN source VARCHAR(50) DEFAULT 'submission';
  -- 'submission' | 'admin' | 'import'

-- Update existing admin-created records
UPDATE apm_prestasi 
SET source = 'admin'
WHERE submission_id IN (
  SELECT id FROM apm_prestasi_submissions 
  WHERE submitter_nim = 'ADMIN'
);
```

**Impact:**
- Cleaner data model
- No dummy submissions
- Requires careful testing in production

### Bulk Import Feature
**Use Case:** Admin wants to import historical prestasi from Excel/CSV

**Implementation:**
- Add `/admin/prestasi/import` page
- Upload CSV with prestasi data
- Parse and validate
- Bulk create via `/api/admin/prestasi/bulk` endpoint
- Set `source='import'`

### Prestasi Templates
**Use Case:** Recurring competitions (e.g., Gemastik, PKM)

**Implementation:**
- Save common fields as template
- Auto-fill form based on template
- Admin just changes specific details

---

## 📞 SUPPORT & MAINTENANCE

### Contact
**Developer:** Zamani  
**Documentation:** `/docs/ADMIN-DIRECT-PRESTASI-PLAN.md`  
**API Docs:** Inline comments in route files

### Known Limitations
1. Cannot edit published prestasi directly (must use /admin/prestasi/[id]/publish)
2. Cannot delete published prestasi (only superadmin via API)
3. Calendar events not auto-deleted when prestasi deleted
4. Cloudinary files not auto-deleted when prestasi deleted

### Troubleshooting
**Problem:** Form submission fails  
**Solution:** Check browser console for errors, verify Cloudinary URLs

**Problem:** Prestasi not appearing on public site  
**Solution:** Verify `is_published=true` in database

**Problem:** Calendar event not created  
**Solution:** Verify `add_to_calendar=true` and `tanggal` is provided

---

## ✅ FINAL CHECKLIST

### Backend (Phase 1)
- [ ] Create `/api/admin/prestasi/direct/route.ts`
- [ ] Add `createPrestasiDirectSchema` validation
- [ ] Implement transaction logic for atomic creation
- [ ] Add calendar event creation logic
- [ ] Test all API endpoints
- [ ] Verify Cloudinary URLs stored correctly in database

### Frontend (Phase 2)
- [ ] Create `/admin/prestasi/create/page.tsx`
- [ ] Implement form with all sections
- [ ] **Integrate thumbnail upload (REQUIRED field)**
- [ ] **Integrate galeri upload (OPTIONAL field, max 10 images)**
- [ ] **Add image preview after upload**
- [ ] **Add drag & drop reordering for galeri**
- [ ] Integrate sertifikat upload
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add "Create" button to prestasi list page

### Homepage Stats (Phase 3)
- [ ] **Verify GET /api/site-settings returns correct counts**
- [ ] **Test stats update after creating prestasi**
- [ ] **Test stats update after creating lomba**
- [ ] **Verify 5-minute cache revalidation works**
- [ ] **Optional: Add revalidatePath('/') for instant update**

### Detail Page (Phase 4)
- [ ] **Verify GET /api/prestasi?slug=... returns thumbnailUrl & galeri**
- [ ] **Verify detail page displays thumbnail as hero image**
- [ ] **Verify detail page displays galeri in grid layout**
- [ ] **Add image lightbox for full-screen view (optional)**
- [ ] **Test with multiple images (1, 5, 10 images)**

### Calendar Integration (Phase 5)
- [ ] Auto-create CalendarEvent when enabled
- [ ] Add 'prestasi' event type to calendar

### Testing (Phase 6)
- [ ] API tests (success & error cases)
- [ ] UI tests (form submission)
- [ ] **Test thumbnail upload & preview**
- [ ] **Test galeri upload & preview (multiple images)**
- [ ] **Test homepage stats update (wait 5min or clear cache)**
- [ ] **Test detail page displays thumbnail & galeri correctly**
- [ ] Integration tests (end-to-end)
- [ ] Mobile responsive testing

### Documentation (Phase 7)
- [ ] Update BLUEPRINT.md
- [ ] Create ADMIN-GUIDE.md
- [ ] Add inline code comments
- [ ] Update API documentation

---

**END OF PLAN**

*This plan provides complete context for implementing Admin Direct Prestasi Creation feature without requiring further clarification. All phases can be executed sequentially or in parallel where dependencies allow.*
