'use client';

/**
 * Store Gallery Component
 * Image carousel with lightbox for store photos
 */

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoreGalleryProps {
  images: string[]; // Array of image URLs
  storeName: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide'; // Aspect ratio preset
  showThumbnails?: boolean;
}

export function StoreGallery({ 
  images, 
  storeName,
  className,
  aspectRatio = 'video', // 16:9 default
  showThumbnails = true
}: StoreGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className={cn(
        'relative rounded-lg bg-muted flex items-center justify-center',
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        aspectRatio === 'wide' && 'aspect-[21/9]',
        className
      )}>
        <p className="text-muted-foreground text-sm">No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleOpenLightbox = () => {
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className={className}>
        {/* Main Image */}
        <div className={cn(
          'relative rounded-lg overflow-hidden bg-muted group',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === 'wide' && 'aspect-[21/9]',
        )}>
          <Image
            src={images[currentIndex]}
            alt={`${storeName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={currentIndex === 0}
          />

          {/* Zoom Button */}
          <button
            onClick={handleOpenLightbox}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="View full size"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Navigation Arrows (only show if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                  currentIndex === index 
                    ? 'border-primary ring-2 ring-primary ring-offset-2' 
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${storeName} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseLightbox}
        >
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex]}
                alt={`${storeName} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Lightbox Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-lg rounded-lg">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
