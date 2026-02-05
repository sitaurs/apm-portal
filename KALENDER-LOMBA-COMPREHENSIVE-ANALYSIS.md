# Kalender & Lomba Features - Comprehensive Technical Analysis

**Date:** February 5, 2026  
**Project:** APM Portal - Next.js Application  
**Analysis Type:** Backend & Frontend Flow Documentation  

---

## EXECUTIVE SUMMARY

This analysis covers the complete technical implementation of the **Lomba (Competition)** and **Kalender (Calendar)** features in the APM Portal. Both features are **functionally complete** with modern architecture, but several gaps exist around multi-media support, dynamic form fields, navbar visibility, and field naming inconsistencies.

### Key Findings:
✅ **Working:** Full CRUD for Lomba, Calendar aggregation API, Cloudinary integration, tipe_pendaftaran modes  
⚠️ **Gaps:** No thumbnail field, limited multi-poster support, navbar missing Kalender link, field mapping inconsistencies  
🔧 **Priority:** Field normalization, navbar update, thumbnail field addition, form builder UI

---

## 1. DATABASE SCHEMA ANALYSIS

### 1.1 Lomba Model

**File:** [prisma/schema.prisma](prisma/schema.prisma#L40-L93)

```prisma
model Lomba {
  id                  Int       @id @default(autoincrement())
  nama_lomba          String
  slug                String    @unique
  deskripsi           String?   @db.Text
  kategori            String
  tingkat             String    // regional, nasional, internasional

  deadline            DateTime?
  tanggal_pelaksanaan DateTime?

  penyelenggara       String?
  lokasi              String?

  // Registration Type
  sumber              String    @default("internal")
  tipe_pendaftaran    String    @default("internal") // internal, eksternal, none
  link_pendaftaran    String?
  custom_form         Json?     // FormFieldDefinition[]

  // Details
  syarat_ketentuan    String?   @db.Text
  hadiah              Json?
  biaya               Int       @default(0)
  kontak_panitia      Json?

  // Display
  poster              String?   // ⚠️ Single field only
  tags                Json?
  is_featured         Boolean   @default(false)
  is_urgent           Boolean   @default(false)

  // Status
  status              String    @default("draft")
  is_deleted          Boolean   @default(false)

  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  registrations       LombaRegistration[]
}
```

#### Schema Strengths:
- ✅ Complete core fields (nama_lomba, kategori, tingkat, deadline, tanggal_pelaksanaan)
- ✅ `tipe_pendaftaran` supports: internal, eksternal, none
- ✅ `custom_form` (Json) for dynamic form builder
- ✅ Soft delete with `is_deleted`
- ✅ Featured & urgent flags for display priority

#### Schema Gaps:

| Gap | Impact | Priority |
|-----|--------|----------|
| **No `thumbnail` field** | Can't separate list thumbnail from full poster | **HIGH** |
| **Single `poster` field** | No multi-poster/flyer support | **MEDIUM** |
| **Field naming: `deadline` vs API `deadline_pendaftaran`** | Causes mapping complexity in API layer | **HIGH** |
| **Field naming: `syarat_ketentuan` vs API `persyaratan`** | Inconsistent naming between DB and frontend | **MEDIUM** |
| **Field naming: `biaya` vs API `biaya_pendaftaran`** | Requires mapping transformations | **MEDIUM** |
| **No `mode_pendaftaran` field** | `tipe_pendaftaran` serves this purpose (OK) | **N/A** |

**Recommendation:**
1. Add `thumbnail` field for list view (separate from poster)
2. Consider `galeri` Json field for multiple posters/flyers
3. Standardize field names (either use `deadline_pendaftaran` everywhere or `deadline` everywhere)

---

### 1.2 CalendarEvent Model

**File:** [prisma/schema.prisma](prisma/schema.prisma#L343-L362)

```prisma
model CalendarEvent {
  id            Int       @id @default(autoincrement())

  title         String
  description   String?
  type          String    @default("event") // event, meeting, announcement
  color         String?   @default("#3B82F6")

  start_date    DateTime
  end_date      DateTime?
  all_day       Boolean   @default(true)

  link          String?

  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}
```

#### Schema Strengths:
- ✅ Simple and flexible design
- ✅ Supports date ranges (start_date, end_date)
- ✅ Custom color for UI display
- ✅ Optional link for detail page

#### Schema Gaps:
| Gap | Impact | Priority |
|-----|--------|----------|
| No explicit source tracking | Events are generic, not linked to Lomba/Expo | **LOW** |
| Limited metadata | No kategori, tingkat, or tags | **LOW** |

**Note:** CalendarEvent is designed for **manual events only**. Lomba and Expo deadlines are aggregated dynamically via API (see Calendar API section).

---

### 1.3 LombaRegistration Model

**File:** [prisma/schema.prisma](prisma/schema.prisma#L95-L123)

```prisma
model LombaRegistration {
  id            Int       @id @default(autoincrement())
  lomba_id      Int

  // Required fields
  nama          String
  nim           String
  email         String
  whatsapp      String    // WAJIB
  fakultas      String
  prodi         String

  // Custom form data
  custom_data   Json?     // Data from custom form builder

  status        String    @default("registered")
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  lomba         Lomba     @relation(fields: [lomba_id], references: [id], onDelete: Cascade)
}
```

#### Strengths:
- ✅ Base fields for student registration
- ✅ `custom_data` (Json) for dynamic form responses
- ✅ Cascade delete when Lomba is deleted
- ✅ WhatsApp field mandatory (critical for contact)

#### Gaps:
- **No registration validation against deadline** (handled in API only)

---

## 2. API ENDPOINT ANALYSIS

### 2.1 Public Lomba API

#### GET /api/lomba
**File:** [app/api/lomba/route.ts](app/api/lomba/route.ts#L1-L109)

**Features:**
- ✅ Pagination (page, limit)
- ✅ Filter by: kategori, tingkat, status, featured, search
- ✅ Slug-based single lomba fetch
- ✅ Force dynamic rendering (`export const dynamic = 'force-dynamic'`)

**Field Mapping (DB → API):**
```typescript
// Lines 63-93
{
  deadline: item.deadline,              // DB: deadline
  deadline_pendaftaran: item.deadline,  // ⚠️ Duplicate mapping
  tipePendaftaran: item.tipe_pendaftaran,
  posterUrl: item.poster,
  // ... other fields
}
```

**Issues:**
- ⚠️ **Field name duplication** (both `deadline` and `deadline_pendaftaran` sent)
- ⚠️ **Case inconsistency** (camelCase vs snake_case)
- Status filter defaults to: `['open', 'draft', 'ongoing', 'published']` but DB only has: `draft, open, closed` (lines 42-44)

---

### 2.2 Public Lomba Registration API

#### POST /api/lomba/[slug]/register
**File:** [app/api/lomba/[slug]/register/route.ts](app/api/lomba/[slug]/register/route.ts#L1-L215)

**Features:**
- ✅ Rate limiting by IP (submission rate limiter)
- ✅ Duplicate check (by email or NIM)
- ✅ Deadline validation
- ✅ tipe_pendaftaran validation (must be 'internal')
- ✅ Dynamic form validation using `generateFormSchema`
- ✅ Custom form data stored in `custom_data` field

**Validation Flow:**
1. Base fields validation (nama, email, nim, fakultas, prodi, whatsapp)
2. Custom form fields validation (if `custom_form` exists)
3. Duplicate registration check
4. Deadline check
5. Create registration

**Strengths:**
- Excellent validation coverage
- Proper error handling with specific messages
- Dynamic form engine integration

**Gaps:**
- No confirmation email sent after registration
- No registration count limit check

---

### 2.3 Admin Lomba CRUD API

#### GET /api/admin/lomba
**File:** [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts#L1-L192)

**Features:**
- ✅ Pagination, search, filtering
- ✅ Registration count via `_count`
- ✅ Field mapping for API compatibility

**Field Mapping Issues:**
```typescript
// Lines 76-85 - Response transformation
deadline_pendaftaran: item.deadline,    // Maps DB 'deadline' to API 'deadline_pendaftaran'
```

This creates **bidirectional mapping complexity**.

---

#### POST /api/admin/lomba
**File:** [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts#L106-L192)

**Field Mapping (API → DB):**
```typescript
// Lines 145-171
deadline: body.deadline_pendaftaran ? new Date(body.deadline_pendaftaran) : 
          (body.deadline ? new Date(body.deadline) : null),
syarat_ketentuan: body.persyaratan || body.syarat_ketentuan || null,
biaya: body.biaya_pendaftaran ?? body.biaya ?? 0,
poster: body.poster_url || body.poster || null,
custom_form: body.form_config || body.custom_form || null,
```

**Issues:**
- ⚠️ **Dual field acceptance** creates confusion (which one is canonical?)
- ⚠️ Fallback logic makes debugging harder
- ⚠️ No validation that both fields aren't contradictory

---

#### PATCH /api/admin/lomba/[id]
**File:** [app/api/admin/lomba/[id]/route.ts](app/api/admin/lomba/[id]/route.ts#L1-L256)

**Features:**
- ✅ Partial update support
- ✅ Slug uniqueness check
- ✅ Auto-slug generation from nama_lomba
- ✅ Soft delete support

**Same field mapping issues as POST**

---

#### DELETE /api/admin/lomba/[id]
**File:** [app/api/admin/lomba/[id]/route.ts](app/api/admin/lomba/[id]/route.ts#L221-L256)

**Features:**
- ✅ Soft delete (sets `is_deleted = true`)
- ✅ Registration count check
- ✅ Force delete option (`?force=true`)
- ✅ Superadmin-only access

---

### 2.4 Admin Lomba Registration API

#### GET /api/admin/lomba/[id]/registrations
**File:** [app/api/admin/lomba/[id]/registrations/route.ts](app/api/admin/lomba/[id]/registrations/route.ts#L1-L177)

**Features:**
- ✅ Pagination
- ✅ Search by nama, nim, email
- ✅ Status filter
- ✅ Export support (JSON, CSV)

**Strengths:**
- Clean implementation
- Good use of Prisma select for performance

---

### 2.5 Calendar Aggregation API

#### GET /api/calendar
**File:** [app/api/calendar/route.ts](app/api/calendar/route.ts#L1-L239)

**Features:**
- ✅ Aggregates events from 3 sources:
  1. CalendarEvent table (manual events)
  2. Lomba deadlines + pelaksanaan dates
  3. Expo dates
- ✅ Month/year filtering
- ✅ Type filtering (lomba, expo, deadline, event)
- ✅ Source filtering
- ✅ Limit parameter

**Implementation:**
```typescript
// Lines 63-106 - CalendarEvent aggregation
const calendarEvents = await prisma.calendarEvent.findMany({
  where: {
    is_active: true,
    OR: [
      { start_date: { gte: startDate, lte: endDate } },
      { AND: [{ start_date: { lte: endDate } }, { end_date: { gte: startDate } }] }
    ]
  }
})

// Lines 109-156 - Lomba aggregation
const lombas = await prisma.lomba.findMany({
  where: {
    status: { not: 'closed' },
    is_deleted: false,
    deadline: { gte: startDate, lte: endDate }
  }
})

// Creates TWO calendar events per Lomba:
events.push(
  // 1. Deadline event
  { id: `lomba-deadline-${l.id}`, title: `[Deadline] ${l.nama_lomba}`, type: 'deadline', ... },
  // 2. Pelaksanaan event
  { id: `lomba-exec-${l.id}`, title: l.nama_lomba, type: 'lomba', ... }
)
```

**Strengths:**
- Smart aggregation from multiple sources
- Color-coded by source (lomba: blue, deadline: red/orange, expo: purple)
- Links back to detail pages

**Gaps:**
- No caching (every request hits DB 3 times)
- No admin API for CalendarEvent CRUD (missing entirely)

---

## 3. FRONTEND ANALYSIS

### 3.1 Public Lomba Page

#### /app/lomba/page.tsx
**File:** [app/lomba/page.tsx](app/lomba/page.tsx#L1-L32)

**Implementation:**
- Server component that fetches initial data
- Passes data to client component (LombaPageClient)
- Uses `next: { revalidate: 60 }` for ISR

**Issues:**
- ⚠️ Hardcoded limit=100 (should be configurable)
- ⚠️ No error boundary

---

### 3.2 Lomba Detail Page

#### /app/lomba/[slug]/page.tsx
**File:** [app/lomba/[slug]/page.tsx](app/lomba/[slug]/page.tsx#L1-L400)

**Features:**
- ✅ Breadcrumbs
- ✅ Countdown timer to deadline
- ✅ Quick info cards (deadline, lokasi, peserta, biaya)
- ✅ Conditional registration button based on `tipe_pendaftaran`:
  - **internal** → Link to `/lomba/[slug]/daftar`
  - **eksternal** → External link to `link_pendaftaran`
  - **none** → Info only message
- ✅ Poster display
- ✅ Contact info (email, phone, website)
- ✅ Hadiah, timeline, syarat display

**Strengths:**
- Well-designed UI with proper UX
- Proper handling of tipe_pendaftaran

**Gaps:**
- No sharing functionality (bookmark/share buttons are placeholders)
- No related lomba section

---

### 3.3 Lomba Registration Page

#### /app/lomba/[slug]/daftar/page.tsx
**File:** [app/lomba/[slug]/daftar/page.tsx](app/lomba/[slug]/daftar/page.tsx#L1-L478)

**Features:**
- ✅ Client-side validation
- ✅ Dynamic form rendering (if custom_form exists)
- ✅ Success/error state handling
- ✅ Redirect to lomba detail after success

**Gaps:**
- Custom form builder UI not visible in this file (likely in FormField components)
- No form builder admin UI mentioned

---

### 3.4 Kalender Page

#### /app/kalender/page.tsx
**File:** [app/kalender/page.tsx](app/kalender/page.tsx#L1-L563)

**Features:**
- ✅ Calendar view (grid) and list view toggle
- ✅ Month navigation (prev/next)
- ✅ Filter by event type (lomba, expo, deadline, event)
- ✅ Search functionality
- ✅ Event summary stats
- ✅ Click on date to see events
- ✅ Upcoming events sidebar

**Implementation:**
```typescript
// Lines 74-98 - Fetch events from API when month changes
useEffect(() => {
  async function fetchEvents() {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
    const data = await res.json();
    
    // Transform snake_case to camelCase
    const transformedEvents = data.data.events.map((event) => ({
      startDate: event.start_date,
      endDate: event.end_date,
      // ...
    }));
  }
  fetchEvents();
}, [currentMonth]);
```

**Strengths:**
- Modern calendar UI with date-fns for date manipulation
- Smart event grouping by date
- Responsive design

**Gaps:**
- No "today" indicator on calendar grid
- No event detail modal (clicking event just selects date)
- Loading state exists but calendar can appear empty during load

---

### 3.5 Admin Lomba Pages

#### /app/admin/lomba/page.tsx
**File:** [app/admin/lomba/page.tsx](app/admin/lomba/page.tsx#L1-L400)

**Features:**
- ✅ Data table with search & filters
- ✅ Pagination
- ✅ Status badges
- ✅ Featured indicator (star icon)
- ✅ Soft delete indicator
- ✅ Restore deleted lomba
- ✅ Quick actions (view, edit, registrations, delete)

**Strengths:**
- Clean admin UI
- Proper state management

---

#### /app/admin/lomba/create/page.tsx
**File:** [app/admin/lomba/create/page.tsx](app/admin/lomba/create/page.tsx#L1-L520)

**Features:**
- ✅ Auto-slug generation from nama_lomba
- ✅ Image upload (single poster) via ImageUpload component
- ✅ tipe_pendaftaran radio selection with descriptions
- ✅ Conditional fields (eksternal shows link_pendaftaran)
- ✅ RichTextEditor for deskripsi
- ✅ Form validation

**Field Names Used:**
```typescript
// Lines 13-30
interface LombaFormData {
  nama_lomba: string;
  deadline_pendaftaran: string;  // ⚠️ API name, not DB name
  tanggal_pelaksanaan: string;
  persyaratan: string;            // ⚠️ API name, not DB name
  biaya_pendaftaran: number;      // ⚠️ API name, not DB name
  poster: string;                 // ⚠️ Matches DB (poster, not poster_url)
  // ...
}
```

**Issues:**
- ⚠️ Uses API field names (deadline_pendaftaran) instead of DB names (deadline)
- ⚠️ Creates confusion about canonical field names

---

#### /app/admin/lomba/[id]/edit/page.tsx
**File:** [app/admin/lomba/[id]/edit/page.tsx](app/api/admin/lomba/[id]/edit/page.tsx#L1-L541)

**Features:**
- ✅ Pre-fills form with existing data
- ✅ Same UI as create page
- ✅ Field mapping on fetch:
  ```typescript
  // Lines 89-104
  deadline_pendaftaran: lomba.deadline_pendaftaran?.split('T')[0],
  persyaratan: lomba.persyaratan || lomba.syarat_ketentuan,
  biaya_pendaftaran: lomba.biaya_pendaftaran || lomba.biaya,
  poster: lomba.poster_url || lomba.poster,
  ```

**Issues:**
- Same field mapping complexity as create page

---

### 3.6 Navbar Analysis

**File:** [components/layout/Header.tsx](components/layout/Header.tsx#L1-L198) & [lib/constants.ts](lib/constants.ts#L1-L50)

**mainNavigation structure:**
```typescript
// Lines 14-50 in lib/constants.ts
export const mainNavigation = [
  {
    name: 'Lomba',
    href: '/lomba',
    submenu: [/* ... */],
  },
  {
    name: 'Prestasi',
    href: '/prestasi',
    submenu: [/* ... */],
  },
  {
    name: 'Expo',
    href: '/expo',
    submenu: [/* ... */],
  },
  // ⚠️ NO KALENDER LINK
]
```

**Issue:**
- ❌ **Kalender link is MISSING from navbar**
- ✅ Kalender link IS present in Footer ([components/layout/Footer.tsx](components/layout/Footer.tsx#L10))

**Impact:** Users can only access Kalender via:
1. Direct URL: `/kalender`
2. Footer link
3. NOT from main navigation

**Priority:** **HIGH** - Major discoverability issue

---

## 4. CLOUDINARY INTEGRATION ANALYSIS

### 4.1 Upload API

**File:** [app/api/upload/route.ts](app/api/upload/route.ts#L1-L178)

**Features:**
- ✅ Handles single file or multiple files
- ✅ Image validation (JPEG, PNG, GIF, WebP)
- ✅ Document validation (PDF, DOC, DOCX)
- ✅ Size limits: 5MB (images), 10MB (docs)
- ✅ Category-based folder structure: `apm/{category}/`
- ✅ Auto optimization for images

**Implementation:**
```typescript
// Lines 70-91
async function processFile(file: File, category: string): Promise<UploadResult> {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const result = await uploadToCloudinary(buffer, category, isImage ? 'image' : 'raw');
  
  return {
    filename: file.name,
    url: result.url,
    size: file.size,
    type: file.type,
    publicId: result.publicId,
  };
}
```

**Strengths:**
- Clean API design
- Proper error handling
- Category support for organization

**Gaps:**
- No delete endpoint (orphaned files if upload succeeds but DB save fails)
- No cleanup job for unused files

---

### 4.2 ImageUpload Component

**File:** [components/admin/ImageUpload.tsx](components/admin/ImageUpload.tsx#L1-L305)

**Features:**
- ✅ Drag & drop support
- ✅ Multiple file upload (configurable)
- ✅ Preview before upload
- ✅ Upload progress state
- ✅ Calls `/api/upload` endpoint
- ✅ Returns Cloudinary URL

**Usage in Lomba Create/Edit:**
```typescript
// app/admin/lomba/create/page.tsx lines 255-262
<ImageUpload
  value={formData.poster}
  onChange={(value) => setFormData(prev => ({ ...prev, poster: value as string }))}
  category="lomba"
  label="Upload Poster"
  helperText="Ukuran rekomendasi: 800x1200px (Portrait). Max 5MB."
/>
```

**Strengths:**
- Excellent UX with drag & drop
- Proper loading states

**Gaps:**
- Single poster only (no multi-poster support)
- No thumbnail variant generation

---

## 5. DATA FLOW ISSUES

### 5.1 Field Naming Inconsistencies

**Problem:** Same data has different names across layers:

| Database (Prisma) | API (Request/Response) | Frontend (Form) | Status |
|-------------------|------------------------|-----------------|--------|
| `deadline` | `deadline_pendaftaran` | `deadline_pendaftaran` | ⚠️ Inconsistent |
| `syarat_ketentuan` | `persyaratan` | `persyaratan` | ⚠️ Inconsistent |
| `biaya` | `biaya_pendaftaran` | `biaya_pendaftaran` | ⚠️ Inconsistent |
| `poster` | `poster_url` | `poster` | ⚠️ Inconsistent |
| `custom_form` | `form_config` | `form_config` | ⚠️ Inconsistent |

**Impact:**
- Complex mapping logic in API layer (lines 145-171 in POST, lines 124-165 in PATCH)
- Risk of bugs when field names change
- Harder to maintain

**Recommendation:**
1. **Option A:** Standardize on DB names everywhere (simpler, cleaner)
2. **Option B:** Create TypeScript types for each layer with proper transformers
3. **Current workaround:** Dual-field acceptance (both names work) - fragile

---

### 5.2 Calendar Event Sources

**Data Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                     /api/calendar                           │
│                                                             │
│  1. CalendarEvent table                                     │
│     └─> Manual events (is_active = true)                   │
│                                                             │
│  2. Lomba table                                             │
│     ├─> deadline → "[Deadline] {nama_lomba}" (type=deadline)│
│     └─> tanggal_pelaksanaan → "{nama_lomba}" (type=lomba)  │
│                                                             │
│  3. Expo table                                              │
│     └─> tanggal_mulai/selesai → "{nama_event}" (type=expo) │
│                                                             │
│  ▼ Aggregated, sorted, limited                             │
│  ▼ Sent to /app/kalender/page.tsx                          │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- Single endpoint for all event sources
- Auto-sync (Lomba/Expo dates appear in calendar immediately)
- Color-coded by source

**Gaps:**
- No cache layer (3 DB queries per request)
- No admin UI to create CalendarEvent entries

---

## 6. GAP IDENTIFICATION

### 6.1 Database Schema Gaps

| Gap | Description | Priority | File Reference |
|-----|-------------|----------|----------------|
| **No thumbnail field** | Can't have separate list thumbnail vs full poster | **HIGH** | [schema.prisma](prisma/schema.prisma#L77) |
| **Single poster field** | No support for multiple posters/flyers | **MEDIUM** | [schema.prisma](prisma/schema.prisma#L77) |
| **Field naming inconsistency** | deadline vs deadline_pendaftaran, etc. | **HIGH** | Throughout |

### 6.2 API Endpoint Gaps

| Gap | Description | Priority | File Reference |
|-----|-------------|----------|----------------|
| **No CalendarEvent CRUD API** | Can't create/edit manual calendar events from admin | **HIGH** | Missing entirely |
| **No cache layer** | Calendar API hits DB 3 times per request | **MEDIUM** | [app/api/calendar/route.ts](app/api/calendar/route.ts#L63-L189) |
| **No upload cleanup** | Orphaned Cloudinary files if DB save fails | **LOW** | [app/api/upload/route.ts](app/api/upload/route.ts#L1-L178) |
| **Duplicate field mapping** | API accepts both old and new field names | **MEDIUM** | [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts#L145-L171) |

### 6.3 Frontend Component Gaps

| Gap | Description | Priority | File Reference |
|-----|-------------|----------|----------------|
| **Kalender missing from navbar** | Link only in footer, not main nav | **HIGH** | [lib/constants.ts](lib/constants.ts#L14-L50) |
| **No multi-poster UI** | ImageUpload component only handles single file for poster | **MEDIUM** | [components/admin/ImageUpload.tsx](components/admin/ImageUpload.tsx#L1-L305) |
| **No form builder admin UI** | custom_form field exists but no UI to create forms | **HIGH** | Missing |
| **No CalendarEvent admin page** | Can't manage manual calendar events | **HIGH** | Missing |
| **No event detail modal** | Clicking event in calendar only selects date | **LOW** | [app/kalender/page.tsx](app/kalender/page.tsx#L1-L563) |

### 6.4 Integration Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| **No confirmation email** | Registration succeeds but no email sent | **MEDIUM** |
| **No registration limit** | Lomba can exceed capacity | **LOW** |
| **No analytics** | No tracking of views, clicks, conversions | **LOW** |

---

## 7. PRIORITY-RANKED IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Week 1)

#### 1.1 Add Kalender to Navbar ⚡ **IMMEDIATE**
**File:** [lib/constants.ts](lib/constants.ts#L14-L50)

**Change:**
```typescript
export const mainNavigation = [
  { name: 'Lomba', href: '/lomba', submenu: [/* ... */] },
  { name: 'Prestasi', href: '/prestasi', submenu: [/* ... */] },
  { name: 'Expo', href: '/expo', submenu: [/* ... */] },
  + { name: 'Kalender', href: '/kalender' }, // ADD THIS
]
```

**Impact:** High user value, 5-minute fix

---

#### 1.2 Standardize Field Names ⚡ **HIGH PRIORITY**

**Problem:** Inconsistent field names between DB, API, and frontend

**Solution Options:**

**Option A: Use DB Names Everywhere** (Recommended)
- Migrate all API/frontend to use: `deadline`, `syarat_ketentuan`, `biaya`, `poster`, `custom_form`
- Remove dual-field acceptance logic
- Update TypeScript interfaces

**Option B: Keep API Names, Add Transformers**
- Create Prisma middleware or Zod transformers
- Maintain backward compatibility

**Files to Update:**
1. [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts) - Lines 145-171 (POST), 76-85 (GET response)
2. [app/api/admin/lomba/[id]/route.ts](app/api/admin/lomba/[id]/route.ts) - Lines 124-165 (PATCH)
3. [app/admin/lomba/create/page.tsx](app/admin/lomba/create/page.tsx) - Lines 13-30 (FormData interface)
4. [app/admin/lomba/[id]/edit/page.tsx](app/admin/lomba/[id]/edit/page.tsx) - Lines 18-35 (FormData interface)

**Effort:** 4-6 hours
**Risk:** Medium (requires testing all CRUD flows)

---

#### 1.3 Add Thumbnail Field to Lomba Schema ⚡ **HIGH PRIORITY**

**Migration:**
```sql
-- Add thumbnail field to Lomba table
ALTER TABLE apm_lomba ADD COLUMN thumbnail VARCHAR(500);

-- Optionally copy poster to thumbnail for existing records
UPDATE apm_lomba SET thumbnail = poster WHERE thumbnail IS NULL AND poster IS NOT NULL;
```

**Schema Change:**
```prisma
model Lomba {
  // ...
  poster              String?   // Full poster (high-res)
  + thumbnail         String?   // List thumbnail (optimized)
  // ...
}
```

**API Updates:**
- [app/api/lomba/route.ts](app/api/lomba/route.ts#L63-L93) - Add thumbnail to response
- [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts) - Add thumbnail field support

**Frontend Updates:**
- [app/lomba/page.tsx](app/lomba/page.tsx) - Use thumbnail in list view
- [app/admin/lomba/create/page.tsx](app/admin/lomba/create/page.tsx) - Add second ImageUpload for thumbnail

**Effort:** 3-4 hours
**Impact:** Better performance (smaller images in list view)

---

### Phase 2: Major Features (Week 2-3)

#### 2.1 Build CalendarEvent Admin CRUD ⚡ **HIGH VALUE**

**Missing Files to Create:**

1. **API Routes:**
   - `app/api/admin/calendar/route.ts` - GET (list), POST (create)
   - `app/api/admin/calendar/[id]/route.ts` - GET (single), PATCH (update), DELETE

2. **Admin Pages:**
   - `app/admin/calendar/page.tsx` - List all manual events
   - `app/admin/calendar/create/page.tsx` - Create event form
   - `app/admin/calendar/[id]/edit/page.tsx` - Edit event form

**Features to Include:**
- Title, description, type (dropdown: event, meeting, announcement)
- Start/end date pickers
- Color picker
- Link (optional)
- is_active toggle

**Effort:** 12-16 hours
**Impact:** Enables admin to add holidays, meetings, important dates

---

#### 2.2 Build Form Builder Admin UI ⚡ **HIGH VALUE**

**Current State:**
- `custom_form` field exists in DB (Json type)
- Dynamic form validation engine exists ([lib/form-validation/engine.ts](lib/form-validation/engine.ts))
- **Missing:** UI to CREATE custom forms

**Required Components:**
1. Form builder drag-and-drop interface
2. Field type selector (text, number, select, checkbox, file, etc.)
3. Validation rules UI
4. Preview panel
5. Save as JSON to `custom_form` field

**Reference Implementation:**
- Consider using libraries: `react-hook-form`, `formik`, or `react-jsonschema-form`
- Store in format matching `FormFieldDefinition` type

**Effort:** 20-30 hours (complex feature)
**Impact:** Enables custom registration forms per lomba

---

#### 2.3 Add Multi-Poster Support

**Schema Change:**
```prisma
model Lomba {
  // ...
  poster              String?   // Main poster
  thumbnail           String?   // List thumbnail
  + galeri            Json?     // Array of additional posters/flyers
  // ...
}
```

**Frontend Changes:**
- Update ImageUpload component to support multiple files
- Add gallery section to detail page
- Add image carousel/lightbox

**Effort:** 8-10 hours

---

### Phase 3: Performance & Polish (Week 4)

#### 3.1 Add Cache Layer to Calendar API

**Implementation:**
- Use Next.js unstable_cache or Redis
- Cache key: `calendar:{year}:{month}`
- TTL: 5 minutes
- Invalidate on Lomba/Expo create/update/delete

**Effort:** 4-6 hours

---

#### 3.2 Add Confirmation Email

**Requirements:**
- SMTP service (SendGrid, Mailgun, Resend)
- Email template
- Send after successful registration

**Effort:** 6-8 hours

---

#### 3.3 Polish UI/UX

**Items:**
- Event detail modal in calendar view
- Today indicator on calendar grid
- Related lomba section on detail page
- Sharing functionality (social media, copy link)
- Loading skeletons for better perceived performance

**Effort:** 10-12 hours

---

## 8. IMPLEMENTATION RECOMMENDATIONS

### 8.1 Field Naming Standard

**Adopt This Standard:**

```typescript
// Database (Prisma) = API = Frontend
{
  deadline: Date,
  syarat_ketentuan: string,
  biaya: number,
  poster: string,
  custom_form: Json,
}
```

**Migration Path:**
1. Update API to use DB names
2. Add deprecation warnings for old names
3. Update frontend forms
4. Remove dual-field support after 1 sprint

---

### 8.2 Thumbnail Strategy

**Options:**

**Option A: Separate Field** (Recommended)
- Pros: Explicit control, better semantics
- Cons: More fields

**Option B: Cloudinary Transformations**
- Store only full poster URL
- Generate thumbnail on-the-fly: `poster.replace('/upload/', '/upload/w_400,h_600,c_fill/')`
- Pros: Less storage, automatic
- Cons: Couples to Cloudinary

**Recommendation:** Use Option A for clarity

---

### 8.3 Form Builder Architecture

**JSON Schema Format:**
```json
{
  "fields": [
    {
      "id": "team_name",
      "type": "text",
      "label": "Nama Tim",
      "required": true,
      "validation": {
        "minLength": 3,
        "maxLength": 50
      }
    },
    {
      "id": "team_size",
      "type": "number",
      "label": "Jumlah Anggota",
      "required": true,
      "validation": {
        "min": 1,
        "max": 5
      }
    }
  ]
}
```

**Renderer:**
- Map `type` to form components
- Apply validation rules
- Store responses in `custom_data`

---

## 9. TESTING CHECKLIST

Before deployment, test:

- [ ] Create lomba with all tipe_pendaftaran modes (internal, eksternal, none)
- [ ] Register for internal lomba
- [ ] Verify deadline validation
- [ ] Check duplicate registration prevention
- [ ] Test calendar aggregation (lomba + expo + manual events)
- [ ] Verify month navigation in calendar
- [ ] Test filter/search in all pages
- [ ] Upload images to Cloudinary
- [ ] Verify soft delete/restore
- [ ] Check admin pagination
- [ ] Test mobile responsiveness

---

## 10. SUMMARY TABLE

| Feature | Status | Files Involved | Priority |
|---------|--------|----------------|----------|
| **Lomba CRUD (Admin)** | ✅ Complete | [app/api/admin/lomba/*](app/api/admin/lomba), [app/admin/lomba/*](app/admin/lomba) | - |
| **Lomba Public API** | ✅ Complete | [app/api/lomba/route.ts](app/api/lomba/route.ts) | - |
| **Lomba Registration** | ✅ Complete | [app/api/lomba/[slug]/register/route.ts](app/api/lomba/[slug]/register/route.ts) | - |
| **Calendar Aggregation** | ✅ Complete | [app/api/calendar/route.ts](app/api/calendar/route.ts) | - |
| **Cloudinary Upload** | ✅ Complete | [app/api/upload/route.ts](app/api/upload/route.ts) | - |
| **tipe_pendaftaran Support** | ✅ Complete | Throughout | - |
| **Kalender in Navbar** | ❌ Missing | [lib/constants.ts](lib/constants.ts#L14-L50) | **HIGH** |
| **Thumbnail Field** | ❌ Missing | [prisma/schema.prisma](prisma/schema.prisma#L77) | **HIGH** |
| **Field Naming Consistency** | ⚠️ Inconsistent | All API/form files | **HIGH** |
| **CalendarEvent Admin** | ❌ Missing | Need to create | **HIGH** |
| **Form Builder UI** | ❌ Missing | Need to create | **HIGH** |
| **Multi-Poster Support** | ⚠️ Limited | Schema + Frontend | **MEDIUM** |
| **Cache Layer** | ❌ Missing | [app/api/calendar/route.ts](app/api/calendar/route.ts) | **MEDIUM** |
| **Confirmation Email** | ❌ Missing | Registration flow | **MEDIUM** |

---

## APPENDIX A: File Index

### API Routes
- Public Lomba: [app/api/lomba/route.ts](app/api/lomba/route.ts)
- Lomba Registration: [app/api/lomba/[slug]/register/route.ts](app/api/lomba/[slug]/register/route.ts)
- Admin Lomba List: [app/api/admin/lomba/route.ts](app/api/admin/lomba/route.ts)
- Admin Lomba Detail: [app/api/admin/lomba/[id]/route.ts](app/api/admin/lomba/[id]/route.ts)
- Admin Registrations: [app/api/admin/lomba/[id]/registrations/route.ts](app/api/admin/lomba/[id]/registrations/route.ts)
- Calendar: [app/api/calendar/route.ts](app/api/calendar/route.ts)
- Upload: [app/api/upload/route.ts](app/api/upload/route.ts)

### Frontend Pages
- Lomba List: [app/lomba/page.tsx](app/lomba/page.tsx)
- Lomba Detail: [app/lomba/[slug]/page.tsx](app/lomba/[slug]/page.tsx)
- Lomba Registration: [app/lomba/[slug]/daftar/page.tsx](app/lomba/[slug]/daftar/page.tsx)
- Kalender: [app/kalender/page.tsx](app/kalender/page.tsx)
- Admin Lomba List: [app/admin/lomba/page.tsx](app/admin/lomba/page.tsx)
- Admin Lomba Create: [app/admin/lomba/create/page.tsx](app/admin/lomba/create/page.tsx)
- Admin Lomba Edit: [app/admin/lomba/[id]/edit/page.tsx](app/admin/lomba/[id]/edit/page.tsx)

### Components
- Header: [components/layout/Header.tsx](components/layout/Header.tsx)
- Footer: [components/layout/Footer.tsx](components/layout/Footer.tsx)
- ImageUpload: [components/admin/ImageUpload.tsx](components/admin/ImageUpload.tsx)

### Config
- Navigation: [lib/constants.ts](lib/constants.ts)
- Cloudinary: [lib/cloudinary.ts](lib/cloudinary.ts)
- Schema: [prisma/schema.prisma](prisma/schema.prisma)

---

**END OF ANALYSIS**

**Next Steps:**
1. Review this analysis with team
2. Prioritize gaps based on business impact
3. Create implementation tickets for Phase 1
4. DO NOT implement code changes yet - wait for approval

**Questions for Team:**
- Should we standardize on DB field names or API field names?
- Is multi-poster support needed, or is single poster + galeri sufficient?
- What's the timeline for form builder feature?
- Do we need email confirmation immediately or can it wait?
