'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Users, Megaphone, Code, BookOpen, BarChart3, MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopupSettings {
  enabled: boolean;
  title: string;
  message: string;
}

interface RecruitmentPopupProps {
  enabled?: boolean; // Client-side control (e.g., only show on homepage)
  delay?: number;
}

export function RecruitmentPopup({ enabled = true, delay = 2000 }: RecruitmentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);

  useEffect(() => {
    // Don't fetch if client-side disabled
    if (!enabled) return;
    
    // Fetch popup settings from API
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/popup-settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch popup settings:', error);
      }
    };
    fetchSettings();
  }, [enabled]);

  useEffect(() => {
    // Both client-side and API settings must be enabled
    if (!enabled || !settings?.enabled) return;

    // Check if user has already dismissed the popup in this session
    const dismissed = sessionStorage.getItem('recruitment-popup-dismissed');
    if (dismissed) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => setIsAnimating(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [settings, delay]);

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
    { nama: 'Publikasi & Media', icon: Megaphone },
    { nama: 'Teknologi & Developer', icon: Code },
    { nama: 'Riset & Database', icon: BookOpen },
    { nama: 'Edukasi & Mentoring', icon: BarChart3 },
    { nama: 'Kompetisi & Event', icon: Users },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div className={cn(
        "fixed inset-x-4 top-[50%] -translate-y-1/2 z-[101] max-w-lg mx-auto",
        "transition-all duration-500 ease-out",
        isAnimating 
          ? "opacity-100 scale-100 translate-y-[-50%]" 
          : "opacity-0 scale-95 translate-y-[-45%]"
      )}>
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Top accent bar */}
          <div className="h-1.5 bg-primary" />
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-5">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3">
                {settings?.title || 'Open Recruitment 2026'}
              </span>
              
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                {settings?.message || 'Bergabung dengan Tim APM Polinema!'}
              </h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Kembangkan skill-mu, perluas jaringan, dan jadilah bagian dari tim yang mendorong prestasi mahasiswa!
              </p>
            </div>

            {/* Divisi List */}
            <div className="mb-5">
              <p className="text-xs text-slate-400 mb-2 text-center uppercase tracking-wider font-medium">
                Posisi yang tersedia
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {divisiList.map((divisi, idx) => {
                  const Icon = divisi.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span>{divisi.nama}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-slate-500 mb-2 text-center font-medium">Keuntungan Bergabung</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Pengembangan Skill', 'Sertifikat Keaktifan', 'Networking Luas', 'Portofolio Real'].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 text-center">
                Hubungi kami untuk info lebih lanjut
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleWhatsApp('6281252460190')}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <div className="text-left">
                    <span className="text-xs font-semibold block">WhatsApp 1</span>
                    <span className="text-[10px] opacity-80">0812-5246-0190</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleWhatsApp('6287853462867')}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <div className="text-left">
                    <span className="text-xs font-semibold block">WhatsApp 2</span>
                    <span className="text-[10px] opacity-80">0878-5346-2867</span>
                  </div>
                </button>
              </div>

              {/* Link to struktur page */}
              <Link 
                href="/tentang/struktur"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                <Users className="w-4 h-4" />
                <span>Lihat Struktur Organisasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Footer note */}
            <p className="text-[11px] text-slate-400 text-center mt-4">
              Terbuka untuk seluruh mahasiswa Telekomunikasi Polinema
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecruitmentPopup;
