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
      {/* Header with fixed positioning */}
      <div className="relative">
        {/* Back Button - Left Center */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Download Button - Right Top */}
        <Button 
          onClick={handleDownload} 
          className="absolute right-6 top-6 z-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        {/* Page Header */}
        <div className="pt-8 pb-6 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner Ads</h1>
            <p className="text-gray-600">Review your AI-generated designs before download</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Leaderboard Banner */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Leaderboard Banner <span className="text-gray-500 font-normal">(728×90)</span>
            </h2>
            
            <div className="w-full max-w-4xl">
              <div 
                className="relative bg-gradient-to-r from-amber-200 to-amber-100 overflow-hidden shadow-lg mx-auto"
                style={{ width: '728px', height: '90px', maxWidth: '100%' }}
              >
                {/* Left side with product image */}
                <div className="absolute left-0 top-0 h-full w-20 flex items-center justify-center">
                  {(generatedImages[0]?.url || uploadedImage) && (
                    <img 
                      src={generatedImages[0]?.url || uploadedImage} 
                      alt="Premium headphones" 
                      className="w-12 h-12 object-contain" 
                    />
                  )}
                  {/* Arrow decoration */}
                  <div className="absolute bottom-2 left-2">
                    <svg width="20" height="12" viewBox="0 0 20 12" className="text-white opacity-80">
                      <path d="M2 6h16M14 2l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Center content */}
                <div className="absolute left-24 top-1/2 -translate-y-1/2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-black tracking-wide">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-xs text-black font-medium">
                      SMASH THE COMPETITION<br/>WITH 30% DISCOUNT
                    </p>
                  </div>
                </div>

                {/* Right CTA button */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <button className="bg-white/90 hover:bg-white text-black font-semibold px-6 py-2 rounded-full shadow-md">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Half Page & Medium Rectangle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Half Page Banner */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Half Page Banner <span className="text-gray-500 font-normal">(300×600)</span>
              </h2>
              
              <div className="flex justify-center lg:justify-start">
                <div 
                  className="relative bg-gradient-to-b from-amber-200 to-amber-100 overflow-hidden shadow-lg"
                  style={{ width: '300px', height: '600px' }}
                >
                  {/* Top Product Area */}
                  <div className="h-80 bg-gradient-to-b from-amber-200 to-amber-100 flex items-center justify-center p-6">
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <img 
                        src={generatedImages[0]?.url || uploadedImage} 
                        alt="Premium headphones" 
                        className="w-full h-auto max-h-72 object-contain drop-shadow-xl" 
                      />
                    )}
                    {/* Arrow decoration */}
                    <div className="absolute top-6 left-4">
                      <svg width="20" height="12" viewBox="0 0 20 12" className="text-white opacity-80">
                        <path d="M2 6h16M14 2l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Bottom section with black background */}
                  <div className="h-52 bg-black text-white flex flex-col justify-center px-6 text-center">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold uppercase tracking-wide">
                        PREMIUM SOUND
                      </h3>
                      <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                        MINIMALIST DESIGN
                      </p>
                      <div className="pt-4 space-y-2">
                        <p className="text-sm font-medium">
                          SMASH THE COMPETITION<br/>WITH 30% DISCOUNT
                        </p>
                        <button className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Rectangle Banner */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Medium Rectangle Banner <span className="text-gray-500 font-normal">(300×250)</span>
              </h2>
              
              <div className="flex justify-center lg:justify-start">
                <div 
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shadow-lg"
                  style={{ width: '300px', height: '250px' }}
                >
                  {/* Top section with product */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <img 
                        src={generatedImages[0]?.url || uploadedImage} 
                        alt="Premium headphones" 
                        className="w-24 h-24 object-contain drop-shadow-lg" 
                      />
                    )}
                  </div>
                  
                  {/* Bottom section with tan background */}
                  <div className="h-32 bg-amber-100 flex flex-col justify-center px-4 text-center">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-black uppercase tracking-wide">
                        PREMIUM SOUND
                      </h3>
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                        MINIMALIST DESIGN
                      </p>
                      <div className="pt-2">
                        <div className="text-xs text-black font-medium mb-3">
                          SMASH THE COMPETITION<br/>WITH 30% DISCOUNT
                        </div>
                        <button className="bg-black text-white font-semibold px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors">
                          Shop Now
                        </button>
                      </div>
                    </div>
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