# 🎯 Kalender & Lomba - Rencana Implementasi Robust

**Tanggal:** 5 Februari 2026  
**Target Completion:** 4 Minggu  
**Status:** Ready for Implementation

---

## 📋 Executive Summary

Dokumen ini adalah **action plan** eksekusi lengkap untuk memperbaiki dan melengkapi fitur Kalender dan Lomba di APM Portal. Semua masalah yang teridentifikasi akan diselesaikan secara sistematis dengan prioritas berdasarkan dampak user.

### ✅ **DATABASE ACTUAL STATE (Verified 5 Feb 2026):**

**Table: apm_lomba**
- ✅ Total: 26 columns
- ✅ Fields present: nama_lomba, slug, kategori, tingkat, deadline, poster, tipe_pendaftaran, custom_form, hadiah, kontak_panitia, tags
- ❌ Missing: `thumbnail`, `posters[]`, `additional_fields`

**Table: apm_calendar_events**
- ✅ Complete: 12 columns with proper indexes
- ✅ Functional integration with Lomba & Expo

**Data Status:**
- 1 Lomba exists (is_deleted=true)
- 2 Calendar events (ID 1 just fixed: "Deadline LKTI" is_active=false)

### Masalah Utama yang Akan Diselesaikan:

1. ❌ **Kalender tidak ada di navbar** - User sulit akses
2. ❌ **Event tidak muncul di tanggal kalender** - UI tidak informatif  
3. ❌ **Lomba belum ada thumbnail** - List view tidak optimal
4. ❌ **Poster/flyer hanya 1 gambar** - Butuh multiple upload
5. ❌ **Field tambahan tidak bisa dikelola** - Admin terbatas
6. ❌ **Mode pendaftaran belum lengkap** - Flow tidak jelas
7. ❌ **Cache kalender** - Data lama masih muncul

---

## 🎯 PHASE 1: Quick Wins (Week 1)
**Target: Fix UI/UX Critical Issues**

### 1.1 Tambah Kalender ke Navbar ⚡ PRIORITY 1

**File:** `lib/constants.ts`

```typescript
// BEFORE: Kalender missing
export const mainNavigation = [
  { name: 'Lomba', ... },
  { name: 'Prestasi', ... },
  { name: 'Expo', ... },
  { name: 'Resources', ... },
  { name: 'Tentang', ... },
]

// AFTER: Add Kalender
export const mainNavigation = [
  { name: 'Lomba', ... },
  { name: 'Prestasi', ... },
  { name: 'Expo', ... },
  { name: 'Kalender', href: '/kalender' }, // ✅ NEW
  { name: 'Resources', ... },
  { name: 'Tentang', ... },
]
```

**Impact:** Kalender langsung accessible dari navbar utama

---

### 1.2 Fix Event Display di Kalender ⚡ PRIORITY 1

**Problem:** Event tidak muncul di tanggal (seperti referensi gambar user)

**File:** `app/kalender/page.tsx` (line 315-380)

**Changes:**

1. **Show event badges in calendar cells:**

```tsx
// CURRENT: Empty date cells
<div className="min-h-[80px]">
  <span>{date.getDate()}</span>
</div>

// IMPROVED: Show events as dots/badges
<div className="min-h-[80px]">
  <span>{date.getDate()}</span>
  {getEventsForDate(date).slice(0, 3).map(event => (
    <div key={event.id} className={cn(
      "text-xs truncate px-1 rounded mt-1",
      eventTypeColors[event.type].bg,
      eventTypeColors[event.type].text
    )}>
      {event.title}
    </div>
  ))}
  {getEventsForDate(date).length > 3 && (
    <div className="text-xs text-muted">
      +{getEventsForDate(date).length - 3} more
    </div>
  )}
</div>
```

2. **Add click handler to show event detail:**

```tsx
const handleDateClick = (date: Date) => {
  setSelectedDate(date)
  // Scroll to event detail sidebar
}
```

**Impact:** User bisa lihat event langsung di kalender (seperti referensi gambar)

---

### 1.3 Fix Cache Kalender ⚡ PRIORITY 1

