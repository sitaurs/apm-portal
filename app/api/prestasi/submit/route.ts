/**
 * Public Prestasi Submission API
 * 
 * POST /api/prestasi/submit - Submit a new prestasi
 * GET  /api/prestasi/submit - Check submission status
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { TeamMemberInput, PembimbingInput } from '@/lib/validations/prestasi'
import {
  createdResponse,
  errorResponse,
  notFoundResponse,
  successResponse,
} from '@/lib/api/helpers'
import { submissionRateLimiter, getClientIP } from '@/lib/rate-limit'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/prestasi/submit
 * Submit a new prestasi (handles FormData)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = getClientIP(request)
    const rateLimitResult = submissionRateLimiter.check(ip)
    if (!rateLimitResult.success) {
      return errorResponse(
        'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.',
        429
      )
    }

    const contentType = request.headers.get('content-type') || ''
    
    let data: Record<string, unknown>
    let sertifikatPath: string | null = null
    let suratPath: string | null = null
    const dokumentasiPaths: string[] = []
    
    // Handle FormData (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      data = {
        judul: formData.get('judul') as string || formData.get('nama_lomba') as string,
        nama_lomba: formData.get('nama_lomba') as string,
        penyelenggara: formData.get('penyelenggara') as string || null,
        tingkat: (formData.get('tingkat') as string || 'nasional').toLowerCase(),
        peringkat: (formData.get('peringkat') as string || 'lainnya').toLowerCase().replace(/-/g, '_'),
        tanggal: formData.get('tanggal') as string || null,
        kategori: formData.get('kategori') as string || null,
        deskripsi: formData.get('deskripsi') as string || null,
        submitter_name: formData.get('submitter_name') as string,
        submitter_nim: formData.get('submitter_nim') as string,
        submitter_email: formData.get('submitter_email') as string,
        submitter_whatsapp: formData.get('submitter_whatsapp') as string || '-',
      }
      
      // Parse team members if provided (with whatsapp)
      const timJson = formData.get('tim') as string
      if (timJson) {
        try {
          const tim = JSON.parse(timJson)
          data.team_members = tim.map((m: { nama: string; nim: string; role?: string; angkatan?: string; whatsapp?: string }, idx: number) => ({
            nama: m.nama,
            nim: m.nim,
            angkatan: m.angkatan || null,
            whatsapp: m.whatsapp || null,
            is_ketua: idx === 0 || m.role === 'ketua',
          }))
        } catch {
          // Ignore parse errors
        }
      }
      
      // Parse pembimbing data
      const pembimbingNama = formData.get('pembimbing_nama') as string
      const pembimbingNidn = formData.get('pembimbing_nidn') as string
      const pembimbingWhatsapp = formData.get('pembimbing_whatsapp') as string
      if (pembimbingNama && pembimbingNama.trim()) {
        data.pembimbing = [{
          nama: pembimbingNama,
          nidn: pembimbingNidn || null,
          whatsapp: pembimbingWhatsapp || null,
        }]
      }
      
      // Handle file uploads to Cloudinary
      const sertifikat = formData.get('sertifikat') as File | null
      if (sertifikat && sertifikat.size > 0) {
        const bytes = await sertifikat.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await uploadToCloudinary(buffer, 'prestasi/sertifikat', 'raw')
        sertifikatPath = result.url
      }
      
      // Handle dokumentasi URLs (already uploaded via ImageUpload component)
      const dokumentasiJson = formData.get('dokumentasi') as string
      if (dokumentasiJson) {
        try {
          const urls = JSON.parse(dokumentasiJson)
          if (Array.isArray(urls)) {
            dokumentasiPaths.push(...urls)
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      // Handle legacy file upload format for dokumentasi
      for (let i = 0; i < 10; i++) {
        const dok = formData.get(`dokumentasi_${i}`) as File | null
        if (dok && dok.size > 0) {
          const bytes = await dok.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const result = await uploadToCloudinary(buffer, 'prestasi/dokumentasi', 'image')
          dokumentasiPaths.push(result.url)
        }
      }
      
      // Handle surat pendukung with labels (already uploaded via FileUploadWithLabels)
      const suratPendukungJson = formData.get('surat_pendukung') as string
      interface SuratPendukungItem { url: string; label: string }
      let suratPendukungItems: SuratPendukungItem[] = []
      if (suratPendukungJson) {
        try {
          const items = JSON.parse(suratPendukungJson)
          if (Array.isArray(items)) {
            suratPendukungItems = items
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      // Handle legacy surat keterangan format
      const suratKeterangan = formData.get('suratKeterangan') as File | null
      if (suratKeterangan && suratKeterangan.size > 0) {
        const bytes = await suratKeterangan.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await uploadToCloudinary(buffer, 'prestasi/surat', 'raw')
        suratPath = result.url
      }
      
      // Store surat pendukung items for later use
      data.surat_pendukung_items = suratPendukungItems
    } else {
      // Handle JSON
      data = await request.json()
    }

    // Validate required fields
    if (!data.judul || !data.nama_lomba || !data.submitter_name || !data.submitter_nim) {
      return errorResponse('Data tidak lengkap. Pastikan semua field wajib terisi.', 400)
    }

    // Check for duplicate submission (same title + submitter)
    const existingSubmission = await prisma.prestasiSubmission.findFirst({
      where: {
        judul: { equals: data.judul as string, mode: 'insensitive' },
        submitter_nim: data.submitter_nim as string,
      },
    })

    if (existingSubmission) {
      return errorResponse(
        'Anda sudah pernah mengajukan prestasi dengan judul yang sama',
        409
      )
    }

    // Create submission with relations
    const submission = await prisma.prestasiSubmission.create({
      data: {
        judul: data.judul as string,
        nama_lomba: data.nama_lomba as string,
        penyelenggara: (data.penyelenggara as string) || null,
        tingkat: (data.tingkat as string) || 'nasional',
        peringkat: (data.peringkat as string) || 'lainnya',
        tanggal: data.tanggal ? new Date(data.tanggal as string) : null,
        kategori: (data.kategori as string) || null,
        deskripsi: (data.deskripsi as string) || null,
        submitter_name: data.submitter_name as string,
        submitter_nim: data.submitter_nim as string,
        submitter_email: (data.submitter_email as string) || '',
        submitter_whatsapp: (data.submitter_whatsapp as string) || '-',
        status: 'pending',
        team_members: data.team_members && Array.isArray(data.team_members) && (data.team_members as TeamMemberInput[]).length > 0 ? {
          create: (data.team_members as TeamMemberInput[]).map((member: TeamMemberInput) => ({
            nama: member.nama,
            nim: member.nim,
            prodi: member.prodi || null,
            angkatan: member.angkatan || null,
            whatsapp: member.whatsapp || null,
            is_ketua: member.is_ketua || false,
          })),
        } : undefined,
        pembimbing: data.pembimbing && Array.isArray(data.pembimbing) && (data.pembimbing as PembimbingInput[]).length > 0 ? {
          create: (data.pembimbing as PembimbingInput[]).map((p: PembimbingInput) => ({
            nama: p.nama,
            nidn: p.nidn || null,
            whatsapp: p.whatsapp || null,
          })),
        } : undefined,
        documents: {
          create: [
            // Sertifikat
            ...(sertifikatPath ? [{ 
              type: 'sertifikat', 
              file_path: sertifikatPath, 
              file_name: 'Sertifikat', 
              file_type: 'application/pdf', 
              file_size: 0 
            }] : []),
            // Legacy surat tugas
            ...(suratPath ? [{ 
              type: 'surat_tugas', 
              file_path: suratPath, 
              file_name: 'Surat Keterangan', 
              file_type: 'application/pdf', 
              file_size: 0 
            }] : []),
            // Dokumentasi (images)
            ...dokumentasiPaths.map((p, i) => ({ 
              type: 'dokumentasi', 
              file_path: p, 
              file_name: `Dokumentasi ${i+1}`, 
              file_type: 'image/jpeg', 
              file_size: 0 
            })),
            // Surat pendukung dengan labels
            ...((data.surat_pendukung_items as Array<{url: string; label: string}>) || []).map((item: {url: string; label: string}) => ({
              type: 'surat_pendukung',
              label: item.label,
              file_path: item.url,
              file_name: item.label || 'Surat Pendukung',
              file_type: 'application/pdf',
              file_size: 0
            })),
          ].filter(doc => doc.file_path), // Filter out empty paths
        },
      },
      include: {
        team_members: true,
        pembimbing: true,
        documents: true,
      },
    })

    return createdResponse({
      id: submission.id,
      judul: submission.judul,
      status: submission.status,
      created_at: submission.created_at,
    }, 'Prestasi berhasil diajukan! Silakan tunggu review dari admin.')
  } catch (error) {
    console.error('Error submitting prestasi:', error)
    return errorResponse('Gagal mengajukan prestasi. Silakan coba lagi.')
  }
}

/**
 * GET /api/prestasi/submit
 * Check submission status by email/nim
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const nim = searchParams.get('nim')

    if (!email && !nim) {
      return errorResponse('Email atau NIM diperlukan untuk cek status', 400)
    }

    // Build where clause
    const orConditions: Array<{ submitter_email?: string; submitter_nim?: string }> = []
    if (email) orConditions.push({ submitter_email: email })
    if (nim) orConditions.push({ submitter_nim: nim })

    // Find submissions
    const submissions = await prisma.prestasiSubmission.findMany({
      where: { OR: orConditions },
      select: {
        id: true,
        judul: true,
        nama_lomba: true,
        tingkat: true,
        peringkat: true,
        status: true,
        reviewer_notes: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    if (submissions.length === 0) {
      return notFoundResponse('Tidak ada submission ditemukan')
    }

    return successResponse({
      count: submissions.length,
      submissions,
    })
  } catch (error) {
    console.error('Error checking prestasi submission:', error)
    return errorResponse('Gagal mengecek status submission')
  }
}

