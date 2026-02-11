import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Button, 
  Badge, 
  Breadcrumb
} from '@/components/ui';
import { 
  CalendarDays, 
  MapPin, 
  Share2,
  Bookmark,
  Ticket
} from 'lucide-react';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getExpoBySlug(slug: string) {
  try {
    const expo = await prisma.expo.findFirst({
      where: {
        slug: slug,
        is_deleted: false,
      },
    });
    
    if (!expo) return null;
    
    return {
      id: expo.id,
      slug: expo.slug,
      title: expo.nama_event,
      tanggal: expo.tanggal_mulai?.toISOString(),
      tanggalMulai: expo.tanggal_mulai?.toISOString(),
      tanggalSelesai: expo.tanggal_selesai?.toISOString(),
      lokasi: expo.lokasi,
      status: expo.status,
      deskripsi: expo.deskripsi,
      posterUrl: expo.poster,
      registrationOpen: expo.registration_open,
      registrationDeadline: expo.registration_deadline?.toISOString(),
      maxParticipants: expo.max_participants,
      biayaPartisipasi: expo.biaya_partisipasi,
    };
  } catch (error) {
    console.error('Error fetching expo:', error);
    return null;
  }
}

export default async function ExpoDetailPage({ params }: { params: { slug: string } }) {
  const expo = await getExpoBySlug(params.slug);

  if (!expo) {
    notFound();
  }

  const expoDetail = {
    id: expo.id,
    slug: expo.slug,
    title: expo.title,
    tanggal: expo.tanggal,
    tanggalMulai: expo.tanggalMulai,
    tanggalSelesai: expo.tanggalSelesai,
    lokasi: expo.lokasi || 'Belum ditentukan',
    status: expo.status || 'upcoming',
    deskripsi: expo.deskripsi || 'Belum ada deskripsi lengkap.',
    posterUrl: expo.posterUrl,
    registrationOpen: expo.registrationOpen || false,
    registrationDeadline: expo.registrationDeadline,
    maxParticipants: expo.maxParticipants,
    biayaPartisipasi: expo.biayaPartisipasi || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary via-secondary-600 to-secondary-700">
        <div className="container-apm py-6">
          <Breadcrumb 
            items={[
              { label: 'Expo & Pameran', href: '/expo' },
              { label: expoDetail.title }
            ]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm -mt-2 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={expoDetail.status === 'upcoming' ? 'open' : 'closed'}>
                      {expoDetail.status === 'upcoming' ? 'MENDATANG' : expoDetail.status === 'ongoing' ? 'BERLANGSUNG' : 'SELESAI'}
                    </Badge>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-text-main mb-2">
                    {expoDetail.title}
                  </h1>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Bookmark className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Share2 className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Tanggal</p>
                    <p className="text-sm font-medium text-text-main">{expoDetail.tanggal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Lokasi</p>
                    <p className="text-sm font-medium text-text-main">{expoDetail.lokasi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Biaya</p>
                    <p className="text-sm font-medium text-success">
                      {expoDetail.biayaPartisipasi === 0 ? 'Gratis' : `Rp ${expoDetail.biayaPartisipasi.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">Tentang Event</h2>
              <div className="prose prose-sm max-w-none text-text-muted">
                {expoDetail.deskripsi.split('\\n').map((paragraph: string, idx: number) => (
                  paragraph.trim() && <p key={idx} className="mb-3">{paragraph.trim()}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Poster */}
              {expoDetail.posterUrl && (
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={expoDetail.posterUrl}
                      alt={expoDetail.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-white rounded-xl shadow-card p-6 space-y-3">
                {expoDetail.registrationOpen ? (
                  <Link href={`/expo/${expoDetail.slug}/daftar`}>
                    <Button variant="primary" size="lg" fullWidth>
                      <Ticket className="w-5 h-5 mr-2" />
                      Daftar Sekarang
                    </Button>
                  </Link>
                ) : (
                  <Button variant="primary" size="lg" fullWidth disabled>
                    Pendaftaran Ditutup
                  </Button>
                )}
                
                {expoDetail.registrationDeadline && (
                  <p className="text-xs text-text-muted text-center">
                    Deadline: {new Date(expoDetail.registrationDeadline).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
                
                {expoDetail.maxParticipants && (
                  <div className="text-center pt-3 border-t border-gray-100">
                    <p className="text-xs text-text-muted">Kapasitas</p>
                    <p className="text-sm font-semibold text-text-main">{expoDetail.maxParticipants} peserta</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
