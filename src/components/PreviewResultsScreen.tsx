import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Play, QrCode, Edit, ArrowUpRight, Camera, Heart, MessageCircle, Send, Share, Plus, Search, MoreHorizontal, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import RibbedSphere from '@/components/RibbedSphere';
import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationResponse } from '@/types/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import QRDownloadModal from '@/components/QRDownloadModal';
import { extractColorsFromImage } from '@/lib/color-extraction';

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, campaignResults, campaignId } = location.state || {};
  const [fetchedCampaignResults, setFetchedCampaignResults] = useState<CampaignCreationResponse | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(!!campaignResults);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);

  // Fetch campaign results if not provided but campaignId is available
  useEffect(() => {
    const fetchCampaignResults = async () => {
      if (campaignId) {
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
        }
      }
    };

    fetchCampaignResults();
  }, [campaignId]);

  // Use either passed campaignResults or fetched results
  const activeCampaignResults = campaignResults || fetchedCampaignResults;

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
      const timer = setTimeout(() => {
        setIsContentReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeCampaignResults]);

  // Extract color from uploaded image
  useEffect(() => {
    if (uploadedImage) {
      extractColorsFromImage(uploadedImage).then(colors => {
        setComplementaryColor(colors.secondary);
      }).catch(() => {
        setComplementaryColor(null);
      });
    }
  }, [uploadedImage]);

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
      'Social Video Collection': '/video-scripts',
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

  // Show loading screen until content is ready
  if (!isContentReady || !activeCampaignResults) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
        <video 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 text-center">
          <div className="w-[70px] h-[70px] mx-auto mb-6">
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
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0" 
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
                  <QrCode className="w-3 h-3" />
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
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </div>
                <CardContent className="p-4">
                  <div className="h-80 rounded">
                    {/* Top Row - Two Square Banners */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      
                      {/* Left Banner - Product Focus */}
                      <div className="aspect-square bg-white rounded overflow-hidden relative">
                        <div className="flex items-center h-full">
                          {/* Left - Product Image */}
                          <div className="w-1/2 h-full flex items-center justify-center">
                            {(imageMapping?.image_1 || uploadedImage) && (
                              <img 
                                src={imageMapping?.image_1 || uploadedImage} 
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
                        {(imageMapping?.image_0 || uploadedImage) && (
                          <img 
                            src={imageMapping?.image_0 || uploadedImage} 
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
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded overflow-hidden h-20 relative">
                      <div className="flex items-center h-full">
                        {/* Left - Product Image */}
                        <div className="w-20 h-full flex items-center justify-center">
                          {(imageMapping?.image_0 || uploadedImage) && (
                            <img 
                              src={imageMapping?.image_0 || uploadedImage} 
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

              {/* Web Creative Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Web Creative')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Web Creative</h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </div>
                <CardContent className="p-4">
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
                        {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) && (
                          <img 
                            src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
                            alt="Product showcase" 
                            className="w-full h-full object-cover rounded-r" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Video Collection Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Social Video Collection')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Social Video Collection</h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </div>
                <CardContent className="p-4">
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
                              <img src={uploadedImage || activeCampaignResults?.generated_images?.[0]?.url} alt="Your story" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <span className="text-white text-[6px] mt-0.5">Your story</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full p-0.5">
                              <div className="w-full h-full bg-gray-400 rounded-full"></div>
                            </div>
                            <span className="text-gray-400 text-[6px] mt-0.5">joshua_l</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full p-0.5">
                              <div className="w-full h-full bg-gray-400 rounded-full"></div>
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
                              <img src={uploadedImage || activeCampaignResults?.generated_images?.[0]?.url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                              <div className="text-white text-[8px] font-semibold">joshua_l</div>
                              <div className="text-gray-400 text-[6px]">Sponsored</div>
                            </div>
                          </div>
                        </div>
                        {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) && (
                          <img 
                            src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
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
                            <span className="font-semibold">joshua_l</span> The game in Japan was amazing and I want to share some photos
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
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
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
                        {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) && (
                          <img 
                            src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
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
                            {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) ? (
                              <img 
                                src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
                                alt="Brand profile" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className="text-white text-[8px] font-bold">Brand</span>
                            )}
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
                        {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) && (
                          <img 
                            src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
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

              {/* Email Templates Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/60 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Email Templates')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </div>
                <CardContent className="p-4">
                  <div className="h-80 relative rounded">
                    {/* Modern Email Client Interface */}
                    <div className="bg-white backdrop-blur-sm overflow-hidden h-full border border-white/20 shadow-inner rounded">
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
    </div>
  );
};

export default PreviewResultsScreen;