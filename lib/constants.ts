// APM Portal Constants

// Color Palette
export const colors = {
  primary: '#0B4F94',
  secondary: '#00A8E8',
  accent: '#FF7F11',
  background: '#F3F6F9',
  surface: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
} as const;

// Navigation Menu Structure
export const mainNavigation = [
  {
    name: 'Lomba',
    href: '/lomba',
    submenu: [
      { name: 'Semua Lomba', href: '/lomba' },
      { name: 'Teknologi & IT', href: '/lomba?kategori=teknologi' },
      { name: 'Bisnis & Kewirausahaan', href: '/lomba?kategori=bisnis' },
      { name: 'Akademik & Riset', href: '/lomba?kategori=akademik' },
      { name: 'Seni & Desain', href: '/lomba?kategori=seni' },
      { name: 'Olahraga & Kesehatan', href: '/lomba?kategori=olahraga' },
      { name: 'Lomba Mendesak', href: '/lomba?deadline=urgent' },
      { name: 'Lomba Bergengsi', href: '/lomba?featured=true' },
    ],
  },
  {
    name: 'Prestasi',
    href: '/prestasi',
    submenu: [
      { name: 'Galeri Prestasi', href: '/prestasi' },
      { name: 'Berdasarkan Jenis', href: '/prestasi?filter=jenis' },
      { name: 'Berdasarkan Tahun', href: '/prestasi?filter=tahun' },
      { name: 'Success Stories', href: '/prestasi/stories' },
      { name: 'Statistik Prestasi', href: '/prestasi/statistik' },
    ],
  },
  {
    name: 'Expo',
    href: '/expo',
    submenu: [
      { name: 'Daftar Expo', href: '/expo' },
      { name: 'Jadwal Pameran', href: '/expo/jadwal' },
      { name: 'Laporan Kunjungan', href: '/expo/laporan' },
      { name: 'Panduan Partisipasi', href: '/expo/panduan' },
    ],
  },
  {
    name: 'Kalender',
    href: '/kalender',
  },
  {
    name: 'Resources',
    href: '/resources',
    submenu: [
      { name: 'Tips & Strategi', href: '/resources/tips' },
      { name: 'Template Proposal', href: '/resources/template' },
      { name: 'Panduan Pendaftaran', href: '/resources/panduan' },
      { name: 'FAQ', href: '/resources/faq' },
      { name: 'Download Materi', href: '/resources/download' },
    ],
  },
  {
    name: 'Tentang',
    href: '/tentang',
    submenu: [
      { name: 'Struktur Organisasi', href: '/tentang/struktur' },
      { name: 'Visi & Misi', href: '/tentang/visi-misi' },
    ],
  },
] as const;

// Kategori Lomba
export const kategoriLomba = [
  { id: 'teknologi', name: 'Teknologi & IT', color: 'primary' },
  { id: 'bisnis', name: 'Bisnis & Kewirausahaan', color: 'secondary' },
  { id: 'akademik', name: 'Akademik & Riset', color: 'info' },
  { id: 'seni', name: 'Seni & Desain', color: 'accent' },
  { id: 'olahraga', name: 'Olahraga & Kesehatan', color: 'success' },
  { id: 'lainnya', name: 'Lainnya', color: 'muted' },
] as const;

// Tingkat Lomba
export const tingkatLomba = [
  { id: 'regional', name: 'Regional', level: 1 },
  { id: 'nasional', name: 'Nasional', level: 2 },
  { id: 'internasional', name: 'Internasional', level: 3 },
] as const;

// Status Lomba
export const statusLomba = [
  { id: 'open', name: 'Open', color: 'success' },
  { id: 'coming-soon', name: 'Coming Soon', color: 'warning' },
  { id: 'closed', name: 'Closed', color: 'error' },
] as const;

// Status Prestasi
export const statusPrestasi = [
  { id: 'pending', name: 'Pending', color: 'warning' },
  { id: 'verified', name: 'Verified', color: 'success' },
  { id: 'rejected', name: 'Rejected', color: 'error' },
] as const;

// Jenis Prestasi
export const jenisPrestasi = [
  { id: 'lomba', name: 'Juara Lomba' },
  { id: 'karya', name: 'Karya Inovasi' },
  { id: 'penghargaan', name: 'Penghargaan' },
  { id: 'publikasi', name: 'Publikasi' },
  { id: 'lainnya', name: 'Lainnya' },
] as const;

// Jurusan Politeknik Negeri Malang (Polinema)
export const fakultasList = [
  { id: 'jti', name: 'Jurusan Teknologi Informasi' },
  { id: 'jte', name: 'Jurusan Teknik Elektro' },
  { id: 'jtm', name: 'Jurusan Teknik Mesin' },
  { id: 'jts', name: 'Jurusan Teknik Sipil' },
  { id: 'jtk', name: 'Jurusan Teknik Kimia' },
  { id: 'jak', name: 'Jurusan Akuntansi' },
  { id: 'jan', name: 'Jurusan Administrasi Niaga' },
] as const;

// Program Studi Teknik Telekomunikasi (Jurusan Teknik Elektro)
export const prodiTelkomList = [
  { id: 'd3-telkom', name: 'D3 Teknik Telekomunikasi' },
  { id: 'd4-jtd', name: 'D4 Jaringan Telekomunikasi Digital' },
] as const;

// Peringkat/Hasil Lomba
export const peringkatOptions = [
  { value: 'Juara 1', label: 'Juara 1' },
  { value: 'Juara 2', label: 'Juara 2' },
  { value: 'Juara 3', label: 'Juara 3' },
  { value: 'Juara Harapan', label: 'Juara Harapan' },
  { value: 'Finalis', label: 'Finalis' },
  { value: 'Lainnya', label: 'Lainnya (isi manual)' },
] as const;

// Pagination
export const ITEMS_PER_PAGE = 12;
export const MAX_VISIBLE_PAGES = 5;

// Date formats
export const DATE_FORMAT = {
  display: 'dd MMMM yyyy',
  short: 'dd MMM yyyy',
  api: 'yyyy-MM-dd',
  time: 'HH:mm',
  full: 'EEEE, dd MMMM yyyy',
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocTypes: ['application/pdf'],
  maxFiles: 5,
} as const;

// Deadline thresholds
export const DEADLINE_THRESHOLDS = {
  urgent: 7, // days
  soon: 14, // days
  normal: 30, // days
} as const;

// Social media links
export const socialLinks = {
  instagram: 'https://instagram.com/apm_portal',
  twitter: 'https://twitter.com/apm_portal',
  youtube: 'https://youtube.com/@apm_portal',
  telegram: 'https://t.me/apm_portal',
} as const;

// Contact info
export const contactInfo = {
  whatsapp1: '+62 812-5246-0190',
  whatsapp2: '+62 878-5346-2867',
} as const;
