import { Metadata } from 'next';
import ExpoPageClient from './ExpoPageClient';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Expo & Pameran | APM Polinema',
  description: 'Ikuti berbagai event expo dan pameran karya mahasiswa',
};

async function getExpoData() {
  try {
    const data = await prisma.expo.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: { tanggal_mulai: 'desc' },
      take: 100,
    });

    return data.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_event,
      tanggal: item.tanggal_mulai?.toISOString() || '',
      lokasi: item.lokasi,
      deskripsiSingkat: item.deskripsi || undefined,
      status: (item.status === 'completed' ? 'past' : item.status) as 'upcoming' | 'ongoing' | 'past',
      kategori: item.tema || undefined,
      posterUrl: item.poster || undefined,
    }));
  } catch (error) {
    console.error('Error fetching expo:', error);
    return [];
  }
}

async function getExpoSettings() {
  try {
    const settings = await prisma.expoSettings.findFirst({
      where: { id: 1 },
    });
    
    return {
      is_active: settings?.is_active ?? true,
      inactive_message: settings?.inactive_message || '',
      next_expo_date: settings?.next_expo_date?.toISOString() || null,
    };
  } catch (error) {
    console.error('Error fetching expo settings:', error);
    return { is_active: true, inactive_message: '', next_expo_date: null };
  }
}

export default async function ExpoPage() {
  const [expoData, settings] = await Promise.all([
    getExpoData(),
    getExpoSettings(),
  ]);

  return <ExpoPageClient initialData={expoData} settings={settings} />;
}

