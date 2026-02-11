import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, Button } from '@/components/ui';
import { HelpCircle, ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react';
import { FaqAccordion } from './FaqAccordion';

export const metadata: Metadata = {
    title: 'FAQ | APM Polinema',
    description: 'Pertanyaan yang sering diajukan tentang APM dan lomba',
};

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number;
}

// Static FAQ data
const staticFaqs: FaqItem[] = [
    { id: '1', question: 'Apa itu APM Polinema?', answer: 'APM (Ajang Prestasi Mahasiswa) adalah unit yang mengelola informasi lomba dan prestasi mahasiswa Telekomunikasi Polinema.', order: 1 },
    { id: '2', question: 'Bagaimana cara mendaftar lomba?', answer: 'Buka halaman Lomba, pilih kompetisi yang diminati, lalu klik tombol Daftar dan ikuti petunjuk yang ada.', order: 2 },
    { id: '3', question: 'Bagaimana cara melaporkan prestasi?', answer: 'Akses menu Submit Prestasi, isi formulir dengan lengkap, upload bukti prestasi, lalu submit untuk diverifikasi admin.', order: 3 },
    { id: '4', question: 'Siapa yang bisa submit prestasi?', answer: 'Semua mahasiswa aktif Telekomunikasi Polinema yang telah meraih prestasi di kompetisi resmi.', order: 4 },
    { id: '5', question: 'Berapa lama proses verifikasi?', answer: 'Proses verifikasi biasanya memakan waktu 1-3 hari kerja setelah submit.', order: 5 },
];

export default async function FaqPage() {
    const faqs = staticFaqs;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header - APM Style */}
            <section className="bg-gradient-to-br from-accent via-accent to-orange-600 text-white">
                <div className="container-apm py-12">
                    <Breadcrumb
                        items={[
                            { label: 'Resources', href: '/resources' },
                            { label: 'FAQ' },
                        ]}
                        className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white mb-6"
                    />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-heading">FAQ</h1>
                            <p className="text-white/80 mt-1">Pertanyaan yang sering diajukan</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-10">
                <div className="container-apm">
                    <div className="max-w-3xl mx-auto">
                        <FaqAccordion faqs={faqs} />

                        {/* Contact CTA */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <MessageCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-text-main">Tidak menemukan jawaban?</h4>
                                    <p className="text-text-muted text-sm mt-1">
                                        Hubungi tim APM melalui halaman{' '}
                                        <Link href="/kontak" className="text-primary hover:underline">
                                            Kontak
                                        </Link>{' '}
                                        atau email ke apm@polinema.ac.id
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="mt-8 text-center">
                            <Link href="/resources">
                                <Button variant="outline">
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
