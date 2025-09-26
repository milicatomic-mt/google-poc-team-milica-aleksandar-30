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
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useImageCache } from '@/hooks/useImageCache';
import { toast } from "sonner";

const OptimizedGallery = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedItemForDownload, setSelectedItemForDownload] = useState<any>(null);
  const { preloadImages, getCachedImageUrl } = useImageCache();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: items = [], isLoading, error } = useGalleryData();

  // Preload critical images when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      const imagesToPreload = items
        .slice(0, 4) // Preload first 4 items
        .flatMap(item => [
          item.image_url,
          // Add any generated images if available
        ])
        .filter(Boolean);
      
      if (imagesToPreload.length > 0) {
        preloadImages(imagesToPreload).catch(console.warn);
      }
    }
  }, [items, preloadImages]);

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
    
    // Create consistent image mapping for detail pages
    const imageMapping = itemDetails?.generated_images ? {
      image_0: itemDetails.generated_images[0]?.url || null,
      image_1: itemDetails.generated_images[1]?.url || null,
      image_2: itemDetails.generated_images[2]?.url || null,
      image_3: itemDetails.generated_images[3]?.url || null,
    } : {};
    
    const route = routeMap[category as keyof typeof routeMap];
    if (route) {
      navigate(route, {
        state: { 
          campaignResults: {
            ...itemDetails?.result,
            generated_video_url: itemDetails?.generated_video_url,
            generated_images: itemDetails?.generated_images
          }, 
          uploadedImage: item.image_url, 
          campaignId: item.id,
          imageMapping,  // ← ✅ NOW INCLUDED
          returnTo: '/gallery'
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
  const { data: itemDetails, isLoading } = useGalleryItemDetails(item);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
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
        <CardContent className="p-4">
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

// Campaign content display component - using identical cards from PreviewResultsScreen
const CampaignContent: React.FC<{
  campaignResults: any;
  generatedImages: any[];
  generatedVideoUrl: string | null;
  uploadedImage: string;
  onViewDetails: (category: string) => void;
}> = ({ campaignResults, generatedImages, generatedVideoUrl, uploadedImage, onViewDetails }) => {
  
  const activeCampaignResults = campaignResults;
  
  // Create consistent image mapping for preview cards
  const imageMapping = generatedImages ? {
    image_0: generatedImages[0]?.url || null,
    image_1: generatedImages[1]?.url || null,
    image_2: generatedImages[2]?.url || null,
    image_3: generatedImages[3]?.url || null,
  } : {};

  // Use same logic as detail pages for consistent images
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || generatedImages?.[index]?.url || null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Banner Ads Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
        onClick={() => onViewDetails('Banner Ads')}
      >
        <div className="px-4 py-2 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Banner Ads</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">4</span>
          </div>
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails('Banner Ads');
            }}
            className="tap-target focus-ring rounded-full py-1 px-2 h-auto"
          >
            <Download className="w-4 h-4 text-white" />
          </Button>
        </div>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="h-80 p-4">
            {/* Top Row - Two Square Banners */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Left Banner - Person with Headphones */}
              <div className="aspect-square bg-gradient-to-br from-slate-200 to-stone-300 overflow-hidden relative">
                {getImage(0) && (
                  <OptimizedImage
                    src={getImage(0)}
                    alt="Person with headphones" 
                    className="w-full h-full object-cover"
                    priority={true}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="space-y-1">
                    <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                      Premium Sound
                    </h3>
                    <p className="text-white/90 text-[8px] uppercase tracking-wider">
                      Minimalist Design
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/80 text-[7px]">
                        WIRELESS BLUETOOTH CONNECTION<br/>
                        WITH BASS RESONANCE
                      </span>
                      <button className="bg-white text-gray-900 text-[8px] px-2 py-1 rounded font-semibold">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Banner - Just Headphones Product */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                {(getImage(1) || getImage(0)) && (
                  <OptimizedImage
                    src={getImage(1) || getImage(0)}
                    alt="Headphones product" 
                    className="w-full h-full object-cover"
                    priority={true}
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-200 to-slate-100 p-2">
                  <div className="space-y-1">
                    <h3 className="text-gray-900 text-[10px] font-bold uppercase tracking-wide">
                      Premium Sound
                    </h3>
                    <p className="text-gray-700 text-[7px] uppercase tracking-wider">
                      Minimalist Design
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-600 text-[6px]">
                        WIRELESS BLUETOOTH CONNECTION<br/>
                        WITH BASS RESONANCE
                      </span>
                      <button className="bg-gray-900 text-white text-[7px] px-2 py-1 rounded font-semibold">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Row - Wide Horizontal Banner */}
            <div className="bg-gradient-to-r from-slate-200 to-stone-200 overflow-hidden relative h-20">
              <div className="flex items-center h-full">
                {/* Left - Person Image */}
                <div className="w-20 h-full relative overflow-hidden">
                  {getImage(0) && (
                    <OptimizedImage
                      src={getImage(0)} 
                      alt="Person with headphones" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 px-4 py-3">
                  <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wide mb-1">
                    Premium Sound
                  </h3>
                  <p className="text-gray-700 text-[10px] uppercase tracking-wider mb-2">
                    Minimalist Design
                  </p>
                  <p className="text-gray-600 text-[8px] leading-tight">
                    WIRELESS BLUETOOTH CONNECTION<br/>
                    WITH BASS RESONANCE
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-4">
                  <button className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg font-semibold">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Creative Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
        onClick={() => onViewDetails('Web Creative')}
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Web Creative</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
          </div>
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails('Web Creative');
            }}
            className="tap-target focus-ring rounded-full py-1 px-2 h-auto"
          >
            <Download className="w-4 h-4 text-white" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="h-80 bg-gray-100 rounded overflow-hidden border border-gray-300 shadow-sm">
            {/* Browser-like Screenshot Mockup */}
            <div className="h-full bg-white">
              {/* Browser Header */}
              <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
                  <div className="text-[6px] text-gray-500">https://yoursite.com</div>
                </div>
              </div>

              {/* Landing Page with Background Image */}
              <div className="h-full relative overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                 {activeCampaignResults?.generated_images?.[0]?.url ? (
                    <OptimizedImage
                      src={activeCampaignResults.generated_images[0].url} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                   ) : getImage(0) ? (
                    <OptimizedImage
                      src={getImage(0)} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  )}
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  {/* Gradient overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                </div>

                {/* Navigation Bar - Floating */}
                <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
                  <div className="px-3 py-1 flex justify-between items-center">
                    <div className="text-[8px] font-bold text-white">BRAND</div>
                    <div className="flex gap-3 text-[6px] text-white/80">
                      <span>Home</span> <span>Products</span> <span>About</span>
                    </div>
                  </div>
                </div>

                {/* Hero Content - Centered with Text Overlays */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
                  {/* Badge */}
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-2">
                    <div className="text-[5px] font-medium text-white">✨ New Launch</div>
                  </div>
                  
                  {/* Main Headline with Text Shadow */}
                  <h1 className="text-[12px] font-bold text-white leading-tight mb-2 max-w-24 drop-shadow-lg">
                    Transform Your Experience Today
                  </h1>
                  
                  {/* Subtext */}
                  <p className="text-[6px] text-white/90 leading-relaxed mb-3 max-w-20 drop-shadow-md">
                    Discover innovative solutions that drive exceptional results for your business.
                  </p>
                  
                  {/* CTA Button */}
                  <div className="bg-white text-gray-900 text-[6px] px-3 py-1 rounded-full font-medium shadow-lg hover:bg-white/90 transition-all mb-3">
                    Get Started Now
                  </div>

                  {/* Features Bar - Bottom Overlay */}
                  <div className="bg-white/10 backdrop-blur-md rounded px-3 py-1 border border-white/20">
                    <div className="flex items-center gap-3 text-center">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <div className="text-[4px] text-white font-medium">Free Ship</div>
                      </div>
                      <div className="w-px h-2 bg-white/30"></div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <div className="text-[4px] text-white font-medium">30d Returns</div>
                      </div>
                      <div className="w-px h-2 bg-white/30"></div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <div className="text-[4px] text-white font-medium">Premium</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer - Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
                  <div className="px-2 py-1">
                    <div className="text-[4px] text-white/70 text-center">© 2024 Brand. All rights reserved.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Scripts Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant overflow-hidden backdrop-blur-xl bg-white/5 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
        onClick={() => onViewDetails('Video Scripts')}
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Video Scripts</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
          </div>
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails('Video Scripts');
            }}
            className="tap-target focus-ring rounded-full py-1 px-2 h-auto"
          >
            <Download className="w-4 h-4 text-white" />
          </Button>
        </div>
        <CardContent className="p-4">
          {/* Mobile-First Vertical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
            {/* Left Side - Video Preview */}
            <div className="bg-black rounded overflow-hidden relative min-h-[120px] lg:h-full">
              {/* Video Thumbnail with Play Button */}
              <div className="relative w-full h-full">
                {getImage(0) ? (
                  <OptimizedImage src={getImage(0)} alt="Video thumbnail" className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                
                {/* Play Button - Static (no playback functionality) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  0:30
                </div>
              </div>
            </div>

            {/* Right Side - Script Preview */}
            <div className="bg-white backdrop-blur-sm rounded p-3 border border-white/20">
              <div className="space-y-2">
                {/* Script Header */}
                <div className="text-center pb-1 border-b border-white/30">
                  <h4 className="font-semibold text-sm text-gray-900">Professional Script</h4>
                  <p className="text-xs text-gray-600">Multi-platform optimized</p>
                </div>
                
                {/* Script Sections */}
                <div className="space-y-1">
                  <div className="bg-white/60 p-2 rounded">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-4 h-4 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">1</div>
                      <span className="font-medium text-xs text-gray-800">Hook</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">
                      "Transform your experience..."
                    </p>
                  </div>
                  
                  <div className="bg-white/60 p-2 rounded">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-4 h-4 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">2</div>
                      <span className="font-medium text-xs text-gray-800">Content</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      Product demo with features...
                    </p>
                  </div>
                  
                  <div className="bg-white/60 p-2 rounded">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-4 h-4 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">3</div>
                      <span className="font-medium text-xs text-gray-800">CTA</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">
                      "Get started today!"
                    </p>
                  </div>
                </div>
                
                {/* Social Icons Preview */}
                <div className="pt-1 border-t border-white/30">
                  <p className="text-xs text-gray-600 text-center mb-1">Perfect for:</p>
                  <div className="flex justify-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">I</span>
                    </div>
                    <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
        onClick={() => onViewDetails('Email Templates')}
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Email Templates</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">2</span>
          </div>
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails('Email Templates');
            }}
            className="tap-target focus-ring rounded-full py-1 px-2 h-auto"
          >
            <Download className="w-4 h-4 text-white" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="h-80 relative overflow-hidden">
            {/* Email Preview - Matching EmailTemplatesPreview design */}
            
            {/* Header with Background Image */}
            <div 
              className="relative text-center py-6 bg-cover bg-center bg-no-repeat h-20 flex flex-col justify-center"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h1 className="text-xs font-bold text-white drop-shadow-lg">Premium sound</h1>
              <p className="text-[8px] text-white/90 uppercase tracking-wider drop-shadow">MINIMALIST DESIGN</p>
            </div>

            {/* Product Showcase Section */}
            <div 
              className="py-6 bg-cover bg-center bg-no-repeat h-32 flex items-center"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="w-full px-4">
                <div className="flex items-center justify-center">
                  {getImage(0) && (
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 shadow-lg max-w-16 max-h-16">
                      <OptimizedImage 
                        src={getImage(0)}
                        alt="Premium product"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content section */}
            <div 
              className="px-3 py-4 bg-gradient-to-b from-transparent to-black/5 h-24"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="text-center">
                <h2 className="text-[9px] font-bold text-slate-900 mb-2 leading-tight">
                  Premium wireless headphones with a sleek ivory finish
                </h2>
                
                <p className="text-[7px] text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  Experience high-quality audio with stylish over-ear wireless headphones featuring advanced noise isolation.
                </p>
                
                <div className="bg-slate-900 hover:bg-slate-800 text-white text-[6px] px-3 py-1 rounded-full inline-block shadow-lg">
                  Shop Now
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/90 backdrop-blur-sm py-1 text-center h-4 flex items-center justify-center">
              <p className="text-[5px] text-slate-300">
                © 2024 Premium Sound. All rights reserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <div className="aspect-square bg-muted overflow-hidden">
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