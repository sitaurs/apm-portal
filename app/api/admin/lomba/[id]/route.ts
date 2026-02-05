/**
 * Lomba Admin API - Single Item Operations
 * 
 * GET    /api/admin/lomba/[id] - Get single lomba by ID
 * PATCH  /api/admin/lomba/[id] - Update lomba
 * DELETE /api/admin/lomba/[id] - Delete lomba
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth } from '@/lib/auth/jwt'
import { generateSlug } from '@/lib/api/helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Helper to map DB lomba to API response
function mapLombaToResponse(lomba: Record<string, unknown>) {
  return {
    ...lomba,
    deadline_pendaftaran: lomba.deadline,
    persyaratan: lomba.syarat_ketentuan,
    biaya_pendaftaran: lomba.biaya,
    poster_url: lomba.poster,
    form_config: lomba.custom_form,
  }
}

/**
 * GET /api/admin/lomba/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const lombaId = parseInt(id)

    if (isNaN(lombaId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const lomba = await prisma.lomba.findUnique({
      where: { id: lombaId },
      include: {
        registrations: {
          select: {
            id: true,
            nama: true,
            nim: true,
            email: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!lomba) {
      return NextResponse.json({ success: false, error: 'Lomba tidak ditemukan' }, { status: 404 })
    }

    // Transform registrations
    const transformedRegistrations = lomba.registrations.map(reg => ({
      ...reg,
      nama_lengkap: reg.nama,
    }))

    const response = {
      ...mapLombaToResponse(lomba as unknown as Record<string, unknown>),
      registrations: transformedRegistrations,
      registration_count: lomba._count.registrations,
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Error fetching lomba:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data lomba' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/lomba/[id]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const lombaId = parseInt(id)

    if (isNaN(lombaId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const existing = await prisma.lomba.findUnique({ where: { id: lombaId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lomba tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json()

    // Handle slug update
    let slug = body.slug
    if (slug && slug !== existing.slug) {
      const existingSlug = await prisma.lomba.findFirst({
        where: { slug, id: { not: lombaId } },
      })
      if (existingSlug) {
        return NextResponse.json({ success: false, error: 'Slug sudah digunakan' }, { status: 400 })
      }
    } else if (body.nama_lomba && body.nama_lomba !== existing.nama_lomba && !slug) {
      slug = generateSlug(body.nama_lomba)
      const existingSlug = await prisma.lomba.findFirst({
        where: { slug, id: { not: lombaId } },
      })
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Build update data - map API fields to DB fields
    const updateData: Record<string, unknown> = {}

    if (body.nama_lomba !== undefined) updateData.nama_lomba = body.nama_lomba
    if (slug !== undefined) updateData.slug = slug
    if (body.kategori !== undefined) updateData.kategori = body.kategori
    if (body.tingkat !== undefined) updateData.tingkat = body.tingkat
    if (body.penyelenggara !== undefined) updateData.penyelenggara = body.penyelenggara || null
    
    // Map deadline_pendaftaran to deadline
    if (body.deadline_pendaftaran !== undefined) {
      updateData.deadline = body.deadline_pendaftaran ? new Date(body.deadline_pendaftaran) : null
    } else if (body.deadline !== undefined) {
      updateData.deadline = body.deadline ? new Date(body.deadline) : null
    }
    
    if (body.tanggal_pelaksanaan !== undefined) {
      updateData.tanggal_pelaksanaan = body.tanggal_pelaksanaan ? new Date(body.tanggal_pelaksanaan) : null
    }
    if (body.lokasi !== undefined) updateData.lokasi = body.lokasi || null
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi || null
    
    // Map persyaratan to syarat_ketentuan
    if (body.persyaratan !== undefined) {
      updateData.syarat_ketentuan = body.persyaratan || null
    } else if (body.syarat_ketentuan !== undefined) {
      updateData.syarat_ketentuan = body.syarat_ketentuan || null
    }
    
    if (body.hadiah !== undefined) updateData.hadiah = body.hadiah || null
    if (body.link_pendaftaran !== undefined) updateData.link_pendaftaran = body.link_pendaftaran || null
    
    // Map biaya_pendaftaran to biaya
    if (body.biaya_pendaftaran !== undefined) {
      updateData.biaya = body.biaya_pendaftaran
    } else if (body.biaya !== undefined) {
      updateData.biaya = body.biaya
    }
    
    if (body.kontak_panitia !== undefined) updateData.kontak_panitia = body.kontak_panitia || null
    
    // Map poster_url to poster
    if (body.poster_url !== undefined) {
      updateData.poster = body.poster_url || null
    } else if (body.poster !== undefined) {
      updateData.poster = body.poster || null
    }
    
    // NEW: Support thumbnail for list/card view (16:9 aspect ratio)
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail || null
    
    // NEW: Support multiple posters/flyers as array
    if (body.posters !== undefined) updateData.posters = body.posters || []
    
    // NEW: Support dynamic additional fields [{label, value}]
    if (body.additional_fields !== undefined) updateData.additional_fields = body.additional_fields || null
    
    if (body.tags !== undefined) updateData.tags = body.tags || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
    if (body.is_urgent !== undefined) updateData.is_urgent = body.is_urgent
    
    // Map form_config to custom_form
    if (body.form_config !== undefined) {
      updateData.custom_form = body.form_config || null
    } else if (body.custom_form !== undefined) {
      updateData.custom_form = body.custom_form || null
    }

    const lomba = await prisma.lomba.update({
      where: { id: lombaId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: mapLombaToResponse(lomba as unknown as Record<string, unknown>),
      message: 'Lomba berhasil diperbarui',
    })
  } catch (error) {
    console.error('Error updating lomba:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui lomba' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/lomba/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Only superadmin can delete
    if (session.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Hanya superadmin yang dapat menghapus lomba' }, { status: 403 })
    }

    const { id } = await params
    const lombaId = parseInt(id)

    if (isNaN(lombaId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const existing = await prisma.lomba.findUnique({
      where: { id: lombaId },
      include: { _count: { select: { registrations: true } } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lomba tidak ditemukan' }, { status: 404 })
    }

    // Check for registrations
    if (existing._count.registrations > 0) {
      const { searchParams } = new URL(request.url)
      const force = searchParams.get('force') === 'true'
      
      if (!force) {
        return NextResponse.json({
          success: false,
          error: `Lomba ini memiliki ${existing._count.registrations} pendaftar. Tambahkan ?force=true untuk menghapus paksa.`
        }, { status: 400 })
      }
    }

    // Soft delete lomba
    await prisma.lomba.update({
      where: { id: lombaId },
      data: { is_deleted: true },
    })

    // Auto-sync Calendar: Deactivate calendar events linked to this lomba
    // Format: /lomba/[slug] or contains lomba title
    await prisma.calendarEvent.updateMany({
      where: { 
        OR: [
          { link: { contains: `/lomba/${existing.slug}` } },
          { title: { contains: existing.nama_lomba } },
        ],
        is_active: true,
      },
      data: { is_active: false },
    })

    return NextResponse.json({ success: true, message: 'Lomba berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting lomba:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus lomba' }, { status: 500 })
  }
}
