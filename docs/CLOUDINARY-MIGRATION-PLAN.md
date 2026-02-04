# 🚀 APM Portal - Cloudinary Migration Plan

> **Project:** APM Portal  
> **Migration:** Local Storage → Cloudinary Cloud Storage  
> **Date Created:** 4 Februari 2026  
> **Status:** 📋 Planning

---

## 📋 Executive Summary

### Current State
- Upload files disimpan ke `/public/uploads/` (local filesystem)
- Pada Vercel, filesystem read-only → file hilang setiap deploy
- 2 upload routes aktif: `/api/upload` dan `/api/prestasi/submit`
- Database menyimpan local path (`/uploads/...`)

### Target State
- Semua upload disimpan ke Cloudinary CDN
- Database menyimpan Cloudinary secure URLs
- Files persistent, tidak hilang saat deploy
- Auto image optimization + global CDN

### Impact Analysis

| Area | Files Affected | Effort | Risk |
|------|---------------|--------|------|
| Backend API | 2 routes | Medium | High |
| Database | 6 fields | Low | Medium |
| Frontend | 0 (sudah pakai /api/upload) | None | Low |
| Config | 2 files | Low | Low |

---

## 🏗️ Architecture

### Before (Local Storage)
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API     │────▶│  /public/uploads │
│   Upload    │     │  writeFile()     │     │  (Local Disk)    │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │ file_path: local │
                    └──────────────────┘
```

### After (Cloudinary)
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API     │────▶│   Cloudinary    │
│   Upload    │     │  cloudinary SDK  │     │   Cloud CDN     │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │                        │
                            ▼                        ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │   PostgreSQL     │     │  Auto-optimize  │
                    │ file_path: URL   │     │  Global delivery│
                    └──────────────────┘     └─────────────────┘
```

---

## 🔍 Detailed File Analysis

### 1. Backend Routes yang Perlu Diubah

#### A. `/api/upload/route.ts` ✅ PARTIALLY DONE
**File:** `app/api/upload/route.ts`  
**Status:** Sudah menggunakan Cloudinary, tapi ada SYNTAX ERROR

**Issues:**
1. Line 69-73: Duplicate properties `size` dan `type`
2. Return object malformed

**Fix Required:**
```typescript
// BEFORE (broken)
return {
  filename: file.name,
  url: result.url,
  size: file.size,
  type: file.type,
  publicId: result.publicId,
}
    size: file.size,  // DUPLICATE!
    type: file.type,  // DUPLICATE!
  }
}

// AFTER (fixed)
return {
  filename: file.name,
  url: result.url,
  size: file.size,
  type: file.type,
  publicId: result.publicId,
}
```

#### B. `/api/prestasi/submit/route.ts` 🔴 CRITICAL
**File:** `app/api/prestasi/submit/route.ts`  
**Status:** Masih menggunakan LOCAL writeFile()

**Lines to Change:**
| Line | Current Code | New Code |
|------|--------------|----------|
| 18 | `import { writeFile, mkdir } from 'fs/promises'` | `import { uploadToCloudinary } from '@/lib/cloudinary'` |
| 19 | `import { existsSync } from 'fs'` | REMOVE |
| 93-97 | `mkdir(uploadsDir)` | REMOVE |
| 100-107 | `writeFile() for sertifikat` | `uploadToCloudinary()` |
| 126-132 | `writeFile() for dokumentasi` | `uploadToCloudinary()` |
| 151-159 | `writeFile() for surat` | `uploadToCloudinary()` |

### 2. Config Files yang Perlu Diubah

#### A. `next.config.js`
**Current remotePatterns:**
```javascript
remotePatterns: [
  { protocol: 'https', hostname: 'placehold.co' },
  { protocol: 'http', hostname: 'localhost' },
]
```

**Required Addition:**
```javascript
remotePatterns: [
  { protocol: 'https', hostname: 'placehold.co' },
  { protocol: 'http', hostname: 'localhost' },
  { protocol: 'https', hostname: 'res.cloudinary.com' }, // ADD THIS
]
```

#### B. `.env` & Vercel Environment Variables
**Required Variables:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Fields yang Menyimpan File Paths

