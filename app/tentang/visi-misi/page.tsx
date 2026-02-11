import Link from 'next/link';
import { Breadcrumb, Badge, Button } from '@/components/ui';
import {
    Target,
    Heart,
    Star,
    Rocket,
    Users,
    Globe,
    Award,
    Sparkles,
    ArrowRight,
    Trophy,
    GraduationCap,
    Zap,
    Shield,
    Eye,
    Compass
} from 'lucide-react';

// Misi Points
const misiPoints = [
    {
        number: '01',
        title: 'Sistem Informasi Terintegrasi',
        description: 'Menciptakan sistem informasi terintegrasi tentang kompetisi dan peluang prestasi yang lengkap, terkini, dan mudah diakses.',
        icon: Compass,
    },
    {
        number: '02',
        title: 'Partisipasi Aktif',
        description: 'Meningkatkan partisipasi aktif mahasiswa Telekomunikasi POLINEMA di ajang bergengsi tingkat nasional dan internasional.',
        icon: Rocket,
    },
    {
        number: '03',
        title: 'Database Prestasi',
        description: 'Membangun database prestasi yang komprehensif dan terverifikasi sebagai dokumentasi dan apresiasi pencapaian mahasiswa.',
        icon: Award,
    },
    {
        number: '04',
        title: 'Budaya Kompetitif',
        description: 'Mengembangkan budaya kompetitif yang sehat dan kolaboratif untuk memaksimalkan potensi dan peluang kemenangan.',
        icon: Shield,
    },
    {
        number: '05',
        title: 'Pendampingan & Resources',
        description: 'Memfasilitasi mahasiswa dengan pendampingan intensif dan resources yang memadai untuk persiapan lomba dan pengembangan diri.',
        icon: GraduationCap,
    },
    {
        number: '06',
        title: 'Jejaring Alumni',
        description: 'Membentuk jejaring alumni berprestasi sebagai mentor dan inspirator untuk membuka lebih banyak peluang bagi generasi selanjutnya.',
        icon: Users,
    },
];

export default function VisiMisiPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Animated Hero Section */}
            <div className="relative bg-gradient-to-br from-primary via-primary-600 to-primary-700 overflow-hidden">
                {/* Animated Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/30 to-transparent rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full" />

                    {/* Floating Icons */}
                    <div className="absolute top-20 left-[10%] text-white/10 animate-bounce delay-100">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <div className="absolute top-40 right-[15%] text-white/10 animate-bounce delay-300">
                        <Star className="w-8 h-8" />
                    </div>
                    <div className="absolute bottom-32 left-[20%] text-white/10 animate-bounce delay-500">
                        <Rocket className="w-10 h-10" />
                    </div>
                    <div className="absolute bottom-20 right-[25%] text-white/10 animate-bounce delay-700">
                        <Award className="w-14 h-14" />
                    </div>
                </div>

                <div className="container-apm py-20 relative z-10">
                    <Breadcrumb
                        items={[
                            { label: 'Tentang', href: '/tentang' },
                            { label: 'Visi & Misi' }
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-8"
                    />

                    <div className="text-center max-w-4xl mx-auto">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
                            <Sparkles className="w-3 h-3 mr-1" /> Our Purpose
                        </Badge>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Visi & Misi
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Membangun generasi mahasiswa berprestasi yang siap bersaing di kancah global
                        </p>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB" />
                    </svg>
                </div>
            </div>

            {/* Visi Section */}
            <section className="container-apm py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Visual */}
                        <div className="relative">
                            <div className="aspect-square max-w-md mx-auto relative">
                                {/* Rotating Ring */}
                                <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />

                                {/* Inner Circle */}
                                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl flex items-center justify-center">
                                    <div className="text-center text-white p-8">
                                        <Eye className="w-16 h-16 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold">VISI</h3>
                                        <p className="text-sm text-white/80 mt-2">Our Vision</p>
                                    </div>
                                </div>

                                {/* Orbiting Icons */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                                    <div className="w-14 h-14 rounded-full bg-amber-500 shadow-lg flex items-center justify-center text-white">
                                        <Trophy className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center text-white">
                                        <Globe className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                                    <div className="w-14 h-14 rounded-full bg-purple-500 shadow-lg flex items-center justify-center text-white">
                                        <Star className="w-7 h-7" />
                                    </div>
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                                    <div className="w-14 h-14 rounded-full bg-rose-500 shadow-lg flex items-center justify-center text-white">
                                        <Rocket className="w-7 h-7" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div>
                            <Badge variant="primary" className="mb-4">
                                <Eye className="w-3 h-3 mr-1" /> Visi Kami
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                Menjadi Pusat Ekosistem Prestasi Mahasiswa Telekomunikasi POLINEMA yang Berdaya Saing Nasional dan Internasional
                            </h2>
                            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border-l-4 border-primary mb-6">
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Mewujudkan APM Telekomunikasi POLINEMA sebagai <strong className="text-primary">pusat ekosistem prestasi</strong> yang menghasilkan talenta-talenta unggul berdaya saing <strong className="text-secondary">nasional dan internasional</strong>, berkontribusi nyata bagi kemajuan bangsa melalui inovasi dan prestasi.
                                </p>
                            </div>

                            {/* Vision Pillars */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-700">Berprestasi</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-700">Berdaya Saing</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-700">Berkontribusi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Misi Section */}
            <section className="bg-white py-20">
                <div className="container-apm">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4">
                            <Target className="w-3 h-3 mr-1" /> Misi Kami
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            6 Pilar Misi Strategis
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Langkah-langkah konkret yang kami lakukan untuk mewujudkan visi
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        {/* Vertical Timeline */}
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full hidden md:block" />

                            {misiPoints.map((misi, index) => (
                                <div
                                    key={index}
                                    className={`relative flex items-start gap-6 mb-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                        }`}
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg hidden md:flex items-center justify-center z-10">
                                        <misi.icon className="w-7 h-7 text-white" />
                                    </div>

                                    {/* Content Card */}
                                    <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-24 lg:text-right' : 'lg:pl-24'}`}>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow ml-20 lg:ml-0">
                                            <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                                                <span className="text-4xl font-bold text-primary/20">{misi.number}</span>
                                                <misi.icon className="w-6 h-6 text-primary md:hidden" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{misi.title}</h3>
                                            <p className="text-gray-600 leading-relaxed">{misi.description}</p>
                                        </div>
                                    </div>

                                    {/* Spacer for alternating layout */}
                                    <div className="flex-1 hidden lg:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container-apm py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
                        {/* Decorative */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <Zap className="w-12 h-12 text-amber-400 mx-auto mb-6" />
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                                Bergabung Bersama Kami
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                Jadilah bagian dari perjalanan prestasi Polinema. Mulai langkah pertamamu sekarang!
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/prestasi/submit">
                                    <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl px-8 py-3">
                                        <Trophy className="w-4 h-4 mr-2" /> Submit Prestasi
                                    </Button>
                                </Link>
                                <Link href="/lomba">
                                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3">
                                        Jelajahi Lomba <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
