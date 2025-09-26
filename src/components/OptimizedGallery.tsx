import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'campaigns' | 'catalogs'>('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedItemForDownload, setSelectedItemForDownload] = useState<any>(null);
  const { preloadImages, getCachedImageUrl } = useImageCache();

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
    // Save current scroll position before navigating
    try {
      sessionStorage.setItem('gallery-scroll-position', String(window.scrollY));
      sessionStorage.setItem('gallery-restore', '1');
    } catch {}
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
                className="hover:bg-muted/80 shadow-sm"
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
              {/* Removed download button */}
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
  
  // Debug: Check what data we actually have
  console.log('🏗️ OptimizedGallery - campaignResults:', campaignResults);
  console.log('🏗️ OptimizedGallery - activeCampaignResults:', activeCampaignResults);
  console.log('🏗️ OptimizedGallery - banner_ads:', activeCampaignResults?.banner_ads);
  console.log('🏗️ OptimizedGallery - first banner:', activeCampaignResults?.banner_ads?.[0]);
  
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
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Banner Ads</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">4</span>
          </div>
          {/* Removed download button from banner ads section */}
        </div>
        <CardContent className="p-4">
          <div className="h-72 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
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
                  <div className="text-[6px] text-gray-500">https://yourads.com</div>
                </div>
              </div>

              {/* Banner Ads Content - Mini versions of actual layouts */}
              <div className="h-full p-2 pb-2 overflow-hidden space-y-1">
                {/* Leaderboard Banner (mini) */}
                <div className="bg-gradient-to-r from-slate-200 to-stone-200 overflow-hidden relative opacity-100" style={{height: '24px', borderRadius: '1px'}}>
                  <div className="flex items-center h-full">
                    {/* Left - Person Image */}
                    <div className="w-6 h-full relative overflow-hidden flex-shrink-0">
                      {getImage(0) && (
                        <OptimizedImage
                          src={getImage(0)}
                          alt="Person with headphones" 
                          className="w-full h-full object-cover"
                          priority={true}
                        />
                      )}
                    </div>
                    {/* Middle - Text Content */}
                     <div className="flex-1 px-2">
               <h3 className="text-gray-900 text-[6px] font-bold uppercase leading-none">
                 {campaignResults?.banner_ads?.[0]?.headline || 'Premium Sound'}
               </h3>
               <p className="text-gray-700 text-[4px] uppercase leading-none">
                 Minimalist Design
               </p>
               <p className="text-gray-600 text-[3px] font-semibold leading-none">
                 SMASH THE COMPETITION<br/>
                 WITH 30% DISCOUNT
               </p>
             </div>
             {/* Right - CTA Button */}
              <div className="pr-1 flex-shrink-0">
                <button className="bg-white/90 text-gray-900 text-[4px] px-1 py-0.5 font-semibold border border-gray-200 leading-none">
                  {campaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
                </button>
                      </div>
                  </div>
                </div>

                {/* Bottom Row - Half Page and Medium Rectangle (mini) */}
                <div className="grid grid-cols-2 gap-1">
                  {/* Half Page Banner (mini) */}
                  <div className="bg-gradient-to-b from-slate-200 to-stone-200 overflow-hidden relative opacity-100" style={{height: '36px', borderRadius: '1px'}}>
                    {/* Top - Person Image */}
                    <div className="h-6 relative overflow-hidden">
                      {getImage(0) && (
                        <OptimizedImage
                          src={getImage(0)}
                          alt="Person with headphones" 
                          className="w-full h-full object-cover"
                          priority={true}
                        />
                      )}
                    </div>
                    {/* Bottom - Dark Section with Text */}
                     <div className="h-3 bg-black text-white flex flex-col justify-center px-1 text-center">
                      <h3 className="text-white text-[4px] font-bold uppercase leading-none">
                        {campaignResults?.banner_ads?.[0]?.headline || 'Premium Sound'}
                      </h3>
                      <p className="text-white/90 text-[3px] uppercase leading-none">
                        Minimalist Design
                      </p>
                      <p className="text-white text-[3px] font-semibold leading-none">
                        SMASH THE COMPETITION WITH 30% DISCOUNT
                      </p>
                     </div>
                   </div>

                  {/* Medium Rectangle (mini) */}
                  <div className="bg-gradient-to-br from-slate-200 to-stone-200 overflow-hidden relative opacity-100" style={{height: '36px', borderRadius: '1px'}}>
                    <div className="flex items-center h-full">
                      {/* Left - Product Image */}
                      <div className="w-4 h-full relative overflow-hidden flex-shrink-0">
                        {(getImage(1) || getImage(0)) && (
                          <OptimizedImage
                            src={getImage(1) || getImage(0)}
                            alt="Headphones product" 
                            className="w-full h-full object-cover"
                            priority={true}
                          />
                        )}
                      </div>
                      {/* Right - Text Content */}
                       <div className="flex-1 px-1">
                        <h3 className="text-gray-900 text-[5px] font-bold uppercase leading-none">
                          {campaignResults?.banner_ads?.[0]?.headline || 'Premium Sound'}
                        </h3>
                        <p className="text-gray-700 text-[4px] uppercase leading-none">
                          Minimalist Design
                        </p>
                        <p className="text-gray-600 text-[3px] font-semibold leading-none">
                          30% DISCOUNT
                        </p>
                        <button className="bg-gray-900 text-white text-[3px] px-1 py-0.5 font-semibold mt-0.5 leading-none">
                          {campaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
                        </button>
                      </div>
                    </div>
                  </div>
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
          {/* Removed download button from web creative section */}
        </div>
        <CardContent className="p-4">
          <div className="h-80 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
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

              {/* Web Creative Preview - Matching WebCreativePreview design */}
              <div className="h-full relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  {getImage(0) ? (
                    <OptimizedImage
                      src={getImage(0)} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  )}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                </div>

                {/* Hero Section - Matching WebCreativePreview layout */}
                <div className="relative z-10 py-4 px-3">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-[3px] font-medium bg-primary/10 text-primary border border-primary/20">
                        ✨ New Launch  
                      </div>
                      <h1 className="text-[7px] font-bold text-white leading-tight">
                        {activeCampaignResults?.landing_page_concept?.hero_text || 
                         activeCampaignResults?.banner_ads?.[0]?.headline || 
                         'Transform Your Experience Today'}
                      </h1>
                      <p className="text-[4px] text-white/80 leading-relaxed">
                        {activeCampaignResults?.landing_page_concept?.sub_text || 
                         'Discover innovative solutions that drive exceptional results for your business.'}
                      </p>
                      <div className="flex gap-1">
                        <button className="bg-primary text-white text-[3px] px-1 py-0.5 rounded font-medium">
                          {activeCampaignResults?.landing_page_concept?.cta || 
                           activeCampaignResults?.banner_ads?.[0]?.cta || 
                           'Get Started Now'}
                        </button>
                        <button className="border border-white/30 text-white text-[3px] px-1 py-0.5 rounded">
                          Learn More
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      {getImage(0) && (
                        <OptimizedImage 
                          src={getImage(0)} 
                          alt="Product showcase"
                          className="w-full h-10 object-cover rounded shadow-lg"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Highlights Section */}
                <div className="relative z-10 px-3 py-2">
                  <h2 className="text-[5px] font-bold text-white mb-1">Product Highlights</h2>
                  <div className="grid grid-cols-2 gap-1 text-white/80">
                    <div className="text-[4px]">• Premium Quality Materials</div>
                    <div className="text-[4px]">• Advanced Technology</div>
                    <div className="text-[4px]">• Modern Design</div>
                    <div className="text-[4px]">• Expert Craftsmanship</div>
                  </div>
                </div>

                {/* Testimonials Section */}
                <div className="relative z-10 px-3 py-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded p-1.5">
                    <h3 className="text-[4px] font-bold text-white mb-0.5">What Our Customers Say</h3>
                    <p className="text-[3px] text-white/80 italic">
                      "This product has transformed my daily experience. Highly recommend!"
                    </p>
                    <p className="text-[3px] text-white/60 mt-0.5">- Sarah J., Marketing Manager</p>
                  </div>
                </div>

                {/* Call to Action Section */}
                <div className="absolute bottom-4 left-3 right-3 z-10">
                  <div className="bg-primary/90 backdrop-blur-sm rounded-lg p-2 text-center">
                    <div className="text-[4px] text-white font-bold mb-0.5">Special Offer</div>
                    <div className="text-[3px] text-white/90 mb-1">Get 30% off your first order</div>
                    <button className="bg-white text-primary text-[3px] px-2 py-0.5 rounded font-medium w-full">
                      Claim Offer Now
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
                  <div className="px-2 py-0.5">
                    <div className="text-[3px] text-white/70 text-center">© 2024 Brand. All rights reserved.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Scripts Card - Exact copy from PreviewResultsScreen */}
      <Card 
        className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
        onClick={() => onViewDetails('Video Scripts')}
      >
        <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
          <div className="flex items-center space-x-2">
            <h3 className="text-foreground font-medium">Video Scripts</h3>
            <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
          </div>
          {/* Removed download button from video scripts section */}
        </div>
        <CardContent className="p-4">
          <div className="h-80 bg-black overflow-hidden relative" style={{borderRadius: '1px'}}>
            {/* Video Preview - Matching VideoScriptsPreview design */}
            <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10">
              {getImage(0) ? (
                <OptimizedImage 
                  src={getImage(0)} 
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                </div>
              </div>
              
              {/* Script Overlays */}
              <div className="absolute top-2 left-2 right-2">
                <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-[6px] text-white font-medium">TikTok Script</div>
                  <div className="text-[4px] text-white/80">
                    {activeCampaignResults?.video_scripts?.[0]?.platform || 'TikTok'}: {activeCampaignResults?.video_scripts?.[0]?.script?.substring(0, 50) || 'Hook: Transform your daily routine...'}
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-[6px] text-white font-medium">Instagram Script</div>
                  <div className="text-[4px] text-white/80">
                    {activeCampaignResults?.video_scripts?.[1]?.platform || 'Instagram'}: {activeCampaignResults?.video_scripts?.[1]?.script?.substring(0, 30) || 'CTA: Swipe up to shop now!'}
                  </div>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute top-2 right-2 bg-black/80 text-white text-[5px] px-1 py-0.5 rounded backdrop-blur-sm">
                0:30
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
          {/* Removed download button from email templates section */}
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
              <h1 className="text-xs font-bold text-white drop-shadow-lg">
                {activeCampaignResults?.email_copy?.subject || 'Premium sound'}
              </h1>
              <p className="text-[8px] text-white/90 uppercase tracking-wider drop-shadow">
                {activeCampaignResults?.banner_ads?.[0]?.description || 'MINIMALIST DESIGN'}
              </p>
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
                  {activeCampaignResults?.banner_ads?.[0]?.headline || 'Premium wireless headphones with a sleek ivory finish'}
                </h2>
                
                <p className="text-[7px] text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  {activeCampaignResults?.email_copy?.body?.substring(0, 100) || 'Experience high-quality audio with stylish over-ear wireless headphones featuring advanced noise isolation.'}
                </p>
                
                <div className="bg-slate-900 hover:bg-slate-800 text-white text-[6px] px-3 py-1 rounded-full inline-block shadow-lg">
                  {activeCampaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
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