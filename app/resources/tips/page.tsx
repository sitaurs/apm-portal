import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { Lightbulb, ArrowLeft, Target, Search, Users, Clock, MessageCircle, Mic } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tips & Strategi | APM Polinema',
    description: 'Tips dan strategi untuk meningkatkan peluang menang lomba',
};

interface Tip {
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    target: Target,
    search: Search,
    users: Users,
    clock: Clock,
    'message-circle': MessageCircle,
    mic: Mic,
    lightbulb: Lightbulb,
};

// Static tips data
const staticTips: Tip[] = [
    { id: '1', title: 'Tentukan Target', description: 'Pilih lomba yang sesuai dengan kemampuan dan minat Anda', icon: 'target', order: 1 },
    { id: '2', title: 'Riset Mendalam', description: 'Pelajari kriteria penilaian dan pemenang sebelumnya', icon: 'search', order: 2 },
    { id: '3', title: 'Bangun Tim Solid', description: 'Pilih anggota tim yang saling melengkapi', icon: 'users', order: 3 },
    { id: '4', title: 'Manajemen Waktu', description: 'Buat jadwal persiapan yang realistis', icon: 'clock', order: 4 },
    { id: '5', title: 'Latihan Presentasi', description: 'Latih kemampuan komunikasi dan presentasi', icon: 'mic', order: 5 },
    { id: '6', title: 'Konsultasi Dosen', description: 'Minta masukan dari dosen pembimbing', icon: 'message-circle', order: 6 },
];

export default async function TipsPage() {
    const tips = staticTips;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Resources', href: '/resources' },
                            { label: 'Tips & Strategi' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Lightbulb className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Tips & Strategi</h1>
                            <p className="text-white/80 mt-1">Strategi jitu untuk memenangkan kompetisi</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-10">
                <div className="container-apm">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tips.map((tip, index) => {
                            const IconComponent = iconMap[tip.icon] || Lightbulb;
                            return (
                                <div
                                    key={tip.id}
                                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all">
                                            <span className="text-primary font-bold group-hover:text-white">{index + 1}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <IconComponent className="w-4 h-4 text-primary" />
                                                <h3 className="font-semibold text-text-main">{tip.title}</h3>
                                            </div>
                                            <p className="text-sm text-text-muted leading-relaxed">{tip.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-12 bg-gradient-to-r from-secondary to-primary rounded-2xl p-8 text-center text-white">
                        <h2 className="text-xl font-bold mb-2">Siap Berkompetisi?</h2>
                        <p className="text-white/80 mb-4">Lihat daftar lomba yang tersedia dan mulai persiapan Anda!</p>
                        <div className="flex justify-center gap-3">
                            <Link href="/lomba">
                                <Button variant="primary" size="lg">
                                    Jelajahi Lomba
                                </Button>
                            </Link>
                            <Link href="/resources">
                                <Button variant="outline-white">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
