/**
 * Prestasi Submissions Admin API
 * 
 * GET  /api/admin/prestasi - List all submissions
 * POST /api/admin/prestasi - Create a new submission (admin-initiated)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { querySubmissionsSchema, createPrestasiSubmissionSchema } from '@/lib/validations/prestasi'
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  calculatePagination,
  parseSearchParams,
  validationErrorFromZod,
} from '@/lib/api/helpers'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/prestasi
 * List all prestasi submissions with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = parseSearchParams(searchParams, [
      'page', 'limit', 'search', 'status', 'tingkat', 'sort', 'order'
    ])

    const validation = querySubmissionsSchema.safeParse({
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
      search: params.search || undefined,
      status: params.status || undefined,
      tingkat: params.tingkat || undefined,
      sort: params.sort || 'created_at',
      order: params.order || 'desc',
    })

    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const { page, limit, search, status, tingkat, sort, order } = validation.data

    // Build where clause
    interface WhereClause {
      status?: string
      tingkat?: string
      OR?: Array<{
        judul?: { contains: string; mode: 'insensitive' }
        nama_lomba?: { contains: string; mode: 'insensitive' }
        submitter_name?: { contains: string; mode: 'insensitive' }
        submitter_nim?: { contains: string; mode: 'insensitive' }
      }>
    }
    
    const where: WhereClause = {}

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { nama_lomba: { contains: search, mode: 'insensitive' } },
        { submitter_name: { contains: search, mode: 'insensitive' } },
        { submitter_nim: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (tingkat) {
      where.tingkat = tingkat
    }

    // Get total count
    const total = await prisma.prestasiSubmission.count({ where })

    // Get paginated data with relations
    const data = await prisma.prestasiSubmission.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        judul: true,
        nama_lomba: true,
        tingkat: true,
        peringkat: true,
        tanggal: true,
        status: true,
        reviewer_notes: true,
        reviewed_at: true,
        submitter_name: true,
        submitter_nim: true,
        submitter_email: true,
        created_at: true,
        team_members: {
          select: { id: true, nama: true, nim: true, is_ketua: true },
        },
        pembimbing: {
          select: { id: true, nama: true, nidn: true },
        },
        documents: {
          select: { id: true, type: true, file_path: true, file_name: true },
        },
        // Include published prestasi data
        published: {
          select: { id: true, slug: true, is_published: true },
        },
      },
    })

    const pagination = calculatePagination(total, page, limit)

    // Get status counts for dashboard
    const statusCounts = await prisma.prestasiSubmission.groupBy({
      by: ['status'],
      _count: { _all: true },
    })

    const stats = statusCounts.reduce((acc, item) => ({
      ...acc,
      [item.status]: item._count._all,
    }), {} as Record<string, number>)

    // Transform data for frontend compatibility
    const transformedData = data.map(item => {
      // Find sertifikat from documents
      const sertifikatDoc = item.documents.find(d => d.type === 'sertifikat');
      // Find dokumentasi photos
      const dokumentasiDocs = item.documents.filter(d => d.type === 'dokumentasi');
      const galeri = dokumentasiDocs.map(d => d.file_path);
      
      return {
        id: item.id,
        namaPrestasi: item.judul,
        namaLomba: item.nama_lomba,
        tingkat: item.tingkat,
        peringkat: item.peringkat,
        tanggal: item.tanggal?.toISOString() || null,
        sertifikatUrl: sertifikatDoc?.file_path || null,
        thumbnailUrl: galeri[0] || null,
        galeri: galeri,
        status: item.status,
        reviewerNotes: item.reviewer_notes || '',
        verifiedAt: item.reviewed_at?.toISOString() || null,
        submitterName: item.submitter_name,
        submitterNim: item.submitter_nim,
        submitterEmail: item.submitter_email,
        dateCreated: item.created_at.toISOString(),
        teamMembers: item.team_members,
        pembimbing: item.pembimbing,
        documents: item.documents,
        // Published prestasi info
        isPublished: item.published?.is_published || false,
        publishedPrestasiId: item.published?.id || null,
        slug: item.published?.slug || null,
      };
    })

    // Return data with stats included in response
    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: pagination,
      stats,
    })
  } catch (error) {
    console.error('Error fetching prestasi submissions:', error)
    return errorResponse('Gagal mengambil data prestasi')
  }
}

/**
 * POST /api/admin/prestasi
 * Create a new prestasi submission (admin-initiated)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate input
    const validation = createPrestasiSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorFromZod(validation.error.issues)
    }

    const data = validation.data

    // Create submission with relations
    const submission = await prisma.prestasiSubmission.create({
      data: {
        judul: data.judul,
        nama_lomba: data.nama_lomba,
        penyelenggara: data.penyelenggara || null,
        tingkat: data.tingkat,
        peringkat: data.peringkat,
        tanggal: data.tanggal ? new Date(data.tanggal) : null,
        kategori: data.kategori || null,
        deskripsi: data.deskripsi || null,
        submitter_name: data.submitter_name,
        submitter_nim: data.submitter_nim,
        submitter_email: data.submitter_email,
        submitter_whatsapp: data.submitter_whatsapp,
        status: 'pending',
        team_members: data.team_members && data.team_members.length > 0 ? {
          create: data.team_members.map(member => ({
            nama: member.nama,
            nim: member.nim,
            prodi: member.prodi || null,
            angkatan: member.angkatan || null,
            whatsapp: member.whatsapp || null,
            is_ketua: member.is_ketua || false,
          })),
        } : undefined,
        pembimbing: data.pembimbing && data.pembimbing.length > 0 ? {
          create: data.pembimbing.map(p => ({
            nama: p.nama,
            nidn: p.nidn || null,
            whatsapp: p.whatsapp || null,
          })),
        } : undefined,
      },
      include: {
        team_members: true,
        pembimbing: true,
      },
    })

    return createdResponse(submission, 'Prestasi berhasil ditambahkan')
  } catch (error) {
    console.error('Error creating prestasi submission:', error)
    return errorResponse('Gagal menambahkan prestasi')
  }
}

