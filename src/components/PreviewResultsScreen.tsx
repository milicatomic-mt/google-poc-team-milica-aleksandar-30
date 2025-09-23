import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Play, Download, Edit } from 'lucide-react';
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
        const firstScript = activeCampaignResults.video_scripts?.[0];
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Mobile-First Layout: Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Video Preview */}
              <div className="space-y-6">
                <div className="border-2 border-border rounded-2xl overflow-hidden bg-background shadow-2xl">
                {/* Video Script Preview */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white relative">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video">
                    {uploadedImage && (
                      <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </div>
                    
                    {/* Duration */}
                    <div className="absolute bottom-6 right-6 bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                      0:30
                    </div>
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
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Perfect for All Platforms</h3>
                    <p className="text-gray-600">Optimized and ready to deploy</p>
                  </div>
                  
                  {/* Social Platform Icons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">TikTok</h4>
                      <p className="text-xs text-gray-600">9:16 Vertical</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Instagram</h4>
                      <p className="text-xs text-gray-600">Stories & Reels</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">YouTube</h4>
                      <p className="text-xs text-gray-600">Shorts & Standard</p>
                    </div>
                    
                    <div className="group text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  {/* Script Header */}
                  <div className="text-center pb-6 border-b border-gray-200">
                    <h4 className="font-bold text-2xl text-gray-900 mb-2">Professional Video Script</h4>
                    <p className="text-gray-600">Optimized for maximum engagement across all social platforms</p>
                  </div>
                  
                  {/* Script Breakdown */}
                  <div className="space-y-6 mt-8">
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Visual Direction:</strong> Close-up of product with dynamic zoom and smooth transition
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Visual Direction:</strong> Product demonstration with key features highlighted and lifestyle shots
                      </p>
                    </div>
                    
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Visual Direction:</strong> Product showcase with animated CTA button and compelling offer display
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <h5 className="font-bold text-lg mb-4 text-gray-900">Technical Specifications</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-900 mb-1">Duration</p>
                      <p className="text-sm text-gray-600">30 seconds</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-900 mb-1">Format</p>
                      <p className="text-sm text-gray-600">Multi-ratio</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-900 mb-1">Music</p>
                      <p className="text-sm text-gray-600">Upbeat, energetic</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
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
        <header className="container-padding pt-20 relative">
          <div className="w-full flex justify-between items-center px-8">
            {/* Left - Sphere Animation with Text */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12">
                <RibbedSphere className="w-full h-full" />
              </div>
              <div className="text-sm text-foreground font-semibold">
                Bring Your Products to <span className="text-indigo-600">Life</span>
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
            </div>
            
            {/* Right - Edit and Download Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="tap-target focus-ring bg-white hover:bg-white/90 text-black hover:text-black border-white rounded-full px-6 py-2 flex items-center gap-2"
              >
                <Edit className="w-4 h-4 text-black" />
                Edit
              </Button>
              <Button
                variant="default"
                className="tap-target focus-ring bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container-padding pt-16 pb-8">
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
                  <div className="grid grid-cols-2 gap-3 h-64">
                    {/* Top Left - Leaderboard Banner */}
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col border border-white/20">
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
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col border border-white/20">
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
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 overflow-hidden flex flex-col justify-between border border-white/20">
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
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 overflow-hidden relative border border-white/20">
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
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
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
                          {uploadedImage ? (
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
                          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-64">
                    {/* Left Side - Video Preview */}
                    <div className="bg-black rounded-lg overflow-hidden relative min-h-[120px] lg:h-full">
                      {/* Video Thumbnail with Play Button */}
                      <div className="relative w-full h-full">
                        {uploadedImage && (
                          <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                        )}
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
                    <div className="bg-white backdrop-blur-sm rounded-lg p-4 overflow-y-auto border border-white/20">
                      <div className="space-y-3">
                        {/* Script Header */}
                        <div className="text-center pb-2 border-b border-white/30">
                          <h4 className="font-semibold text-sm text-gray-900">Professional Script</h4>
                          <p className="text-xs text-gray-600">Multi-platform optimized</p>
                        </div>
                        
                        {/* Script Sections */}
                        <div className="space-y-2">
                          <div className="bg-white/60 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">1</div>
                              <span className="font-medium text-xs text-gray-800">Hook</span>
                            </div>
                            <p className="text-xs text-gray-700 font-medium">
                              "Transform your experience..."
                            </p>
                          </div>
                          
                          <div className="bg-white/60 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">2</div>
                              <span className="font-medium text-xs text-gray-800">Content</span>
                            </div>
                            <p className="text-xs text-gray-700">
                              Product demo with features...
                            </p>
                          </div>
                          
                          <div className="bg-white/60 p-3 rounded-lg">
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
                  <div className="space-y-3 h-64">
                    {/* Promotional Email Template */}
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 h-[48%] overflow-hidden border border-white/20">
                      <div className="space-y-2 h-full flex flex-col">
                        {/* Email Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-black/10">
                          <div className="text-[9px] font-medium text-foreground">Promotional Email</div>
                          <div className="text-[8px] text-muted-foreground">📧 Marketing</div>
                        </div>
                        
                        {/* Email Content Preview */}
                        <div className="flex-1 flex gap-2">
                          <div className="w-12 h-12 bg-primary/20 rounded overflow-hidden flex-shrink-0">
                            {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <h4 className="text-[10px] font-bold text-foreground leading-tight">🎉 Exclusive Launch Offer</h4>
                            <p className="text-[8px] text-muted-foreground leading-relaxed">Get 25% off your first purchase. Limited time offer for our premium collection.</p>
                            <div className="bg-black text-white text-[7px] px-2 py-1 rounded inline-block">
                              Shop Now
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Newsletter Email Template */}
                    <div className="bg-white backdrop-blur-sm rounded-lg p-3 h-[48%] overflow-hidden border border-white/20">
                      <div className="space-y-2 h-full flex flex-col">
                        {/* Email Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-black/10">
                          <div className="text-[9px] font-medium text-foreground">Newsletter Email</div>
                          <div className="text-[8px] text-muted-foreground">📰 Weekly</div>
                        </div>
                        
                        {/* Email Content Preview */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-6 bg-primary/20 rounded overflow-hidden flex-shrink-0">
                              {uploadedImage && <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[9px] font-bold text-foreground leading-tight">This Week's Featured Product</h4>
                              <p className="text-[7px] text-muted-foreground">Discover what's new and trending in our latest collection.</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[7px]">
                              <span className="text-muted-foreground">• Product highlights</span>
                              <span className="text-muted-foreground">• Customer reviews</span>
                            </div>
                            <div className="text-center">
                              <div className="bg-black text-white text-[7px] px-3 py-1 rounded inline-block">
                                Read More
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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