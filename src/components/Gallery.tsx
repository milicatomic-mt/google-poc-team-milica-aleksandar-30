import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Image, FileText, Calendar } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';

interface GalleryItem {
  id: string;
  type: 'campaign' | 'catalog';
  created_at: string;
  generated_images: any;
  generated_video_url?: string;
  result: any;
  image_url?: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>('all');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns with limit to prevent timeouts
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaign_results')
        .select('id, created_at, generated_images, generated_video_url, result, image_url')
        .order('created_at', { ascending: false })
        .limit(24);

      // Fetch catalogs with limit to prevent timeouts
      const { data: catalogs, error: catalogsError } = await supabase
        .from('catalog_results')
        .select('id, created_at, generated_images, result, image_url')
        .order('created_at', { ascending: false })
        .limit(24);

      // Handle partial failures
      if (campaignsError) {
        console.error('Campaigns fetch error:', campaignsError);
      }
      if (catalogsError) {
        console.error('Catalogs fetch error:', catalogsError);
      }

      // Combine and format data safely
      const safeCampaigns: GalleryItem[] = (campaignsError ? [] : (campaigns || [])).map(item => ({ 
        ...item, 
        type: 'campaign' as const,
        generated_images: Array.isArray(item.generated_images) ? item.generated_images : []
      }));

      const safeCatalogs: GalleryItem[] = (catalogsError ? [] : (catalogs || [])).map(item => ({ 
        ...item, 
        type: 'catalog' as const,
        generated_images: Array.isArray(item.generated_images) ? item.generated_images : []
      }));

      const allItems: GalleryItem[] = [...safeCampaigns, ...safeCatalogs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(allItems);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getItemTitle = (item: GalleryItem) => {
    if (item.type === 'campaign') {
      return item.result?.emailCopy?.subject || 'Marketing Campaign';
    } else {
      return item.result?.title || 'Product Catalog';
    }
  };

  const getItemDescription = (item: GalleryItem) => {
    if (item.type === 'campaign') {
      return item.result?.emailCopy?.preview || item.result?.videoScript?.hook || 'Campaign content';
    } else {
      return item.result?.description || 'Catalog content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16">
            <RibbedSphere className="w-full h-full animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your gallery...</p>
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
                className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-border transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Media Preview */}
                <div className="aspect-video bg-muted/30 relative overflow-hidden">
                  {item.generated_images && Array.isArray(item.generated_images) && item.generated_images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={item.generated_images[0].url || item.generated_images[0]}
                        alt="Generated content"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {Array.isArray(item.generated_images) && item.generated_images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          +{item.generated_images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : item.image_url ? (
                    <img
                      src={item.image_url}
                      alt="Original content"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  {item.generated_video_url && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>Video</span>
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
                    {getItemTitle(item)}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {getItemDescription(item)}
                  </p>

                  {/* Asset Count */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      {Array.isArray(item.generated_images) && item.generated_images && item.generated_images.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Image className="w-3 h-3" />
                          <span>{Array.isArray(item.generated_images) ? item.generated_images.length : 0}</span>
                        </div>
                      )}
                      {item.generated_video_url && (
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span>1</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        // Navigate to preview with this item's data
                        navigate('/preview-results', {
                          state: {
                            campaignId: item.id,
                            campaignResults: item.result,
                            type: item.type
                          }
                        });
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
    </div>
  );
};

export default Gallery;