'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumb, Badge, Button } from '@/components/ui';
import {
    Users,
    Building2,
    Mail,
    Phone,
    Award,
    GraduationCap,
    ChevronRight,
    Crown,
    Star,
    Briefcase,
    MapPin,
    Database,
    Search,
    Megaphone,
    Handshake,
    Code,
    User,
    UserCheck
} from 'lucide-react';

// Data Struktur Organisasi APM Telekomunikasi POLINEMA
// Periode 2025-2026
const strukturOrganisasi = {
    dewanPembina: [
        {
            nama: 'Dodit Suprianto, S.Kom., M.T.',
            jabatan: 'Dosen Pembina',
            nip: '-',
            unit: 'Dosen Prodi Telekomunikasi',
            foto: null,
            email: null,
        },
        {
            nama: 'Ginanjar Suwasono Adi, S.ST., M.Sc.',
            jabatan: 'Dosen Pembina',
            nip: '-',
            unit: 'Dosen Prodi Telekomunikasi',
            foto: null,
            email: null,
        },
    ],
    bph: {
        ketuaUmum: {
            nama: 'Belum Ditentukan',
            jabatan: 'Ketua Umum',
            unit: 'Mahasiswa Telekomunikasi',
            foto: null,
            email: null,
            tugas: [
                'Penanggung jawab utama organisasi',
                'Koordinasi eksternal dengan kampus dan pihak luar',
                'Representasi komunitas'
            ]
        },
        wakilKetua: {
            nama: 'Belum Ditentukan',
            jabatan: 'Wakil Ketua',
            unit: 'Mahasiswa Telekomunikasi',
            foto: null,
            email: null,
            tugas: [
                'Koordinasi internal antar divisi',
                'Monitoring kinerja harian',
                'Backup Ketua Umum'
            ]
        },
        sekretaris: {
            nama: 'Belum Ditentukan',
            jabatan: 'Sekretaris',
            unit: 'Mahasiswa Telekomunikasi',
            foto: null,
            email: null,
            tugas: [
                'Administrasi dan dokumentasi',
                'Database anggota dan prestasi',
                'Notulensi rapat'
            ]
        },
        bendahara: {
            nama: 'Belum Ditentukan',
            jabatan: 'Bendahara',
            unit: 'Mahasiswa Telekomunikasi',
            foto: null,
            email: null,
            tugas: [
                'Pengelolaan keuangan',
                'Pelaporan anggaran',
                'Fundraising (jika diperlukan)'
            ]
        },
    },
    divisi: [
        {
            nama: 'Divisi Informasi & Data Prestasi',
            fokus: 'Verifikasi dan dokumentasi',
            icon: Database,
            kepala: {
                nama: 'Belum Ditentukan',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            anggota: [],
            tugas: [
                'Verifikasi informasi lomba/expo',
                'Database prestasi mahasiswa',
                'Pengarsipan sertifikat/dokumen',
                'Pelaporan data ke kampus'
            ],
            warna: 'from-blue-500 to-indigo-600'
        },
        {
            nama: 'Divisi Pencarian & Kurasi',
            fokus: 'Hunting peluang prestasi',
            icon: Search,
            kepala: {
                nama: 'Belum Ditentukan',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            anggota: [],
            tugas: [
                'Scouting lomba nasional/internasional',
                'Kalender tahunan kompetisi',
                'Koneksi dengan penyelenggara',
                'Kategori: Teknologi, Seni, Olahraga, dll'
            ],
            warna: 'from-amber-500 to-orange-600'
        },
        {
            nama: 'Divisi Diseminasi & Media',
            fokus: 'Penyebaran informasi',
            icon: Megaphone,
            kepala: {
                nama: 'Belum Ditentukan',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            anggota: [],
            tugas: [
                'Media sosial (IG, Telegram, Website)',
                'Newsletter mingguan/bulanan',
                'Success stories mahasiswa',
                'Kolaborasi dengan UKM lain'
            ],
            warna: 'from-purple-500 to-pink-600'
        },
        {
            nama: 'Divisi Pendampingan & Liaison',
            fokus: 'Fasilitasi mahasiswa',
            icon: Handshake,
            kepala: {
                nama: 'Belum Ditentukan',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            anggota: [],
            tugas: [
                'Kontak pertama bagi peminat lomba',
                'Hubungkan dengan mentor/dosen',
                'Bantu pembentukan tim',
                'Koordinasi partisipasi kolektif'
            ],
            warna: 'from-emerald-500 to-teal-600'
        },
        {
            nama: 'Divisi Teknologi & Developer',
            fokus: 'Platform digital',
            icon: Code,
            kepala: {
                nama: 'Belum Ditentukan',
                jabatan: 'Koordinator Divisi',
                unit: 'Mahasiswa Telekomunikasi',
                foto: null,
            },
            anggota: [
                {
                    nama: 'Naufal Muhammad Dzaka',
                    role: 'Frontend Specialist (UI/UX)',
                    foto: null,
                },
                {
                    nama: 'Muhammad Fakhri Zamani',
                    role: 'Backend Specialist (Database)',
                    foto: null,
                },
            ],
            tugas: [
                'Pengembangan portal web APM',
                'Sistem database digital',
                'Fitur: Submit prestasi, kalender, pencarian',
                'Maintenance & security',
                'Training pengguna'
            ],
            warna: 'from-cyan-500 to-blue-600'
        },
    ]
};

// Component: Person Card
function PersonCard({
    nama,
    jabatan,
    unit,
    nip,
    email,
    foto,
    size = 'md',
    tugas,
    showTugas = false,
    gradient = 'from-primary to-primary-600'
}: {
    nama: string;
    jabatan: string;
    unit?: string;
    nip?: string;
    email?: string | null;
    foto?: string | null;
    size?: 'sm' | 'md' | 'lg';
    tugas?: string[];
    showTugas?: boolean;
    gradient?: string;
}) {
    const sizes = {
        sm: { avatar: 'w-12 h-12', text: 'text-sm', subtext: 'text-xs' },
        md: { avatar: 'w-16 h-16', text: 'text-base', subtext: 'text-sm' },
        lg: { avatar: 'w-20 h-20', text: 'text-lg', subtext: 'text-sm' },
    };

    const initials = nama === 'Belum Ditentukan' ? '?' : nama.split(' ').map(n => n[0]).slice(0, 2).join('');

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-4">
                <div className={`${sizes[size].avatar} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-gray-900 ${sizes[size].text} truncate`}>{nama}</h4>
                    <p className={`text-primary font-medium ${sizes[size].subtext}`}>{jabatan}</p>
                    {unit && <p className={`text-gray-500 ${sizes[size].subtext}`}>{unit}</p>}
                    {nip && nip !== '-' && <p className="text-xs text-gray-400 mt-1">NIP: {nip}</p>}
                    {email && (
                        <a href={`mailto:${email}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {email}
                        </a>
                    )}
                </div>
            </div>

            {showTugas && tugas && tugas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Tugas & Tanggung Jawab:</p>
                    <ul className="space-y-1">
                        {tugas.map((t, i) => (
                            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                                <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Component: Divisi Card
function DivisiCard({
    divisi
}: {
    divisi: typeof strukturOrganisasi.divisi[0]
}) {
    const IconComponent = divisi.icon;
    
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className={`bg-gradient-to-r ${divisi.warna} px-5 py-4`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{divisi.nama}</h3>
                        <p className="text-white/80 text-sm">Fokus: {divisi.fokus}</p>
                    </div>
                </div>
            </div>

            {/* Koordinator Divisi */}
            <div className="p-5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Koordinator</p>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${divisi.warna} flex items-center justify-center text-white font-bold text-sm`}>
                        {divisi.kepala.nama === 'Belum Ditentukan' ? '?' : divisi.kepala.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{divisi.kepala.nama}</h4>
                        <p className="text-xs text-gray-500">{divisi.kepala.unit}</p>
                    </div>
                </div>
            </div>

            {/* Anggota Tim (if any) */}
            {divisi.anggota && divisi.anggota.length > 0 && (
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Tim</p>
                    <div className="space-y-3">
                        {divisi.anggota.map((anggota, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${divisi.warna} flex items-center justify-center text-white font-bold text-xs`}>
                                    {anggota.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900 text-sm">{anggota.nama}</h5>
                                    <p className="text-xs text-gray-500">{anggota.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tugas */}
            <div className="p-5">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Tugas & Tanggung Jawab</p>
                <ul className="space-y-2">
                    {divisi.tugas.map((t, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function StrukturOrganisasiPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <div className="container-apm py-12 relative z-10">
                    <Breadcrumb
                        items={[
                            { label: 'Tentang', href: '/tentang' },
                            { label: 'Struktur Organisasi' }
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                                <Building2 className="w-3 h-3 mr-1" />
                                Organisasi
                            </Badge>
                            <h1 className="text-2xl lg:text-4xl font-bold text-white flex items-center gap-3">
                                <Users className="w-8 h-8" />
                                Struktur Organisasi APM
                            </h1>
                            <p className="text-white/80 mt-2 max-w-2xl">
                                Struktur kepengurusan Ajang Prestasi Mahasiswa - Prodi D4 Teknik Telekomunikasi POLINEMA periode 2025-2026
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/tentang">
                                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                    Tentang APM
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-apm py-12">

                {/* Dewan Pembina */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <Badge variant="outline" className="mb-3 bg-gray-100 border-gray-300">
                            <GraduationCap className="w-3 h-3 mr-1" /> Dewan Pembina
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">Dosen Pembina APM</h2>
                        <p className="text-gray-600 mt-2">Dosen pembimbing dan penasehat organisasi APM Telekomunikasi</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                        {strukturOrganisasi.dewanPembina.map((pembina, index) => (
                            <div key={index} className="w-full md:w-auto md:flex-1 max-w-md">
                                <PersonCard
                                    {...pembina}
                                    size="lg"
                                    gradient="from-gray-600 to-gray-800"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connector Line */}
                <div className="flex justify-center mb-8">
                    <div className="w-0.5 h-12 bg-gradient-to-b from-gray-400 to-primary"></div>
                </div>

                {/* BPH (Badan Pengurus Harian) */}
                <div className="mb-16">
                    <div className="flex justify-center mb-8">
                        <Badge variant="primary" className="text-base px-4 py-2">
                            <Crown className="w-4 h-4 mr-2" /> Badan Pengurus Harian (BPH)
                        </Badge>
                    </div>
                    
                    {/* Ketua & Wakil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
                        {/* Ketua Umum */}
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-primary/10 text-primary border-primary/30">
                                <User className="w-3 h-3 mr-1" /> Ketua Umum
                            </Badge>
                            <PersonCard
                                {...strukturOrganisasi.bph.ketuaUmum}
                                size="md"
                                showTugas={true}
                                gradient="from-primary to-primary-700"
                            />
                        </div>

                        {/* Wakil Ketua */}
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-primary/10 text-primary border-primary/30">
                                <UserCheck className="w-3 h-3 mr-1" /> Wakil Ketua
                            </Badge>
                            <PersonCard
                                {...strukturOrganisasi.bph.wakilKetua}
                                size="md"
                                showTugas={true}
                                gradient="from-primary-600 to-primary-800"
                            />
                        </div>
                    </div>

                    {/* Sekretaris & Bendahara */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Sekretaris */}
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-blue-50 text-blue-700 border-blue-200">Sekretaris</Badge>
                            <PersonCard
                                {...strukturOrganisasi.bph.sekretaris}
                                size="md"
                                showTugas={true}
                                gradient="from-blue-500 to-indigo-600"
                            />
                        </div>

                        {/* Bendahara */}
                        <div className="text-center">
                            <Badge variant="outline" className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200">Bendahara</Badge>
                            <PersonCard
                                {...strukturOrganisasi.bph.bendahara}
                                size="md"
                                showTugas={true}
                                gradient="from-emerald-500 to-teal-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Connector Line */}
                <div className="flex justify-center mb-8">
                    <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-accent"></div>
                </div>

                {/* Divisi Operasional Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <Badge variant="accent" className="mb-3">
                            <Briefcase className="w-3 h-3 mr-1" /> Divisi Operasional
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">5 Divisi Operasional APM</h2>
                        <p className="text-gray-600 mt-2">Divisi-divisi yang menjalankan program kerja APM Telekomunikasi POLINEMA</p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl mx-auto mb-8">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Star className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-800">Proses Rekrutmen</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    Sebagian besar posisi koordinator divisi masih dalam proses pengisian. 
                                    Nama-nama akan diperbarui setelah proses rekrutmen selesai.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* First 3 divisi */}
                        {strukturOrganisasi.divisi.slice(0, 3).map((divisi, index) => (
                            <DivisiCard key={index} divisi={divisi} />
                        ))}
                    </div>
                    
                    {/* Bottom 2 divisi centered */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
                        {strukturOrganisasi.divisi.slice(3, 5).map((divisi, index) => (
                            <DivisiCard key={index + 3} divisi={divisi} />
                        ))}
                    </div>
                </div>

                {/* Kelompok Relawan Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <Badge variant="outline" className="mb-3 bg-rose-50 text-rose-700 border-rose-200">
                            <Users className="w-3 h-3 mr-1" /> Kelompok Relawan
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">KELOMPOK RELAWAN</h2>
                        <p className="text-gray-600 mt-2">Open recruitment per kegiatan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Relawan Card 1 */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Relawan Event</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Membantu pelaksanaan event, lomba, dan kegiatan APM lainnya
                            </p>
                            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
                                Rekrutmen Terbuka
                            </Badge>
                        </div>

                        {/* Relawan Card 2 */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Relawan Mentor</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Pendampingan dan sharing pengalaman untuk peserta lomba
                            </p>
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                                Rekrutmen Terbuka
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Hubungi Kami</h2>
                    <p className="text-white/80 mb-6">Butuh informasi lebih lanjut tentang APM Telekomunikasi POLINEMA?</p>

                    <div className="flex flex-wrap justify-center gap-6 mb-6">
                        <a href="https://wa.me/6281252460190" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white">
                            <Phone className="w-5 h-5" />
                            +62 812-5246-0190
                        </a>
                        <a href="https://wa.me/6287853462867" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90 hover:text-white">
                            <Phone className="w-5 h-5" />
                            +62 878-5346-2867
                        </a>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/tentang">
                            <Button className="bg-white text-primary hover:bg-white/90">
                                Tentang APM
                            </Button>
                        </Link>
                        <Link href="/submit">
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                Submit Prestasi
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
