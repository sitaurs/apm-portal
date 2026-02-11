import Link from 'next/link';
import Image from 'next/image';
import { 
  Button, 
  Badge, 
  Breadcrumb,
  Avatar
} from '@/components/ui';
import { 
  Users, 
  Target, 
  Lightbulb,
  Heart,
  Star,
  Phone,
  ChevronDown,
  Building2,
  GraduationCap
} from 'lucide-react';

// Values
const values = [
  { 
    icon: Target, 
    title: 'Fokus pada Prestasi', 
    desc: 'Mendorong mahasiswa untuk terus berprestasi di tingkat nasional dan internasional' 
  },
  { 
    icon: Lightbulb, 
    title: 'Inovasi', 
    desc: 'Mengembangkan solusi kreatif dan inovatif untuk berbagai permasalahan' 
  },
  { 
    icon: Heart, 
    title: 'Kolaborasi', 
    desc: 'Membangun kerjasama yang kuat antar mahasiswa, dosen, dan industri' 
  },
  { 
    icon: Star, 
    title: 'Keunggulan', 
    desc: 'Menjadi yang terdepan dalam pengembangan potensi mahasiswa' 
  },
];

// FAQ
const faqs = [
  {
    question: 'Apa itu APM Politeknik Negeri Malang?',
    answer: 'APM (Ajang Prestasi Mahasiswa) adalah unit yang mengelola dan mendukung kegiatan kemahasiswaan dalam bidang prestasi, lomba, dan kompetisi di Politeknik Negeri Malang. Kami menyediakan informasi lomba, memfasilitasi pendaftaran, dan mendokumentasikan prestasi mahasiswa.',
  },
  {
    question: 'Bagaimana cara mendaftar lomba melalui APM?',
    answer: 'Anda dapat melihat daftar lomba yang tersedia di halaman Lomba & Kompetisi, memilih lomba yang diminati, lalu mengikuti instruksi pendaftaran yang tertera. Beberapa lomba mungkin memerlukan rekomendasi dari fakultas.',
  },
  {
    question: 'Bagaimana cara melaporkan prestasi yang diraih?',
    answer: 'Gunakan halaman Submission untuk melaporkan prestasi. Upload bukti prestasi seperti sertifikat, foto dokumentasi, dan surat keterangan dari penyelenggara. Tim kami akan memverifikasi dan mempublikasikannya.',
  },
  {
    question: 'Apakah ada pendanaan untuk mengikuti lomba?',
    answer: 'Ya, Politeknik Negeri Malang menyediakan bantuan pendanaan untuk mahasiswa yang mengikuti lomba tertentu. Informasi pendanaan biasanya tersedia di detail masing-masing lomba atau dapat dikonsultasikan dengan koordinator APM fakultas.',
  },
  {
    question: 'Bagaimana cara menjadi volunteer atau panitia event APM?',
    answer: 'Kami membuka rekrutmen volunteer secara berkala. Pantau pengumuman di website dan media sosial kami, atau hubungi langsung tim APM untuk informasi lebih lanjut.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        
        <div className="container-apm py-16 relative z-10">
          <Breadcrumb 
            items={[{ label: 'Tentang APM' }]} 
            className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
          />
          <div className="max-w-3xl">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
              Tentang Kami
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Portal Ajang Prestasi Mahasiswa
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Mendukung dan memfasilitasi mahasiswa D4 Teknik Telekomunikasi Politeknik Negeri Malang untuk berprestasi di tingkat nasional dan internasional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Hubungi Kami
              </Button>
              <Button variant="ghost" className="text-white border-white/50 hover:bg-white/10">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="container-apm py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" className="mb-4">Visi & Misi</Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-6">
              Mencetak Generasi Berprestasi dan Berdaya Saing Global
            </h2>
            
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border-l-4 border-primary">
                <h3 className="font-semibold text-primary mb-2">Visi</h3>
                <p className="text-text-muted">
                  Menjadi Pusat Ekosistem Prestasi Mahasiswa Telekomunikasi POLINEMA yang Berdaya Saing Nasional dan Internasional.
                </p>
              </div>
              
              <div className="bg-secondary/5 rounded-xl p-6 border-l-4 border-secondary">
                <h3 className="font-semibold text-secondary mb-2">Misi (6 Pilar)</h3>
                <ul className="space-y-2 text-text-muted">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
                    Menyediakan platform informasi dan kurasi lomba akademik berbasis teknologi
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</span>
                    Memfasilitasi dan mendukung proses pendaftaran, pembinaan, dan persiapan lomba
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</span>
                    Mendokumentasikan dan mempublikasikan prestasi mahasiswa secara transparan
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">4</span>
                    Membangun kemitraan dengan industri, alumni, dan institusi untuk peningkatan kualitas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">5</span>
                    Mengembangkan budaya kompetitif dan inovatif di lingkungan prodi
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">6</span>
                    Melahirkan talenta yang siap berkontribusi di dunia industri dan masyarakat
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-text-main mb-2">{value.title}</h3>
                <p className="text-sm text-text-muted">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team / Struktur CTA */}
      <div className="bg-white py-16">
        <div className="container-apm">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Struktur Organisasi</Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-4">
              Tim Pengurus APM Telekomunikasi
            </h2>
            <p className="text-text-muted mb-8">
              APM dikelola oleh tim pengurus yang terdiri dari Dewan Pembina (Dosen), 
              Badan Pengurus Harian (BPH), dan 5 Divisi Operasional.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gray-600 mx-auto mb-3 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text-main">Dewan Pembina</h3>
                <p className="text-sm text-text-muted">2 Dosen Pembimbing</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text-main">BPH</h3>
                <p className="text-sm text-text-muted">Ketua, Wakil, Sekretaris, Bendahara</p>
              </div>
              <div className="bg-accent/5 rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-accent mx-auto mb-3 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text-main">Divisi</h3>
                <p className="text-sm text-text-muted">5 Divisi Operasional</p>
              </div>
            </div>
            
            <Link href="/tentang/struktur">
              <Button variant="primary">
                Lihat Struktur Lengkap
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-apm py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">FAQ</Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-main mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details 
                key={idx} 
                className="group bg-white rounded-xl shadow-card overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-text-main pr-4">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-text-muted group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-text-muted">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="container-apm">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ada Pertanyaan Lain?
            </h2>
            <p className="text-white/80 mb-8">
              Jangan ragu untuk menghubungi kami. Tim APM siap membantu kamu!
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a href="https://wa.me/6281252460190" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white">
                <Phone className="w-5 h-5" />
                +62 812-5246-0190
              </a>
              <a href="https://wa.me/6287853462867" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white">
                <Phone className="w-5 h-5" />
                +62 878-5346-2867
              </a>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://wa.me/6281252460190" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Chat WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