**Problem:** "Deadline LKTi" masih muncul padahal sudah dihapus

**Root Cause CONFIRMED (Database Check 5 Feb 2026):**
```sql
-- CalendarEvent was still active
apm_calendar_events: id=1, title="Deadline LKTI Internal", is_active=TRUE

-- But Lomba was deleted
apm_lomba: id=1, nama_lomba="Lomba Karya Tulis Ilmiah Internal", is_deleted=TRUE
```

**✅ FIXED (5 Feb 2026):**
```sql
UPDATE apm_calendar_events 
SET is_active = false 
WHERE id = 1;
-- Result: "Deadline LKTI Internal" is now is_active=false
```

**Prevention Strategy - Auto-sync in DELETE API:**

**File:** `app/api/admin/lomba/[id]/route.ts`

```typescript
export async function DELETE(request: NextRequest, { params }: Context) {
  // ... auth ...
  
  const lomba = await prisma.lomba.update({
    where: { id: parseInt(params.id) },
    data: { is_deleted: true, updated_at: new Date() },
  })
  
  // ✅ NEW: Auto-deactivate related calendar events
  await prisma.calendarEvent.updateMany({
    where: {
      OR: [
        { title: { contains: lomba.nama_lomba } },
        { link: { contains: lomba.slug } }
      ]
    },
    data: { is_active: false }
  })
  
  return NextResponse.json({ success: true })
}
```

**Additional Cache Solutions:**

1. **Add force-dynamic to calendar API:**

```typescript
// File: app/api/calendar/route.ts
export const dynamic = 'force-dynamic' // ✅ Already exists
export const revalidate = 0 // ✅ Add this
```

2. **Clear old CalendarEvent data:**

```sql
-- Run this SQL to check what's in database
SELECT * FROM apm_calendar_events 
WHERE title LIKE '%LKTi%' OR title LIKE '%Deadline%';

-- If found, delete it
DELETE FROM apm_calendar_events 
WHERE id = [problematic_id];
```

3. **Add cache busting to frontend:**

```tsx
// File: app/kalender/page.tsx
useEffect(() => {
  async function fetchEvents() {
    const cacheBuster = Date.now()
    const res = await fetch(
      `/api/calendar?month=${month}&year=${year}&_=${cacheBuster}`
    )
    // ...
  }
}, [currentMonth])
```

**Testing:**
- Hard refresh: Ctrl+Shift+R
- Clear `.next/cache`
- Restart dev server

---

## 📊 **DATABASE VERIFICATION (5 Feb 2026)**

### Current Schema Analysis

**✅ apm_lomba Table (26 columns):**
```sql
EXISTING FIELDS:
  id, nama_lomba, slug, deskripsi
  kategori, tingkat
  deadline, tanggal_pelaksanaan
  penyelenggara, lokasi
  sumber, tipe_pendaftaran, link_pendaftaran
  custom_form (JSONB) ✅
  syarat_ketentuan, hadiah (JSONB)
  biaya, kontak_panitia (JSONB)
  poster (TEXT) ✅ - single only
  tags (JSONB)
  is_featured, is_urgent
  status, is_deleted
  created_at, updated_at

GAPS IDENTIFIED:
  ❌ thumbnail - Need to add for optimized list view
  ❌ posters - Need TEXT[] array for multiple posters
  ❌ additional_fields - Need JSONB for dynamic fields
```

**✅ apm_calendar_events Table (12 columns):**
```sql
ALL PRESENT:
  id, title, description, type, color
  start_date, end_date, all_day
  link, is_active
  created_at, updated_at

INDEXES:
  ✅ apm_calendar_events_start_date_idx
  ✅ apm_calendar_events_is_active_idx
```

**✅ Integration Check:**
- Calendar API aggregates from: CalendarEvent + Lomba + Expo ✅
- Lomba.deadline → feeds calendar ✅
- But NO auto-sync on delete ❌ (just fixed manually)

### Migration SQL Ready

