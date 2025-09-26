import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const BannerAdsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Ensure page starts at the top on mount
  useEffect(() => {
    const prev = history.scrollRestoration as any;
    try { (history as any).scrollRestoration = 'manual'; } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    try { sessionStorage.removeItem('gallery-restore'); } catch {}
    return () => {
      try { (history as any).scrollRestoration = prev; } catch {}
    };
  }, []);

  useEffect(() => {
    if (!campaignResults) {
      navigate(returnTo || '/preview-results');
    }
  }, [campaignResults, navigate, returnTo]);

  const handleBack = () => {
    navigate(returnTo || '/preview-results', {
      state: { 
        campaignResults, 
        uploadedImage, 
        campaignId, 
        imageMapping,
        fromDetail: true 
      }
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
          Back
        </Button>

        {/* Title and Subtitle */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Banner Ads</h1>
          <p className="text-gray-600 text-sm mt-1">Review your AI-generated designs before download</p>
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
          
          {/* Leaderboard Banner (728×90) */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Leaderboard Banner <span className="text-gray-500 font-normal">(728×90)</span>
            </h2>
            
            <div className="bg-gradient-to-r from-slate-200 to-stone-200 overflow-hidden relative shadow-lg" style={{ height: '180px', maxWidth: '100%' }}>
              <div className="flex items-center h-full">
                {/* Left - Person Image */}
                <div className="w-48 h-full relative overflow-hidden flex-shrink-0">
                  {(imageMapping?.image_0 || uploadedImage) && (
                    <img 
                      src={imageMapping?.image_0 || uploadedImage} 
                      alt="Person with headphones" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 px-8 py-6">
                  <h3 className="text-gray-900 text-3xl font-bold uppercase tracking-wide mb-2">
                    Premium Sound
                  </h3>
                  <p className="text-gray-700 text-lg uppercase tracking-wider mb-3">
                    Minimalist Design
                  </p>
                  <p className="text-gray-600 text-sm font-semibold">
                    SMASH THE COMPETITION<br/>
                    WITH 30% DISCOUNT
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-8 flex-shrink-0">
                  <button className="bg-white/90 text-gray-900 text-lg px-8 py-4 font-semibold shadow-lg hover:bg-white transition-colors border border-gray-200">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Half Page and Medium Rectangle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Half Page Banner (300×600) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Half Page Banner <span className="text-gray-500 font-normal">(300×600)</span>
              </h2>
              
              <div className="bg-gradient-to-b from-slate-200 to-stone-200 overflow-hidden relative shadow-lg w-full" style={{ height: '400px' }}>
                {/* Top - Person Image */}
                <div className="h-80 relative overflow-hidden">
                  {(imageMapping?.image_0 || uploadedImage) && (
                    <img 
                      src={imageMapping?.image_0 || uploadedImage} 
                      alt="Person with headphones" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                
                {/* Bottom - Dark Section with Text */}
                <div className="h-20 bg-black text-white flex flex-col justify-center px-4 text-center">
                  <h3 className="text-white text-xs font-bold uppercase tracking-wide mb-0.5">
                    Premium Sound
                  </h3>
                  <p className="text-white/90 text-xs uppercase tracking-wider mb-0.5">
                    Minimalist Design
                  </p>
                  <p className="text-white text-xs font-semibold mb-1">
                    SMASH THE COMPETITION WITH 30% DISCOUNT
                  </p>
                  <button className="bg-white text-black text-xs px-3 py-0.5 rounded font-semibold hover:bg-gray-100 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Medium Rectangle Banner (300×250) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Medium Rectangle Banner <span className="text-gray-500 font-normal">(300×250)</span>
              </h2>
              
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative shadow-lg w-full" style={{ height: '400px' }}>
                {/* Top - Product Image */}
                <div className="h-72 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  {(imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage) && (
                    <img 
                      src={imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage} 
                      alt="Headphones product" 
                      className="w-48 h-48 object-contain" 
                    />
                  )}
                </div>
                
                {/* Bottom - Text Section */}
                <div className="h-28 bg-gradient-to-r from-slate-200 to-stone-200 flex flex-col justify-center px-4 text-center">
                  <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wide mb-1">
                    Premium Sound
                  </h3>
                  <p className="text-gray-700 text-xs uppercase tracking-wider mb-1">
                    Minimalist Design
                  </p>
                  <p className="text-gray-600 text-xs font-semibold mb-2">
                    SMASH THE COMPETITION WITH 30% DISCOUNT
                  </p>
                  <button className="bg-black text-white text-xs px-4 py-1 font-semibold hover:bg-gray-800 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Banner Ads
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Scan the QR code or copy the link to download your banner ad assets:
            </div>
            {downloadUrl && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={downloadUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">Scan with your phone</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(downloadUrl);
                      toast.success("Download link copied to clipboard!");
                    }}
                  >
                    Copy Download Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerAdsPreview;