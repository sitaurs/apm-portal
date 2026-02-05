/**
 * Public Lomba API
 * 
 * GET /api/lomba - Get list of public lomba
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const kategori = searchParams.get('kategori')
    const tingkat = searchParams.get('tingkat')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured') === 'true'

    // Build where clause
    const where: Record<string, unknown> = {
      is_deleted: false,
    }

    if (slug) {
      where.slug = slug
    } else {
      // Default filter for public: show ongoing, open, published, draft
      if (status) {
        where.status = status
      } else {
        where.status = { in: ['open', 'draft', 'ongoing', 'published'] }
      }
      
      if (kategori) where.kategori = kategori
      if (tingkat) where.tingkat = tingkat
      if (featured) where.is_featured = true
      
      if (search) {
        where.OR = [
          { nama_lomba: { contains: search, mode: 'insensitive' } },
          { deskripsi: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // Query lomba - always select all fields for simplicity
    const [lombaList, total] = await Promise.all([
      prisma.lomba.findMany({
        where: where as any,
        orderBy: { created_at: 'desc' },
        skip: slug ? 0 : (page - 1) * limit,
        take: slug ? 1 : limit,
      }),
      slug ? Promise.resolve(1) : prisma.lomba.count({ where: where as any }),
    ])

    // Transform data for frontend compatibility
    const data = lombaList.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.nama_lomba,
      nama_lomba: item.nama_lomba,
      kategori: item.kategori,
      tingkat: item.tingkat.charAt(0).toUpperCase() + item.tingkat.slice(1),
      deadline: item.deadline?.toISOString() || null,
      deadlineDisplay: item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
      lokasi: item.lokasi || '',
      biaya: item.biaya,
      isFree: item.biaya === 0,
      isFeatured: item.is_featured,
      isUrgent: item.is_urgent,
      status: item.status,
      posterUrl: item.poster || null,
      thumbnail: item.thumbnail || null,
      posters: item.posters || [],
      additionalFields: item.additional_fields || null,
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
      // Detail fields (always included)
      deskripsi: item.deskripsi || '',
      tanggalPelaksanaan: item.tanggal_pelaksanaan?.toISOString() || null,
      penyelenggara: item.penyelenggara || '',
      sumber: item.sumber,
      tipe_pendaftaran: item.tipe_pendaftaran,
      tipePendaftaran: item.tipe_pendaftaran || 'internal',
      link_pendaftaran: item.link_pendaftaran || null,
      linkPendaftaran: item.link_pendaftaran || null,
      custom_form: item.custom_form,
      syarat_ketentuan: item.syarat_ketentuan || '',
      hadiah: item.hadiah,
      kontak_panitia: item.kontak_panitia,
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: slug ? undefined : {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching lomba:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data lomba' },
      { status: 500 }
    )
  }
}