```sql
-- Add missing columns to apm_lomba
ALTER TABLE apm_lomba 
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS posters TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_fields JSONB;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS apm_lomba_thumbnail_idx 
  ON apm_lomba(thumbnail) WHERE thumbnail IS NOT NULL;

-- Migrate existing poster to posters array (optional)
UPDATE apm_lomba 
SET posters = ARRAY[poster]::TEXT[]
WHERE poster IS NOT NULL 
  AND poster != '' 
  AND (posters IS NULL OR array_length(posters, 1) IS NULL);

-- Verify migration
SELECT id, nama_lomba, 
       thumbnail, 
       poster, 
       array_length(posters, 1) as poster_count,
       additional_fields
FROM apm_lomba 
LIMIT 3;
```

---

## 🏗️ PHASE 2: Database Schema (Week 2)
**Target: Add Missing Fields**

### 2.1 Add Thumbnail & Multiple Posters

**File:** `prisma/schema.prisma`

```prisma
model Lomba {
  // ... existing fields ...
  
  // BEFORE: Single poster only
  poster              String?   // Single poster URL
  
  // AFTER: Add thumbnail + multiple posters
  thumbnail           String?   // For list/card view (recommended 16:9, 800x450)
  poster              String?   // Main poster (kept for backward compatibility)
  posters             String[]  // Multiple posters/flyers array
  
  // ... rest of fields ...
}
```

**Migration SQL:**

```sql
-- Add new columns
ALTER TABLE apm_lomba 
ADD COLUMN thumbnail TEXT,
ADD COLUMN posters TEXT[] DEFAULT '{}';

-- Migrate existing poster to posters array (optional)
UPDATE apm_lomba 
SET posters = ARRAY[poster]::TEXT[]
WHERE poster IS NOT NULL AND poster != '';
```

**Run Migration:**
```bash
npx prisma db push
npx prisma generate
```

---

### 2.2 Add Dynamic Additional Fields

**File:** `prisma/schema.prisma`

```prisma
model Lomba {
  // ... existing fields ...
  
  // NEW: Dynamic additional fields
  additional_fields   Json?     // Array of {label: string, value: string}
  // Example:
  // [
  //   {label: "Link Panduan", value: "https://..."},
  //   {label: "Kontak WhatsApp", value: "08123..."},
  //   {label: "Grup Telegram", value: "t.me/..."}
  // ]
  
  // ... rest of fields ...
}
```

**Migration:**
```sql
ALTER TABLE apm_lomba 
ADD COLUMN additional_fields JSONB;
```

---

### 2.3 Improve Mode Pendaftaran

**Current State:** Field exists but flow not clear

**Schema (already good):**
```prisma
model Lomba {
  tipe_pendaftaran    String    @default("internal") 
  // Values: "internal", "eksternal", "info_only"
}
```

**Validation Rules to Add:**

```typescript
// lib/validations/lomba.ts
const tipePendaftaranEnum = z.enum(['internal', 'eksternal', 'info_only'])

const lombaSchema = z.object({
  // ...
  tipe_pendaftaran: tipePendaftaranEnum,
  
  // Conditional validation
  link_pendaftaran: z.string().url().optional()
    .refine((val, ctx) => {
      if (ctx.parent.tipe_pendaftaran === 'eksternal' && !val) {
        return false // Link wajib untuk eksternal
      }
      return true
    }, "Link pendaftaran wajib untuk tipe eksternal"),
    
  custom_form: z.any().optional()
    .refine((val, ctx) => {
      if (ctx.parent.tipe_pendaftaran === 'internal' && !val) {
        return false // Form wajib untuk internal
      }
      return true
    }, "Custom form wajib untuk tipe internal"),
})
```

---

## 🎨 PHASE 3: Backend API Updates (Week 2-3)
**Target: Complete CRUD + Field Support**

### 3.1 Update POST /api/admin/lomba - Support New Fields

**File:** `app/api/admin/lomba/route.ts` (line 110-180)

