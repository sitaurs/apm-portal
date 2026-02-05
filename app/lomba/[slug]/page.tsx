import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Button, 
  Badge, 
  Breadcrumb
} from '@/components/ui';
import { Countdown } from '@/components/ui/Countdown';
import { PosterGallery } from './PosterGallery';
import { ThumbnailViewer } from './ThumbnailViewer';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  ExternalLink,
  Share2,
  Bookmark,
  Mail,
  Phone,
  Globe,
  FileText,
  Gift,
  CheckCircle
} from 'lucide-react';
import { prisma } from '@/lib/prisma/client';

async function getLombaBySlug(slug: string) {
  try {
    const lomba = await prisma.lomba.findUnique({
      where: { slug, is_deleted: false },
    });
    
    if (!lomba) return null;

    // Parse JSON fields and format data
    const kontakPanitia = lomba.kontak_panitia as { email?: string; phone?: string; whatsapp?: string } | null;
    
    return {
      id: lomba.id,
      slug: lomba.slug,
      title: lomba.nama_lomba,
      deadline: lomba.deadline?.toISOString() || null,
      deadlineDisplay: lomba.deadline 
        ? new Date(lomba.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Belum diisi',
      kategori: lomba.kategori,
      tingkat: lomba.tingkat,
      status: lomba.status,
      penyelenggara: lomba.penyelenggara || 'Belum diisi',
      lokasi: lomba.lokasi || 'Belum diisi',
      biaya: lomba.biaya || 0,
      peserta: 'Umum',
      hadiah: typeof lomba.hadiah === 'string' ? lomba.hadiah : (Array.isArray(lomba.hadiah) ? lomba.hadiah.join(', ') : ''),
      deskripsi: lomba.deskripsi || 'Belum ada deskripsi lengkap.',
      syarat_ketentuan: lomba.syarat_ketentuan || '',
      kontak_panitia: kontakPanitia,
      kontakEmail: kontakPanitia?.email || '',
      kontakPhone: kontakPanitia?.phone || '',
      kontakWhatsapp: kontakPanitia?.whatsapp || '',
      linkPendaftaran: lomba.link_pendaftaran || '',
      posterUrl: lomba.poster || null,
      thumbnail: lomba.thumbnail || null,
      posters: lomba.posters || [],
      additionalFields: Array.isArray(lomba.additional_fields) ? lomba.additional_fields : [],
      tags: Array.isArray(lomba.tags) ? lomba.tags : [],
      tipe_pendaftaran: lomba.tipe_pendaftaran || 'internal',
    };
  } catch (error) {
    console.error('Error fetching lomba:', error);
    return null;
  }
}

export default async function LombaDetailPage({ params }: { params: { slug: string } }) {
  const lomba = await getLombaBySlug(params.slug);

  if (!lomba) {
    notFound();
  }

  const lombaDetail = {
    id: lomba.id,
    slug: lomba.slug,
    title: lomba.title,
    deadline: lomba.deadline,
    deadlineDisplay: lomba.deadlineDisplay,
    kategori: lomba.kategori,
    tingkat: lomba.tingkat,
    status: lomba.status,
    penyelenggara: lomba.penyelenggara,
    lokasi: lomba.lokasi,
    biaya: lomba.biaya,
    peserta: lomba.peserta,
    hadiah: lomba.hadiah,
    deskripsi: lomba.deskripsi,
    syarat: lomba.syarat_ketentuan,
    kontakEmail: lomba.kontakEmail,
    kontakPhone: lomba.kontakPhone,
    kontakWhatsapp: lomba.kontakWhatsapp,
    linkPendaftaran: lomba.linkPendaftaran,
    posterUrl: lomba.posterUrl,
    thumbnail: lomba.thumbnail,
    posters: lomba.posters,
    additionalFields: lomba.additionalFields,
    tags: lomba.tags,
    tipePendaftaran: lomba.tipe_pendaftaran,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header dengan Background */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        <div className="container-apm py-6">
          <Breadcrumb 
            items={[
              { label: 'Lomba & Kompetisi', href: '/lomba' },
              { label: lombaDetail.title }
            ]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm -mt-2 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="open">{lombaDetail.status === 'open' ? 'OPEN' : 'CLOSED'}</Badge>
                    <Badge variant="nasional">{lombaDetail.tingkat}</Badge>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-text-main mb-2">
                    {lombaDetail.title}
                  </h1>
                  <p className="text-text-muted">
                    Diselenggarakan oleh <span className="font-medium">{lombaDetail.penyelenggara}</span>
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Deadline Pendaftaran</span>
                </div>
                {lombaDetail.deadline ? (
                  <Countdown targetDate={lombaDetail.deadline} size="sm" />
                ) : (
                  <p className="text-text-muted">Belum ada deadline</p>
                )}
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Deadline</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.deadlineDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Lokasi</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.lokasi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Peserta</p>
                    <p className="text-sm font-medium text-text-main">{lombaDetail.peserta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Biaya</p>
                    <p className="text-sm font-medium text-success">
                      {lombaDetail.biaya === 0 ? 'Gratis' : `Rp ${lombaDetail.biaya.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Poster/Flyer Gallery - Moved to top */}
            <PosterGallery posters={lombaDetail.posters} title={lombaDetail.title} />

            {/* Deskripsi */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">Deskripsi</h2>
              <div 
                className="prose prose-sm max-w-none text-text-muted" 
                dangerouslySetInnerHTML={{ __html: lombaDetail.deskripsi }}
              />
            </div>

            {/* Syarat & Ketentuan */}
            {lombaDetail.syarat && lombaDetail.syarat.trim() && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Persyaratan</h2>
                <div 
                  className="prose prose-sm max-w-none text-text-muted" 
                  dangerouslySetInnerHTML={{ __html: lombaDetail.syarat }}
                />
              </div>
            )}

            {/* Hadiah */}
            {lombaDetail.hadiah && lombaDetail.hadiah.trim() && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-accent" />
                  Hadiah
                </h2>
                <div 
                  className="prose prose-sm max-w-none text-text-muted" 
                  dangerouslySetInnerHTML={{ __html: lombaDetail.hadiah }}
                />
              </div>
            )}

            {/* Additional Fields / Informasi Tambahan */}
            {lombaDetail.additionalFields.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Informasi Tambahan</h2>
                <div className="grid gap-4">
                  {lombaDetail.additionalFields.map((field: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2 font-medium">{field.label}</p>
                      {field.value.startsWith('http') ? (
                        <a 
                          href={field.value} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-2 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {field.value}
                        </a>
                      ) : (
                        <p className="text-sm text-text-main font-medium">{field.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Poster Utama dengan Lightbox */}
              {(lombaDetail.thumbnail || lombaDetail.posterUrl) && (
                <ThumbnailViewer 
                  imageUrl={(lombaDetail.thumbnail || lombaDetail.posterUrl) as string} 
                  title={lombaDetail.title}
                />
              )}

              {/* CTA Buttons - Conditional based on tipe_pendaftaran */}
              <div className="bg-white rounded-xl shadow-card p-6 space-y-3">
                {/* Internal: Daftar via form internal */}
                {lombaDetail.tipePendaftaran === 'internal' && (
                  <Link href={`/lomba/${lomba.slug}/daftar`}>
                    <Button variant="primary" size="lg" fullWidth>
                      Daftar Sekarang
                    </Button>
                  </Link>
                )}
                
                {/* Eksternal: Daftar via link penyelenggara */}
                {lombaDetail.tipePendaftaran === 'eksternal' && lombaDetail.linkPendaftaran && (
                  <a href={lombaDetail.linkPendaftaran} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="lg" fullWidth>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Daftar di Website Penyelenggara
                    </Button>
                  </a>
                )}
                
                {/* None: Info only, no registration button */}
                {lombaDetail.tipePendaftaran === 'none' && (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-text-muted text-sm">
                      Lomba ini hanya untuk informasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Kontak */}
              {(lombaDetail.kontakEmail || lombaDetail.kontakPhone || lombaDetail.kontakWhatsapp) && (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-text-main mb-4">Kontak Panitia</h3>
                  <div className="space-y-3">
                    {lombaDetail.kontakEmail && (
                      <a href={`mailto:${lombaDetail.kontakEmail}`} className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Mail className="w-4 h-4" />
                        {lombaDetail.kontakEmail}
                      </a>
                    )}
                    {lombaDetail.kontakPhone && (
                      <a href={`tel:${lombaDetail.kontakPhone}`} className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {lombaDetail.kontakPhone}
                      </a>
                    )}
                    {lombaDetail.kontakWhatsapp && (
                      <a href={`https://wa.me/${lombaDetail.kontakWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-muted hover:text-primary">
                        <Phone className="w-4 h-4" />
                        WhatsApp: {lombaDetail.kontakWhatsapp}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {lombaDetail.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-text-main mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(lombaDetail.tags as string[]).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
