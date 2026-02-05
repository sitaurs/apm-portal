import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Button, 
  Badge, 
  Breadcrumb,
  PrestasiCard,
  Avatar
} from '@/components/ui';
import { 
  Trophy, 
  Medal,
  Calendar, 
  Users, 
  Building2,
  GraduationCap,
  ArrowRight,
  Award,
  FileText,
} from 'lucide-react';
import { PrestasiActions } from './PrestasiActions';

async function getPrestasiBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Fetch from API with slug parameter
    const res = await fetch(`${baseUrl}/api/prestasi?slug=${slug}`, {
      cache: 'no-store',
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // API returns array, get first match
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching prestasi:', error);
    return null;
  }
}

async function getRelatedPrestasi(currentId: number, tingkat: string, limit = 3) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Fetch related prestasi with same tingkat, exclude current
    const res = await fetch(`${baseUrl}/api/prestasi?tingkat=${tingkat.toLowerCase()}&limit=${limit + 1}`, {
      cache: 'no-store',
      next: { revalidate: 300 }, // 5 min cache for related
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    // Filter out current prestasi
    return (data.data || [])
      .filter((p: any) => p.id !== currentId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related prestasi:', error);
    return [];
  }
}

export default async function PrestasiDetailPage({ params }: { params: { slug: string } }) {
  const prestasi = await getPrestasiBySlug(params.slug);

  if (!prestasi) {
    notFound();
  }

  // Fetch related prestasi
  const relatedPrestasi = await getRelatedPrestasi(
    prestasi.id, 
    prestasi.tingkat.toLowerCase()
  );

  // Format date helper
  const formatTanggal = (dateStr: string | null) => {
    if (!dateStr || dateStr === 'Belum diisi') return 'Belum diisi';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Map API data to component format
  const prestasiDetail = {
    id: prestasi.id,
    slug: prestasi.slug,
    title: prestasi.judul,
    namaLomba: prestasi.nama_lomba,
    penyelenggara: prestasi.penyelenggara || 'Belum diisi',
    peringkat: prestasi.peringkat,
    tingkat: prestasi.tingkat,
    kategori: prestasi.kategori,
    tahun: prestasi.tahun.toString(),
    tanggalLomba: formatTanggal(prestasi.tanggal_lomba),
    lokasi: prestasi.lokasi || 'Belum diisi',
    deskripsi: prestasi.deskripsi || 'Belum ada deskripsi lengkap.',
    proyek: prestasi.proyek_data ? {
      nama: prestasi.proyek_data.nama || '',
      deskripsi: prestasi.proyek_data.deskripsi || '',
      fitur: prestasi.proyek_data.fitur || [],
      teknologi: prestasi.proyek_data.teknologi || [],
    } : null,
    tim: prestasi.tim_mahasiswa || [],
    pembimbing: prestasi.pembimbing_data ? {
      nama: prestasi.pembimbing_data.nama || '',
      nidn: prestasi.pembimbing_data.nidn || '',
      whatsapp: prestasi.pembimbing_data.whatsapp || '',
    } : null,
    prodi: prestasi.prodi || 'Belum diisi',
    // Galeri from prestasi table (not dokumentasi_files from documents)
    galeri: prestasi.galeri || [],
    dokumentasi: prestasi.dokumentasi_files || [],
    sertifikat: prestasi.sertifikat_file || null,
    sumberBerita: prestasi.sumber_berita || '',
    linkBerita: prestasi.link_berita || '',
    linkPortofolio: prestasi.link_portofolio || '',
  };
  
  const getPeringkatColor = (peringkat: string) => {
    if (peringkat.toLowerCase().includes('juara 1') || peringkat.toLowerCase().includes('gold')) {
      return 'from-yellow-400 to-yellow-600';
    }
    if (peringkat.toLowerCase().includes('juara 2') || peringkat.toLowerCase().includes('silver')) {
      return 'from-gray-300 to-gray-500';
    }
    if (peringkat.toLowerCase().includes('juara 3') || peringkat.toLowerCase().includes('bronze')) {
      return 'from-orange-400 to-orange-600';
    }
    return 'from-primary to-primary-600';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header dengan Background */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="container-apm py-8 relative z-10">
          <Breadcrumb 
            items={[
              { label: 'Prestasi & Pencapaian', href: '/prestasi' },
              { label: prestasiDetail.title }
            ]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-4"
          />
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Medal/Trophy Icon */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getPeringkatColor(prestasiDetail.peringkat)} flex items-center justify-center shadow-xl`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="open">{prestasiDetail.peringkat}</Badge>
                <Badge variant="internasional">{prestasiDetail.tingkat}</Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {prestasiDetail.kategori}
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {prestasiDetail.title}
              </h1>
              <p className="text-white/80">{prestasiDetail.namaLomba}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-apm py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Tanggal</p>
                    <p className="text-sm font-medium text-text-main">{prestasiDetail.tanggalLomba}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Lokasi</p>
                    <p className="text-sm font-medium text-text-main">{prestasiDetail.lokasi}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Tim</p>
                    <p className="text-sm font-medium text-text-main">{prestasiDetail.tim.length} orang</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Tahun</p>
                    <p className="text-sm font-medium text-text-main">{prestasiDetail.tahun}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4">Deskripsi</h2>
              <div 
                className="prose prose-sm max-w-none text-text-muted"
                dangerouslySetInnerHTML={{ __html: prestasiDetail.deskripsi }}
              />
            </div>

            {/* Galeri Dokumentasi - from galeri array */}
            {prestasiDetail.galeri && prestasiDetail.galeri.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4">Galeri Dokumentasi</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {prestasiDetail.galeri.map((foto: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-primary/50 transition-colors">
                      <img 
                        src={foto} 
                        alt={`Dokumentasi ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tim */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Tim Pemenang
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {prestasiDetail.tim.map((anggota: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar alt={anggota.nama} size="lg" />
                      <div>
                        <p className="font-medium text-text-main">{anggota.nama}</p>
                        <p className="text-xs text-text-muted">{anggota.nim}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-text-muted">{anggota.prodi}</p>
                      <Badge variant="primary" size="sm">{anggota.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proyek/Karya */}
            {prestasiDetail.proyek && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Proyek yang Dikembangkan
                </h2>
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-5 mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">{prestasiDetail.proyek.nama}</h3>
                  <p className="text-text-muted mb-4">{prestasiDetail.proyek.deskripsi}</p>
                  
                  <h4 className="font-medium text-text-main mb-2">Fitur Utama:</h4>
                  <ul className="space-y-2 mb-4">
                    {prestasiDetail.proyek.fitur.map((fitur: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                        <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                        {fitur}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="font-medium text-text-main mb-2">Teknologi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {prestasiDetail.proyek.teknologi.map((tech: string) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pembimbing */}
            {prestasiDetail.pembimbing && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  Dosen Pembimbing
                </h2>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                  <Avatar alt={prestasiDetail.pembimbing.nama} size="lg" />
                  <div>
                    <p className="font-medium text-text-main">{prestasiDetail.pembimbing.nama}</p>
                    {prestasiDetail.pembimbing.nidn && (
                      <p className="text-sm text-text-muted">NIDN: {prestasiDetail.pembimbing.nidn}</p>
                    )}
                    {prestasiDetail.pembimbing.whatsapp && (
                      <p className="text-sm text-text-muted">WA: {prestasiDetail.pembimbing.whatsapp}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${getPeringkatColor(prestasiDetail.peringkat)} flex items-center justify-center shadow-lg mb-4`}>
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-main">{prestasiDetail.peringkat}</h3>
                <p className="text-text-muted">{prestasiDetail.tingkat}</p>
              </div>

              <hr className="my-5" />

              {/* Penyelenggara */}
              <div className="mb-6">
                <p className="text-sm text-text-muted mb-2">Penyelenggara</p>
                <div className="flex items-center gap-3">
                  <Avatar alt={prestasiDetail.penyelenggara} size="md" />
                  <p className="font-medium text-text-main">{prestasiDetail.penyelenggara}</p>
                </div>
              </div>

              {/* Program Studi */}
              <div className="mb-6">
                <p className="text-sm text-text-muted mb-2">Program Studi</p>
                <p className="font-medium text-text-main">{prestasiDetail.prodi}</p>
              </div>

              {/* Peringkat - show nicely formatted */}
              <div className="bg-accent/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-text-muted mb-1">Peringkat</p>
                <p className="font-semibold text-accent">{prestasiDetail.peringkat.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
              </div>

              <hr className="my-5" />

              {/* Sumber & Download */}
              <PrestasiActions
                sumberBerita={prestasiDetail.sumberBerita}
                sertifikat={prestasiDetail.sertifikat}
                linkBerita={prestasiDetail.linkBerita}
                linkPortofolio={prestasiDetail.linkPortofolio}
                title={prestasiDetail.title}
              />
            </div>
          </div>
        </div>

        {/* Related Prestasi */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main">Prestasi Lainnya</h2>
            <Link 
              href="/prestasi" 
              className="text-primary hover:text-primary-600 flex items-center gap-1 text-sm font-medium"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPrestasi.map((prestasi: any) => (
              <PrestasiCard key={prestasi.id} {...prestasi} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
