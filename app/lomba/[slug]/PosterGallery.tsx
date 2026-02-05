'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface PosterGalleryProps {
  posters: string[];
  title: string;
}

export function PosterGallery({ posters, title }: PosterGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePosterClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  if (posters.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">Poster/Flyer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posters.map((poster: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handlePosterClick(idx)}
              className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border-2 border-gray-100 hover:border-primary transition-all duration-300 group cursor-pointer"
            >
              <Image
                src={poster}
                alt={`${title} - Poster ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay dengan icon zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
                  <ZoomIn className="w-6 h-6 text-primary" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ImageLightbox
        images={posters}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
