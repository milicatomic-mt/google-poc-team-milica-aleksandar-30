import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RibbedSphere from '@/components/RibbedSphere';
import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationResponse } from '@/types/api';

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, campaignResults, campaignId } = location.state || {};
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedCampaignResults, setFetchedCampaignResults] = useState<CampaignCreationResponse | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Fetch campaign results if not provided but campaignId is available
  useEffect(() => {
    const fetchCampaignResults = async () => {
      if (!campaignResults && campaignId && !isLoadingResults) {
        setIsLoadingResults(true);
        try {
          const { data, error } = await supabase
            .from('campaign_results')
            .select('result, generated_images')
            .eq('id', campaignId)
            .single();

          if (error) {
            console.error('Error fetching campaign results:', error);
          } else if (data?.result && Object.keys(data.result).length > 0) {
            const genImgs = Array.isArray(data.generated_images)
              ? (data.generated_images as CampaignCreationResponse['generated_images'])
              : [];
            const merged = { ...(data.result as CampaignCreationResponse), generated_images: genImgs };
            setFetchedCampaignResults(merged);
          }
        } catch (error) {
          console.error('Error fetching campaign results:', error);
        } finally {
          setIsLoadingResults(false);
        }
      }
    };

    fetchCampaignResults();
  }, [campaignResults, campaignId]); // Removed isLoadingResults from dependencies

  // Use either passed campaignResults or fetched results
  const activeCampaignResults = campaignResults || fetchedCampaignResults;

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenCategory = (category: string) => {
    setSelectedSection(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  const renderModalContent = () => {
    if (!activeCampaignResults || !selectedSection) return null;

    // Get generated images from campaign results
    const generatedImages = activeCampaignResults.generated_images || [];

    switch (selectedSection) {
      case 'Banner Ads':
        return (
          <div className="space-y-8">
            {/* Generated Images Section */}
            {generatedImages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">AI Generated Related Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={img.url} 
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = uploadedImage || '';
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-6"></div>
              </div>
            )}

            {/* Banner Ad Formats */}
            <div className="space-y-6">
              <h4 className="font-semibold text-lg">Banner Ad Formats</h4>
              
              {/* Medium Rectangle 300x250 - Most Popular */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold">Medium Rectangle</h5>
                  <Badge variant="outline" className="text-xs">300×250px</Badge>
                  <Badge className="text-xs">Most Popular</Badge>
                </div>
                <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-lg" style={{ width: '300px', height: '250px' }}>
                  <div className="relative h-full flex">
                    {/* Left side - Content */}
                    <div className="relative flex-1 p-4 flex flex-col justify-between bg-gradient-to-br from-background/95 to-muted/40">
                      <div className="space-y-2">
                        <h6 className="text-sm font-bold text-foreground leading-tight">{activeCampaignResults.banner_ads?.[0]?.headline || 'Transform Your Brand'}</h6>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">Discover innovative solutions</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                        <Button size="sm" className="text-xs font-semibold px-3 py-1.5">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Learn More'}
                        </Button>
                      </div>
                    </div>
                    {/* Right side - Image */}
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <div className="w-24 relative">
                        <img src={generatedImages[0]?.url || uploadedImage} alt="Campaign product" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/10"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leaderboard 728x90 - Header/Footer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold">Leaderboard</h5>
                  <Badge variant="outline" className="text-xs">728×90px</Badge>
                  <Badge variant="secondary" className="text-xs">Header/Footer</Badge>
                </div>
                <div className="overflow-x-auto">
                  <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-r from-background to-muted/20 shadow-lg" style={{ width: '728px', height: '90px', minWidth: '728px' }}>
                    <div className="relative h-full flex items-center">
                      <div className="flex items-center gap-4 flex-1 px-6">
                        <div className="w-2 h-12 rounded-full bg-primary"></div>
                        {(generatedImages[1]?.url || uploadedImage) && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                            <img src={generatedImages[1]?.url || uploadedImage} alt="Campaign product" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="space-y-1 flex-1">
                          <h6 className="text-base font-bold text-foreground">{activeCampaignResults.banner_ads?.[0]?.headline || 'Transform Your Brand Today'}</h6>
                          <p className="text-xs text-muted-foreground font-medium truncate max-w-md">Discover innovative solutions that drive results</p>
                        </div>
                      </div>
                      <div className="px-6">
                        <Button className="text-xs font-semibold px-6 py-2">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Get Started'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Leaderboard 320x50 - Mobile Optimized */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold">Mobile Leaderboard</h5>
                  <Badge variant="outline" className="text-xs">320×50px</Badge>
                  <Badge variant="secondary" className="text-xs">Mobile</Badge>
                </div>
                <div className="overflow-hidden rounded-lg border-2 border-border bg-gradient-to-r from-background to-muted/20 shadow-lg" style={{ width: '320px', height: '50px' }}>
                  <div className="relative h-full flex items-center">
                    <div className="flex items-center gap-2 flex-1 px-3 min-w-0">
                      <div className="w-1 h-6 rounded-full bg-primary"></div>
                      {(generatedImages[2]?.url || uploadedImage) && (
                        <div className="w-8 h-8 rounded overflow-hidden">
                          <img src={generatedImages[2]?.url || uploadedImage} alt="Campaign product" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h6 className="text-xs font-bold text-foreground truncate">{activeCampaignResults.banner_ads?.[0]?.headline || 'Transform Your Brand'}</h6>
                    </div>
                    <div className="px-3">
                      <Button size="sm" className="text-xs font-semibold px-3 py-1 shrink-0">
                        {activeCampaignResults.banner_ads?.[0]?.cta || 'Try Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Web Creative':
        return (
          <div className="space-y-6">
            {/* Generated Images Section */}
            {generatedImages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">AI Generated Related Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedImages.map((img, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={img.url} 
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = uploadedImage || '';
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{img.prompt}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-6"></div>
              </div>
            )}

            {/* Landing Page Preview */}
            <div className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-2xl">
              <div className="w-full max-w-4xl mx-auto">
                {/* Hero Section */}
                <section className="relative min-h-[600px] bg-gradient-to-br from-background to-primary/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10"></div>
                  
                  <div className="relative z-10 container mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
                    {/* Left Column - Content */}
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          ✨ New Product Launch
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                          {activeCampaignResults.landing_page_concept?.hero_text || 'Transform Your Experience'}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                          {activeCampaignResults.landing_page_concept?.sub_text || 'Discover innovative solutions that drive exceptional results'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="text-lg px-8 py-4 shadow-lg">
                          {activeCampaignResults.landing_page_concept?.cta || 'Get Started'}
                        </Button>
                        <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                          Learn More
                        </Button>
                      </div>
                      
                      {/* Trust Indicators */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Free shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>30-day returns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Premium quality</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Product Image */}
                    <div className="relative">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
                          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-border">
                            <img src={generatedImages[0]?.url || uploadedImage} alt="Product showcase" className="w-full h-auto max-h-96 object-contain rounded-xl" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        );

      case 'Video Scripts':
        return (
          <div className="space-y-8">
            {activeCampaignResults.video_scripts?.map((script, index) => (
              <div key={index} className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-lg">
                {/* Video Script Preview */}
                <div className="bg-black text-white relative">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video">
                    {uploadedImage && (
                      <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="text-xs font-semibold bg-primary text-white">
                        {script.platform}
                      </Badge>
                    </div>
                    
                    {/* Duration */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      0:30
                    </div>
                  </div>
                  
                  {/* Video Title Bar */}
                  <div className="p-4 bg-gray-900">
                    <h3 className="font-bold text-lg mb-2">
                      {activeCampaignResults.banner_ads?.[0]?.headline || 'Transform Your Experience'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>• 1.2M views</span>
                      <span>• 24K likes</span>
                      <span>• 3 hours ago</span>
                    </div>
                  </div>
                </div>
                
                {/* Script Content */}
                <div className="p-6 space-y-6">
                  {/* Script Header */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <h4 className="font-semibold text-lg">Video Script</h4>
                    <Badge variant="outline" className="text-xs">
                      {script.platform} Format
                    </Badge>
                  </div>
                  
                  {/* Script Breakdown */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">1</div>
                        <span className="font-semibold text-sm text-gray-600">Opening Hook (0-3s)</span>
                      </div>
                      <p className="text-sm font-semibold mb-2">
                        "{activeCampaignResults.banner_ads?.[0]?.headline || 'Ready to transform your experience?'}"
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Visual:</strong> Close-up of product with dynamic zoom
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">2</div>
                        <span className="font-semibold text-sm text-gray-600">Main Content (3-25s)</span>
                      </div>
                      <p className="text-sm mb-2 whitespace-pre-wrap">
                        {script.script || "Discover the perfect solution that transforms your daily experience with innovative features designed for modern life."}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Visual:</strong> Product demonstration with key features highlighted
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">3</div>
                        <span className="font-semibold text-sm text-gray-600">Call to Action (25-30s)</span>
                      </div>
                      <p className="text-sm font-semibold mb-2">
                        "{activeCampaignResults.banner_ads?.[0]?.cta || 'Get Started Today'} - Limited time offer!"
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Visual:</strong> Product showcase with animated CTA button
                      </p>
                    </div>
                  </div>
                  
                  {/* Technical Notes */}
                  <div className="border-t pt-4 mt-6">
                    <h5 className="font-medium text-sm mb-3 text-gray-700">Production Notes</h5>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <p className="font-medium mb-1">Duration:</p>
                        <p>30 seconds</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Format:</p>
                        <p>{script.platform === 'TikTok' ? '9:16 Vertical' : '16:9 Landscape'}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Music:</p>
                        <p>Upbeat, energetic</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Captions:</p>
                        <p>Auto-generated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Email Templates':
        return (
          <div className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-xl max-w-2xl mx-auto">
            {/* Email Template Preview */}
            <div className="bg-white text-gray-900" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
              
              {/* Email Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Subject: {activeCampaignResults.email_copy?.subject || 'Transform Your Experience Today'}
                  </div>
                  <div className="text-xs text-gray-500">
                    View in browser
                  </div>
                </div>
              </div>

              {/* Hero Section with Image */}
              <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
                {uploadedImage && (
                  <div className="w-full max-w-sm mx-auto mb-6">
                    <img src={uploadedImage} alt="Featured product" className="w-full h-auto rounded-lg shadow-md" />
                  </div>
                )}
                
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {activeCampaignResults.landing_page_concept?.hero_text || 'Transform Your Experience'}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-md mx-auto">
                    {activeCampaignResults.landing_page_concept?.sub_text || 'Discover innovative solutions designed for you'}
                  </p>
                  
                  <div className="pt-4">
                    <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                      {activeCampaignResults.landing_page_concept?.cta || 'Shop Now'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Email Body Content */}
              <div className="p-8 space-y-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {activeCampaignResults.email_copy?.body || 'We are excited to share our latest innovation that will transform how you experience our products. This exclusive launch features cutting-edge technology and premium design that sets new standards in the industry.'}
                  </p>
                </div>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-sm">Premium Quality</h4>
                    <p className="text-xs text-gray-600">Exceptional materials</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-secondary rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-sm">Fast Delivery</h4>
                    <p className="text-xs text-gray-600">Free 2-day shipping</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-2"></div>
                    <h4 className="font-semibold text-sm">Money Back</h4>
                    <p className="text-xs text-gray-600">30-day guarantee</p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 p-6 text-center border-t">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Follow us on social media for updates</p>
                  <div className="flex justify-center gap-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    © 2024 Your Brand. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p>No content available for this section.</p>;
    }
  };

  const renderImageWithVariation = (src: string | null, alt: string, variation: 'original' | 'light' | 'medium' | 'dark' = 'original') => {
    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          {alt}
        </div>
      );
    }

    const opacityMap = {
      original: 1,
      light: 0.8,
      medium: 0.6,
      dark: 0.4
    };

    const filterMap = {
      original: '',
      light: 'brightness(1.2) contrast(0.9)',
      medium: 'saturate(1.2) contrast(1.1)',
      dark: 'brightness(0.8) sepia(0.2)'
    };
    
    return (
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
        style={{ 
          opacity: opacityMap[variation],
          filter: filterMap[variation]
        }}
      />
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex min-h-screen flex-col overflow-y-auto">
        {/* Header */}
        <header className="container-padding pt-12 relative">
          <div className="absolute top-12 left-8">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Creative Assets Preview</h1>
            </div>
          </div>
          
          <div className="absolute top-12 right-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3">
                  <X className="h-4 w-4 text-black" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exit to Homepage?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to exit? Your generated content preview will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                  <Button onClick={handleStartOver} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Back Button */}
        <div className="fixed top-1/2 left-8 transform -translate-y-1/2 z-20">
          <Button 
            variant="secondary" 
            onClick={handleBack}
            className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </div>

        {/* Title */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Creative Assets Generated
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            Your comprehensive marketing campaign is ready
          </p>
        </div>

        {/* Main Content */}
        <main className="flex-1 container-padding pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Banner Ads Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Banner Ads</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">4</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Banner Ads')}
                    className="px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 h-64">
                    {/* Top Left - Leaderboard Banner */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col">
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 overflow-hidden">
                            {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground leading-tight">Transform Your Experience</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">Premium solutions for modern needs</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="bg-black text-white text-[9px] px-2 py-1 rounded inline-block">
                            Get Started
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Square Banner */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col">
                      <div className="w-full aspect-square bg-primary/20 rounded mb-2 overflow-hidden">
                        {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                      </div>
                      <div className="text-center">
                        <h4 className="text-[10px] font-bold text-foreground mb-1">Premium Collection</h4>
                        <div className="bg-black text-white text-[8px] px-2 py-1 rounded">
                          Shop Now
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Mobile Banner */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-primary/20 flex-shrink-0 overflow-hidden">
                          {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] font-semibold text-foreground">Limited Offer</h4>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] text-muted-foreground">Save up to 50% today</p>
                        <div className="bg-black text-white text-[8px] px-2 py-1 rounded text-center">
                          Claim Deal
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - Video Banner */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 overflow-hidden relative">
                      <div className="w-full h-full bg-primary/20 rounded flex items-center justify-center overflow-hidden">
                        {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-primary border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/80 text-white text-[8px] px-2 py-1 rounded text-center backdrop-blur-sm">
                          Watch Demo
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Web Creative Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Web Creative</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">1</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Web Creative')}
                    className="px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageWithVariation(uploadedImage, 'Web creative', 'original')}
                  </div>
                </CardContent>
              </Card>

              {/* Video Scripts Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Video Scripts</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">1</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Video Scripts')}
                    className="px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageWithVariation(uploadedImage, 'Video script preview', 'original')}
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">2</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Email Templates')}
                    className="px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3 h-64">
                    {/* Two variations for email templates */}
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Email template - original', 'original')}
                    </div>
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Email template variation', 'light')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-foreground hover:bg-white/20 rounded-full px-8"
              >
                Create New Campaign
              </Button>
              <Button 
                onClick={() => navigate('/campaign-results', { state: location.state })}
                size="lg"
                className="rounded-full px-8"
              >
                View Full Results
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Campaign Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSection} Results</DialogTitle>
            <DialogDescription>
              Generated campaign content for {selectedSection?.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderModalContent()}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal} className="rounded-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewResultsScreen;