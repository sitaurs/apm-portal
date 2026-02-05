/**
 * Public Prestasi API
 * 
 * GET /api/prestasi - Get list of published prestasi
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
    const tingkat = searchParams.get('tingkat')
    const kategori = searchParams.get('kategori')
    const tahun = searchParams.get('tahun')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    // Build where clause
    const where: Record<string, unknown> = {
      is_published: true,
    }

    if (slug) {
      where.slug = slug
    } else {
      if (tingkat) where.tingkat = tingkat
      if (kategori) where.kategori = kategori
      if (tahun) where.tahun = parseInt(tahun)
      
      if (search) {
        where.OR = [
          { judul: { contains: search, mode: 'insensitive' } },
          { nama_lomba: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // Query prestasi
    const [prestasiList, total] = await Promise.all([
      prisma.prestasi.findMany({
        where: where as any,
        orderBy: { published_at: 'desc' },
        skip: slug ? 0 : (page - 1) * limit,
        take: slug ? 1 : limit,
        include: {
          submission: slug ? {
            include: {
              team_members: true,
              pembimbing: true,
              documents: true,
            },
          } : false,
        },
      }),
      slug ? Promise.resolve(1) : prisma.prestasi.count({ where: where as any }),
    ])

    // Transform data for frontend compatibility
    const data = prestasiList.map((item) => {
      const submission = (item as any).submission
      
      return {
        id: item.id,
        slug: item.slug,
        title: item.judul,
        judul: item.judul,
        namaLomba: item.nama_lomba,
        nama_lomba: item.nama_lomba,
        peringkat: item.peringkat,
        tingkat: item.tingkat.charAt(0).toUpperCase() + item.tingkat.slice(1),
        tahun: item.tahun.toString(),
        kategori: item.kategori || '',
        deskripsi: item.deskripsi || '',
        isVerified: true, // All published prestasi are verified
        isFeatured: item.is_featured,
        thumbnailUrl: item.thumbnail || null,
        galeri: item.galeri,
        sertifikatUrl: item.sertifikat_public ? item.sertifikat : null,
        linkBerita: item.link_berita || null,
        linkPortofolio: item.link_portofolio || null,
        publishedAt: item.published_at.toISOString(),
        
        // Map submission data for detail page
        penyelenggara: submission?.penyelenggara || null,
        tanggal_lomba: submission?.tanggal?.toISOString() || null,
        lokasi: null, // Not in schema
        
        // Team members with proper formatting
        tim_mahasiswa: submission?.team_members?.map((member: any) => ({
          nama: member.nama,
          nim: member.nim,
          prodi: member.prodi || '',
          angkatan: member.angkatan || '',
          whatsapp: member.whatsapp || '',
          role: member.is_ketua ? 'Ketua Tim' : 'Anggota Tim',
        })) || [],
        
        // Pembimbing data
        pembimbing_data: submission?.pembimbing?.[0] ? {
          nama: submission.pembimbing[0].nama,
          nidn: submission.pembimbing[0].nidn || '',
          whatsapp: submission.pembimbing[0].whatsapp || '',
        } : null,
        
        // Extract fakultas/prodi from first team member
        fakultas: submission?.team_members?.[0]?.prodi?.includes('Fakultas') 
          ? submission.team_members[0].prodi.split(' - ')[0] 
          : 'Belum diisi',
        prodi: submission?.team_members?.[0]?.prodi || 'Belum diisi',
        
        // Documents/sertifikat as dokumentasi_files
        dokumentasi_files: submission?.documents?.filter((doc: any) => doc.type === 'dokumentasi').map((doc: any) => doc.file_path) || [],
        sertifikat_file: submission?.documents?.find((doc: any) => doc.type === 'sertifikat')?.file_path || item.sertifikat,
        
        // Hadiah - not in schema, leave empty
        hadiah_data: null,
        
        // Proyek data - not in schema
        proyek_data: null,
        
        // Sumber berita
        sumber_berita: item.link_berita || '',
      }
    })

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
    console.error('Error fetching prestasi:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data prestasi' },
      { status: 500 }
    )
  }
}

