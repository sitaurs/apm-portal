/**
 * Prestasi Edit API - Edit Published Prestasi
 * 
 * GET /api/admin/prestasi/[id]/edit - Get prestasi data for editing
 * PUT /api/admin/prestasi/[id]/edit - Update published prestasi
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/prestasi/[id]/edit
 * Get published prestasi data for editing
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const prestasiId = parseInt(id, 10)
    
    if (isNaN(prestasiId)) {
      return errorResponse('ID Prestasi tidak valid', 400)
    }

    // Get prestasi with submission data
    const prestasi = await prisma.prestasi.findUnique({
      where: { id: prestasiId },
      include: {
        submission: {
          include: {
            team_members: true,
            pembimbing: true,
            documents: true,
          },
        },
      },
    })

    if (!prestasi) {
      return notFoundResponse('Prestasi tidak ditemukan')
    }

    return successResponse(prestasi)
  } catch (error) {
    console.error('Error fetching prestasi for edit:', error)
    return errorResponse('Gagal mengambil data prestasi')
  }
}

/**
 * PUT /api/admin/prestasi/[id]/edit
 * Update published prestasi
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const prestasiId = parseInt(id, 10)
    
    if (isNaN(prestasiId)) {
      return errorResponse('ID Prestasi tidak valid', 400)
    }

    // Check if prestasi exists
    const existingPrestasi = await prisma.prestasi.findUnique({
      where: { id: prestasiId },
    })

    if (!existingPrestasi) {
      return notFoundResponse('Prestasi tidak ditemukan')
    }

    const body = await request.json()

    // Validate required fields
    if (!body.judul || !body.nama_lomba || !body.tingkat || !body.peringkat) {
      return errorResponse('Judul, nama lomba, tingkat, dan peringkat harus diisi', 400)
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existingPrestasi.slug) {
      const slugExists = await prisma.prestasi.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return errorResponse('Slug sudah digunakan oleh prestasi lain', 400)
      }
    }

    // Update prestasi
    const updated = await prisma.prestasi.update({
      where: { id: prestasiId },
      data: {
        judul: body.judul,
        slug: body.slug || existingPrestasi.slug,
        nama_lomba: body.nama_lomba,
        tingkat: body.tingkat,
        peringkat: body.peringkat,
        tahun: body.tahun || existingPrestasi.tahun,
        kategori: body.kategori || null,
        deskripsi: body.deskripsi || null,
        thumbnail: body.thumbnail || null,
        galeri: body.galeri || [],
        sertifikat: body.sertifikat || null,
        sertifikat_public: body.sertifikat_public ?? false,
        link_berita: body.link_berita || null,
        link_portofolio: body.link_portofolio || null,
        is_featured: body.is_featured ?? false,
        is_published: body.is_published ?? true,
        updated_at: new Date(),
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('Error updating prestasi:', error)
    return errorResponse('Gagal memperbarui prestasi')
  }
}
