import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, X, Calendar, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GalleryItem {
  id: string;
  type: 'campaign' | 'catalog';
  created_at: string;
  generated_images: any;
  generated_video_url?: string;
  result: any;
  image_url?: string;
}

interface GalleryPreviewModalProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const GalleryPreviewModal = ({ item, isOpen, onClose }: GalleryPreviewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if (!item) return null;

  const images = Array.isArray(item.generated_images) 
    ? item.generated_images.filter(img => img && (img.url || typeof img === 'string'))
    : [];

  const getImageUrl = (img: any) => {
    if (typeof img === 'string') return img;
    return img?.url || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemTitle = () => {
    if (item.type === 'campaign') {
      return item.result?.emailCopy?.subject || item.result?.videoScript?.hook || 'Marketing Campaign';
    }
    return item.result?.title || 'Product Catalog';
  };

  const getItemDescription = () => {
    if (item.type === 'campaign') {
      return item.result?.emailCopy?.preview || item.result?.videoScript?.description || 'Campaign content';
    }
    return item.result?.description || 'Catalog content';
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleVideo = () => {
    const video = document.querySelector('#preview-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <Badge variant={item.type === 'campaign' ? 'default' : 'secondary'}>
              {item.type === 'campaign' ? 'Campaign' : 'Catalog'}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(item.created_at)}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Description */}
          <div>
            <DialogTitle className="text-xl font-bold mb-2">
              {getItemTitle()}
            </DialogTitle>
            <p className="text-muted-foreground">
              {getItemDescription()}
            </p>
          </div>

          {/* Video Section (for campaigns) */}
          {item.generated_video_url && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <h3 className="font-semibold">Generated Video</h3>
              </div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  id="preview-video"
                  src={item.generated_video_url}
                  className="w-full h-full"
                  controls
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              </div>
            </div>
          )}

          {/* Images Section */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <h3 className="font-semibold">Generated Images</h3>
                  <span className="text-sm text-muted-foreground">
                    ({images.length} {images.length === 1 ? 'image' : 'images'})
                  </span>
                </div>
                
                {images.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={prevImage}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextImage}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(images[currentImageIndex])}
                  alt={`Generated content ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                        currentImageIndex === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Original Image (fallback) */}
          {images.length === 0 && item.image_url && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <h3 className="font-semibold">Original Image</h3>
              </div>
              <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                <img
                  src={item.image_url}
                  alt="Original content"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryPreviewModal;