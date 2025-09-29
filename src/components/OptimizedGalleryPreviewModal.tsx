import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGalleryItemDetails, type GalleryItem } from '@/hooks/useGalleryData';

interface OptimizedGalleryPreviewModalProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const OptimizedGalleryPreviewModal = ({ item, isOpen, onClose }: OptimizedGalleryPreviewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: itemDetails, isLoading } = useGalleryItemDetails(item);

  if (!item) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const images = Array.isArray(itemDetails?.generated_images) 
    ? itemDetails.generated_images.filter(img => img && (img.url || typeof img === 'string'))
    : [];

  const getImageUrl = (img: any) => {
    if (typeof img === 'string') return img;
    return img?.url || '';
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
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Description */}
          <div>
            <DialogTitle className="text-xl font-bold mb-2">
              {item.title}
            </DialogTitle>
            <p className="text-muted-foreground">
              {item.description}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Video Section (for campaigns) */}
              {item.type === 'campaign' && itemDetails?.generated_video_url && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <h3 className="font-semibold">Generated Video</h3>
                  </div>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={itemDetails.generated_video_url}
                      className="w-full h-full"
                      controls
                      preload="metadata"
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
                      loading="lazy"
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
                            loading="lazy"
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

              {/* Generated Text Content (for campaigns) */}
              {item.type === 'campaign' && itemDetails?.result && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold">Campaign Content</h3>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 space-y-6">
                    {/* Email Copy */}
                    {itemDetails.result.email_copy && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Email Marketing</h4>
                        <div className="space-y-2">
                          {itemDetails.result.email_copy.subject && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Subject:</span>
                              <p className="text-sm mt-1">{itemDetails.result.email_copy.subject}</p>
                            </div>
                          )}
                          {itemDetails.result.email_copy.body && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Body:</span>
                              <p className="text-sm mt-1 leading-relaxed">{itemDetails.result.email_copy.body}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Video Collection */}
                    {itemDetails.result.video_scripts && Array.isArray(itemDetails.result.video_scripts) && itemDetails.result.video_scripts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Social Video Collection</h4>
                        <div className="space-y-3">
                          {itemDetails.result.video_scripts.map((script: any, index: number) => (
                            <div key={index} className="border border-border/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                  {script.platform}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{script.script}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Banner Ads */}
                    {itemDetails.result.banner_ads && Array.isArray(itemDetails.result.banner_ads) && itemDetails.result.banner_ads.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Banner Ads</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {itemDetails.result.banner_ads.map((ad: any, index: number) => (
                            <div key={index} className="border border-border/50 rounded-lg p-3">
                              <div className="space-y-1">
                                <div>
                                  <span className="font-medium text-xs text-muted-foreground">Headline:</span>
                                  <p className="text-sm font-medium">{ad.headline}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-xs text-muted-foreground">CTA:</span>
                                  <p className="text-sm">{ad.cta}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Landing Page Concept */}
                    {itemDetails.result.landing_page_concept && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Landing Page Concept</h4>
                        <div className="border border-border/50 rounded-lg p-3 space-y-2">
                          {itemDetails.result.landing_page_concept.hero_text && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Hero Text:</span>
                              <p className="text-sm font-medium mt-1">{itemDetails.result.landing_page_concept.hero_text}</p>
                            </div>
                          )}
                          {itemDetails.result.landing_page_concept.sub_text && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Subheading:</span>
                              <p className="text-sm mt-1">{itemDetails.result.landing_page_concept.sub_text}</p>
                            </div>
                          )}
                          {itemDetails.result.landing_page_concept.cta && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Call to Action:</span>
                              <p className="text-sm font-medium text-primary mt-1">{itemDetails.result.landing_page_concept.cta}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video Prompt */}
                    {itemDetails.result.video_prompt && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Video Generation Prompt</h4>
                        <div className="border border-border/50 rounded-lg p-3">
                          <p className="text-sm leading-relaxed text-muted-foreground italic">
                            {itemDetails.result.video_prompt}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Text Content (for catalogs) */}
              {item.type === 'catalog' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold">Catalog Information</h3>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    {item.product_category && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Product Category</h4>
                        <p className="text-sm">{item.product_category}</p>
                      </div>
                    )}
                    
                    {item.platform && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Platform</h4>
                        <p className="text-sm">{item.platform}</p>
                      </div>
                    )}
                    
                    {item.tone && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Tone & Style</h4>
                        <p className="text-sm">{item.tone}</p>
                      </div>
                    )}
                    
                    {itemDetails?.result && Object.keys(itemDetails.result).length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Generated Content</h4>
                        <div className="text-sm space-y-2">
                          {Object.entries(itemDetails.result).map(([key, value]) => {
                            if (value && typeof value === 'string') {
                              return (
                                <div key={key}>
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span className="ml-2">{value}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizedGalleryPreviewModal;