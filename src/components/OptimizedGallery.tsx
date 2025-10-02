import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Camera, Heart, MessageCircle, Send, Share, Plus, Search, MoreHorizontal, Bookmark, ArrowUpRight } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { useGalleryData, useGalleryItemDetails, type GalleryItem } from '@/hooks/useGalleryData';
import QRDownloadModal from '@/components/QRDownloadModal';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useImageCache } from '@/hooks/useImageCache';
import profileAvatar from '@/assets/profile-avatar.png';
import profileKaren from '@/assets/profile-karen.png';
import profileZack from '@/assets/profile-zack.png';

const OptimizedGallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize filter from sessionStorage if available
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>(() => {
    try {
      const savedFilter = sessionStorage.getItem('gallery-filter');
      return (savedFilter as 'all' | 'campaigns' | 'catalogs') || 'all';
    } catch {
      return 'all';
    }
  });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedItemForDownload, setSelectedItemForDownload] = useState<any>(null);
  const { preloadImages, getCachedImageUrl } = useImageCache();

  // Measure sticky header height to position the tag directly beneath it
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight || 0);
    measure();
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  // Scroll position: prepare restore on mount
  const savedScrollPositionRef = useRef<number | null>(null);
  const shouldRestoreRef = useRef<boolean>(false);
  useEffect(() => {
    const saved = sessionStorage.getItem('gallery-scroll-position');
    const fromDetail = Boolean(location.state?.fromDetail);
    const restoreFlag = sessionStorage.getItem('gallery-restore') === '1';
    if ((fromDetail || restoreFlag) && saved) {
      savedScrollPositionRef.current = parseInt(saved, 10);
      shouldRestoreRef.current = true;
      // Do not scroll to top now; wait for items to load/layout
    } else {
      window.scrollTo(0, 0);
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: items = [], isLoading, error } = useGalleryData();

  // Restore scroll AFTER data renders
  useEffect(() => {
    if (shouldRestoreRef.current && !isLoading && items.length > 0 && savedScrollPositionRef.current !== null) {
      const y = savedScrollPositionRef.current;
      // Next frame ensures DOM laid out
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'auto' });
        // cleanup
        shouldRestoreRef.current = false;
        savedScrollPositionRef.current = null;
        sessionStorage.removeItem('gallery-scroll-position');
        sessionStorage.removeItem('gallery-restore');
        try {
          window.history.replaceState({ ...(location.state || {}), fromDetail: false }, document.title);
        } catch {}
      });
    }
  }, [isLoading, items.length, location.state]);

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
    if (selectedFilter === 'all') {
      // Show catalogs and only campaigns with videos
      return item.type === 'catalog' || 
             (item.type === 'campaign' && item._fullData?.generated_video_url && item._fullData.generated_video_url.trim() !== '');
    }
    if (selectedFilter === 'campaigns') {
      // Only show campaigns that have generated videos
      return item.type === 'campaign' && 
             item._fullData?.generated_video_url && 
             item._fullData.generated_video_url.trim() !== '';
    }
    if (selectedFilter === 'catalogs') return item.type === 'catalog';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };


  const handleDownload = async (item: any, campaignResults: any) => {
    setSelectedItemForDownload(campaignResults);
    setIsDownloadModalOpen(true);
  };

  const handleViewDetails = (category: string, item: GalleryItem, itemDetails: any) => {
    // Save current scroll position and filter before navigating
    try {
      sessionStorage.setItem('gallery-scroll-position', String(window.scrollY));
      sessionStorage.setItem('gallery-restore', '1');
      sessionStorage.setItem('gallery-filter', selectedFilter);
    } catch {}
    const routeMap = {
      'Web Creative': '/web-creative',
      'Banner Ads': '/banner-ads', 
      'Social Video Collection': '/video-scripts',
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
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0" 
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
                <p className="text-2xl font-semibold text-foreground">
                  Loading Gallery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-300 relative">
      {/* Background Video */}
      <div className="relative z-10">
      {/* Header */}
      <div ref={headerRef} className="border-b border-white/40 bg-white/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Back Button */}
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 text-black" />
            </Button>
            
            {/* Center - Gallery Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-3xl font-bold text-foreground">Gallery</h1>
            </div>
            
            {/* Right - Filter Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className={`text-xs rounded-full ${selectedFilter !== 'all' ? 'border-0' : ''}`}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'campaigns' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('campaigns')}
                className={`text-xs rounded-full ${selectedFilter !== 'campaigns' ? 'border-0' : ''}`}
              >
                Campaigns
              </Button>
              <Button
                variant={selectedFilter === 'catalogs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('catalogs')}
                className={`text-xs rounded-full ${selectedFilter !== 'catalogs' ? 'border-0' : ''}`}
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
      <Card className="w-full overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm">
        <CardContent className="p-0">
          {/* Header Skeleton */}
          <div className="border-b border-white/40 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-8 w-3/4 bg-white/60 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-white/50 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Skeleton 1 */}
              <div className="border-2 border-white/50 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-white/40">
                  <div className="h-6 w-32 bg-white/50 rounded animate-pulse" />
                </div>
                <div className="p-2">
                  <div className="h-80 bg-white/50 rounded animate-pulse" />
                </div>
              </div>

              {/* Card Skeleton 2 */}
              <div className="border-2 border-white/50 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-white/40">
                  <div className="h-6 w-32 bg-white/50 rounded animate-pulse" />
                </div>
                <div className="p-2">
                  <div className="h-80 bg-white/50 rounded animate-pulse" />
                </div>
              </div>

              {/* Card Skeleton 3 */}
              <div className="border-2 border-white/50 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-white/40">
                  <div className="h-6 w-32 bg-white/50 rounded animate-pulse" />
                </div>
                <div className="p-2">
                  <div className="h-80 bg-white/50 rounded animate-pulse" />
                </div>
              </div>

              {/* Card Skeleton 4 */}
              <div className="border-2 border-white/50 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-white/40">
                  <div className="h-6 w-32 bg-white/50 rounded animate-pulse" />
                </div>
                <div className="p-2">
                  <div className="h-80 bg-white/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
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
    <Card className="w-full overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm">
      <CardContent className="p-0 relative">
        
        {/* Header */}
        <div className="border-b border-white/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {item.title.replace(/\s*-\s*e\.g\..*$/i, '').replace(/\s*\(e\.g\..*?\)/gi, '')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(item.created_at)}
              </p>
            </div>
            <Badge className="text-xs bg-primary/10 text-primary border-0">
              {item.type === 'campaign' ? 'Campaign' : 'Catalog'}
            </Badge>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      
      {/* Banner Ads Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer flex flex-col"
        onClick={() => onViewDetails('Banner Ads')}
      >
        <div className="px-2 py-2 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Banner Ads</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black" />
        </div>
        <CardContent className="p-2 flex-1 flex flex-col">
          <div className="h-80 rounded">
            {/* Top Row - Two Square Banners */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              
              {/* Left Banner - Product Focus */}
              <div className="aspect-square bg-white rounded overflow-hidden relative">
                <div className="flex items-center h-full">
                  {/* Left - Product Image */}
                  <div className="w-1/2 h-full flex items-center justify-center">
                    {(getImage(1) || getImage(0)) && (
                      <OptimizedImage 
                        src={getImage(1) || getImage(0)} 
                        alt="Premium Sound Product" 
                        className="w-full h-full object-cover filter drop-shadow-lg" 
                      />
                    )}
                  </div>
                  
                  {/* Right - Text Content */}
                  <div className="flex-1 px-4 text-gray-900">
                    <h3 className="text-gray-900 text-xl font-bold uppercase tracking-wide mb-1">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-gray-700 text-[9px] uppercase tracking-wider mb-1">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-gray-600 text-[7px] font-medium mb-2">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </p>
                    <button className="bg-gray-900 text-white text-[7px] px-3 py-1 font-semibold hover:bg-gray-800 transition-colors rounded-full">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Banner - Full Image Design */}
              <div className="aspect-square bg-gray-900 rounded overflow-hidden relative">
                {/* Full Background Image */}
                {(getImage(0) || getImage(1)) && (
                  <OptimizedImage 
                    src={getImage(0) || getImage(1)} 
                    alt="Person using product" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Text Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-white text-xl font-bold uppercase tracking-wide mb-1">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-white/90 text-[9px] uppercase tracking-wider mb-1">
                    MINIMALIST DESIGN
                  </p>
                  <p className="text-white/80 text-[7px] font-medium mb-2">
                    WIRELESS BLUETOOTH CONNECTION<br/>
                    WITH BASS RESONANCE
                  </p>
                  <button className="bg-white text-gray-900 text-[7px] px-3 py-1 font-semibold hover:bg-gray-100 transition-colors rounded-full">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Banner - Dark */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded overflow-hidden h-16 relative">
              <div className="flex items-center h-full">
                {/* Left - Product Image */}
                <div className="w-20 h-full flex items-center justify-center">
                  {(getImage(0) || getImage(1)) && (
                    <OptimizedImage 
                      src={getImage(0) || getImage(1)} 
                      alt="Premium Sound Product" 
                      className="w-full h-full object-cover filter drop-shadow-lg" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 ml-3 text-white">
                  <h3 className="text-white text-sm font-bold uppercase tracking-wide mb-1">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-white/80 text-[7px] font-medium">
                    WIRELESS BLUETOOTH CONNECTION WITH BASS RESONANCE
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-3 flex-shrink-0">
                  <button className="bg-white text-gray-900 text-[8px] px-3 py-1 font-semibold hover:bg-gray-100 transition-colors rounded-full">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Creative Card - Matching WebCreativePreview design */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer flex flex-col"
        onClick={() => onViewDetails('Web Creative')}
      >
        <div className="px-2 py-2 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Web Creative</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black" />
        </div>
        <CardContent className="p-2">
          <div className="h-80 bg-gray-100 overflow-hidden shadow-sm rounded relative">
            {/* Website Landing Page Layout */}
            <div className="h-full bg-white flex rounded">
              {/* Left Side - Content */}
              <div className="flex-1 p-4 flex flex-col justify-center">
                {/* New Launch Badge */}
                <div 
                  className="inline-flex items-center text-[8px] px-2 py-1 rounded-full mb-3 w-fit"
                  style={{
                    backgroundColor: 'hsl(40, 40%, 85%)',
                    color: 'hsl(0, 0%, 0%)'
                  }}
                >
                  <span className="font-medium">New Launch</span>
                </div>
                
                {/* Main Headline */}
                <h1 className="text-black text-lg font-bold leading-tight mb-2">
                  Sound & Style,<br/>
                  Perfectly Balanced.
                </h1>
                
                {/* Description */}
                <p className="text-gray-600 text-[10px] leading-relaxed mb-3">
                  Premium audio quality in a minimalist design that complements your unique style.
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="bg-black text-white text-[8px] px-3 py-1.5 rounded-full font-medium">
                    Shop 'Her' Now
                  </button>
                  <button className="border border-gray-300 text-gray-700 text-[8px] px-3 py-1.5 rounded-full font-medium">
                    Learn More
                  </button>
                </div>
              </div>
              
              {/* Right Side - Product Image */}
              <div className="flex-[1.5] relative">
                {(getImage(0) || getImage(1)) && (
                  <OptimizedImage 
                    src={getImage(0) || getImage(1)} 
                    alt="Product showcase" 
                    className="w-full h-full object-cover rounded-r" 
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Video Collection Card - Matching PreviewResultsScreen design */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer flex flex-col"
        onClick={() => onViewDetails('Social Video Collection')}
      >
        <div className="px-2 py-2 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Social Video Collection</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black" />
        </div>
        <CardContent className="p-2 flex-1 flex flex-col">
          <div className="h-80 flex gap-2 justify-between">
            
            {/* Instagram Phone Mockup */}
            <div className="flex-1 bg-black overflow-hidden relative border border-gray-300 rounded">
              {/* Status Bar */}
              <div className="bg-black px-3 py-1 flex justify-between items-center text-white text-[8px]">
                <div className="flex items-center gap-1">
                  <span className="font-medium">9:41</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
              </div>
              
              {/* Instagram Header */}
              <div className="bg-black px-3 py-2 border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-white" />
                    <div className="text-white text-[12px] font-bold tracking-wider">Instagram</div>
                  </div>
                  <div className="flex gap-3">
                    <Plus className="w-4 h-4 text-white" />
                    <Heart className="w-4 h-4 text-white" />
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Stories */}
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-0.5">
                      <img src={profileAvatar} alt="Your story" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="text-white text-[6px] mt-0.5">Your story</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full p-0.5">
                      <img src={profileKaren} alt="joshua_l" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="text-gray-400 text-[6px] mt-0.5">joshua_l</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full p-0.5">
                      <img src={profileZack} alt="craig.done" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="text-gray-400 text-[6px] mt-0.5">craig.done</span>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="relative flex-1">
                <div className="bg-black p-2 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-0.5">
                      <img src={uploadedImage || getImage(0)} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                      <div className="text-white text-[8px] font-semibold">joshua_l</div>
                      <div className="text-gray-400 text-[6px]">Sponsored</div>
                    </div>
                  </div>
                </div>
                {getImage(0) && (
                  <OptimizedImage 
                    src={getImage(0)} 
                    alt="Instagram content" 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="bg-black p-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-2">
                      <Heart className="w-4 h-4 text-white" />
                      <MessageCircle className="w-4 h-4 text-white" />
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <Bookmark className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white text-[7px] font-semibold mb-1">
                    Liked by craig.done and 43,840 others
                  </div>
                  <div className="text-white text-[7px]">
                    <span className="font-semibold">joshua_l</span> The game in Japan was amazing
                  </div>
                </div>
              </div>
              
              {/* Bottom Navigation */}
              <div className="bg-black px-3 py-2 border-t border-gray-700">
                <div className="flex justify-around">
                  <div className="w-4 h-4 bg-gray-700 rounded-sm"></div>
                  <Search className="w-4 h-4 text-gray-400" />
                  <Plus className="w-4 h-4 text-gray-400" />
                  <Heart className="w-4 h-4 text-gray-400" />
                  <img src={profileAvatar} alt="Profile" className="w-4 h-4 rounded-full object-cover" />
                </div>
              </div>
            </div>

            {/* TikTok Phone Mockup */}
            <div className="flex-1 bg-black overflow-hidden relative border border-gray-300 rounded">
              {/* Status Bar */}
              <div className="bg-black px-3 py-1 flex justify-between items-center text-white text-[8px]">
                <div className="flex items-center gap-1">
                  <span className="font-medium">9:41</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
              </div>
              
              {/* TikTok Header */}
              <div className="bg-black px-3 py-2 flex justify-center border-b border-gray-800">
                <div className="flex gap-6">
                  <span className="text-gray-400 text-[11px]">Following</span>
                  <span className="text-white text-[11px] font-bold border-b-2 border-white pb-1">For You</span>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="relative flex-1">
                {getImage(0) && (
                  <OptimizedImage 
                    src={getImage(0)} 
                    alt="TikTok content" 
                    className="w-full h-64 object-cover"
                  />
                )}
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-black ml-1" fill="black" />
                  </div>
                </div>
                
                {/* Right Side Actions */}
                <div className="absolute right-2 bottom-16 flex flex-col gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <Share className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Bottom Text */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-white text-[8px] font-bold mb-1">TOMORROW X TOGETHER ✓</div>
                  <div className="text-white text-[7px]">Let's keep dancing until the sun rises😊</div>
                </div>
              </div>
            </div>

            {/* Facebook Phone Mockup */}
            <div className="flex-1 bg-gray-900 overflow-hidden relative border border-gray-300 rounded">
              {/* Status Bar */}
              <div className="bg-gray-800 px-3 py-1 flex justify-between items-center text-white text-[8px]">
                <div className="flex items-center gap-1">
                  <span className="font-medium">15:47</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
              </div>
              
              {/* Facebook Header */}
              <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-white text-[14px] font-bold">facebook</span>
                </div>
                <div className="flex gap-3">
                  <Plus className="w-4 h-4 text-white" />
                  <Search className="w-4 h-4 text-white" />
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Post Header */}
              <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center">
                    <img 
                      src={profileAvatar}
                      alt="Brand profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="text-white text-[9px] font-bold">BMW Group ✓</div>
                    <div className="text-gray-400 text-[7px]">Sponsored • 5</div>
                  </div>
                  <div className="ml-auto">
                    <MoreHorizontal className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="bg-gray-800 px-3 py-2">
                <p className="text-white text-[8px] mb-2">
                  From FCEV prototype to series production – The BMW iX5 Hydrogen 🚙 ... See more
                </p>
              </div>
              
              {/* Main Content */}
              <div className="relative flex-1 bg-gray-800">
                {getImage(0) && (
                  <OptimizedImage 
                    src={getImage(0)} 
                    alt="Facebook content" 
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              
              {/* Post Actions */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm px-3 py-2 border-t border-gray-700">
                <div className="flex justify-around">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-gray-300" />
                    <span className="text-[7px] text-gray-300">Like</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-gray-300" />
                    <span className="text-[7px] text-gray-300">Comment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share className="w-3 h-3 text-gray-300" />
                    <span className="text-[7px] text-gray-300">Share</span>
                  </div>
                </div>
                <div className="text-center text-[6px] text-gray-400 mt-1">
                  45 comments • 75 shares • 5M views
                </div>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Email Templates Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer flex flex-col"
        onClick={() => onViewDetails('Email Templates')}
      >
        <div className="px-2 py-2 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Email Templates</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-black" />
        </div>
        <CardContent className="p-2 flex-1 flex flex-col">
          <div className="h-80 relative overflow-hidden">
            {/* Email Preview - Matching EmailTemplatesPreview design */}
            
            {/* Header with Background Image */}
            <div 
              className="relative text-center py-4 bg-cover bg-center bg-no-repeat h-20 flex flex-col justify-center"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h1 className="text-[10px] font-bold text-white drop-shadow-lg">
                {activeCampaignResults?.email_copy?.subject || 'Premium sound'}
              </h1>
              <p className="text-[6px] text-white/90 uppercase tracking-wider drop-shadow">
                {activeCampaignResults?.banner_ads?.[0]?.description || 'MINIMALIST DESIGN'}
              </p>
            </div>

            {/* Product Showcase Section */}
            <div 
              className="py-4 bg-cover bg-center bg-no-repeat h-28 flex items-center"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="w-full px-4">
                <div className="flex items-center justify-center">
                  {getImage(0) && (
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-2 shadow-lg max-w-12 max-h-12">
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
              className="px-3 py-3 bg-gradient-to-b from-transparent to-black/5 h-24"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="text-center">
                <h2 className="text-[8px] font-bold text-slate-900 mb-1 leading-tight">
                  {activeCampaignResults?.banner_ads?.[0]?.headline || 'Premium wireless headphones with a sleek ivory finish'}
                </h2>
                
                <p className="text-[6px] text-slate-600 leading-relaxed mb-2 line-clamp-2">
                  {activeCampaignResults?.email_copy?.body?.substring(0, 80) || 'Experience high-quality audio with stylish over-ear wireless headphones featuring advanced noise isolation.'}
                </p>
                
                <div className="bg-slate-900 hover:bg-slate-800 text-white text-[5px] px-2 py-1 rounded-full inline-block shadow-lg">
                  {activeCampaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/90 backdrop-blur-sm py-1 text-center h-8 flex items-center justify-center">
              <p className="text-[4px] text-slate-300">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Catalog Enrichment Card - Matching campaign card styling */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer"
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Product Enrichment</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
          </div>
        </div>
        <CardContent className="p-2">
          <div className="h-80 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
            {/* Catalog Preview Layout */}
            <div className="h-full bg-white">
              {/* Header */}
              <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
                  <div className="text-[6px] text-gray-500">catalog.yoursite.com</div>
                </div>
              </div>

              {/* Product Display */}
              <div className="h-full p-3 space-y-2">
                {/* Product Image Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-2 rounded overflow-hidden" style={{height: '120px'}}>
                  <div className="flex items-center h-full gap-2">
                    {/* Product Image */}
                    <div className="w-20 h-full flex-shrink-0 bg-white rounded border overflow-hidden">
                      {uploadedImage && (
                        <OptimizedImage
                          src={uploadedImage}
                          alt="Product"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-1">
                      <div className="bg-primary/10 text-primary text-[5px] px-1 py-0.5 rounded-full w-fit">
                        {catalogResults?.product_category || 'Electronics'}
                      </div>
                      <h3 className="text-[8px] font-bold text-gray-900 line-clamp-2">
                        {catalogResults?.product_title || catalogResults?.title || 'Premium Product'}
                      </h3>
                      <p className="text-[6px] text-gray-600 line-clamp-2">
                        {catalogResults?.description?.substring(0, 80) || 'Enhanced product description with SEO optimization...'}
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="text-[6px] font-bold text-gray-900">★★★★★</div>
                        <div className="text-[5px] text-gray-500">(4.8)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="bg-white border border-gray-200 p-2 rounded" style={{height: '80px'}}>
                  <h4 className="text-[7px] font-semibold text-gray-900 mb-1">Key Features</h4>
                  <div className="space-y-1">
                    {catalogResults?.features?.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <span className="text-[6px] text-gray-700">{feature}</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span className="text-[6px] text-gray-700">Premium Quality Materials</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span className="text-[6px] text-gray-700">Advanced Technology</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span className="text-[6px] text-gray-700">Customer Satisfaction</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="bg-gray-50 p-2 rounded" style={{height: '40px'}}>
                  <h4 className="text-[6px] font-semibold text-gray-900 mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {catalogResults?.tags?.slice(0, 4).map((tag: string, index: number) => (
                      <span key={index} className="bg-white text-gray-700 text-[5px] px-1 py-0.5 rounded border text-center">
                        {tag}
                      </span>
                    )) || (
                      <>
                        <span className="bg-white text-gray-700 text-[5px] px-1 py-0.5 rounded border">Premium</span>
                        <span className="bg-white text-gray-700 text-[5px] px-1 py-0.5 rounded border">Quality</span>
                        <span className="bg-white text-gray-700 text-[5px] px-1 py-0.5 rounded border">Modern</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Platform Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[5px] px-1 py-0.5 rounded backdrop-blur-sm">
                  {catalogResults?.platform || 'E-commerce'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Details Card - Matching campaign card styling */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-sm hover:shadow-sm transition-all duration-smooth cursor-pointer"
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Content Analysis</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">SEO</span>
          </div>
        </div>
        <CardContent className="p-2">
          <div className="space-y-4">
            {/* Platform & Tone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 p-3 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Platform</div>
                <div className="text-sm font-semibold">{catalogResults?.platform || 'E-commerce'}</div>
              </div>
              <div className="bg-white/80 p-3 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Tone</div>
                <div className="text-sm font-semibold">{catalogResults?.tone || 'Professional'}</div>
              </div>
            </div>

            {/* Description */}
            {catalogResults?.description && (
              <div className="bg-white/80 p-3 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-2">SEO Description</div>
                <div className="text-sm text-gray-700 line-clamp-4">{catalogResults.description}</div>
              </div>
            )}

            {/* Tags */}
            {catalogResults?.tags && catalogResults.tags.length > 0 && (
              <div className="bg-white/80 p-3 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-2">Keywords & Tags</div>
                <div className="flex flex-wrap gap-1">
                  {catalogResults.tags.slice(0, 8).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {catalogResults?.product_category && (
              <div className="bg-white/80 p-3 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Product Category</div>
                <div className="text-sm font-semibold">{catalogResults.product_category}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedGallery;