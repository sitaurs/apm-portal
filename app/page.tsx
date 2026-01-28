import Link from 'next/link';
import {
  Button,
  Badge,
  LombaCard,
  PrestasiCard,
  ExpoCard,
  SearchInput,
  FilterChip,
  Avatar
} from '@/components/ui';
import { Countdown } from '@/components/ui/Countdown';
import {
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Mail,
  Clock,
  ChevronRight,
  Star
} from 'lucide-react';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

const filterTags = ['Online', 'Gratis', 'Nasional'];

// Fetch functions
async function getLomba() {
  try {
    const params = new URLSearchParams();
    params.set('limit', '4');
    params.set('sort', '-is_urgent,-date_created');
    // Remove strict status filter - allow all non-closed statuses or just fetch all
    params.set('fields', 'id,nama_lomba,slug,deadline,kategori,tingkat,status,biaya,is_urgent,is_featured');

    const url = `${DIRECTUS_URL}/items/apm_lomba?${params.toString()}`;
    console.log('Fetching lomba from:', url);

    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch lomba: ${res.status} from ${url}`);
      return [];
    }
    const data = await res.json();
    console.log(`Fetched ${data.data?.length || 0} lomba items`);

    return (data.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      deadline: item.deadline,
      deadlineDisplay: item.deadline
        ? new Date(item.deadline as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : null,
      kategori: String(item.kategori || '').charAt(0).toUpperCase() + String(item.kategori || '').slice(1),
      tingkat: String(item.tingkat || '').charAt(0).toUpperCase() + String(item.tingkat || '').slice(1),
      status: item.status || 'open',
      isUrgent: item.is_urgent,
      isFree: item.biaya === 0,
    }));
  } catch (error) {
    console.error('Error fetching lomba:', error);
    return [];
  }
}

async function getPrestasi() {
  try {
    const params = new URLSearchParams();
    params.set('limit', '3');
    params.set('sort', '-date_created');
    // Relaxed filter - show all prestasi for now (status_verifikasi can be verified later)
    params.set('fields', 'id,judul,slug,nama_lomba,peringkat,tingkat,tahun,kategori,verified_at,status_verifikasi');

    const url = `${DIRECTUS_URL}/items/apm_prestasi?${params.toString()}`;
    console.log('Fetching prestasi from:', url);

    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch prestasi: ${res.status} from ${url}`);
      return [];
    }
    const data = await res.json();
    console.log(`Fetched ${data.data?.length || 0} prestasi items`);

    return (data.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_lomba,
      peringkat: item.peringkat,
      tingkat: String(item.tingkat || '').charAt(0).toUpperCase() + String(item.tingkat || '').slice(1),
      tahun: String(item.tahun),
      kategori: String(item.kategori || ''),
      isVerified: true,
    }));
  } catch (error) {
    console.error('Error fetching prestasi:', error);
    return [];
  }
}

async function getExpo() {
  try {
    const params = new URLSearchParams();
    params.set('limit', '3');
    params.set('sort', '-date_created');
    // Relaxed filter - show all expo for now
    params.set('fields', 'id,nama_event,slug,tanggal_mulai,tanggal_selesai,lokasi,status');

    const url = `${DIRECTUS_URL}/items/apm_expo?${params.toString()}`;
    console.log('Fetching expo from:', url);

    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch expo: ${res.status} from ${url}`);
      return [];
    }
    const data = await res.json();
    console.log(`Fetched ${data.data?.length || 0} expo items`);

    const formatTanggal = (start: string, end?: string) => {
      const startDate = new Date(start);
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

      if (end && end !== start) {
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString('id-ID', { day: 'numeric' })}-${endDate.toLocaleDateString('id-ID', opts)}`;
      }
      return startDate.toLocaleDateString('id-ID', opts);
    };

    return (data.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.nama_event,
      tanggal: formatTanggal(item.tanggal_mulai as string, item.tanggal_selesai as string | undefined),
      lokasi: item.lokasi,
    }));
  } catch (error) {
    console.error('Error fetching expo:', error);
    return [];
  }
}

async function getUpcomingDeadline() {
  try {
    const params = new URLSearchParams();
    params.set('limit', '1');
    params.set('sort', 'deadline');
    params.set('filter', JSON.stringify({
      status: { _eq: 'open' },
      deadline: { _gte: new Date().toISOString() }
    }));
    params.set('fields', 'deadline');

    const res = await fetch(`${DIRECTUS_URL}/items/apm_lomba?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.data && data.data.length > 0) {
      return data.data[0].deadline;
    }
    return null;
  } catch {
    return null;
  }
}

interface SiteStats {
  totalLomba: number;
  totalPrestasi: number;
  totalMahasiswa: number;
  totalExpo: number;
}

interface HelpContent {
  title: string;
  description: string;
  email: string;
  showLocation: boolean;
  location?: string;
}

interface SiteSettingsData {
  stats: SiteStats;
  help: HelpContent;
}

const defaultSettings: SiteSettingsData = {
  stats: { totalLomba: 0, totalPrestasi: 0, totalMahasiswa: 0, totalExpo: 0 },
  help: {
    title: 'Butuh Bantuan?',
    description: 'Tim APM siap membantu Anda',
    email: 'apm@polinema.ac.id',
    showLocation: false,
  },
};

async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/site-settings`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      return defaultSettings;
    }

    const data = await res.json();
    return data.data || defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default async function HomePage() {
  // Fetch data in parallel
  const [lomba, prestasi, expo, upcomingDeadline, siteStats] = await Promise.all([
    getLomba(),
    getPrestasi(),
    getExpo(),
    getUpcomingDeadline(),
    getSiteSettings(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white py-12 lg:py-16">
        <div className="container-apm">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold font-heading mb-4 leading-tight">
                Wujudkan Potensi,<br />
                Raih Prestasi Kampus!
              </h1>
              <p className="text-white/80 text-lg mb-6 max-w-lg">
                Temukan peluang emas, berkompetisi di tingkat nasional, dan bagikan
                juga prestasi Anda bersama komunitas mahasiswa berprestasi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/lomba">
                  <Button variant="primary" size="lg">
                    Jelajahi Lomba
                  </Button>
                </Link>
                <Link href="/kalender">
                  <Button variant="outline-white" size="lg">
                    Lihat Kalender
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Countdown & Highlight */}
            <div className="space-y-4">
              {/* Deadline Terdekat */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-medium">Deadline Terdekat</span>
                  </div>
                  <Link href="/lomba?deadline=urgent" className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                    Lihat semua <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {upcomingDeadline ? (
                  <Countdown
                    targetDate={upcomingDeadline}
                    variant="hero"
                    className="text-xl"
                  />
                ) : (
                  <div className="text-white/70 text-center py-4">
                    <p className="text-lg">Belum ada deadline lomba</p>
                    <p className="text-sm mt-1">Lihat daftar lomba untuk info terbaru</p>
                  </div>
                )}
              </div>

              {/* Prestasi Minggu Ini */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-accent" />
                  <span className="font-medium">Prestasi Minggu Ini</span>
                </div>
                {prestasi.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt="Mahasiswa Berprestasi"
                      size="lg"
                      showVerified
                    />
                    <div>
                      <p className="font-semibold">Tim Berprestasi</p>
                      <p className="text-sm text-white/70">
                        {prestasi[0].peringkat} - {prestasi[0].title}
                      </p>
                    </div>
                    <Badge variant="verified" className="ml-auto">
                      Verified
                    </Badge>
                  </div>
                ) : (
                  <div className="text-white/70 text-center py-2">
                    <p>Belum ada prestasi minggu ini</p>
                    <Link href="/prestasi/submit" className="text-accent hover:underline text-sm">
                      Submit prestasi Anda →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="container-apm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="w-full md:w-96">
              <SearchInput
                placeholder="Cari lomba, prestasi, atau expo..."
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {filterTags.map((tag) => (
                <FilterChip key={tag} label={tag} />
              ))}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-sm text-text-muted">Mendesak</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm text-text-muted">&lt;7 hari</span>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="ml-auto">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Kategori</option>
                <option>Teknologi & IT</option>
                <option>Bisnis</option>
                <option>Akademik</option>
                <option>Seni & Desain</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Lomba Pilihan Minggu Ini */}
      <section className="py-10">
        <div className="container-apm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Lomba Pilihan Minggu Ini
              </h2>
            </div>
            <Link
              href="/lomba"
              className="text-primary hover:text-primary-600 flex items-center gap-1 text-sm font-medium"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {lomba.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {lomba.map((item: {
                id: string;
                slug: string;
                title: string;
                deadline: string;
                deadlineDisplay: string;
                kategori: string;
                tingkat: string;
                status: 'open' | 'closed' | 'coming-soon';
                isUrgent: boolean;
                isFree: boolean;
              }) => (
                <LombaCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <p>Belum ada lomba tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* Prestasi Terbaru */}
      <section className="py-10 bg-white">
        <div className="container-apm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Prestasi Terbaru
              </h2>
            </div>
            <Link
              href="/prestasi"
              className="text-primary hover:text-primary-600 flex items-center gap-1 text-sm font-medium"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {prestasi.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prestasi.map((item: {
                id: string;
                slug: string;
                title: string;
                peringkat: string;
                tingkat: string;
                tahun: string;
                kategori: string;
                isVerified: boolean;
              }) => (
                <PrestasiCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <p>Belum ada prestasi tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* Expo Terdekat */}
      <section className="py-10">
        <div className="container-apm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-text-main">
                Expo Terdekat
              </h2>
            </div>
            <Link
              href="/expo"
              className="text-primary hover:text-primary-600 flex items-center gap-1 text-sm font-medium"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {expo.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {expo.map((item: {
                id: string;
                slug: string;
                title: string;
                tanggal: string;
                lokasi: string;
              }) => (
                <ExpoCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <p>Belum ada expo tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container-apm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">
                {siteStats.stats.totalLomba > 0 ? siteStats.stats.totalLomba.toLocaleString('id-ID') : '0'}
              </div>
              <div className="text-text-muted">Lomba Aktif</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-3">
                <Star className="w-7 h-7 text-secondary" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-secondary mb-1">
                {siteStats.stats.totalPrestasi > 0 ? siteStats.stats.totalPrestasi.toLocaleString('id-ID') : '0'}
              </div>
              <div className="text-text-muted">Prestasi Tercatat</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-3">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-1">
                {siteStats.stats.totalMahasiswa > 0 ? siteStats.stats.totalMahasiswa.toLocaleString('id-ID') : '0'}
              </div>
              <div className="text-text-muted">Mahasiswa Bergabung</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 mb-3">
                <Calendar className="w-7 h-7 text-success" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-success mb-1">
                {siteStats.stats.totalExpo > 0 ? siteStats.stats.totalExpo.toLocaleString('id-ID') : '0'}
              </div>
              <div className="text-text-muted">Expo & Pameran</div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section - CMS Driven */}
      <section className="py-12 bg-gray-50">
        <div className="container-apm">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-3">
              {siteStats.help.title}
            </h2>
            <p className="text-text-muted mb-4">
              {siteStats.help.description}
            </p>
            <a
              href={`mailto:${siteStats.help.email}`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-600 font-medium"
            >
              <Mail className="w-5 h-5" />
              {siteStats.help.email}
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-secondary to-primary">
        <div className="container-apm text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Punya Prestasi yang Ingin Dibagikan?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Submit prestasi Anda sekarang dan jadilah inspirasi bagi mahasiswa lainnya.
            Prestasi Anda akan ditampilkan di galeri setelah verifikasi.
          </p>
          <Link href="/submission">
            <Button variant="primary" size="lg">
              Submit Prestasi Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

