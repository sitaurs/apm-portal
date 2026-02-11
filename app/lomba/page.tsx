import { Metadata } from 'next';
import LombaPageClient from './LombaPageClient';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Lomba & Kompetisi | APM Polinema',
  description: 'Temukan berbagai lomba dan kompetisi untuk mengasah kemampuanmu',
};

async function getLombaData() {
  try {
    const data = await prisma.lomba.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: [
        { is_featured: 'desc' },
        { deadline: 'asc' },
      ],
      take: 100,
    });

    return data.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      deadline: item.deadline?.toISOString() ?? undefined,
      deadlineDisplay: item.deadline
        ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : undefined,
      kategori: item.kategori,
      tingkat: item.tingkat,
      status: item.status as 'open' | 'closed' | 'coming-soon',
      isUrgent: item.is_urgent,
      isFree: item.biaya === 0,
      image: item.thumbnail || item.poster || undefined,
      penyelenggara: item.penyelenggara || undefined,
    }));
  } catch (error) {
    console.error('Error fetching lomba:', error);
    return [];
  }
}

export default async function LombaPage() {
  const lombaData = await getLombaData();

  return <LombaPageClient initialData={lombaData} />;
}

