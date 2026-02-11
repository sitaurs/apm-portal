import ResourcesPageClient from './ResourcesPageClient';

interface Resource {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  thumbnail?: string;
  tags?: string[];
  is_featured?: boolean;
}

// Static resources data (no database table for this yet)
const staticResources: Resource[] = [
  {
    id: '1',
    slug: 'template-proposal-lomba',
    judul: 'Template Proposal Lomba',
    deskripsi: 'Template proposal standar untuk mengikuti berbagai lomba dan kompetisi',
    kategori: 'Template',
    is_featured: true,
    tags: ['proposal', 'lomba', 'template'],
  },
  {
    id: '2',
    slug: 'panduan-submit-prestasi',
    judul: 'Panduan Submit Prestasi',
    deskripsi: 'Cara melaporkan prestasi yang telah diraih melalui portal APM',
    kategori: 'Panduan',
    is_featured: true,
    tags: ['prestasi', 'panduan', 'submit'],
  },
  {
    id: '3',
    slug: 'tips-presentasi',
    judul: 'Tips Presentasi yang Efektif',
    deskripsi: 'Tips dan trik untuk presentasi yang memukau di lomba',
    kategori: 'Tips & Trik',
    tags: ['presentasi', 'tips'],
  },
];

export default async function ResourcesPage() {
  return <ResourcesPageClient initialResources={staticResources} />;
}
