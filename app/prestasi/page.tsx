import { Metadata } from 'next';
import PrestasiPageClient from './PrestasiPageClient';
import { prisma } from '@/lib/prisma/client';
import type { PrestasiItem } from '@/hooks/useData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Prestasi & Pencapaian | APM Portal',
  description: 'Daftar prestasi membanggakan dari mahasiswa Politeknik Negeri Malang yang telah berhasil meraih juara di berbagai lomba dan kompetisi.',
};

async function getPrestasiData() {
  try {
    const data = await prisma.prestasi.findMany({
      where: {
        is_published: true,
      },
      orderBy: { published_at: 'desc' },
      take: 100,
    });

    return data.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.judul,
      namaLomba: item.nama_lomba,
      peringkat: item.peringkat,
      tingkat: item.tingkat,
      tahun: item.tahun?.toString() || new Date().getFullYear().toString(),
      kategori: item.kategori || '',
      isVerified: true,
      foto: item.thumbnail || (Array.isArray(item.galeri) && item.galeri.length > 0 ? String(item.galeri[0]) : undefined),
    }));
  } catch (error) {
    console.error('Error fetching prestasi:', error);
    return [];
  }
}

export default async function PrestasiPage() {
  const prestasiData = await getPrestasiData();

  return <PrestasiPageClient initialData={prestasiData} />;
}

