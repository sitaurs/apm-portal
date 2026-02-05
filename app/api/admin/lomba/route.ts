/**
 * Lomba Admin API - CRUD Operations
 * 
 * GET  /api/admin/lomba - List all lomba with pagination & filtering
 * POST /api/admin/lomba - Create new lomba
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { generateSlug, calculatePagination } from '@/lib/api/helpers'

/**
 * GET /api/admin/lomba
 * List all lomba with pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const kategori = searchParams.get('kategori') || ''
    const tingkat = searchParams.get('tingkat') || ''
    const status = searchParams.get('status') || ''
    const sort = searchParams.get('sort') || 'created_at'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const where: {
      is_deleted?: boolean
      OR?: Array<Record<string, unknown>>
      kategori?: string
      tingkat?: string
      status?: string
    } = {
      is_deleted: false,
    }

    if (search) {
      where.OR = [
        { nama_lomba: { contains: search, mode: 'insensitive' } },
        { penyelenggara: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (kategori) where.kategori = kategori
    if (tingkat) where.tingkat = tingkat
    if (status) where.status = status

    // Get total count
    const total = await prisma.lomba.count({ where })

    // Get paginated data
    const data = await prisma.lomba.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { registrations: true }
        }
      },
    })

    // Transform for response - map DB fields to API fields
    const transformedData = data.map(item => ({
      id: item.id,
      nama_lomba: item.nama_lomba,
      slug: item.slug,
      kategori: item.kategori,
      tingkat: item.tingkat,
      penyelenggara: item.penyelenggara,
      deadline_pendaftaran: item.deadline, // Map DB field to API field
      tanggal_pelaksanaan: item.tanggal_pelaksanaan,
      lokasi: item.lokasi,
      status: item.status,
      is_featured: item.is_featured,
      is_urgent: item.is_urgent,
      poster: item.poster,
      thumbnail: item.thumbnail, // NEW: 16:9 thumbnail for cards
      posters: item.posters, // NEW: Multiple posters array
      additional_fields: item.additional_fields, // NEW: Dynamic fields
      created_at: item.created_at,
      updated_at: item.updated_at,
      registration_count: item._count.registrations,
    }))

    const pagination = calculatePagination(total, page, limit)

    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: pagination,
    })
  } catch (error) {
    console.error('Error fetching lomba:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data lomba' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/lomba
 * Create a new lomba
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Basic validation
    if (!body.nama_lomba || !body.kategori || !body.tingkat) {
      return NextResponse.json(
        { success: false, error: 'nama_lomba, kategori, dan tingkat wajib diisi' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    let slug = body.slug
    if (!slug) {
      slug = generateSlug(body.nama_lomba)
      
      // Check for duplicate slug
      const existingSlug = await prisma.lomba.findUnique({ where: { slug } })
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    } else {
      const existingSlug = await prisma.lomba.findUnique({ where: { slug } })
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Create lomba - map API fields to DB fields
    const lomba = await prisma.lomba.create({
      data: {
        nama_lomba: body.nama_lomba,
        slug,
        kategori: body.kategori,
        tingkat: body.tingkat,
        penyelenggara: body.penyelenggara || null,
        // Map API field to DB field
        deadline: body.deadline_pendaftaran ? new Date(body.deadline_pendaftaran) : (body.deadline ? new Date(body.deadline) : null),
        tanggal_pelaksanaan: body.tanggal_pelaksanaan ? new Date(body.tanggal_pelaksanaan) : null,
        lokasi: body.lokasi || null,
        deskripsi: body.deskripsi || null,
        // Map API field to DB field
        syarat_ketentuan: body.persyaratan || body.syarat_ketentuan || null,
        hadiah: body.hadiah || null,
        link_pendaftaran: body.link_pendaftaran || null,
        // Map API field to DB field
        biaya: body.biaya_pendaftaran ?? body.biaya ?? 0,
        kontak_panitia: body.kontak_panitia || null,
        // Map API field to DB field
        poster: body.poster_url || body.poster || null,
        // NEW: Support thumbnail for list/card view (16:9 aspect ratio)
        thumbnail: body.thumbnail || null,
        // NEW: Support multiple posters/flyers as array
        posters: body.posters || [],
        // NEW: Support dynamic additional fields [{label, value}]
        additional_fields: body.additional_fields || null,
        tags: body.tags || null,
        status: body.status || 'draft',
        is_featured: body.is_featured || false,
        is_urgent: body.is_urgent || false,
        // Map API field to DB field
        custom_form: body.form_config || body.custom_form || null,
        sumber: body.sumber || 'internal',
        tipe_pendaftaran: body.tipe_pendaftaran || 'internal',
      },
    })

    // Transform response
    const response = {
      ...lomba,
      deadline_pendaftaran: lomba.deadline,
      persyaratan: lomba.syarat_ketentuan,
      biaya_pendaftaran: lomba.biaya,
      poster_url: lomba.poster,
      form_config: lomba.custom_form,
    }

    return NextResponse.json(
      { success: true, data: response, message: 'Lomba berhasil dibuat' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating lomba:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat lomba' },
      { status: 500 }
    )
  }
}

