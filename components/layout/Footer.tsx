import Link from 'next/link';
import { Instagram, Twitter, Youtube, Phone } from 'lucide-react';
import { socialLinks, contactInfo } from '@/lib/constants';

const footerLinks = {
  quickLinks: [
    { name: 'Lomba & Kompetisi', href: '/lomba' },
    { name: 'Galeri Prestasi', href: '/prestasi' },
    { name: 'Expo & Pameran', href: '/expo' },
    { name: 'Kalender', href: '/kalender' },
    { name: 'Submit Prestasi', href: '/submit' },
  ],
  resources: [
    { name: 'Tips & Strategi', href: '/resources/tips' },
    { name: 'Template Proposal', href: '/resources/template' },
    { name: 'Panduan Pendaftaran', href: '/resources/panduan' },
    { name: 'FAQ', href: '/resources/faq' },
  ],
  about: [
    { name: 'Tentang APM', href: '/tentang' },
    { name: 'Struktur Organisasi', href: '/tentang/struktur' },
    { name: 'Visi & Misi', href: '/tentang/visi-misi' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container-apm py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">APM</span>
              </div>
              <div>
                <span className="font-bold text-lg">APM Portal</span>
                <span className="text-white/60 text-xs block">Ajang Prestasi Mahasiswa</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">
              Portal informasi lomba, kompetisi, dan prestasi mahasiswa Telekomunikasi.
              Wujudkan potensi, raih prestasi kampus!
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & About */}
          <div>
            <h4 className="font-semibold mb-4">Social Inovasi</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-white/50" />
                <a
                  href="https://wa.me/6281252460190"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {contactInfo.whatsapp1}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-white/50" />
                <a
                  href="https://wa.me/6287853462867"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {contactInfo.whatsapp2}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-apm py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>Copyright © 2026 APM Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
