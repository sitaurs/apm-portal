# 🎯 Kalender & Lomba - Status & Next Steps

**Updated:** 5 Februari 2026 15:30 WIB  
**Status:** ✅ Database Verified, Ready for Implementation

---

## ✅ SUDAH DISELESAIKAN HARI INI

### 1. **Bug Fix: "Deadline LKTI" Masih Muncul** ✅ FIXED

**Problem:** User report - deadline LKTI masih muncul di kalender padahal lomba sudah dihapus

**Root Cause (Database Investigation):**
```sql
-- Calendar event masih active
apm_calendar_events:
  id=1, title="Deadline LKTI Internal", is_active=TRUE ❌

-- Tapi lomba sudah deleted
apm_lomba:
  id=1, nama_lomba="Lomba Karya Tulis Ilmiah Internal", is_deleted=TRUE
```

**Solution Applied:**
```sql
UPDATE apm_calendar_events 
SET is_active = false 
WHERE id = 1;
```

**Result:** ✅ "Deadline LKTI Internal" sekarang tidak muncul di kalender

---

## 📊 DATABASE CURRENT STATE

### Schema apm_lomba (26 columns)

**✅ SUDAH ADA:**
- nama_lomba, slug, kategori, tingkat
- deadline, tanggal_pelaksanaan
- poster (single)
- tipe_pendaftaran ('internal', 'eksternal', 'info_only')
- custom_form (JSONB) - untuk dynamic forms
- hadiah (JSONB)
- kontak_panitia (JSONB)
- tags (JSONB)
- is_featured, is_urgent, status

**❌ BELUM ADA (Need to Add):**
- `thumbnail` - untuk list/card view optimal
- `posters[]` - array untuk multiple poster/flyer
- `additional_fields` - JSONB untuk field custom (Link Panduan, dll)

### Schema apm_calendar_events (12 columns)

**✅ COMPLETE** - Semua field lengkap dan functional

---

## 📋 IMPLEMENTATION PLAN READY

Dokumen lengkap: [`KALENDER-LOMBA-IMPLEMENTATION-PLAN.md`](./KALENDER-LOMBA-IMPLEMENTATION-PLAN.md)

### **PHASE 1: Quick Wins (Week 1)** ⚡

#### 1.1 Tambah Kalender ke Navbar
**File:** `lib/constants.ts`
```typescript
{ name: 'Kalender', href: '/kalender' }, // Add this line
```
**Impact:** User bisa langsung akses kalender dari menu utama

#### 1.2 Event Muncul di Tanggal Kalender
**File:** `app/kalender/page.tsx`
- Show event badges di calendar cells (seperti referensi gambar)
- Click date untuk detail
**Impact:** User lihat event langsung di kalender

#### 1.3 Auto-Sync Calendar saat Delete Lomba
**File:** `app/api/admin/lomba/[id]/route.ts`
- Ketika lomba dihapus, calendar event ikut dinonaktifkan
**Impact:** Tidak ada event "hantu" lagi

---

### **PHASE 2: Database Migration (Week 2)** 🏗️

**SQL Migration:**
```sql
ALTER TABLE apm_lomba 
ADD COLUMN thumbnail TEXT,
ADD COLUMN posters TEXT[] DEFAULT '{}',
ADD COLUMN additional_fields JSONB;
```

**Setelah migration:**
- Thumbnail untuk optimasi card view
- Multiple posters/flyers (max 5)
- Dynamic fields (Link Panduan, Grup WA, dll)

---

### **PHASE 3-5: UI Implementation (Week 2-4)** 🎨

- Admin: Form upload thumbnail + multiple posters
- Admin: Dynamic field builder
- Admin: Calendar event management
- Public: Gallery poster view
- Public: Mode pendaftaran yang jelas (Internal/Eksternal/Info Only)

---

## 🚀 EXECUTION OPTIONS

### Option A: Gradual (Recommended)
✅ Week 1: Phase 1 (Quick wins - navbar, events, sync)
✅ Week 2: Phase 2 (Database migration)
✅ Week 3-4: Phases 3-5 (UI implementation)

**Pros:** Less risky, dapat ditest per phase  
**Timeline:** 4 minggu

### Option B: Aggressive
✅ Week 1: Phase 1 + 2 (Quick wins + DB)
✅ Week 2-3: Phases 3-5 (Full UI)

**Pros:** Lebih cepat selesai  
**Timeline:** 3 minggu  
**Risk:** Medium (need thorough testing)

---

## 🎯 IMMEDIATE NEXT STEPS

### Yang Bisa Langsung Dieksekusi Sekarang:

1. **[5 menit] Tambah Kalender ke Navbar**
   ```typescript
   // File: lib/constants.ts (line ~70)
   { name: 'Kalender', href: '/kalender' },
   ```

2. **[10 menit] Database Migration**
   ```bash
   # Run SQL migration untuk add columns
   npx prisma db push
   npx prisma generate
   ```

3. **[30 menit] Fix Calendar Display**
   - Update `app/kalender/page.tsx`
   - Show events in calendar cells

4. **[20 menit] Auto-Sync Delete**
   - Update `app/api/admin/lomba/[id]/route.ts`
   - Add calendar deactivation logic

**Total:** ~1 jam untuk Quick Wins Phase 1 ✅

---

## ✅ TESTING CHECKLIST

Setelah Phase 1:
- [ ] Kalender link muncul di navbar
- [ ] Klik navbar → masuk ke /kalender
- [ ] Event muncul di tanggal yang tepat
- [ ] Klik tanggal → show event detail
- [ ] Delete lomba → calendar event ikut nonaktif
- [ ] Hard refresh → data consistent

---

## 📞 QUESTIONS & SUPPORT

**Mau mulai implementasi sekarang?**

Pilih salah satu:
1. 🚀 **Start Phase 1 Now** - Saya eksekusi Quick Wins (1 jam)
2. 🔧 **Run DB Migration First** - Saya jalankan ALTER TABLE dulu
3. 📖 **Review Plan More** - Mau diskusi detail dulu
4. 🎨 **Focus on UI** - Langsung ke admin interface

**Saya siap eksekusi apapun yang Anda pilih!** 💪

---

**Documents:**
- Full Plan: [`KALENDER-LOMBA-IMPLEMENTATION-PLAN.md`](./KALENDER-LOMBA-IMPLEMENTATION-PLAN.md) (110 pages)
- This Summary: [`KALENDER-LOMBA-STATUS.md`](./KALENDER-LOMBA-STATUS.md)
