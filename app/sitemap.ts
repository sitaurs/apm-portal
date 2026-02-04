import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/client';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://apm.fix.web.id';

async function fetchDynamicRoutes() {
  try {
    // Direct database access for build-time sitemap generation
    const [lombaData, prestasiData, expoData] = await Promise.all([
      prisma.lomba.findMany({
        where: { status: 'published' },
        select: { slug: true, updated_at: true },
        take: 1000,
      }),
      prisma.prestasi.findMany({
        where: { is_published: true },
        select: { slug: true, updated_at: true },
        take: 1000,
      }),
      prisma.expo.findMany({
        where: { status: 'published' },
        select: { slug: true, updated_at: true },
        take: 1000,
      }),
    ]);

    const lombaPages = lombaData.map((item) => ({
      url: `${baseUrl}/lomba/${item.slug}`,
      lastModified: item.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const prestasiPages = prestasiData.map((item) => ({
      url: `${baseUrl}/prestasi/${item.slug}`,
      lastModified: item.updated_at || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    const expoPages = expoData.map((item) => ({
      url: `${baseUrl}/expo/${item.slug}`,
      lastModified: item.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...lombaPages, ...prestasiPages, ...expoPages];
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/lomba`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prestasi`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/expo`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kalender`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/submission`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Fetch dynamic pages
  const dynamicPages = await fetchDynamicRoutes();

  return [...staticPages, ...dynamicPages];
}

