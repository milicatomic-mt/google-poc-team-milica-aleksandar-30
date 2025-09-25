import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Image, FileText, Calendar, Download, QrCode } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { useGalleryData, useGalleryItemDetails, type GalleryItem } from '@/hooks/useGalleryData';
import { VideoPlayer } from '@/components/VideoPlayer';
import QRDownloadModal from '@/components/QRDownloadModal';
import { toast } from "sonner";

const OptimizedGallery = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedItemForDownload, setSelectedItemForDownload] = useState<any>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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


  const handleDownload = async (item: any, campaignResults: any) => {
    setSelectedItemForDownload(campaignResults);
    setIsDownloadModalOpen(true);
  };

  const handleViewDetails = (category: string, item: GalleryItem, itemDetails: any) => {
    const routeMap = {
      'Web Creative': '/web-creative',
      'Banner Ads': '/banner-ads', 
      'Video Scripts': '/video-scripts',
      'Email Templates': '/email-templates'
    };
    
    const route = routeMap[category as keyof typeof routeMap];
    if (route) {
      navigate(route, {
        state: { 
          campaignResults: itemDetails?.result, 
          uploadedImage: item.image_url, 
          campaignId: item.id 
        }
      });
    }
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
          <div className="space-y-12">
            {filteredItems.map((item) => (
              <GalleryItemDisplay 
                key={item.id} 
                item={item}
                onDownload={handleDownload}
                onViewDetails={handleViewDetails}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Download Modal */}
      <QRDownloadModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        campaignData={selectedItemForDownload}
      />
    </div>
  );
};

// Component to display individual gallery items with their full content
const GalleryItemDisplay: React.FC<{
  item: GalleryItem;
  onDownload: (item: GalleryItem, campaignResults: any) => void;
  onViewDetails: (category: string, item: GalleryItem, itemDetails: any) => void;
  formatDate: (dateString: string) => string;
}> = ({ item, onDownload, onViewDetails, formatDate }) => {
  const { data: itemDetails, isLoading } = useGalleryItemDetails(item.id, item.type);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 animate-spin">
              <RibbedSphere className="w-full h-full" />
            </div>
            <span className="ml-3 text-muted-foreground">Loading content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!itemDetails?.result) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Content not available
          </div>
        </CardContent>
      </Card>
    );
  }

  const campaignResults = itemDetails.result;
  const generatedImages = itemDetails.generated_images || [];
  const generatedVideoUrl = itemDetails.generated_video_url;

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-muted/30 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={item.type === 'campaign' ? 'default' : 'secondary'}>
                {item.type === 'campaign' ? 'Campaign' : 'Catalog'}
              </Badge>
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(item.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onDownload(item, campaignResults)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Content based on type */}
        <div className="p-6">
          {item.type === 'campaign' ? (
            <CampaignContent 
              campaignResults={campaignResults}
              generatedImages={generatedImages}
              generatedVideoUrl={generatedVideoUrl}
              uploadedImage={item.image_url}
              onViewDetails={(category) => onViewDetails(category, item, itemDetails)}
            />
          ) : (
            <CatalogContent 
              catalogResults={campaignResults}
              uploadedImage={item.image_url}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Campaign content display component
const CampaignContent: React.FC<{
  campaignResults: any;
  generatedImages: any[];
  generatedVideoUrl: string | null;
  uploadedImage: string;
  onViewDetails: (category: string) => void;
}> = ({ campaignResults, generatedImages, generatedVideoUrl, uploadedImage, onViewDetails }) => {
  
  const categories = [
    {
      title: 'Web Creative',
      description: 'Hero sections and landing page concepts',
      icon: FileText,
      available: true,
      preview: (
        <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden relative">
          {(generatedImages[0]?.url || uploadedImage) && (
            <img 
              src={generatedImages[0]?.url || uploadedImage}
              alt="Web creative preview"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h3 className="text-xl font-bold mb-2">
                {campaignResults.landing_page_concept?.hero_text || 'Elevate Your Experience'}
              </h3>
              <p className="text-sm mb-4">
                {campaignResults.landing_page_concept?.sub_text || 'Discover premium quality'}
              </p>
              <div className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">
                {campaignResults.landing_page_concept?.cta || 'Shop Now'}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Banner Ads',
      description: 'Display ads for various platforms',
      icon: Image,
      available: campaignResults.banner_ads && campaignResults.banner_ads.length > 0,
      preview: (
        <div className="bg-gradient-to-r from-amber-200 to-amber-100 rounded-lg p-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(generatedImages[0]?.url || uploadedImage) && (
              <img 
                src={generatedImages[0]?.url || uploadedImage}
                alt="Banner preview"
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <div className="font-bold text-sm">
                {campaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
              </div>
              <div className="text-xs text-gray-600">Premium Experience</div>
            </div>
          </div>
          <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">
            {campaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
          </div>
        </div>
      )
    },
    {
      title: 'Video Scripts',
      description: 'Scripts for social media videos',
      icon: Play,
      available: campaignResults.video_scripts && campaignResults.video_scripts.length > 0,
      preview: (
        <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden relative">
          {generatedVideoUrl ? (
            <video
              src={generatedVideoUrl}
              className="w-full h-full object-cover"
              muted
              poster={generatedImages[0]?.url || uploadedImage}
            />
          ) : (
            <>
              {(generatedImages[0]?.url || uploadedImage) && (
                <img 
                  src={generatedImages[0]?.url || uploadedImage}
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-gray-700 ml-1" />
                </div>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Email Templates',
      description: 'Marketing email campaigns',
      icon: FileText,
      available: campaignResults.email_copy,
      preview: (
        <div className="bg-white border rounded-lg p-4 text-sm">
          <div className="border-b pb-2 mb-3">
            <div className="font-semibold text-xs text-gray-500">Subject:</div>
            <div className="font-medium">
              {campaignResults.email_copy?.subject || 'Discover Your New Favorite'}
            </div>
          </div>
          <div className="text-gray-600 line-clamp-3">
            {campaignResults.email_copy?.body || 'Experience premium quality like never before...'}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.title}
            className={`group cursor-pointer transition-all duration-300 ${
              category.available ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => category.available && onViewDetails(category.title)}
          >
            <Card className={`h-full ${category.available ? 'hover:shadow-lg' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{category.title}</h3>
                  </div>
                  {category.available && (
                    <Badge variant="outline" className="text-xs">Available</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                
                <div className="mb-3">
                  {category.preview}
                </div>
                
                {category.available && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

// Catalog content display component
const CatalogContent: React.FC<{
  catalogResults: any;
  uploadedImage: string;
}> = ({ catalogResults, uploadedImage }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Original Product</h3>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={uploadedImage}
                alt="Original product"
                className="w-full h-full object-contain"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Generated Content</h3>
            <div className="space-y-4">
              {catalogResults.product_category && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Product Category</div>
                  <div className="text-sm">{catalogResults.product_category}</div>
                </div>
              )}
              
              {catalogResults.platform && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Platform</div>
                  <div className="text-sm">{catalogResults.platform}</div>
                </div>
              )}
              
              {catalogResults.tone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tone</div>
                  <div className="text-sm">{catalogResults.tone}</div>
                </div>
              )}
              
              {catalogResults.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-sm line-clamp-3">{catalogResults.description}</div>
                </div>
              )}
              
              {catalogResults.tags && catalogResults.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {catalogResults.tags.slice(0, 6).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OptimizedGallery;