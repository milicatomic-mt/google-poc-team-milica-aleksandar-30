import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Image, FileText, Calendar } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import OptimizedGalleryPreviewModal from '@/components/OptimizedGalleryPreviewModal';
import { useGalleryData, type GalleryItem } from '@/hooks/useGalleryData';

const OptimizedGallery = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: items = [], isLoading, error } = useGalleryData();

  const filteredItems = items.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'campaigns') return item.type === 'campaign';
    if (selectedFilter === 'catalogs') return item.type === 'catalog';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setSelectedItem(null);
  };

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">Failed to load gallery items.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        {/* Background Video */}
        <video 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          onError={(e) => {
            console.warn('Background video failed to load');
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Animated Sphere - 200x200px */}
              <div className="w-[200px] h-[200px] animate-fade-in">
                <RibbedSphere className="w-full h-full" />
              </div>

              {/* Loading Text */}
              <div className="text-center animate-fade-in animation-delay-300 min-h-[80px] flex flex-col justify-center">
                <p className="text-2xl font-semibold text-foreground mb-2">
                  Loading your gallery...
                </p>
                <p className="text-sm text-muted-foreground">
                  Preparing your creative content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hover:bg-muted/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'campaigns' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('campaigns')}
                className="text-xs"
              >
                Campaigns
              </Button>
              <Button
                variant={selectedFilter === 'catalogs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('catalogs')}
                className="text-xs"
              >
                Catalogs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 opacity-40">
              <RibbedSphere className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating campaigns and catalogs to see them appear here.
            </p>
            <Button onClick={() => navigate('/welcome')}>
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {/* Media Preview */}
                <div className="aspect-video bg-muted/30 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt="Content preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Video Indicator */}
                  {item.has_video && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>Video</span>
                    </div>
                  )}

                  {/* Images Indicator */}
                  {item.has_images && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      <Image className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.type === 'campaign' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {item.type === 'campaign' ? 'Campaign' : 'Catalog'}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(item.created_at)}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  {/* Asset Count */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      {item.has_images && (
                        <div className="flex items-center space-x-1">
                          <Image className="w-3 h-3" />
                          <span>Images</span>
                        </div>
                      )}
                      {item.has_video && (
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span>Video</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <OptimizedGalleryPreviewModal 
        item={selectedItem}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
      />
    </div>
  );
};

export default OptimizedGallery;