'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface ThumbnailViewerProps {
  imageUrl: string;
  title: string;
}

export function ThumbnailViewer({ imageUrl, title }: ThumbnailViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setLightboxOpen(true)}
        className="bg-white rounded-xl shadow-card overflow-hidden group w-full cursor-pointer"
      >
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Zoom icon hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <ZoomIn className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </button>

      <ImageLightbox
        images={[imageUrl]}
        initialIndex={0}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
