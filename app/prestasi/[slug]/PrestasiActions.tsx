'use client';

import { Button } from '@/components/ui';
import { ExternalLink, Download, Share2, Globe, Briefcase } from 'lucide-react';

interface PrestasiActionsProps {
  sumberBerita?: string;
  sertifikat?: string;
  linkBerita?: string;
  linkPortofolio?: string;
  title: string;
}

export function PrestasiActions({ sumberBerita, sertifikat, linkBerita, linkPortofolio, title }: PrestasiActionsProps) {
  const handleOpenBerita = () => {
    if (sumberBerita) {
      window.open(sumberBerita, '_blank');
    }
  };

  const handleDownloadSertifikat = async () => {
    if (!sertifikat) return;
    
    try {
      // Fetch the file to get proper blob with correct content type
      const response = await fetch(sertifikat);
      const blob = await response.blob();
      
      // Get file extension from URL or content-type
      let extension = '';
      const urlMatch = sertifikat.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      if (urlMatch) {
        extension = urlMatch[1].toLowerCase();
      } else {
        // Fallback to content-type
        const contentType = blob.type;
        if (contentType.includes('pdf')) extension = 'pdf';
        else if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
        else if (contentType.includes('webp')) extension = 'webp';
        else extension = 'pdf'; // default to pdf
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat-${title.replace(/[^a-zA-Z0-9]/g, '-')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to opening in new tab
      window.open(sertifikat, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  return (
    <div className="space-y-3">
      {sumberBerita && (
        <Button 
          variant="primary" 
          fullWidth
          leftIcon={<ExternalLink className="w-4 h-4" />}
          onClick={handleOpenBerita}
        >
          Lihat Berita Resmi
        </Button>
      )}
      {linkBerita && (
        <Button 
          variant="outline" 
          fullWidth
          leftIcon={<Globe className="w-4 h-4" />}
          onClick={() => window.open(linkBerita, '_blank')}
        >
          Berita Terkait
        </Button>
      )}
      {linkPortofolio && (
        <Button 
          variant="outline" 
          fullWidth
          leftIcon={<Briefcase className="w-4 h-4" />}
          onClick={() => window.open(linkPortofolio, '_blank')}
        >
          Lihat Portofolio
        </Button>
      )}
      {sertifikat && (
        <Button 
          variant="outline" 
          fullWidth
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownloadSertifikat}
        >
          Download Sertifikat
        </Button>
      )}
      <Button 
        variant="ghost" 
        fullWidth
        leftIcon={<Share2 className="w-4 h-4" />}
        onClick={handleShare}
      >
        Bagikan Prestasi
      </Button>
    </div>
  );
}
