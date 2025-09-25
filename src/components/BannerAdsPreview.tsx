import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const BannerAdsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (!campaignResults) {
      navigate('/preview-results');
    }
  }, [campaignResults, navigate]);

  const handleBack = () => {
    navigate('/preview-results', {
      state: { campaignResults, uploadedImage, campaignId }
    });
  };

  const handleDownload = async () => {
    try {
      const { createDownloadSession } = await import('@/lib/download-session');
      const bannerData = {
        banner_ads: campaignResults?.banner_ads,
        generated_images: campaignResults?.generated_images,
        video_scripts: [],
        email_copy: { subject: '', body: '' },
        landing_page_concept: { hero_text: '', sub_text: '', cta: '' },
        uploadedImageUrl: uploadedImage
      };
      
      const sessionToken = await createDownloadSession(bannerData as CampaignCreationResponse);
      setDownloadUrl(window.location.origin + `/download?session=${sessionToken}&type=banner-ads`);
      setIsDownloadModalOpen(true);
    } catch (error) {
      console.error('Failed to create download session:', error);
      toast.error('Failed to prepare download. Please try again.');
    }
  };

  if (!campaignResults) {
    return null;
  }

  const bannerAds = campaignResults.banner_ads || [];
  const generatedImages = campaignResults.generated_images || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        {/* Back Button - Left */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Title and Subtitle */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Banner Ads</h1>
          <p className="text-gray-600 text-sm">Review your AI-generated designs before download</p>
        </div>

        {/* Download Button - Right */}
        <Button 
          onClick={handleDownload} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
        >
          Download
        </Button>
      </div>

      {/* Content */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Leaderboard Banner - 728×90 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Leaderboard Banner <span className="text-gray-500 font-normal">(728×90)</span>
            </h2>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
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
                  {/* Highlight border */}
                  <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                  
                  {/* Banner Content */}
                  <div 
                    className="relative bg-gradient-to-r from-amber-200 to-amber-100"
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
                        <h3 className="text-lg font-bold text-black">PREMIUM SOUND</h3>
                        <p className="text-xs text-gray-700 uppercase">MINIMALIST DESIGN</p>
                      </div>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <button className="bg-white text-black font-semibold px-6 py-2 rounded-full">
                        Shop Now
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
            <h2 className="text-xl font-semibold text-gray-900">
              Medium Rectangle Banner <span className="text-gray-500 font-normal">(300×250)</span>
            </h2>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
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
                    
                    {/* Highlighted Banner Area */}
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
                          
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-amber-100 flex flex-col justify-center px-4 text-center">
                            <h3 className="text-sm font-bold text-black uppercase">PREMIUM SOUND</h3>
                            <button className="bg-black text-white font-semibold px-4 py-1 rounded-full text-xs mt-1">
                              Shop Now
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
            <h2 className="text-xl font-semibold text-gray-900">
              Wide Skyscraper Banner <span className="text-gray-500 font-normal">(160×600)</span>
            </h2>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="flex">
                {/* Left Sidebar with Banner */}
                <div className="w-48 p-4 bg-gray-50 border-r">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Advertisement</h4>
                    
                    {/* Highlighted Banner Area */}
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                      
                      <div 
                        className="relative bg-gradient-to-b from-amber-200 to-amber-100"
                        style={{ width: '160px', height: '600px' }}
                      >
                        {/* Top product area */}
                        <div className="h-40 flex items-center justify-center p-3">
                          {(generatedImages[0]?.url || uploadedImage) && (
                            <img 
                              src={generatedImages[0]?.url || uploadedImage} 
                              alt="Premium headphones" 
                              className="w-20 h-20 object-contain" 
                            />
                          )}
                        </div>
                        
                        {/* Middle content */}
                        <div className="px-3 py-4 text-center">
                          <h3 className="text-sm font-bold text-black uppercase mb-2">PREMIUM SOUND</h3>
                          <p className="text-xs text-gray-700 uppercase mb-4">MINIMALIST DESIGN</p>
                          <div className="space-y-2 text-xs">
                            <div>✓ Superior Quality</div>
                            <div>✓ Wireless Freedom</div>
                            <div>✓ All-Day Comfort</div>
                          </div>
                        </div>
                        
                        {/* Bottom CTA */}
                        <div className="absolute bottom-4 left-3 right-3">
                          <button className="w-full bg-black text-white font-semibold py-2 rounded-full text-xs">
                            Shop Now
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
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    <div className="w-full h-48 bg-gray-200 rounded"></div>
                    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Half Page - 300×600 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Half Page Banner <span className="text-gray-500 font-normal">(300×600)</span>
            </h2>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-4">
                  <h3 className="text-lg font-semibold mb-3">Featured Article</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>This is the main content area of the webpage where articles and information would be displayed.</p>
                    <div className="w-full h-40 bg-gray-200 rounded"></div>
                    <p>The half-page banner format provides excellent visibility while maintaining good user experience.</p>
                    <p>Users can still access the main content while being exposed to the advertisement.</p>
                  </div>
                </div>
                
                {/* Right Sidebar with Banner */}
                <div className="w-80 p-4 bg-gray-50 border-l">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Advertisement</h4>
                    
                    {/* Highlighted Banner Area */}
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                      
                      <div 
                        className="relative"
                        style={{ width: '300px', height: '600px' }}
                      >
                        {/* Top Product Area */}
                        <div className="h-96 bg-gradient-to-b from-amber-200 to-amber-100 flex items-center justify-center relative">
                          {(generatedImages[0]?.url || uploadedImage) && (
                            <img 
                              src={generatedImages[0]?.url || uploadedImage} 
                              alt="Premium headphones" 
                              className="w-40 h-40 object-contain" 
                            />
                          )}
                        </div>
                        
                        {/* Bottom section */}
                        <div className="h-52 bg-black text-white flex flex-col justify-center px-6 text-center">
                          <h3 className="text-xl font-bold uppercase mb-2">PREMIUM SOUND</h3>
                          <p className="text-sm uppercase mb-4 opacity-80">MINIMALIST DESIGN</p>
                          <p className="text-sm font-semibold mb-4">SMASH THE COMPETITION<br/>WITH 30% DISCOUNT</p>
                          <button className="bg-white text-black font-semibold px-6 py-3 rounded-full">
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 font-medium">↑ Right sidebar placement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billboard - 970×250 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Billboard Banner <span className="text-gray-500 font-normal">(970×250)</span>
            </h2>
            
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              {/* Website Header */}
              <div className="bg-gray-100 px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-700">TechBlog.com</div>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>Reviews</span>
                    <span>News</span>
                    <span>Guides</span>
                    <span>Products</span>
                  </div>
                </div>
              </div>
              
              {/* Highlighted Banner Area - Above the fold */}
              <div className="p-4 bg-gray-50">
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"></div>
                  
                  <div 
                    className="relative bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200"
                    style={{ width: '970px', height: '250px', maxWidth: '100%' }}
                  >
                    {/* Left content area */}
                    <div className="absolute left-8 top-1/2 -translate-y-1/2">
                      <div className="space-y-3">
                        <h3 className="text-3xl font-bold text-black">PREMIUM SOUND</h3>
                        <p className="text-lg text-gray-700 uppercase tracking-wide">MINIMALIST DESIGN</p>
                        <p className="text-lg font-semibold text-black">
                          SMASH THE COMPETITION<br/>WITH 30% DISCOUNT
                        </p>
                        <button className="bg-black text-white font-semibold px-8 py-3 rounded-full text-lg mt-4">
                          Shop Now
                        </button>
                      </div>
                    </div>
                    
                    {/* Right product showcase */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage} 
                          alt="Premium headphones" 
                          className="w-48 h-48 object-contain" 
                        />
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 font-medium">↑ Above-the-fold premium placement</p>
              </div>
              
              {/* Website Content Preview */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-gray-200 rounded"></div>
                    <h4 className="font-semibold">Latest Tech Reviews</h4>
                    <p className="text-sm text-gray-600">Comprehensive reviews of the latest gadgets...</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-gray-200 rounded"></div>
                    <h4 className="font-semibold">Industry News</h4>
                    <p className="text-sm text-gray-600">Breaking news from the tech industry...</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-gray-200 rounded"></div>
                    <h4 className="font-semibold">Buyer's Guide</h4>
                    <p className="text-sm text-gray-600">Expert recommendations for your next purchase...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Banner Ads
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG value={downloadUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Scan with your mobile device to download
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(downloadUrl);
                  toast.success('Download link copied to clipboard');
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerAdsPreview;