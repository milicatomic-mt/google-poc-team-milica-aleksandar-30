import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Play, Download, Edit, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogOverlay,
  AlertDialogPortal,
} from '@/components/ui/alert-dialog';
import RibbedSphere from '@/components/RibbedSphere';
import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationResponse } from '@/types/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import QRDownloadModal from '@/components/QRDownloadModal';

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, campaignResults, campaignId } = location.state || {};
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedCampaignResults, setFetchedCampaignResults] = useState<CampaignCreationResponse | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(!!campaignResults);

  // Fetch campaign results if not provided but campaignId is available
  useEffect(() => {
    const fetchCampaignResults = async () => {
      if (campaignId && !isLoadingResults) {
        setIsLoadingResults(true);
        try {
          const { data, error } = await supabase
            .from('campaign_results')
            .select('result, generated_images, generated_video_url')
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
            setGeneratedVideoUrl((data as any).generated_video_url || null);
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

  // Debug: Log the actual landing page structure
  useEffect(() => {
    if (activeCampaignResults?.landing_page_concept) {
      console.log('🏗️ Landing Page Concept Structure:', activeCampaignResults.landing_page_concept);
      console.log('🏗️ Available fields:', Object.keys(activeCampaignResults.landing_page_concept));
    }
  }, [activeCampaignResults]);

  // Create consistent image mapping for preview cards and detail pages
  const imageMapping = activeCampaignResults?.generated_images ? {
    image_0: activeCampaignResults.generated_images[0]?.url || null,
    image_1: activeCampaignResults.generated_images[1]?.url || null,
    image_2: activeCampaignResults.generated_images[2]?.url || null,
    image_3: activeCampaignResults.generated_images[3]?.url || null,
  } : {};

  // Set content ready state when we have campaign results
  useEffect(() => {
    if (activeCampaignResults) {
      // Add a small delay to ensure images are loaded
      const timer = setTimeout(() => {
        setIsContentReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeCampaignResults]);

  const handleBack = () => {
    // Navigate to campaign-prompt for editing with campaign data
    if (campaignId) {
      navigate('/campaign-prompt', {
        state: {
          editMode: true,
          campaignId: campaignId,
          uploadedImage: uploadedImage
        }
      });
    } else {
      navigate(-1);
    }
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
  };

  // Modal handlers
  const handleOpenCategory = (category: string) => {
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
          campaignResults: {
            ...activeCampaignResults,
            generated_video_url: generatedVideoUrl 
          }, 
          uploadedImage, 
          campaignId, 
          imageMapping,
          returnTo: '/preview-results' // Ensure it returns to preview results from the normal flow
        }
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderModalContent = () => {
    if (!activeCampaignResults || !selectedSection) return null;

    // Get generated images from campaign results
    const generatedImages = activeCampaignResults.generated_images || [];

    switch (selectedSection) {

      case 'Banner Ads':
        return (
          <div className="overflow-hidden bg-white shadow-2xl rounded-lg">
            <div>
              {/* Grid layout matching reference image */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                
                {/* Left Banner */}
                <div 
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: (generatedImages[0]?.url || uploadedImage) 
                      ? `url(${generatedImages[0]?.url || uploadedImage})` 
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold uppercase tracking-wide">
                      {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                    </h3>
                    <p className="text-sm opacity-90 uppercase tracking-wider mb-2">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-xs opacity-75 mb-2">
                      WIRELESS BLUETOOTH CONNECTION<br />
                      WITH BASS RESONANCE
                    </p>
                    <Button size="sm" className="bg-white text-black hover:bg-gray-100 text-xs font-semibold px-4">
                      {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                    </Button>
                  </div>
                </div>

                {/* Right Banner */}
                <div 
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: (generatedImages[1]?.url || uploadedImage) 
                      ? `url(${generatedImages[1]?.url || uploadedImage})` 
                      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold uppercase tracking-wide">
                      {activeCampaignResults.banner_ads?.[1]?.headline || 'PREMIUM SOUND'}
                    </h3>
                    <p className="text-sm opacity-90 uppercase tracking-wider mb-2">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-xs opacity-75 mb-2">
                      WIRELESS BLUETOOTH CONNECTION<br />
                      WITH BASS RESONANCE
                    </p>
                    <Button size="sm" className="bg-black text-white hover:bg-gray-900 text-xs font-semibold px-4">
                      {activeCampaignResults.banner_ads?.[1]?.cta || 'Shop Now'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Banner */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {(generatedImages[2]?.url || uploadedImage) && (
                  <img 
                    src={generatedImages[2]?.url || uploadedImage} 
                    alt="Product" 
                    className="w-16 h-16 object-contain rounded-lg bg-white p-2" 
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                    {activeCampaignResults.banner_ads?.[2]?.headline || 'PREMIUM SOUND'}
                  </h3>
                  <p className="text-sm text-gray-600 uppercase tracking-wider">
                    MINIMALIST DESIGN
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    WIRELESS BLUETOOTH CONNECTION WITH BASS RESONANCE
                  </p>
                </div>
                <Button className="bg-black text-white hover:bg-gray-900 text-sm font-semibold px-6 py-2 rounded-full">
                  {activeCampaignResults.banner_ads?.[2]?.cta || 'Shop Now'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'Video Scripts':
        const firstScript = activeCampaignResults.video_scripts?.[0];
        return (
          <div className="max-w-6xl mx-auto">
            {/* Clean, minimal layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Side - Video Preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border border-gray-100 overflow-hidden bg-white">
                  {/* Video Preview */}
                  <div className="bg-gray-50 relative">
                    <div className="relative aspect-[9/16]">
                      {generatedVideoUrl ? (
                        <VideoPlayer
                          videoUrl={generatedVideoUrl}
                          posterUrl={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage}
                          title="Generated Campaign Video"
                          className="w-full h-full rounded-lg"
                        />
                      ) : (
                        <>
                          {/* Video Thumbnail */}
                          {activeCampaignResults?.generated_images?.[0]?.url ? (
                            <img src={activeCampaignResults.generated_images[0].url} alt="Video thumbnail" className="w-full h-full object-cover" />
                          ) : uploadedImage ? (
                            <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                          ) : null}
                          <div className="absolute inset-0 bg-black/5"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center border border-black/10">
                              <Play className="w-5 h-5 text-black/60 ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            0:15
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Platform Info - Simplified */}
                <div className="bg-white border border-gray-100 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Optimized For</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="w-6 h-6 bg-gray-900 rounded text-white text-xs flex items-center justify-center font-medium">
                        T
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">TikTok</p>
                        <p className="text-xs text-gray-500">9:16 • 15-60s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="w-6 h-6 bg-gray-700 rounded text-white text-xs flex items-center justify-center font-medium">
                        IG
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">Instagram Reels</p>
                        <p className="text-xs text-gray-500">9:16 • 15-90s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="w-6 h-6 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-medium">
                        YT
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">YouTube Shorts</p>
                        <p className="text-xs text-gray-500">9:16 • 15-60s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center - Video Script Timeline */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-gray-100 p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Video Script</h4>
                    <p className="text-sm text-gray-500">Scene-by-scene breakdown</p>
                  </div>
                  
                  {/* Script Timeline - Clean minimal design */}
                  <div className="space-y-4">
                    {/* Hook */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                          1
                        </div>
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">Hook</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">0-3s</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            "{activeCampaignResults.banner_ads?.[0]?.headline || 'Stop scrolling! This will change everything...'}"
                          </p>
                          <p className="text-xs text-gray-500">
                            Visual: Quick product reveal with dramatic zoom
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Problem */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center font-medium">
                          2
                        </div>
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">Problem</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">3-6s</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            "Tired of [common problem]? You're not alone..."
                          </p>
                          <p className="text-xs text-gray-500">
                            Visual: Relatable scenario, quick cuts
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Solution */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center font-medium">
                          3
                        </div>
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">Solution</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">6-10s</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {firstScript?.script?.substring(0, 80) || "Here's how our product solves this perfectly..."}
                          </p>
                          <p className="text-xs text-gray-500">
                            Visual: Product in action, key features
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Proof */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center font-medium">
                          4
                        </div>
                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">Proof</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">10-13s</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            "Look at these results! Over 10,000 happy customers..."
                          </p>
                          <p className="text-xs text-gray-500">
                            Visual: Before/after, testimonials, stats
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-medium">
                          5
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">Call to Action</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">13-15s</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            "{activeCampaignResults.banner_ads?.[0]?.cta || 'Get yours now'} - Link in bio!"
                          </p>
                          <p className="text-xs text-gray-500">
                            Visual: Product close-up, animated CTA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Notes */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Production Notes</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-900">Format:</span>
                        <span>Vertical 9:16, mobile-first</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-900">Audio:</span>
                        <span>Trending sounds + clear voiceover</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-900">Text:</span>
                        <span>Large, readable fonts with high contrast</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-900">Pace:</span>
                        <span>Quick cuts, 1-2 seconds per shot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Email Templates':
        return (
          <div className="overflow-hidden bg-background shadow-2xl max-w-3xl mx-auto">
            {/* Email Template Preview - Match EmailTemplatesPreview.tsx */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header with Background Image */}
              <div 
                className="relative text-center py-12 bg-cover bg-center bg-no-repeat min-h-[200px] flex flex-col justify-center"
                style={{
                  backgroundImage: (imageMapping?.image_0 || uploadedImage) 
                    ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${imageMapping?.image_0 || uploadedImage})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Premium sound</h1>
                <p className="text-sm text-white/90 uppercase tracking-wider drop-shadow">MINIMALIST DESIGN</p>
              </div>

              {/* Product Showcase Section */}
              <div 
                className="py-8 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: (imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage) 
                    ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage})`
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                }}
              >
                <div className="container mx-auto px-6">
                  <div className="flex items-center justify-center">
                    {(imageMapping?.image_0 || uploadedImage) && (
                      <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 shadow-xl max-w-xs">
                        <img 
                          src={imageMapping?.image_0 || uploadedImage}
                          alt="Premium product"
                          className="w-full h-auto object-contain max-h-40"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className="container mx-auto px-6 py-8 bg-gradient-to-b from-transparent to-black/5">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Premium wireless headphones with a sleek ivory finish, designed for immersive sound and all-day comfort.
                  </h2>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {activeCampaignResults?.email_copy?.body || "Experience high-quality audio with these stylish over-ear wireless headphones. Featuring soft cushioned ear pads, a minimalist design, and advanced noise isolation, they're perfect for music, calls, or daily use."}
                  </p>
                  
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-2 rounded-full text-sm shadow-lg">
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-900/90 backdrop-blur-sm py-3 text-center">
                <p className="text-xs text-slate-300">
                  © 2024 Premium Sound. All rights reserved.
                </p>
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

  // Show loading screen until content is ready
  if (!isContentReady || !activeCampaignResults) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
        <video 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <RibbedSphere className="w-full h-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Preparing Your Campaign Results
          </h2>
          <p className="text-muted-foreground">
            Loading generated content and images...
          </p>
        </div>
      </div>
    );
  }

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
        <header className="container-padding pt-20 relative">
          <div className="w-full flex justify-between items-start px-8">
            {/* Left - Sphere and Text in 1 row */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12">
                <RibbedSphere className="w-full h-full" />
              </div>
              <div className="text-sm text-foreground font-semibold">
                Image to Campaign
              </div>
            </div>
            
            {/* Center - Title and Subtitle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Campaign Creative Preview
              </h2>
              <p className="text-lg text-muted-foreground">
                Your assets across channels at a glance
              </p>
              
              {/* Edit and Download buttons beneath title */}
              <div className="flex justify-center gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="tap-target focus-ring bg-white hover:bg-white/90 text-black hover:text-black border-white rounded-full px-6 py-2 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4 text-black" />
                  Edit
                </Button>
                <Button
                  onClick={handleOpenDownloadModal}
                  variant="default"
                  className="tap-target focus-ring bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Download All
                </Button>
              </div>
            </div>
            
            {/* Right - Close Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3 shadow-sm"
                >
                  <X className="h-4 w-4 text-black" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border-none shadow-lg max-w-md p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle>Exit to Homepage?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to exit? Any current selection will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartOver} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">Exit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
         </header>

        {/* Main Content */}
        <main className="flex-1 container-padding pt-40 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              

              {/* Banner Ads Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Banner Ads')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Banner Ads</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">4</span>
                  </div>
                  {/* Removed download button from banner ads section */}
                </div>
                <CardContent className="p-4">
                  <div className="h-80">
                    {/* Top Row - Two Square Banners */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Left Banner - Person with Headphones */}
                      <div className="aspect-square bg-gradient-to-br from-slate-200 to-gray-300 overflow-hidden relative" style={{borderRadius: '1px'}}>
                        {(imageMapping?.image_0 || uploadedImage) && (
                          <img 
                            src={imageMapping?.image_0 || uploadedImage} 
                            alt="Person with headphones" 
                            className="w-full h-full object-cover" 
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
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative" style={{borderRadius: '1px'}}>
                        {(imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage) && (
                          <img 
                            src={imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage} 
                            alt="Headphones product" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-200 to-gray-100 p-2">
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
                    <div className="bg-gradient-to-r from-slate-200 to-gray-200 overflow-hidden relative h-20" style={{borderRadius: '1px'}}>
                      <div className="flex items-center h-full">
                        {/* Left - Person Image */}
                        <div className="w-20 h-full relative overflow-hidden">
                          {(imageMapping?.image_0 || uploadedImage) && (
                            <img 
                              src={imageMapping?.image_0 || uploadedImage} 
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

              {/* Web Creative Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Web Creative')}
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

                      {/* Landing Page with Background Image */}
                      <div className="h-full relative overflow-hidden">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                           {activeCampaignResults?.generated_images?.[0]?.url ? (
                             <img 
                               src={activeCampaignResults.generated_images[0].url} 
                               alt="Background" 
                               className="w-full h-full object-cover"
                             />
                           ) : uploadedImage ? (
                            <img 
                              src={uploadedImage} 
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
                          {/* Campaign Badge - Using actual campaign data */}
                          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/80 backdrop-blur-md border border-primary/50 mb-2">
                            <div className="text-[5px] font-medium text-white">✨ New Launch</div>
                          </div>
                          
                          {/* Main Headline - Using actual campaign data */}
                          <h1 className="text-[10px] font-bold text-white leading-tight mb-2 max-w-28 drop-shadow-lg">
                            {activeCampaignResults?.landing_page_concept?.hero_text ||
                             activeCampaignResults?.banner_ads?.[0]?.headline || 
                             'Your Custom Headline'}
                          </h1>
                          
                          {/* Subtext - Using actual campaign data */}
                          <p className="text-[5px] text-white/90 leading-relaxed mb-2 max-w-24 drop-shadow-md">
                            {activeCampaignResults?.landing_page_concept?.sub_text ||
                             activeCampaignResults?.banner_ads?.[0]?.description || 
                             'Your custom description here'}
                          </p>
                          
                          {/* Template indicator */}
                          <div className="text-[4px] text-slate-300 mb-3 font-medium">+ Standard Template Sections Below</div>
                          
                          {/* CTA Button - Using actual campaign data */}
                          <div className="bg-white text-gray-900 text-[6px] px-3 py-1 rounded-full font-medium shadow-lg hover:bg-white/90 transition-all mb-3">
                            {activeCampaignResults?.landing_page_concept?.cta ||
                             activeCampaignResults?.banner_ads?.[0]?.cta || 
                             'Your CTA'}
                          </div>

                          {/* Standard Template Features Preview */}
                          <div className="bg-white/10 backdrop-blur-md rounded px-3 py-1 border border-white/20">
                            <div className="flex items-center gap-2 text-center">
                              <div className="text-[4px] text-white/70 font-medium">Template includes:</div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                <div className="text-[4px] text-white font-medium">Features</div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                <div className="text-[4px] text-white font-medium">Reviews</div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                <div className="text-[4px] text-white font-medium">Pricing</div>
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

              {/* Video Scripts Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Video Scripts')}
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
                    {/* Video Preview - Simple and consistent */}
                    <div className="relative w-full h-full">
                      {activeCampaignResults?.generated_images?.[0]?.url ? (
                        <img src={activeCampaignResults.generated_images[0].url} alt="Video thumbnail" className="w-full h-full object-cover" />
                      ) : uploadedImage ? (
                        <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="space-y-1">
                          <h3 className="text-white text-sm font-bold uppercase tracking-wide">
                            Professional Video Script
                          </h3>
                          <p className="text-white/90 text-xs uppercase tracking-wider">
                            Multi-platform Optimized
                          </p>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        0:30
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Email Templates')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">2</span>
                  </div>
                  {/* Removed download button from email templates section */}
                </div>
                <CardContent className="p-4">
                  <div className="h-80 relative">
                    {/* Modern Email Client Interface */}
                    <div className="bg-white backdrop-blur-sm overflow-hidden h-full border border-white/20 shadow-inner">
                      {/* Email Client Header */}
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="text-[8px] font-semibold text-gray-900">Your Brand Newsletter</div>
                          </div>
                        </div>
                        <div className="text-[6px] text-gray-600 mt-1">From: hello@yourbrand.com</div>
                      </div>

                      {/* Email Content */}
                      <div className="relative h-full overflow-hidden">
                        {/* Hero Section with Gradient */}
                        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 px-3 py-4 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10"></div>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                          <div className="relative z-10 text-center">
                            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2 py-1 mb-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <span className="text-[6px] font-medium text-white">New Launch</span>
                            </div>
                            <h2 className="text-[10px] font-bold text-white mb-1 leading-tight">
                              Transform Your Experience ✨
                            </h2>
                            <p className="text-[6px] text-gray-300 leading-relaxed">
                              Discover premium solutions designed for you
                            </p>
                          </div>
                        </div>

                        {/* Product Showcase - Expanded */}
                        <div className="bg-gradient-to-br from-white to-slate-50 px-3 py-4 relative">
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            <div className="relative">
                              <div className="w-16 h-16 bg-primary/10 rounded-lg overflow-hidden shadow-sm border border-white/50">
                                {activeCampaignResults?.generated_images?.[0]?.url ? (
                                  <img src={activeCampaignResults.generated_images[0].url} alt="Product" className="w-full h-full object-cover" />
                                ) : uploadedImage ? (
                                  <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />
                                ) : null}
                              </div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-[5px] text-white font-bold">!</span>
                              </div>
                            </div>
                            
                            {/* Product Info - Expanded */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[10px] font-bold text-gray-900 leading-tight mb-2">
                                Exclusive Premium Collection
                              </h3>
                              <p className="text-[7px] text-gray-600 leading-relaxed mb-3">
                                Limited time offer - Save up to 40% on our bestselling products. Premium quality meets exceptional value in this curated selection.
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white text-[6px] px-3 py-1 rounded-full font-medium shadow-sm">
                                  Shop Now
                                </div>
                                <div className="text-[6px] text-gray-500">Free shipping included</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Features Section - Condensed */}
                        <div className="bg-gray-50 px-3 py-1.5">
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full mx-auto mb-0.5 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                              <div className="text-[4px] font-semibold text-gray-700">Premium</div>
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full mx-auto mb-0.5 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                              <div className="text-[4px] font-semibold text-gray-700">Fast</div>
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full mx-auto mb-0.5 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                              <div className="text-[4px] font-semibold text-gray-700">Returns</div>
                            </div>
                          </div>
                        </div>

                        {/* Social Proof */}
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-2 border-t border-gray-100">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-2 h-2 bg-slate-400 rounded-full flex items-center justify-center">
                                <span className="text-[3px] text-white">★</span>
                              </div>
                            ))}
                            <span className="text-[5px] text-gray-700 font-semibold ml-1">4.9/5</span>
                          </div>
                          <div className="text-center">
                            <div className="text-[5px] text-gray-600 italic">"Best purchase I've made this year!"</div>
                            <div className="text-[4px] text-gray-500 mt-0.5">- Sarah M., Verified Customer</div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-gray-900 to-black px-3 py-2 absolute bottom-0 left-0 right-0">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div className="text-[4px] text-gray-400">© 2024 Your Brand</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* QR Download Modal */}
      <QRDownloadModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        campaignData={{
          ...activeCampaignResults,
          uploadedImageUrl: uploadedImage
        }}
        title="Download Campaign Content"
      />

      {/* Campaign Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className={selectedSection === 'Banner Ads' ? 'text-center text-3xl font-bold' : ''}>
              {selectedSection === 'Email Templates' ? 'Email Template Preview' :
               selectedSection === 'Banner Ads' ? 'Professional Web Banner Suite' :
               selectedSection === 'Web Creative' ? 'Landing Page Design' :
               selectedSection === 'Video Scripts' ? 'Video Scripts Collection' :
               'Campaign Results'}
            </DialogTitle>
            <DialogDescription className={selectedSection === 'Banner Ads' ? 'text-center' : ''}>
              {selectedSection === 'Email Templates' ? 'Complete email template ready for your marketing campaigns' :
               selectedSection === 'Banner Ads' ? 'High-performing banner ads optimized for clicks and conversions' :
               selectedSection === 'Web Creative' ? 'Complete landing page design with all sections' :
               selectedSection === 'Video Scripts' ? 'Video scripts optimized for different social media platforms' :
               'Explore your generated campaign content'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {renderModalContent()}
          </div>
          <DialogFooter className="shrink-0">
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