```typescript
export async function POST(request: NextRequest) {
  // ... auth & validation ...
  
  const lomba = await prisma.lomba.create({
    data: {
      // ... existing fields ...
      
      // ✅ NEW: Thumbnail
      thumbnail: body.thumbnail || null,
      
      // ✅ NEW: Multiple posters
      posters: body.posters || [],
      
      // ✅ NEW: Additional fields
      additional_fields: body.additional_fields || null,
      
      // ... rest of data ...
    },
  })
  
  return NextResponse.json({ success: true, data: lomba })
}
```

**API Request Example:**
```json
{
  "nama_lomba": "Hackathon 2026",
  "thumbnail": "https://cloudinary.com/.../thumbnail.jpg",
  "posters": [
    "https://cloudinary.com/.../poster1.jpg",
    "https://cloudinary.com/.../poster2.jpg",
    "https://cloudinary.com/.../flyer.jpg"
  ],
  "additional_fields": [
    {"label": "Link Panduan", "value": "https://docs.example.com"},
    {"label": "Grup WhatsApp", "value": "https://chat.whatsapp.com/..."}
  ],
  "tipe_pendaftaran": "internal"
}
```

---

### 3.2 Update PUT /api/admin/lomba/[id] - Support Edit

**File:** `app/api/admin/lomba/[id]/route.ts`

```typescript
export async function PUT(request: NextRequest, { params }: Context) {
  // ... auth ...
  
  const lomba = await prisma.lomba.update({
    where: { id: parseInt(params.id) },
    data: {
      // ... existing fields ...
      
      // ✅ Allow editing new fields
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.posters !== undefined && { posters: body.posters }),
      ...(body.additional_fields !== undefined && { 
        additional_fields: body.additional_fields 
      }),
    },
  })
  
  return NextResponse.json({ success: true, data: lomba })
}
```

---

### 3.3 Create CalendarEvent Admin API (NEW)

**File:** `app/api/admin/calendar/route.ts` (CREATE NEW)

```typescript
/**
 * Admin Calendar Event API
 * 
 * GET  /api/admin/calendar - List all calendar events
 * POST /api/admin/calendar - Create calendar event
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events = await prisma.calendarEvent.findMany({
    orderBy: { start_date: 'desc' },
  })

  return NextResponse.json({ success: true, data: events })
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const event = await prisma.calendarEvent.create({
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type || 'event',
      color: body.color || '#3B82F6',
      start_date: new Date(body.start_date),
      end_date: body.end_date ? new Date(body.end_date) : null,
      all_day: body.all_day ?? true,
      link: body.link || null,
    },
  })

  return NextResponse.json({ success: true, data: event }, { status: 201 })
}
```

**Also Create:**
- `app/api/admin/calendar/[id]/route.ts` - PUT, DELETE endpoints

---

## 🎨 PHASE 4: Frontend Admin UI (Week 3)
**Target: Complete Admin Interface**

### 4.1 Update Lomba Create Form - Add New Fields

**File:** `app/admin/lomba/create/page.tsx`

**Add Sections:**

#### A. Thumbnail Upload

```tsx
<div className="bg-white rounded-xl p-6">
  <h2 className="font-semibold mb-4">Thumbnail (Rekomendasi)</h2>
  <p className="text-sm text-gray-600 mb-3">
    Gambar untuk tampilan card/list. Rasio 16:9, ukuran 800x450px.
  </p>
  
  {formData.thumbnail ? (
    <div className="relative">
      <Image src={formData.thumbnail} alt="Thumbnail" width={400} height={225} />
      <button onClick={() => setFormData({...formData, thumbnail: ''})}>
        Hapus
      </button>
    </div>
  ) : (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
      Upload Thumbnail
    </label>
  )}
</div>
```

#### B. Multiple Posters Upload

```tsx
<div className="bg-white rounded-xl p-6">
  <h2 className="font-semibold mb-4">Poster / Flyer (Multiple)</h2>
  <p className="text-sm text-gray-600 mb-3">
    Upload poster utama dan flyer tambahan. Maksimal 5 gambar.
  </p>
  
  <div className="grid grid-cols-3 gap-4">
    {formData.posters.map((url, idx) => (
      <div key={idx} className="relative">
        <Image src={url} alt={`Poster ${idx+1}`} width={300} height={400} />
        <button onClick={() => removePoster(idx)}>
          <X />
        </button>
      </div>
    ))}
    
    {formData.posters.length < 5 && (
      <label className="aspect-[3/4] border-2 border-dashed cursor-pointer">
        <input type="file" accept="image/*" onChange={handlePosterUpload} />
        + Tambah Poster
      </label>
    )}
  </div>
</div>
```

