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
          {/* Leaderboard Banner */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Leaderboard Banner <span className="text-gray-500 font-normal">(728×90)</span>
            </h2>
            
            <div className="w-full">
              <div 
                className="relative bg-gradient-to-r from-amber-200 to-amber-100 overflow-hidden mx-auto"
                style={{ width: '728px', height: '90px', maxWidth: '100%' }}
              >
                {/* Left side with product image */}
                <div className="absolute left-0 top-0 h-full w-24 flex items-center justify-center">
                  {(generatedImages[0]?.url || uploadedImage) && (
                    <img 
                      src={generatedImages[0]?.url || uploadedImage} 
                      alt="Premium headphones" 
                      className="w-14 h-14 object-contain" 
                    />
                  )}
                  {/* Arrow decoration */}
                  <div className="absolute bottom-3 left-3">
                    <svg width="24" height="14" viewBox="0 0 24 14" className="text-white">
                      <path d="M2 7h20M18 3l4 4-4 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Center content */}
                <div className="absolute left-28 top-1/2 -translate-y-1/2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-black tracking-wide">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-xs text-gray-700 font-medium uppercase tracking-wider">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-xs text-black font-semibold">
                      SMASH THE COMPETITION<br/>WITH 30% DISCOUNT
                    </p>
                  </div>
                </div>

                {/* Right CTA button */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <button className="bg-white text-black font-semibold px-8 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout for remaining banners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Half Page Banner */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Half Page Banner <span className="text-gray-500 font-normal">(300×600)</span>
              </h2>
              
              <div className="flex justify-start">
                <div 
                  className="relative overflow-hidden"
                  style={{ width: '300px', height: '600px' }}
                >
                  {/* Top Product Area - Tan background */}
                  <div className="h-96 bg-gradient-to-b from-amber-200 to-amber-100 flex items-center justify-center relative">
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <img 
                        src={generatedImages[0]?.url || uploadedImage} 
                        alt="Premium headphones" 
                        className="w-48 h-48 object-contain" 
                      />
                    )}
                    {/* Arrow decoration */}
                    <div className="absolute top-6 left-4">
                      <svg width="24" height="14" viewBox="0 0 24 14" className="text-white">
                        <path d="M2 7h20M18 3l4 4-4 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Bottom section with black background */}
                  <div className="h-52 bg-black text-white flex flex-col justify-center px-6 text-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold uppercase tracking-wide">
                        PREMIUM SOUND
                      </h3>
                      <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                        MINIMALIST DESIGN
                      </p>
                      <div className="pt-2 space-y-3">
                        <p className="text-sm font-semibold">
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
              
              <div className="flex justify-start">
                <div 
                  className="relative overflow-hidden"
                  style={{ width: '300px', height: '250px' }}
                >
                  {/* Full background with product - White/Gray background */}
                  <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <img 
                        src={generatedImages[0]?.url || uploadedImage} 
                        alt="Premium headphones" 
                        className="w-32 h-32 object-contain absolute top-8" 
                      />
                    )}
                    
                    {/* Bottom section overlay with tan background */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-amber-100 flex flex-col justify-center px-4 text-center">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-black uppercase tracking-wide">
                          PREMIUM SOUND
                        </h3>
                        <p className="text-xs text-gray-700 font-medium uppercase tracking-wider">
                          MINIMALIST DESIGN
                        </p>
                        <div className="pt-1">
                          <div className="text-xs text-black font-semibold mb-2">
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