import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Play, Download, Edit } from 'lucide-react';
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
          <div className="space-y-8 overflow-x-hidden max-w-full">
            
            {/* Leaderboard Banner - 728×90 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-semibold text-gray-900">Leaderboard Banner</h4>
                <Badge className="text-xs bg-green-100 text-green-800">728×90</Badge>
              </div>
              
              <div className="bg-white border overflow-hidden shadow-sm max-w-full">
                {/* Website Header Mockup */}
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">NewsWebsite.com</div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Home</span>
                      <span>Sports</span>
                      <span>Tech</span>
                      <span>Business</span>
                    </div>
                  </div>
                </div>
                
                {/* Highlighted Banner Area */}
                <div className="p-4 bg-gray-50">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                    
                    <div 
                      className="relative bg-gradient-to-r from-slate-200 to-gray-100"
                      style={{ width: '728px', height: '90px', maxWidth: '100%' }}
                    >
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage} 
                            alt="Premium headphones" 
                            className="w-12 h-12 object-contain" 
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-black">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                          </h3>
                          <p className="text-xs text-gray-700 uppercase">MINIMALIST DESIGN</p>
                        </div>
                      </div>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <button className="bg-white text-black font-semibold px-6 py-2 rounded-full">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">↑ Banner placement in header area</p>
                </div>
                
                {/* Website Content Preview */}
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold">Breaking News Today</h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Latest updates in technology and business...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Rectangle - 300×250 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-semibold text-gray-900">Medium Rectangle Banner</h4>
                <Badge className="text-xs bg-purple-100 text-purple-800">300×250</Badge>
              </div>
              
              <div className="bg-white border overflow-hidden shadow-sm">
                <div className="flex">
                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-semibold mb-3">Article Title Here</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                      <div className="w-full h-32 bg-gray-200 rounded"></div>
                      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>
                    </div>
                  </div>
                  
                  {/* Sidebar with Banner */}
                  <div className="w-80 p-4 bg-gray-50 border-l">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Advertisement</h4>
                      
                      <div className="relative">
                        <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                        
                        <div 
                          className="relative bg-gradient-to-br from-gray-200 to-gray-300"
                          style={{ width: '300px', height: '250px' }}
                        >
                          <div className="h-full flex items-center justify-center relative">
                            {(generatedImages[0]?.url || uploadedImage) && (
                              <img 
                                src={generatedImages[0]?.url || uploadedImage} 
                                alt="Premium headphones" 
                                className="w-28 h-28 object-contain absolute top-8" 
                              />
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-100 flex flex-col justify-center px-4 text-center">
                              <h3 className="text-sm font-bold text-black uppercase">
                                {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                              </h3>
                              <button className="bg-black text-white font-semibold px-4 py-1 rounded-full text-xs mt-1">
                                {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-medium">↑ Sidebar placement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wide Skyscraper - 160×600 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-semibold text-gray-900">Wide Skyscraper Banner</h4>
                <Badge variant="secondary" className="text-xs">160×600</Badge>
              </div>
              
              <div className="bg-white border overflow-hidden shadow-sm">
                <div className="flex">
                  {/* Left Sidebar with Banner */}
                  <div className="w-48 p-4 bg-gray-50 border-r">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Advertisement</h4>
                      
                      <div className="relative">
                        <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                        
                        <div 
                          className="relative bg-gradient-to-b from-slate-200 to-gray-100"
                          style={{ width: '160px', height: '400px' }}
                        >
                          {/* Top product area */}
                          <div className="h-32 flex items-center justify-center p-3">
                            {(generatedImages[0]?.url || uploadedImage) && (
                              <img 
                                src={generatedImages[0]?.url || uploadedImage} 
                                alt="Premium headphones" 
                                className="w-16 h-16 object-contain" 
                              />
                            )}
                          </div>
                          
                          {/* Middle content */}
                          <div className="px-3 py-4 text-center">
                            <h3 className="text-xs font-bold text-black uppercase mb-2">
                              {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                            </h3>
                            <p className="text-xs text-gray-700 uppercase mb-3">MINIMALIST DESIGN</p>
                            <div className="space-y-1 text-xs">
                              <div>✓ Superior Quality</div>
                              <div>✓ Wireless Freedom</div>
                            </div>
                          </div>
                          
                          {/* Bottom CTA */}
                          <div className="absolute bottom-4 left-3 right-3">
                            <button className="w-full bg-black text-white font-semibold py-2 rounded-full text-xs">
                              {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-medium">↑ Left sidebar placement</p>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-semibold mb-3">Main Article Content</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <div className="w-full h-32 bg-gray-200 rounded"></div>
                      <p>Ut enim ad minim veniam, quis nostrud exercitation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billboard - 970×250 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-semibold text-gray-900">Billboard Banner</h4>
                <Badge className="text-xs bg-blue-100 text-blue-800">970×250</Badge>
              </div>
              
              <div className="bg-white border overflow-hidden shadow-sm">
                {/* Website Header */}
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">TechBlog.com</div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>Reviews</span>
                      <span>News</span>
                      <span>Guides</span>
                    </div>
                  </div>
                </div>
                
                {/* Highlighted Banner Area */}
                <div className="p-4 bg-gray-50">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                    
                    <div 
                      className="relative bg-gradient-to-r from-slate-200 via-gray-100 to-slate-200"
                      style={{ width: '970px', height: '250px', maxWidth: '100%' }}
                    >
                      {/* Left content area */}
                      <div className="absolute left-8 top-1/2 -translate-y-1/2">
                        <div className="space-y-3">
                          <h2 className="text-3xl font-bold text-black uppercase">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                          </h2>
                          <p className="text-lg font-semibold text-gray-800">WIRELESS FREEDOM</p>
                          <button className="bg-black text-white font-bold px-8 py-3 rounded-full text-lg">
                            {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Right product area */}
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage} 
                            alt="Premium headphones" 
                            className="w-40 h-40 object-contain" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">↑ Above the fold placement</p>
                </div>
              </div>
            </div>
          </div>
        );
        return (
          <div className="space-y-0 overflow-x-hidden">
            {/* Single Column Layout - All Banners Stacked Vertically */}
            <div className="space-y-8 max-w-full">
              
              {/* Medium Rectangle */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">Medium Rectangle</h4>
                  <Badge className="text-xs bg-green-100 text-green-800">Most Popular</Badge>
                </div>
                <div className="flex gap-4">
                  <div className="overflow-hidden bg-white shadow-lg" style={{ width: '240px', height: '200px' }}>
                    <div 
                      className="relative h-full flex flex-col"
                      style={{
                        backgroundImage: `url(${generatedImages[0]?.url || uploadedImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {/* Background overlay for better text contrast */}
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      {/* Spacer to push content to bottom */}
                      <div className="flex-1"></div>
                      
                      {/* Bottom text area - 1/4 of total height */}
                      <div className="relative z-10 h-12 bg-gradient-to-t from-black/80 to-black/40 p-3 flex flex-col justify-center">
                        <div className="text-xs font-bold text-white uppercase tracking-wide">
                          {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                        </div>
                        <div className="text-[9px] text-white/90 font-medium uppercase tracking-wider">
                          MINIMALIST DESIGN
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="bg-muted/20 p-3 rounded-lg h-full">
                      <h6 className="font-semibold mb-2">Layout Notes:</h6>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        <li>• Clean minimalist design</li>
                        <li>• Bold typography hierarchy</li>
                        <li>• Product showcase area</li>
                        <li>• Premium color scheme</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">Leaderboard</h4>
                  <Badge variant="secondary" className="text-xs">Header/Footer</Badge>
                </div>
                <div className="space-y-2">
                  <div className="overflow-hidden bg-white shadow-lg" style={{ width: '100%', height: '70px', maxWidth: '580px' }}>
                    <div className="relative h-full flex items-center bg-gradient-to-r from-slate-50 to-white">
                      {/* Left Product Image */}
                      {(generatedImages[1]?.url || uploadedImage) && (
                        <div className="w-16 h-full bg-slate-100 flex items-center justify-center p-2">
                          <img 
                            src={generatedImages[1]?.url || uploadedImage} 
                            alt="Product" 
                            className="w-full h-auto max-h-10 object-contain drop-shadow-sm" 
                          />
                        </div>
                      )}
                      {/* Content Area */}
                      <div className="flex-1 px-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                          </h5>
                          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                            MINIMALIST DESIGN
                          </p>
                        </div>
                        <Button size="sm" className="text-xs font-semibold px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-lg text-[11px] text-muted-foreground">
                    Horizontal layout with prominent product image and clean typography.
                  </div>
                </div>
              </div>

              {/* Billboard */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">Billboard</h4>
                  <Badge className="text-xs bg-purple-100 text-purple-800">Premium</Badge>
                </div>
                <div className="space-y-2">
                  <div className="overflow-hidden bg-white shadow-lg" style={{ width: '100%', height: '100px', maxWidth: '580px' }}>
                    <div className="relative h-full flex items-center bg-gradient-to-r from-slate-50 via-white to-slate-50">
                      {/* Left Content */}
                      <div className="flex-1 p-4 space-y-2">
                        <div className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                          {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                        </div>
                        <div className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                          MINIMALIST DESIGN
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {activeCampaignResults.banner_ads?.[0]?.description?.substring(0, 50) || 'Experience the perfect blend of form and function'}
                        </p>
                      </div>
                      {/* Right Area */}
                      <div className="flex items-center gap-3 pr-4">
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center p-2">
                            <img 
                              src={generatedImages[0]?.url || uploadedImage} 
                              alt="Product" 
                              className="w-full h-auto object-contain drop-shadow-sm" 
                            />
                          </div>
                        )}
                        <Button size="sm" className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-lg text-[11px] text-muted-foreground">
                    Wide premium format with clean product integration and strong CTA.
                  </div>
                </div>
              </div>

              {/* Wide Skyscraper */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">Wide Skyscraper</h4>
                  <Badge variant="secondary" className="text-xs">Sidebar</Badge>
                </div>
                <div className="flex gap-4">
                  <div className="overflow-hidden bg-white shadow-lg" style={{ width: '160px', height: '280px' }}>
                    <div className="relative h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
                      {/* Top Product Image */}
                      {(generatedImages[2]?.url || uploadedImage) && (
                        <div className="h-24 bg-slate-100 flex items-center justify-center p-3">
                          <img 
                            src={generatedImages[2]?.url || uploadedImage} 
                            alt="Product" 
                            className="w-full h-auto max-h-16 object-contain drop-shadow-sm" 
                          />
                        </div>
                      )}
                      {/* Content Area */}
                      <div className="flex-1 p-3 flex flex-col justify-between text-center">
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide leading-tight">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                          </h5>
                          <div className="text-[9px] text-slate-600 font-medium uppercase tracking-wider">
                            MINIMALIST DESIGN
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {activeCampaignResults.banner_ads?.[0]?.description?.substring(0, 40) || 'Experience premium craftsmanship'}
                          </p>
                          
                          {/* Feature Points */}
                          <div className="space-y-1 py-2">
                            <div className="flex items-center justify-center gap-1 text-[8px]">
                              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                              <span className="text-slate-600 uppercase tracking-wide">Superior Quality</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[8px]">
                              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                              <span className="text-slate-600 uppercase tracking-wide">Fast Delivery</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="w-full h-px bg-slate-200"></div>
                          <Button size="sm" className="w-full text-[10px] font-semibold py-1 bg-slate-900 hover:bg-slate-800 text-white">
                            {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="bg-muted/20 p-3 rounded-lg h-full">
                      <h6 className="font-semibold mb-2">Layout Notes:</h6>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        <li>• Vertical product showcase</li>
                        <li>• Clean typography stack</li>
                        <li>• Feature highlights</li>
                        <li>• Minimalist aesthetic</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Half Page */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">Half Page</h4>
                  <Badge className="text-xs bg-blue-100 text-blue-800">High Impact</Badge>
                </div>
                <div className="flex gap-4">
                  <div className="overflow-hidden bg-white shadow-lg" style={{ width: '240px', height: '280px' }}>
                    <div className="relative h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
                      {/* Hero Product Area */}
                      <div className="relative h-24 bg-slate-100 flex items-center justify-center p-4">
                        {(generatedImages[3]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[3]?.url || uploadedImage} 
                            alt="Product" 
                            className="w-full h-auto max-h-16 object-contain drop-shadow-sm" 
                          />
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="text-center space-y-1">
                            <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide leading-tight">
                              {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                            </h5>
                            <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                              MINIMALIST DESIGN
                            </div>
                            <p className="text-[9px] text-slate-500 leading-relaxed">
                              {activeCampaignResults.banner_ads?.[0]?.description?.substring(0, 45) || 'Experience the perfect blend of form and function'}
                            </p>
                          </div>
                          
                          {/* Feature Grid */}
                          <div className="grid grid-cols-2 gap-2 py-2">
                            <div className="text-center p-2 bg-slate-50 rounded-lg text-[8px]">
                              <div className="w-3 h-3 bg-slate-300 rounded-full mx-auto mb-1"></div>
                              <span className="text-slate-700 uppercase tracking-wide font-medium">Quality</span>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg text-[8px]">
                              <div className="w-3 h-3 bg-slate-300 rounded-full mx-auto mb-1"></div>
                              <span className="text-slate-700 uppercase tracking-wide font-medium">Design</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-center">
                          <div className="w-full h-px bg-slate-200"></div>
                          <Button size="sm" className="w-full text-[10px] font-semibold py-2 bg-slate-900 hover:bg-slate-800 text-white">
                            {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="bg-muted/20 p-3 rounded-lg h-full">
                      <h6 className="font-semibold mb-2">Layout Notes:</h6>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        <li>• Hero product showcase</li>
                        <li>• Structured content hierarchy</li>
                        <li>• Feature highlight grid</li>
                        <li>• Premium brand aesthetic</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Web Creative':
        return (
          <div className="space-y-0">
            {/* Complete Landing Page Preview */}
            <div className="overflow-hidden bg-background shadow-2xl max-h-[70vh]">
              <div className="w-full">
                
                {/* Hero Section */}
                <section className="relative min-h-[500px] bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                  
                  <div className="relative z-10 container mx-auto px-8 py-12 grid lg:grid-cols-2 gap-8 items-center min-h-[500px]">
                    {/* Left Column - Content */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                          ✨ {activeCampaignResults.banner_ads?.[0]?.headline ? 'New Launch' : 'Premium Product'}
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                          {activeCampaignResults.landing_page_concept?.hero_text || 
                           activeCampaignResults.banner_ads?.[0]?.headline || 
                           'Transform Your Experience Today'}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {activeCampaignResults.landing_page_concept?.sub_text || 
                           activeCampaignResults.banner_ads?.[0]?.description || 
                           'Discover innovative solutions that drive exceptional results and elevate your lifestyle to new heights.'}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="text-lg px-8 py-3 shadow-lg">
                          {activeCampaignResults.landing_page_concept?.cta || 
                           activeCampaignResults.banner_ads?.[0]?.cta || 
                           'Get Started Now'}
                        </Button>
                        <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                          Learn More
                        </Button>
                      </div>
                      
                      {/* Trust Indicators */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>30-Day Returns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Premium Quality</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Hero Image */}
                    <div className="relative flex justify-center">
                      {(generatedImages?.[0]?.url || uploadedImage) && (
                        <div className="relative">
                          <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-60"></div>
                          <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border">
                            <img 
                              src={generatedImages?.[0]?.url || uploadedImage} 
                              alt="Hero product showcase" 
                              className="w-full h-auto max-h-80 object-contain rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Features/Benefits Section */}
                <section className="py-16 bg-muted/20">
                  <div className="container mx-auto px-8">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-foreground mb-4">
                           {activeCampaignResults.landing_page_concept?.product_highlights?.title || 'Why Choose Our Solution'}
                         </h2>
                         <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                           {activeCampaignResults.landing_page_concept?.product_highlights?.description || 
                            'Discover the features that make us the preferred choice for thousands of customers'}
                         </p>
                    </div>
                    
                     <div className="grid md:grid-cols-3 gap-8">
                       {/* Use actual product highlights if available, otherwise fallback to banner ads */}
                       {(activeCampaignResults.landing_page_concept?.product_highlights?.features || 
                         activeCampaignResults.banner_ads?.slice(0, 3) || [
                         { headline: "Premium Quality", description: "Experience unmatched quality with our carefully crafted solutions designed for excellence." },
                         { headline: "Fast & Reliable", description: "Lightning-fast performance with 99.9% reliability ensures you never miss a beat." },
                         { headline: "24/7 Support", description: "Round-the-clock expert support to help you succeed every step of the way." }
                       ]).map((item, index) => (
                         <div key={index} className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                           <div className="relative">
                             <div className={`w-16 h-16 ${index === 0 ? 'bg-primary/10' : index === 1 ? 'bg-secondary/10' : 'bg-accent/10'} rounded-full flex items-center justify-center mx-auto`}>
                               <div className={`w-8 h-8 ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-accent'} rounded-full`}></div>
                             </div>
                             {generatedImages?.[index + 1]?.url && (
                               <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                                 <img src={generatedImages[index + 1].url} alt={`Feature ${index + 1}`} className="w-full h-full object-cover" />
                               </div>
                             )}
                           </div>
                           <h3 className="text-xl font-semibold">
                             {item.headline || item.title || `Feature ${index + 1}`}
                           </h3>
                           <p className="text-muted-foreground">
                             {item.description || item.content || 'Feature description'}
                           </p>
                         </div>
                       ))}
                    </div>
                  </div>
                </section>

                {/* Product/Service Details Section */}
                <section className="py-16">
                  <div className="container mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-foreground">
                            Complete Solution for Your Needs
                          </h2>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {activeCampaignResults.landing_page_concept?.sub_text || 
                             'Our comprehensive approach ensures you get everything you need to succeed, backed by industry-leading technology and expert support.'}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {(activeCampaignResults.banner_ads || [
                            { headline: "Advanced Technology", description: "Cutting-edge solutions that stay ahead of the curve" },
                            { headline: "Expert Team", description: "Dedicated professionals committed to your success" },
                            { headline: "Proven Results", description: "Track record of delivering exceptional outcomes" }
                          ]).slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-primary font-bold text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                  {item.headline}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button size="lg" className="px-8 py-3">
                          Explore Features
                        </Button>
                      </div>

                      <div className="relative">
                        {uploadedImage && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl blur-xl transform rotate-2"></div>
                            <div className="relative bg-background/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border">
                              <img 
                                src={uploadedImage} 
                                alt="Product details showcase" 
                                className="w-full h-auto rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Social Proof Section */}
                <section className="py-16 bg-muted/20">
                  <div className="container mx-auto px-8">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        {activeCampaignResults.landing_page_concept?.social_proof?.title || 'Trusted by Industry Leaders'}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {activeCampaignResults.landing_page_concept?.social_proof?.subtitle || 
                         'Join thousands of satisfied customers who have transformed their business'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                      {(activeCampaignResults.landing_page_concept?.social_proof?.testimonials || [
                        {
                          quote: "This solution completely transformed our workflow. The results exceeded our expectations by 300%.",
                          author: "Sarah Johnson",
                          role: "CEO, TechCorp",
                          rating: 5
                        },
                        {
                          quote: "Outstanding quality and support. The team went above and beyond to ensure our success.",
                          author: "Michael Chen", 
                          role: "Director, InnovateNow",
                          rating: 5
                        },
                        {
                          quote: "The ROI was immediate. We saw improvements within the first week of implementation.",
                          author: "Emily Rodriguez",
                          role: "Manager, GrowthLab",
                          rating: 5
                        }
                      ]).map((testimonial, index) => (
                        <div key={index} className="p-6 bg-background rounded-xl border border-border">
                          <div className="flex items-center gap-1 text-yellow-500 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <div key={i} className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                            ))}
                          </div>
                          <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                          <div>
                            <div className="font-semibold text-foreground">{testimonial.author}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex justify-center items-center gap-8 opacity-60">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">10K+</div>
                        <div className="text-sm text-muted-foreground">Happy Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">99.9%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">24/7</div>
                        <div className="text-sm text-muted-foreground">Support</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                  <div className="container mx-auto px-8 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <h2 className="text-4xl font-bold text-foreground">
                        {activeCampaignResults.landing_page_concept?.cta_section?.headline || 
                         'Ready to Transform Your Business?'}
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        {activeCampaignResults.landing_page_concept?.cta_section?.description || 
                         'Join thousands of successful businesses and start your journey today. No setup fees, no long-term contracts.'}
                      </p>
                      
                      {/* Pricing Section (if available) */}
                      {activeCampaignResults.landing_page_concept?.pricing_section && (
                        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border my-8">
                          <h3 className="text-2xl font-semibold mb-4">
                            {activeCampaignResults.landing_page_concept.pricing_section.title || 'Choose Your Plan'}
                          </h3>
                          {activeCampaignResults.landing_page_concept.pricing_section.guarantees && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {activeCampaignResults.landing_page_concept.pricing_section.guarantees}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button size="lg" className="text-lg px-12 py-4 shadow-lg">
                          {activeCampaignResults.landing_page_concept?.cta_section?.primary_cta || 
                           activeCampaignResults.landing_page_concept?.cta || 
                           'Start Free Trial'}
                        </Button>
                        <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                          {activeCampaignResults.landing_page_concept?.cta_section?.secondary_cta || 
                           'Schedule Demo'}
                        </Button>
                      </div>
                      
                      {activeCampaignResults.landing_page_concept?.cta_section?.urgency && (
                        <p className="text-sm text-muted-foreground mt-4 font-medium">
                          {activeCampaignResults.landing_page_concept.cta_section.urgency}
                        </p>
                      )}

                      {/* Supporting Visual */}
                      {generatedImages?.[0]?.url && (
                        <div className="mt-8 flex justify-center">
                          <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-60"></div>
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-2xl">
                              <img 
                                src={generatedImages[0].url} 
                                alt="Success guarantee" 
                                className="w-full h-full object-cover"
                              />
                            </div>
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
            {/* Email Template Preview */}
            <div className="bg-white text-gray-900 font-sans" style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
              
              {/* Email Client Header */}
              <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-8 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    <div className="text-sm font-semibold text-gray-900">
                      {activeCampaignResults.email_copy?.subject || 'Transform Your Experience Today ✨'}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 hover:text-primary cursor-pointer transition-colors">
                    View in browser →
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-2 font-medium">
                  From: Your Brand &lt;hello@yourbrand.com&gt;
                </div>
              </div>

              {/* Email Content */}
              <div className="relative">
                {/* Brand Header */}
                <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-8 py-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">New Launch</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {activeCampaignResults.landing_page_concept?.hero_text || 'Transform Your Experience'}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-lg mx-auto leading-relaxed">
                      {activeCampaignResults.landing_page_concept?.sub_text || 'Discover innovative solutions designed for you'}
                    </p>
                  </div>
                </div>

                {/* Hero Product Section */}
                <div className="bg-gradient-to-br from-white via-slate-50 to-gray-100 px-8 py-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                  {uploadedImage && (
                    <div className="relative z-10">
                      <div className="max-w-md mx-auto relative">
                        <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-60"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/50">
                          <img 
                            src={uploadedImage} 
                            alt="Featured product" 
                            className="w-full h-auto rounded-xl shadow-lg hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <div className="text-center mt-12">
                        <div className="inline-flex flex-col items-center gap-4">
                          <button className="group relative bg-gradient-to-r from-gray-900 to-black text-white font-semibold text-lg px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-800">
                            <span className="relative z-10">
                              {activeCampaignResults.landing_page_concept?.cta || 'Shop Now'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                          </button>
                          <p className="text-sm text-gray-600 font-medium">
                            Free shipping • 30-day returns • Premium quality
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="bg-white px-8 py-16">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
                      <div className="prose prose-lg max-w-none text-center">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {activeCampaignResults.email_copy?.body || 'We are excited to share our latest innovation that will transform how you experience our products. This exclusive launch features cutting-edge technology and premium design that sets new standards in the industry.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                      <div className="group text-center relative">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
                          <div className="relative z-10 w-full h-full rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-lg"></div>
                          </div>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-3">Premium Quality</h4>
                        <p className="text-gray-600 leading-relaxed">Exceptional materials and craftsmanship in every detail</p>
                      </div>
                      
                      <div className="group text-center relative">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
                          <div className="relative z-10 w-full h-full rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-lg"></div>
                          </div>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-3">Fast Delivery</h4>
                        <p className="text-gray-600 leading-relaxed">Free 2-day shipping with tracking on all orders</p>
                      </div>
                      
                      <div className="group text-center relative">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/70 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
                          <div className="relative z-10 w-full h-full rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-lg"></div>
                          </div>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-3">Money Back</h4>
                        <p className="text-gray-600 leading-relaxed">30-day money-back guarantee, no questions asked</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Proof Section */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 px-8 py-16">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Trusted by thousands</h3>
                    <div className="flex justify-center items-center gap-2 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">★</span>
                        </div>
                      ))}
                      <span className="ml-2 text-gray-700 font-semibold">4.9/5 from 2,847 reviews</span>
                    </div>
                    <p className="text-gray-600 italic text-lg">
                      "This completely changed how I approach my daily routine. The quality is unmatched!"
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">- Sarah M., Verified Customer</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Footer */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white px-8 py-12">
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Stay Connected</h4>
                    <p className="text-gray-300 max-w-md mx-auto">
                      Follow us for exclusive updates, behind-the-scenes content, and special offers.
                    </p>
                  </div>
                  
                  {/* Social Icons */}
                  <div className="flex justify-center gap-6">
                    <div className="group cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-sm">f</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-sm">@</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-sm">t</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Links */}
                  <div className="border-t border-gray-700 pt-8 space-y-4">
                    <div className="flex justify-center gap-8 text-sm">
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors">Unsubscribe</a>
                    </div>
                    <p className="text-xs text-gray-400">
                      © 2024 Your Brand. All rights reserved. | 123 Innovation Drive, Tech City, TC 12345
                    </p>
                  </div>
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
                Bring Your Product to <span className="text-primary">Life</span>
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
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
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
                          <div className="text-[4px] text-orange-300 mb-3 font-medium">+ Standard Template Sections Below</div>
                          
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
                              <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
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