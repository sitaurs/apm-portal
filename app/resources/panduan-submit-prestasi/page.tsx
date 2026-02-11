import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { Trophy, ArrowLeft, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Panduan Submit Prestasi | APM Polinema',
    description: 'Panduan lengkap cara melaporkan prestasi yang sudah diraih',
};

interface Step {
    step: number;
    title: string;
    description: string;
}

// Static panduan data
const staticSteps: Step[] = [
    { step: 1, title: 'Login ke Portal', description: 'Masuk ke portal APM menggunakan akun Polinema' },
    { step: 2, title: 'Akses Menu Prestasi', description: 'Pilih menu Submit Prestasi dari dashboard' },
    { step: 3, title: 'Isi Form Prestasi', description: 'Lengkapi informasi prestasi: nama lomba, tingkat, hasil, dan tanggal' },
    { step: 4, title: 'Upload Bukti', description: 'Unggah sertifikat, foto, atau bukti prestasi lainnya' },
    { step: 5, title: 'Submit & Verifikasi', description: 'Kirim form dan tunggu verifikasi dari admin APM' },
];

export default async function PanduanSubmitPrestasiPage() {
    const steps = staticSteps;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-success via-emerald-600 to-teal-600 text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Resources', href: '/resources' },
                            { label: 'Panduan Submit Prestasi' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">Panduan Submit Prestasi</h1>
                            <p className="text-white/80 mt-1">Langkah-langkah melaporkan prestasi yang sudah diraih</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-10">
                <div className="container-apm">
                    <div className="max-w-3xl mx-auto">
                        {/* Steps */}
                        <div className="space-y-4">
                            {steps.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-success/20 transition-all flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-white font-bold text-lg">{item.step}</span>
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="font-semibold text-text-main text-lg mb-1">{item.title}</h3>
                                        <p className="text-text-muted">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 p-6 bg-success/5 border border-success/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <HelpCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-success">Butuh Bantuan?</h4>
                                    <p className="text-text-muted text-sm mt-1">
                                        Hubungi tim APM jika ada pertanyaan tentang proses submit prestasi atau kunjungi halaman{' '}
                                        <Link href="/resources/faq" className="text-success hover:underline">
                                            FAQ
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/prestasi/submit">
                                <Button variant="primary" size="lg" className="bg-success hover:bg-emerald-600">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Laporkan Prestasi Sekarang
                                </Button>
                            </Link>
                            <Link href="/resources">
                                <Button variant="outline" size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Resources
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