#### C. Dynamic Additional Fields

```tsx
<div className="bg-white rounded-xl p-6">
  <h2 className="font-semibold mb-4">Field Tambahan</h2>
  <p className="text-sm text-gray-600 mb-3">
    Tambahkan informasi custom seperti link panduan, grup telegram, dll.
  </p>
  
  {formData.additional_fields?.map((field, idx) => (
    <div key={idx} className="grid grid-cols-2 gap-4 mb-3">
      <input 
        placeholder="Label (contoh: Link Panduan)"
        value={field.label}
        onChange={(e) => updateAdditionalField(idx, 'label', e.target.value)}
      />
      <div className="flex gap-2">
        <input 
          placeholder="Value (contoh: https://...)"
          value={field.value}
          onChange={(e) => updateAdditionalField(idx, 'value', e.target.value)}
        />
        <button onClick={() => removeAdditionalField(idx)}>
          <Trash2 />
        </button>
      </div>
    </div>
  ))}
  
  <button onClick={addAdditionalField} className="text-primary">
    + Tambah Field
  </button>
</div>
```

#### D. Mode Pendaftaran (Improve UX)

```tsx
<div className="bg-white rounded-xl p-6">
  <h2 className="font-semibold mb-4">Mode Pendaftaran</h2>
  
  <div className="space-y-3">
    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
      <input 
        type="radio" 
        name="tipe_pendaftaran" 
        value="internal"
        checked={formData.tipe_pendaftaran === 'internal'}
        onChange={handleChange}
      />
      <div>
        <p className="font-medium">Internal</p>
        <p className="text-sm text-gray-600">
          Pendaftaran melalui form di website ini
        </p>
      </div>
    </label>
    
    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
      <input 
        type="radio" 
        name="tipe_pendaftaran" 
        value="eksternal"
        checked={formData.tipe_pendaftaran === 'eksternal'}
        onChange={handleChange}
      />
      <div>
        <p className="font-medium">Eksternal</p>
        <p className="text-sm text-gray-600">
          Pendaftaran melalui link website penyelenggara
        </p>
      </div>
    </label>
    
    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
      <input 
        type="radio" 
        name="tipe_pendaftaran" 
        value="info_only"
        checked={formData.tipe_pendaftaran === 'info_only'}
        onChange={handleChange}
      />
      <div>
        <p className="font-medium">Info Only</p>
        <p className="text-sm text-gray-600">
          Hanya informasi, tanpa pendaftaran
        </p>
      </div>
    </label>
  </div>
  
  {/* Conditional Fields */}
  {formData.tipe_pendaftaran === 'eksternal' && (
    <div className="mt-4">
      <label>Link Pendaftaran *</label>
      <input 
        type="url"
        placeholder="https://..."
        value={formData.link_pendaftaran}
        onChange={handleChange}
        required
      />
    </div>
  )}
  
  {formData.tipe_pendaftaran === 'internal' && (
    <div className="mt-4">
      <button onClick={() => setShowFormBuilder(true)}>
        Atur Form Pendaftaran
      </button>
    </div>
  )}
</div>
```

---

### 4.2 Create Calendar Admin Page (NEW)

**File:** `app/admin/kalender/page.tsx` (CREATE NEW)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

