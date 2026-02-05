/**
 * Admin Direct Prestasi Creation API
 * 
 * POST /api/admin/prestasi/direct - Create prestasi directly (admin-only)
 * 
 * This endpoint allows admin to create prestasi without going through
 * the public submission workflow. It creates both:
 * 1. Dummy PrestasiSubmission (submitter_nim='ADMIN', status='approved')
 * 2. Published Prestasi record (is_published=true)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { createPrestasiDirectSchema } from '@/lib/validations/prestasi'
import {
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  generateSlug,
  validationErrorFromZod,
} from '@/lib/api/helpers'

// Force dynamic - no caching
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/prestasi/direct
 * Create prestasi directly as admin
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createPrestasiDirectSchema.safeParse(body)
    
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Generate unique slug
    let slug = generateSlug(data.judul)
    const existingSlug = await prisma.prestasi.findUnique({ 
      where: { slug } 
    })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create dummy PrestasiSubmission
      const submission = await tx.prestasiSubmission.create({
        data: {
          judul: data.judul,
          nama_lomba: data.nama_lomba,
          penyelenggara: data.penyelenggara || null,
          tingkat: data.tingkat,
          peringkat: data.peringkat,
          tanggal: data.tanggal ? new Date(data.tanggal) : null,
          kategori: data.kategori || null,
          deskripsi: data.deskripsi || null,
          
          // Admin identifier
          submitter_name: 'Admin',
          submitter_nim: 'ADMIN',
          submitter_email: session.email || 'admin@apm.polinema.ac.id',
          submitter_whatsapp: '-',
          
          // Auto-approved
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: session.id,
        }
      })

      // 2. Create team members if provided
      if (data.team_members && data.team_members.length > 0) {
        await tx.prestasiTeamMember.createMany({
          data: data.team_members.map(member => ({
            submission_id: submission.id,
            nama: member.nama,
            nim: member.nim,
            prodi: member.prodi || null,
            angkatan: member.angkatan || null,
            whatsapp: member.whatsapp || null,
            is_ketua: member.is_ketua,
          }))
        })
      }

      // 3. Create pembimbing if provided
      if (data.pembimbing && data.pembimbing.length > 0) {
        await tx.prestasiPembimbing.createMany({
          data: data.pembimbing.map(p => ({
            submission_id: submission.id,
            nama: p.nama,
            nidn: p.nidn || null,
            whatsapp: p.whatsapp || null,
          }))
        })
      }

      // 4. Create documents if provided
      if (data.documents && data.documents.length > 0) {
        await tx.prestasiDocument.createMany({
          data: data.documents.map(doc => ({
            submission_id: submission.id,
            type: doc.type,
            label: doc.label || null,
            file_path: doc.file_path,
            file_name: doc.file_name,
            file_type: doc.file_path.split('.').pop() || 'unknown',
            file_size: 0, // Size not provided in direct create
          }))
        })
      }

      // 5. Create published Prestasi record
      const prestasi = await tx.prestasi.create({
        data: {
          submission_id: submission.id,
          judul: data.judul,
          slug: slug,
          nama_lomba: data.nama_lomba,
          tingkat: data.tingkat,
          peringkat: data.peringkat,
          tahun: data.tahun,
          kategori: data.kategori || null,
          deskripsi: data.deskripsi || null,
          
          // Media
          thumbnail: data.thumbnail,
          galeri: data.galeri || [],
          sertifikat: data.sertifikat || null,
          sertifikat_public: data.sertifikat_public,
          
          // Links
          link_berita: data.link_berita || null,
          link_portofolio: data.link_portofolio || null,
          
          // Display settings
          is_featured: data.is_featured,
          is_published: data.is_published,
          published_at: new Date(),
        }
      })

      // 6. Create calendar event if requested
      if (data.add_to_calendar && data.tanggal) {
        const peringkatLabel = data.peringkat.replace('_', ' ').toUpperCase()
        await tx.calendarEvent.create({
          data: {
            title: `🏆 ${peringkatLabel} - ${data.nama_lomba}`,
            description: data.deskripsi || null,
            type: 'prestasi',
            color: '#22c55e', // Green for achievements
            start_date: new Date(data.tanggal),
            end_date: null,
            all_day: true,
            link: `/prestasi/${slug}`,
            is_active: true,
          }
        })
      }

      return { submission, prestasi }
    })

    // Return success response
    return createdResponse(
      {
        id: result.prestasi.id,
        slug: result.prestasi.slug,
        submission_id: result.submission.id,
        message: 'Prestasi berhasil dibuat',
      },
      'Prestasi berhasil dibuat dan dipublikasikan'
    )

  } catch (error) {
    console.error('Error creating prestasi directly:', error)
    return errorResponse(
      'Gagal membuat prestasi. Silakan coba lagi.',
      500
    )
  }
}
