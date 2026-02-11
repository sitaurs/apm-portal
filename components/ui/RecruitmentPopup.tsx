'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Users, Megaphone, Code, BookOpen, BarChart3, MessageCircle, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';

interface RecruitmentPopupProps {
  // Control whether popup shows - can be disabled via prop
  enabled?: boolean;
  // Delay before showing popup (ms)
  delay?: number;
}

export function RecruitmentPopup({ enabled = true, delay = 2000 }: RecruitmentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if user has already dismissed the popup in this session
    const dismissed = sessionStorage.getItem('recruitment-popup-dismissed');
    if (dismissed) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Trigger entrance animation
      setTimeout(() => setIsAnimating(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem('recruitment-popup-dismissed', 'true');
    }, 300);
  };

  const handleWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent('Halo! Saya tertarik untuk bergabung dengan tim APM Polinema. Bisa info lebih lanjut?');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  const divisiList = [
    { nama: 'Divisi Publikasi & Media', icon: Megaphone, color: 'from-pink-500 to-rose-600' },
    { nama: 'Divisi Teknologi & Developer', icon: Code, color: 'from-blue-500 to-indigo-600' },
    { nama: 'Divisi Riset & Database', icon: BookOpen, color: 'from-green-500 to-emerald-600' },
    { nama: 'Divisi Edukasi & Mentoring', icon: BarChart3, color: 'from-purple-500 to-violet-600' },
    { nama: 'Divisi Kompetisi & Event', icon: Users, color: 'from-orange-500 to-amber-600' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div className={cn(
        "fixed inset-x-4 top-[50%] -translate-y-1/2 z-[101] max-w-2xl mx-auto",
        "transition-all duration-500 ease-out",
        isAnimating 
          ? "opacity-100 scale-100 translate-y-[-50%]" 
          : "opacity-0 scale-95 translate-y-[-45%]"
      )}>
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
          
          {/* Sparkle decorations */}
          <Sparkles className="absolute top-8 right-20 w-6 h-6 text-accent/40 animate-pulse" />
          <Sparkles className="absolute bottom-20 left-16 w-4 h-4 text-primary/40 animate-pulse delay-300" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium mb-4 shadow-lg animate-bounce">
                <Crown className="w-4 h-4" />
                <span>OPEN RECRUITMENT 2026</span>
                <Crown className="w-4 h-4" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-2">
                Bergabung dengan{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Tim APM Polinema!
                </span>
              </h2>
              <p className="text-text-muted text-sm md:text-base max-w-md mx-auto">
                Kembangkan skill-mu, perluas jaringan, dan jadilah bagian dari tim yang mendorong prestasi mahasiswa!
              </p>
            </div>

            {/* Divisi List */}
            <div className="mb-6">
              <p className="text-xs text-text-muted mb-3 text-center uppercase tracking-wider font-medium">
                Posisi yang tersedia:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {divisiList.map((divisi, idx) => {
                  const Icon = divisi.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r text-white text-xs font-medium shadow-md",
                        "transform hover:scale-105 transition-transform cursor-default",
                        divisi.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{divisi.nama.replace('Divisi ', '')}</span>
                      <span className="sm:hidden">{divisi.nama.replace('Divisi ', '').split('&')[0].trim()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-4 mb-6">
              <p className="text-xs text-text-muted mb-2 text-center font-medium">Keuntungan Bergabung:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 text-text-main">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs">✓</span>
                  Pengembangan Skill
                </div>
                <div className="flex items-center gap-2 text-text-main">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs">✓</span>
                  Sertifikat Keaktifan
                </div>
                <div className="flex items-center gap-2 text-text-main">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs">✓</span>
                  Networking Luas
                </div>
                <div className="flex items-center gap-2 text-text-main">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs">✓</span>
                  Portofolio Real
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <p className="text-sm text-text-muted text-center mb-3">
                Hubungi kami untuk info lebih lanjut:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleWhatsApp('6281252460190')}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-[1.02] transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <span className="text-sm font-semibold">WhatsApp 1</span>
                    <p className="text-xs opacity-80">+62 812-5246-0190</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleWhatsApp('6287853462867')}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-[1.02] transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <span className="text-sm font-semibold">WhatsApp 2</span>
                    <p className="text-xs opacity-80">+62 878-5346-2867</p>
                  </div>
                </button>
              </div>

              {/* Link to struktur page */}
              <Link 
                href="/tentang/struktur"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
              >
                <Users className="w-5 h-5" />
                <span>Lihat Struktur Organisasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Footer note */}
            <p className="text-xs text-text-muted text-center mt-4">
              <span className="text-accent">*</span> Terbuka untuk seluruh mahasiswa Telekomunikasi Polinema
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecruitmentPopup;