export default function AdminKalenderPage() {
  const [events, setEvents] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/calendar')
    const data = await res.json()
    setEvents(data.data)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus event ini?')) return
    
    await fetch(`/api/admin/calendar/${id}`, { method: 'DELETE' })
    fetchEvents()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Kalender Event</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Event
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Judul</th>
              <th className="p-4 text-left">Tipe</th>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr key={event.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{event.title}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {event.type}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(event.start_date).toLocaleDateString('id-ID')}
                </td>
                <td className="p-4">
                  {event.is_active ? (
                    <span className="text-green-600">✓ Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:underline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal - Will implement form */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchEvents()
          }}
        />
      )}
    </div>
  )
}
```

---

## 🎨 PHASE 5: Frontend Public UI (Week 3-4)
**Target: User-Facing Improvements**

### 5.1 Update Lomba Card - Show Thumbnail

**File:** `components/ui/LombaCard.tsx` (or wherever lomba cards are)

```tsx
<div className="aspect-video relative overflow-hidden rounded-t-lg">
  {/* Prioritize thumbnail over poster for card view */}
  <Image
    src={lomba.thumbnail || lomba.poster || '/placeholder.jpg'}
    alt={lomba.nama_lomba}
    fill
    className="object-cover"
  />
</div>
```

---

### 5.2 Update Lomba Detail - Show All Posters

**File:** `app/lomba/[slug]/page.tsx`

```tsx
{/* Poster Gallery - Show all posters */}
{lomba.posters && lomba.posters.length > 0 && (
  <section className="mb-8">
    <h2 className="text-xl font-bold mb-4">Poster & Flyer</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {lomba.posters.map((poster, idx) => (
        <a 
          key={idx} 
          href={poster} 
          target="_blank"
          className="relative aspect-[3/4] rounded-lg overflow-hidden group"
        >
          <Image
            src={poster}
            alt={`Poster ${idx + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </a>
      ))}
    </div>
  </section>
)}

{/* Additional Fields - Show dynamic fields */}
{lomba.additional_fields && lomba.additional_fields.length > 0 && (
  <section className="mb-8">
    <h2 className="text-xl font-bold mb-4">Informasi Tambahan</h2>
    <div className="space-y-3">
      {lomba.additional_fields.map((field: any, idx: number) => (
        <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-gray-700">{field.label}</p>
            <p className="text-gray-600">
              {field.value.startsWith('http') ? (
                <a href={field.value} target="_blank" className="text-primary hover:underline">
                  {field.value}
                </a>
              ) : (
                field.value
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)}
```

---

### 5.3 Update Registration Flow - Mode-Based Logic

**File:** `app/lomba/[slug]/page.tsx`

```tsx
{/* Registration CTA - Based on tipe_pendaftaran */}
<div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
  <h3 className="font-bold mb-4">Cara Mendaftar</h3>
  
  {lomba.tipe_pendaftaran === 'internal' && (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Pendaftaran melalui website APM Portal
      </p>
      <Button 
        fullWidth 
        onClick={() => router.push(`/lomba/${lomba.slug}/register`)}
      >
        Daftar Sekarang
      </Button>
    </>
  )}
  
  {lomba.tipe_pendaftaran === 'eksternal' && (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Pendaftaran melalui website penyelenggara
      </p>
      <Button 
        fullWidth 
        onClick={() => window.open(lomba.link_pendaftaran, '_blank')}
      >
        Daftar di Website Resmi
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </>
  )}
  
  {lomba.tipe_pendaftaran === 'info_only' && (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Informasi saja. Pendaftaran belum dibuka atau sudah ditutup.
      </p>
      <Button fullWidth variant="outline" disabled>
        Belum Bisa Mendaftar
      </Button>
    </>
  )}
</div>
```

---

## ✅ Testing & Quality Assurance

### Testing Checklist

#### Backend Testing
```bash
# Test Lomba CRUD
- [ ] POST /api/admin/lomba - Create dengan thumbnail + posters
- [ ] POST /api/admin/lomba - Create dengan additional_fields
- [ ] PUT /api/admin/lomba/[id] - Update semua field
- [ ] DELETE /api/admin/lomba/[id] - Soft delete
- [ ] GET /api/lomba - Public list shows thumbnail
- [ ] GET /api/lomba/[slug] - Detail shows all posters

# Test Calendar
- [ ] GET /api/calendar - Aggregates from 3 sources
- [ ] POST /api/admin/calendar - Create manual event
- [ ] PUT /api/admin/calendar/[id] - Edit event
- [ ] DELETE /api/admin/calendar/[id] - Delete event

# Test Upload
- [ ] POST /api/upload - Upload ke Cloudinary
- [ ] Verify thumbnail max 2MB
- [ ] Verify poster max 5MB
- [ ] Verify multiple upload works
```

#### Frontend Testing
```bash
# Lomba Pages
- [ ] /admin/lomba - List shows thumbnail
- [ ] /admin/lomba/create - All new fields work
- [ ] /admin/lomba/[id]/edit - Can edit new fields
- [ ] /lomba - Public list optimized with thumbnail
- [ ] /lomba/[slug] - Shows all posters in gallery
- [ ] /lomba/[slug] - Shows additional_fields
- [ ] /lomba/[slug]/register - Mode internal works
- [ ] /lomba/[slug] - Mode eksternal redirects
- [ ] /lomba/[slug] - Mode info_only shows disabled

# Kalender Pages
- [ ] Navbar shows "Kalender" link
- [ ] /kalender - Events appear on calendar dates
- [ ] /kalender - Click date shows events
- [ ] /kalender - Filter by type works
- [ ] /admin/kalender - CRUD interface works
- [ ] Cache cleared, no old events
```

#### Integration Testing
```bash
- [ ] Create lomba → appears in calendar
- [ ] Update deadline → calendar updates
- [ ] Delete lomba → removed from calendar
- [ ] Upload thumbnail → Cloudinary URL saved
- [ ] Upload multiple posters → Array saved
- [ ] Add additional_fields → JSON saved correctly
```

---

## 📊 Data Migration Plan

### Migration Steps

```sql
-- Step 1: Backup existing data
CREATE TABLE apm_lomba_backup AS 
SELECT * FROM apm_lomba;

-- Step 2: Add new columns
ALTER TABLE apm_lomba 
ADD COLUMN thumbnail TEXT,
ADD COLUMN posters TEXT[] DEFAULT '{}',
ADD COLUMN additional_fields JSONB;

-- Step 3: Migrate existing poster to posters array (optional)
UPDATE apm_lomba 
SET posters = ARRAY[poster]::TEXT[]
WHERE poster IS NOT NULL AND poster != '';

-- Step 4: Verify migration
SELECT id, nama_lomba, thumbnail, poster, posters, additional_fields 
FROM apm_lomba 
LIMIT 5;
```

### Rollback Plan

```sql
-- If migration fails, rollback
ALTER TABLE apm_lomba 
DROP COLUMN thumbnail,
DROP COLUMN posters,
DROP COLUMN additional_fields;

-- Restore from backup if needed
-- (Use pg_dump/pg_restore for production)
```

---

## 📈 Performance Optimization

### Cloudinary Optimization

```typescript
// Use transformations for different sizes
const getThumbnailUrl = (url: string) => {
  // Cloudinary transformation for 400x225 thumbnail
  return url.replace('/upload/', '/upload/w_400,h_225,c_fill/')
}

const getPosterUrl = (url: string) => {
  // Cloudinary transformation for 800x1000 poster
  return url.replace('/upload/', '/upload/w_800,h_1000,c_fill/')
}
```

### Calendar Caching Strategy

```typescript
// app/kalender/page.tsx
// Cache events for 5 minutes
const CACHE_TTL = 5 * 60 * 1000

// Store in localStorage with timestamp
const getCachedEvents = (month: number, year: number) => {
  const key = `calendar-${year}-${month}`
  const cached = localStorage.getItem(key)
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_TTL) {
      return data
    }
  }
  return null
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

```bash
- [ ] Run all tests (backend + frontend)
- [ ] Run database migration on staging
- [ ] Test migration rollback
- [ ] Update .env with Cloudinary keys
- [ ] Build production: npm run build
- [ ] Check bundle size
- [ ] Test production build locally
```

### Deployment Steps

```bash
# 1. Database Migration
psql $DATABASE_URL -f migration.sql

# 2. Regenerate Prisma Client
npx prisma generate

# 3. Build & Deploy
npm run build
vercel --prod

# 4. Verify Deployment
curl https://your-domain.com/api/calendar
curl https://your-domain.com/api/admin/lomba
```

### Post-Deployment

```bash
- [ ] Verify kalender in navbar
- [ ] Test create lomba with new fields
- [ ] Check calendar shows events
- [ ] Monitor error logs
- [ ] Clear CDN cache if needed
```

---

## 📝 Documentation Updates

### API Documentation

Update API docs with new fields:

```markdown
## POST /api/admin/lomba

Request Body:
```json
{
  "nama_lomba": "string",
  "thumbnail": "string (URL)",           // NEW
  "poster": "string (URL)",
  "posters": ["string (URL)"],           // NEW - array
  "additional_fields": [                 // NEW
    {"label": "string", "value": "string"}
  ],
  "tipe_pendaftaran": "internal|eksternal|info_only"
}
```

Response:
- 201: Success with lomba data
- 400: Validation error
- 401: Unauthorized
```

### User Documentation

Create user guide for admins:

```markdown
# Panduan Admin - Mengelola Lomba

## Upload Thumbnail vs Poster

- **Thumbnail**: Gambar kecil untuk tampilan list/card (800x450px, 16:9)
- **Poster**: Gambar utama ukuran penuh (1080x1440px, 3:4)
- **Posters/Flyers**: Multiple gambar promosi (max 5)

## Mode Pendaftaran

1. **Internal**: Form ada di website APM
   - Anda perlu setup custom form
   
2. **Eksternal**: Redirect ke website penyelenggara
   - Wajib isi Link Pendaftaran
   
3. **Info Only**: Hanya informasi
   - Tombol daftar akan disabled

## Field Tambahan

Gunakan untuk informasi custom:
- Link Panduan
- Grup WhatsApp/Telegram
- Kontak Panitia
- dll
```

---

## 🎯 Success Metrics

### KPIs to Track

1. **Kalender Accessibility**
   - Click rate pada navbar "Kalender": Target >20%
   - Time on page kalender: Target >2 min

2. **Lomba Engagement**
   - Registration conversion rate: Track before/after
   - Poster view rate: Monitor gallery interaction

3. **Admin Efficiency**
   - Time to create lomba: Should decrease 30%
   - Error rate in lomba creation: <5%

### Analytics Events to Add

```typescript
// Track lomba interactions
gtag('event', 'lomba_view_poster', {
  lomba_id: id,
  poster_index: idx
})

gtag('event', 'lomba_register_click', {
  lomba_id: id,
  mode: tipe_pendaftaran
})

// Track calendar usage
gtag('event', 'calendar_date_click', {
  date: selectedDate,
  event_count: eventsForDate.length
})
```

---

## 🔄 Maintenance Plan

### Weekly Tasks
- Monitor Cloudinary storage usage
- Check calendar event accuracy
- Review user feedback on registration flow

### Monthly Tasks
- Archive closed lomba (soft delete)
- Backup database
- Review and optimize slow queries
- Update documentation

---

## 📞 Support & Escalation

### If Issues Occur

**Cache Problems:**
1. Clear browser cache: Ctrl+Shift+R
2. Clear Next.js cache: `rm -rf .next/cache`
3. Restart dev server

**Database Issues:**
1. Check migration status: `npx prisma migrate status`
2. Rollback if needed: Run rollback SQL
3. Contact DB admin

**Upload Issues:**
1. Verify Cloudinary env vars
2. Check upload preset: `apm_preset`
3. Test upload endpoint directly

---

## 🎊 Conclusion

Dengan mengikuti rencana implementasi ini secara sistematis, semua fitur Kalender dan Lomba akan lengkap, robust, dan user-friendly dalam 4 minggu.

**Next Steps:**
1. Review dokumen ini dengan team
2. Assign tasks ke developers
3. Setup staging environment
4. Mulai Phase 1 (Quick Wins)

**Questions?** Contact: [Your Contact]

---

**Document Version:** 1.0  
**Last Updated:** 5 Februari 2026  
**Status:** ✅ Ready for Implementation