| Table | Field | Type | Current Value | After Migration |
|-------|-------|------|---------------|-----------------|
| `apm_lomba` | `poster` | String? | `/uploads/lomba/...` | `https://res.cloudinary.com/...` |
| `apm_expo` | `poster` | String? | `/uploads/expo/...` | `https://res.cloudinary.com/...` |
| `apm_expo` | `galeri` | Json? | `["/uploads/..."]` | `["https://res.cloudinary.com/..."]` |
| `apm_prestasi` | `thumbnail` | String? | `/uploads/...` | `https://res.cloudinary.com/...` |
| `apm_prestasi` | `galeri` | Json? | `["/uploads/..."]` | `["https://res.cloudinary.com/..."]` |
| `apm_prestasi` | `sertifikat` | String? | `/uploads/...` | `https://res.cloudinary.com/...` |
| `apm_prestasi_documents` | `file_path` | String | `/uploads/...` | `https://res.cloudinary.com/...` |

---

## 📦 Cloudinary Configuration

### Folder Structure
```
apm/                          # Root folder
├── lomba/                    # Lomba posters
├── expo/                     # Expo posters & gallery
├── prestasi/                 # Prestasi files
│   ├── sertifikat/          # PDFs (resource_type: raw)
│   ├── dokumentasi/         # Images
│   └── surat/               # PDFs
└── general/                  # Other uploads
```

### Upload Settings
```typescript
// lib/cloudinary.ts
{
  folder: `apm/${folder}`,
  resource_type: resourceType, // 'image' or 'raw'
  transformation: resourceType === 'image' 
    ? [{ quality: 'auto', fetch_format: 'auto' }]
    : undefined,
}
```

### Security Rules
| Rule | Value | Implementation |
|------|-------|----------------|
| Max Image Size | 5 MB | Validated in API route |
| Max Document Size | 10 MB | Validated in API route |
| Allowed Image Types | JPEG, PNG, GIF, WebP | Validated before upload |
| Allowed Doc Types | PDF, DOC, DOCX | Validated before upload |
| API Secret | Server-only | Never exposed to client |

---

## 🚦 Migration Phases

### Phase 1: Foundation (Day 1)
**Goal:** Fix bugs, setup config, verify Cloudinary works

| Task | File | Priority |
|------|------|----------|
| 1.1 Fix syntax error in upload route | `app/api/upload/route.ts` | 🔴 Critical |
| 1.2 Add Cloudinary domain to next.config | `next.config.js` | 🔴 Critical |
| 1.3 Setup Cloudinary account | Cloudinary Dashboard | 🔴 Critical |
| 1.4 Set ENV vars locally | `.env` | 🔴 Critical |
| 1.5 Set ENV vars in Vercel | Vercel Dashboard | 🔴 Critical |
| 1.6 Test upload via admin panel | Manual test | 🔴 Critical |

**Acceptance Criteria:**
- [ ] `npm run build` succeeds
- [ ] Admin dapat upload image
- [ ] Image URL adalah `res.cloudinary.com/...`
- [ ] Image tampil di frontend

### Phase 2: Prestasi Submit Migration (Day 1-2)
**Goal:** Migrate public prestasi submission to Cloudinary

| Task | File | Priority |
|------|------|----------|
| 2.1 Replace fs imports with cloudinary | `app/api/prestasi/submit/route.ts` | 🔴 Critical |
| 2.2 Migrate sertifikat upload | Line 100-107 | 🔴 Critical |
| 2.3 Migrate dokumentasi upload | Line 126-132 | 🔴 Critical |
| 2.4 Migrate surat upload | Line 151-159 | 🔴 Critical |
| 2.5 Remove mkdir logic | Line 93-97 | 🟡 Medium |
| 2.6 Test full submission flow | Manual test | 🔴 Critical |

**Acceptance Criteria:**
- [ ] Public user dapat submit prestasi
- [ ] Semua file tersimpan di Cloudinary
- [ ] `PrestasiDocument.file_path` berisi Cloudinary URL
- [ ] Admin dapat melihat dokumen yang disubmit

### Phase 3: Verification & Cleanup (Day 2)
**Goal:** Verify all flows work, cleanup unused code

