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
  const [downloadUrl, setDownloadUrl] = useState<string>('');
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
    navigate(-1);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenDownloadModal = () => {
    // Generate a download URL for the campaign results
    const downloadData = {
      type: 'campaign',
      results: activeCampaignResults,
      image: uploadedImage
    };
    const dataUrl = `data:application/json;base64,${btoa(JSON.stringify(downloadData))}`;
    setDownloadUrl(window.location.origin + `/download?data=${encodeURIComponent(dataUrl)}`);
    setIsDownloadModalOpen(true);
  };

  // Modal handlers
  const handleOpenCategory = (category: string) => {
    setSelectedSection(category);
    setIsModalOpen(true);
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
          <div className="space-y-0 overflow-x-hidden">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-2xl font-bold text-foreground">Professional Web Banner Suite</h3>
              <p className="text-muted-foreground">High-performing banner ads optimized for clicks and conversions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-full">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Medium Rectangle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">Medium Rectangle</h4>
                    <Badge className="text-xs bg-green-100 text-green-800">Most Popular</Badge>
                  </div>
                  <div className="flex gap-4">
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-white shadow-lg" style={{ width: '240px', height: '200px' }}>
                      <div className="relative h-full flex">
                        {/* Left Content Area */}
                        <div className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-br from-slate-50 to-slate-100">
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                              {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM QUALITY'}
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                              MINIMALIST DESIGN
                            </div>
                            <p className="text-[9px] text-slate-500 leading-snug mt-2">
                              {activeCampaignResults.banner_ads?.[0]?.description?.substring(0, 35) || 'Elevate your experience with premium craftsmanship'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Button size="sm" className="text-[10px] font-semibold px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white">
                              {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                            </Button>
                          </div>
                        </div>
                        {/* Right Product Image */}
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <div className="w-20 relative bg-slate-100 flex items-center justify-center p-2">
                            <img 
                              src={generatedImages[0]?.url || uploadedImage} 
                              alt="Product" 
                              className="w-full h-auto max-h-16 object-contain drop-shadow-sm" 
                            />
                          </div>
                        )}
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
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-white shadow-lg" style={{ width: '100%', height: '70px', maxWidth: '580px' }}>
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
                    <div className="bg-muted/20 p-2 rounded text-[11px] text-muted-foreground">
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
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-white shadow-lg" style={{ width: '100%', height: '100px', maxWidth: '580px' }}>
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
                    <div className="bg-muted/20 p-2 rounded text-[11px] text-muted-foreground">
                      Wide premium format with clean product integration and strong CTA.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Wide Skyscraper */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">Wide Skyscraper</h4>
                    <Badge variant="secondary" className="text-xs">Sidebar</Badge>
                  </div>
                  <div className="flex gap-4">
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-white shadow-lg" style={{ width: '160px', height: '280px' }}>
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
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-white shadow-lg" style={{ width: '240px', height: '280px' }}>
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
                              <div className="text-center p-2 bg-slate-50 rounded text-[8px]">
                                <div className="w-3 h-3 bg-slate-300 rounded-full mx-auto mb-1"></div>
                                <span className="text-slate-700 uppercase tracking-wide font-medium">Quality</span>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded text-[8px]">
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
          </div>
        );

      case 'Web Creative':
        return (
          <div className="space-y-0">
            {/* Complete Landing Page Preview */}
            <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-2xl max-h-[70vh] overflow-y-auto">
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
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <div className="relative">
                          <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-60"></div>
                          <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border">
                            <img 
                              src={generatedImages[0]?.url || uploadedImage} 
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
                      <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Solution</h2>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover the features that make us the preferred choice for thousands of customers
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Feature 1 */}
                      <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-8 h-8 bg-primary rounded-full"></div>
                          </div>
                          {generatedImages[1]?.url && (
                            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                              <img src={generatedImages[1].url} alt="Feature 1" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">
                          {activeCampaignResults.banner_ads?.[0]?.headline || 'Premium Quality'}
                        </h3>
                        <p className="text-muted-foreground">
                          {activeCampaignResults.banner_ads?.[0]?.description || 'Experience unmatched quality with our carefully crafted solutions designed for excellence.'}
                        </p>
                      </div>

                      {/* Feature 2 */}
                      <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-8 h-8 bg-secondary rounded-full"></div>
                          </div>
                          {generatedImages[2]?.url && (
                            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                              <img src={generatedImages[2].url} alt="Feature 2" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">
                          {activeCampaignResults.banner_ads?.[1]?.headline || 'Fast & Reliable'}
                        </h3>
                        <p className="text-muted-foreground">
                          {activeCampaignResults.banner_ads?.[1]?.description || 'Lightning-fast performance with 99.9% reliability ensures you never miss a beat.'}
                        </p>
                      </div>

                      {/* Feature 3 */}
                      <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-8 h-8 bg-accent rounded-full"></div>
                          </div>
                          {generatedImages[3]?.url && (
                            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                              <img src={generatedImages[3].url} alt="Feature 3" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">
                          {activeCampaignResults.banner_ads?.[2]?.headline || '24/7 Support'}
                        </h3>
                        <p className="text-muted-foreground">
                          {activeCampaignResults.banner_ads?.[2]?.description || 'Round-the-clock expert support to help you succeed every step of the way.'}
                        </p>
                      </div>
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
                      <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by Industry Leaders</h2>
                      <p className="text-lg text-muted-foreground">
                        Join thousands of satisfied customers who have transformed their business
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                      {[
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
                      ].map((testimonial, index) => (
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
                        Ready to Transform Your Business?
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Join thousands of successful businesses and start your journey today. 
                        No setup fees, no long-term contracts.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button size="lg" className="text-lg px-12 py-4 shadow-lg">
                          {activeCampaignResults.landing_page_concept?.cta || 'Start Free Trial'}
                        </Button>
                        <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                          Schedule Demo
                        </Button>
                      </div>

                      {/* Supporting Visual */}
                      {generatedImages[0]?.url && (
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

                {/* Footer */}
                <footer className="py-12 bg-background border-t border-border">
                  <div className="container mx-auto px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>Features</li>
                          <li>Pricing</li>
                          <li>Integrations</li>
                          <li>API</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>About Us</li>
                          <li>Careers</li>
                          <li>Press</li>
                          <li>Blog</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Support</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>Help Center</li>
                          <li>Contact Us</li>
                          <li>Status</li>
                          <li>Community</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>Privacy Policy</li>
                          <li>Terms of Service</li>
                          <li>Cookie Policy</li>
                          <li>GDPR</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                      <p>&copy; 2024 Your Company. All rights reserved. | Designed with ❤️ for success</p>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        );

      case 'Video Scripts':
        const firstScript = activeCampaignResults.video_scripts?.[0];
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Mobile-First Layout: Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Video Preview */}
              <div className="space-y-6">
                <div className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-2xl">
                {/* Video Script Preview */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white relative">
                  <div className="relative aspect-video">
                    {generatedVideoUrl ? (
                      <VideoPlayer
                        videoUrl={generatedVideoUrl}
                        posterUrl={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage}
                        title="Generated Campaign Video"
                        className="w-full h-full"
                      />
                    ) : (
                      <>
                        {/* Video Thumbnail (fallback while video not ready) */}
                        {activeCampaignResults?.generated_images?.[0]?.url ? (
                          <img src={activeCampaignResults.generated_images[0].url} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : uploadedImage ? (
                          <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                            <Play className="w-10 h-10 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-6 right-6 bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                          0:30
                        </div>
                      </>
                    )}
                  </div>
                  {/* Video Title Bar */}
                  <div className="p-6 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm">
                    <h3 className="font-bold text-2xl mb-3 text-white">
                      {activeCampaignResults.banner_ads?.[0]?.headline || 'Transform Your Experience'}
                    </h3>
                    <div className="flex items-center gap-6 text-gray-300">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Live Campaign
                      </span>
                      <span>• Optimized for all platforms</span>
                    </div>
                  </div>
                </div>
                </div>

                {/* Social Media Platforms Section - Moved to left */}
                <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Perfect for All Platforms</h3>
                    <p className="text-gray-600">Optimized and ready to deploy</p>
                  </div>
                  
                  {/* Social Platform Icons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group text-center p-4 rounded bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">TikTok</h4>
                      <p className="text-xs text-gray-600">9:16 Vertical</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Instagram</h4>
                      <p className="text-xs text-gray-600">Stories & Reels</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-red-500 to-pink-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">YouTube</h4>
                      <p className="text-xs text-gray-600">Shorts & Standard</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Twitter</h4>
                      <p className="text-xs text-gray-600">Video tweets</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Script Content */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                  {/* Script Header */}
                  <div className="text-center pb-6 border-b border-gray-200">
                    <h4 className="font-bold text-2xl text-gray-900 mb-2">Professional Video Script</h4>
                    <p className="text-gray-600">Optimized for maximum engagement across all social platforms</p>
                  </div>
                  
                  {/* Script Breakdown */}
                  <div className="space-y-6 mt-8">
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">1</div>
                        <div>
                          <span className="font-semibold text-lg text-gray-900">Opening Hook</span>
                          <p className="text-sm text-gray-500">0-3 seconds</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mb-3 text-gray-900">
                        "{activeCampaignResults.banner_ads?.[0]?.headline || 'Ready to transform your experience?'}"
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-sm">
                        <strong>Visual Direction:</strong> Close-up of product with dynamic zoom and smooth transition
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">2</div>
                        <div>
                          <span className="font-semibold text-lg text-gray-900">Main Content</span>
                          <p className="text-sm text-gray-500">3-25 seconds</p>
                        </div>
                      </div>
                      <p className="text-base mb-4 whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {firstScript?.script || "Discover the perfect solution that transforms your daily experience with innovative features designed for modern life. Experience the difference that premium quality makes."}
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-sm">
                        <strong>Visual Direction:</strong> Product demonstration with key features highlighted and lifestyle shots
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">3</div>
                        <div>
                          <span className="font-semibold text-lg text-gray-900">Call to Action</span>
                          <p className="text-sm text-gray-500">25-30 seconds</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mb-3 text-gray-900">
                        "{activeCampaignResults.banner_ads?.[0]?.cta || 'Get Started Today'} - Limited time offer!"
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-sm">
                        <strong>Visual Direction:</strong> Product showcase with animated CTA button and compelling offer display
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                  <h5 className="font-bold text-lg mb-4 text-gray-900">Technical Specifications</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-900 mb-1">Duration</p>
                      <p className="text-sm text-gray-600">30 seconds</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-900 mb-1">Format</p>
                      <p className="text-sm text-gray-600">Multi-ratio</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-900 mb-1">Music</p>
                      <p className="text-sm text-gray-600">Upbeat, energetic</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-900 mb-1">Captions</p>
                      <p className="text-sm text-gray-600">Auto-generated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Email Templates':
        return (
          <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-2xl max-w-3xl mx-auto">
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
                Bring Your Product to <span className="text-indigo-600">Life</span>
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
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
              </div>
            </div>
            
            {/* Right - Close Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3"
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
                className="card-elegant backdrop-blur-xl bg-white/5 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer" 
                onClick={() => handleOpenCategory('Banner Ads')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Banner Ads</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">4</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCategory('Banner Ads');
                    }}
                    className="tap-target focus-ring group bg-white/40 border-white/30 hover:bg-white/60 rounded-full px-6"
                  >
                    <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      View All
                    </span>
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 h-80">
                    {/* Top Left - Leaderboard Style Banner */}
                    <div className="bg-gradient-to-r from-amber-100 to-amber-50 backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col border border-amber-200 shadow-sm">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-white/80 flex-shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                          {activeCampaignResults?.generated_images?.[0]?.url ? (
                            <img src={activeCampaignResults.generated_images[0].url} alt="Product" className="w-full h-auto max-h-14 object-contain" />
                          ) : uploadedImage ? (
                            <img src={uploadedImage} alt="Product" className="w-full h-auto max-h-14 object-contain" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-black text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-1 inline-block">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                          </div>
                          <p className="text-xs text-amber-800 font-medium uppercase tracking-wider mb-2">MINIMALIST DESIGN</p>
                          <button className="bg-black text-white text-xs px-4 py-1.5 rounded font-semibold hover:bg-gray-800 transition-colors">
                            {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Square Banner */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col border border-gray-200 shadow-sm">
                      <div className="w-full h-20 bg-white rounded-lg mb-3 overflow-hidden flex items-center justify-center p-2 shadow-sm">
                        {activeCampaignResults?.generated_images?.[1]?.url ? (
                          <img src={activeCampaignResults.generated_images[1].url} alt="Product" className="w-full h-auto max-h-16 object-contain" />
                        ) : activeCampaignResults?.generated_images?.[0]?.url ? (
                          <img src={activeCampaignResults.generated_images[0].url} alt="Product" className="w-full h-auto max-h-16 object-contain" />
                        ) : uploadedImage ? (
                          <img src={uploadedImage} alt="Product" className="w-full h-auto max-h-16 object-contain" />
                        ) : null}
                      </div>
                      <div className="text-center flex-1 flex flex-col justify-between">
                        <div>
                          <div className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide mb-1 inline-block">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                          </div>
                          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">MINIMALIST DESIGN</p>
                        </div>
                        <button className="bg-black text-white text-xs px-4 py-1.5 rounded font-semibold hover:bg-gray-800 transition-colors">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Left - Wide Banner */}
                    <div className="bg-gradient-to-r from-amber-50 to-white backdrop-blur-sm rounded-lg p-3 overflow-hidden flex items-center border border-amber-200 shadow-sm col-span-2">
                      <div className="w-20 h-16 rounded-lg bg-white flex-shrink-0 overflow-hidden flex items-center justify-center p-2 shadow-sm mr-4">
                        {activeCampaignResults?.generated_images?.[0]?.url ? (
                          <img src={activeCampaignResults.generated_images[0].url} alt="Product" className="w-full h-auto max-h-12 object-contain" />
                        ) : uploadedImage ? (
                          <img src={uploadedImage} alt="Product" className="w-full h-auto max-h-12 object-contain" />
                        ) : null}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="bg-black text-white px-3 py-1 rounded text-sm font-bold uppercase tracking-wide mb-1 inline-block">
                            {activeCampaignResults.banner_ads?.[0]?.headline || 'PREMIUM SOUND'}
                          </div>
                          <p className="text-xs text-amber-800 font-medium uppercase tracking-wider">MINIMALIST DESIGN</p>
                        </div>
                        <button className="bg-black text-white text-sm px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                          {activeCampaignResults.banner_ads?.[0]?.cta || 'Shop Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Web Creative Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/5 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Web Creative')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Web Creative</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCategory('Web Creative');
                    }}
                    className="tap-target focus-ring group bg-white/40 border-white/30 hover:bg-white/60 rounded-full px-6"
                  >
                    <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      View All
                    </span>
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
                           {activeCampaignResults?.generated_images?.[1]?.url ? (
                             <img 
                               src={activeCampaignResults.generated_images[1].url} 
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

              {/* Video Scripts Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/5 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Video Scripts')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Video Scripts</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">1</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCategory('Video Scripts');
                    }}
                    className="tap-target focus-ring group bg-white/40 border-white/30 hover:bg-white/60 rounded-full px-6"
                  >
                    <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      View All
                    </span>
                  </Button>
                </div>
                <CardContent className="p-4">
                  {/* Mobile-First Vertical Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
                    {/* Left Side - Video Preview */}
                    <div className="bg-black rounded overflow-hidden relative min-h-[120px] lg:h-full">
                      {/* Video Thumbnail with Play Button */}
                      <div className="relative w-full h-full">
                        {activeCampaignResults?.generated_images?.[0]?.url ? (
                          <img src={activeCampaignResults.generated_images[0].url} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : uploadedImage ? (
                          <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                        
                        {/* Play Button */}
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
                    <div className="bg-white backdrop-blur-sm rounded p-4 overflow-y-auto border border-white/20">
                      <div className="space-y-3">
                        {/* Script Header */}
                        <div className="text-center pb-2 border-b border-white/30">
                          <h4 className="font-semibold text-sm text-gray-900">Professional Script</h4>
                          <p className="text-xs text-gray-600">Multi-platform optimized</p>
                        </div>
                        
                        {/* Script Sections */}
                        <div className="space-y-2">
                          <div className="bg-white/60 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">1</div>
                              <span className="font-medium text-xs text-gray-800">Hook</span>
                            </div>
                            <p className="text-xs text-gray-700 font-medium">
                              "Transform your experience..."
                            </p>
                          </div>
                          
                          <div className="bg-white/60 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">2</div>
                              <span className="font-medium text-xs text-gray-800">Content</span>
                            </div>
                            <p className="text-xs text-gray-700">
                              Product demo with features...
                            </p>
                          </div>
                          
                          <div className="bg-white/60 p-3 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">3</div>
                              <span className="font-medium text-xs text-gray-800">CTA</span>
                            </div>
                            <p className="text-xs text-gray-700 font-medium">
                              "Get started today!"
                            </p>
                          </div>
                        </div>
                        
                        {/* Social Icons Preview */}
                        <div className="pt-2 border-t border-white/30">
                          <p className="text-xs text-gray-600 text-center mb-2">Perfect for:</p>
                          <div className="flex justify-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">I</span>
                            </div>
                            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">Y</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Card */}
              <Card 
                className="card-elegant backdrop-blur-xl bg-white/5 border-white/50 border-2 shadow-2xl hover:shadow-elegant-lg transition-all duration-smooth cursor-pointer"
                onClick={() => handleOpenCategory('Email Templates')}
              >
                <div className="px-4 py-3 flex items-center justify-between transition-all duration-smooth">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                    <span className="bg-muted text-primary text-xs px-2 py-1 rounded-full font-medium">2</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCategory('Email Templates');
                    }}
                    className="tap-target focus-ring group bg-white/40 border-white/30 hover:bg-white/60 rounded-full px-6"
                  >
                    <span className="text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      View All
                    </span>
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-80 relative">
                    {/* Modern Email Client Interface */}
                    <div className="bg-white backdrop-blur-sm rounded-lg overflow-hidden h-full border border-white/20 shadow-inner">
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

      {/* Download QR Code Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Download Campaign Results</DialogTitle>
            <DialogDescription className="text-center">
              Scan the QR code with your mobile device to download your campaign results
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <QRCodeSVG 
                value={downloadUrl}
                size={171}
                level="L"
                includeMargin={true}
                fgColor="#000000"
                bgColor="transparent"
              />
            </div>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mt-4">
              SCAN ME
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
          <div className="flex-1 overflow-hidden">
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