| Task | File | Priority |
|------|------|----------|
| 3.1 Test admin lomba create with poster | Manual test | 🟡 Medium |
| 3.2 Test admin expo create with poster | Manual test | 🟡 Medium |
| 3.3 Test prestasi publish flow | Manual test | 🟡 Medium |
| 3.4 Verify images display on public pages | Manual test | 🟡 Medium |
| 3.5 Remove /public/uploads from .gitignore | `.gitignore` | 🟢 Low |
| 3.6 Update Dockerfile (optional) | `Dockerfile` | 🟢 Low |

**Acceptance Criteria:**
- [ ] All upload flows work end-to-end
- [ ] No 404 errors for images
- [ ] PDFs can be downloaded
- [ ] Files persist after Vercel redeploy

### Phase 4: Data Migration (Optional - Day 3+)
**Goal:** Migrate existing local files to Cloudinary

| Task | File | Priority |
|------|------|----------|
| 4.1 Create migration script | `scripts/migrate-to-cloudinary.ts` | 🟢 Low |
| 4.2 Export existing files | Server | 🟢 Low |
| 4.3 Run migration | Script | 🟢 Low |
| 4.4 Update database records | Script | 🟢 Low |
| 4.5 Verify migration | Manual check | 🟢 Low |

**Note:** This phase only needed if there's existing data in production.

### Phase 5: Enhancement (Future)
**Goal:** Add advanced features

| Task | Description | Priority |
|------|-------------|----------|
| 5.1 Add delete functionality | Delete from Cloudinary when record deleted | 🟢 Low |
| 5.2 Store public_id in DB | For easier deletion | 🟢 Low |
| 5.3 Add upload widget | Better UX with progress bar | 🟢 Low |
| 5.4 Image transformation | Resize, crop on-the-fly | 🟢 Low |

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `uploadToCloudinary()` returns correct structure
- [ ] File validation rejects invalid types
- [ ] File validation rejects oversized files

### Integration Tests
- [ ] POST `/api/upload` → returns Cloudinary URL
- [ ] POST `/api/prestasi/submit` with files → stores Cloudinary URLs
- [ ] GET `/api/admin/prestasi/[id]/publish` → returns viewable file URLs

### E2E Tests
- [ ] Full prestasi submission flow (submit → approve → publish → view)
- [ ] Full lomba creation flow (create with poster → view on public)
- [ ] Full expo creation flow (create with poster + galeri → view on public)

### Manual Verification
- [ ] Upload image via admin panel
- [ ] View image on frontend (check Network tab for Cloudinary domain)
- [ ] Download PDF document
- [ ] Redeploy Vercel → verify files still accessible

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cloudinary API key exposed | Low | High | Keep in server-side only, never in client bundle |
| Upload fails silently | Medium | High | Add proper error handling, return clear messages |
| Large file timeout | Medium | Medium | Set appropriate timeout, chunk large files |
| Existing data broken | Low | High | Keep backward compatibility, migrate incrementally |
| Cloudinary quota exceeded | Low | Medium | Monitor usage, upgrade plan if needed |

---

## 📊 Cloudinary Free Tier Limits

| Resource | Free Limit | APM Estimated Usage |
|----------|------------|---------------------|
| Storage | 25 GB | < 5 GB (low risk) |
| Bandwidth | 25 GB/month | < 10 GB/month (low risk) |
| Transformations | 25,000/month | < 5,000/month (low risk) |

---

## 🔧 Rollback Plan

If migration fails:

1. **Revert code changes** via git
2. **Keep Cloudinary URLs** that already exist (they'll still work)
3. **Re-enable local upload** as fallback
4. **Debug and retry** migration

---

## 📝 Post-Migration Tasks

- [ ] Update documentation
- [ ] Inform team about new upload flow
- [ ] Monitor Cloudinary usage dashboard
- [ ] Set up usage alerts
- [ ] Archive `/public/uploads` directory

---

## 📚 References

- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## ✅ Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | - | - | ⏳ Pending |
| Reviewer | - | - | ⏳ Pending |
| Deployment | - | - | ⏳ Pending |

---

*Last Updated: 4 Februari 2026*
