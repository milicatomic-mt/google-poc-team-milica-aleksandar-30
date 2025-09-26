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
  const activeCampaignResults = campaignResults;
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

  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || uploadedImage;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-8 left-8 z-20">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="tap-target hover-lift focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3 shadow-sm"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-center px-8 py-6 pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Banner Ads</h1>
          <p className="text-gray-600 text-sm mt-1">Review your AI-generated designs before download</p>
        </div>

        {/* Download Button - Absolute Top Right */}
        <div className="absolute top-8 right-8">
          <Button 
            onClick={handleDownload} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Content with increased spacing */}
      <div className="px-8 pb-8 mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Banner Grid */}
          <div className="space-y-6">
            {/* Top Row - Two Banners Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Banner - Product Focus */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-lg overflow-hidden shadow-lg h-64 relative">
                <div className="flex items-center h-full px-8">
                  {/* Left - Product Image */}
                  <div className="w-32 h-40 flex-shrink-0 flex items-center justify-center">
                    {getImage(1) && (
                      <img 
                        src={getImage(1)} 
                        alt="Premium Sound Product" 
                        className="w-full h-full object-contain filter drop-shadow-lg" 
                      />
                    )}
                  </div>
                  
                  {/* Right - Text Content */}
                  <div className="flex-1 ml-8 text-white">
                    <h3 className="text-white text-2xl font-bold uppercase tracking-wide mb-2">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-white/90 text-sm uppercase tracking-wider mb-3">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-white/80 text-xs font-medium mb-4">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </p>
                    <button className="bg-white text-gray-900 text-sm px-6 py-2 font-semibold hover:bg-gray-100 transition-colors rounded">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Banner - Lifestyle Focus */}
              <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-stone-100 rounded-lg overflow-hidden shadow-lg h-64 relative">
                <div className="flex items-center h-full">
                  {/* Left - Person Image */}
                  <div className="w-48 h-full relative overflow-hidden flex-shrink-0">
                    {getImage(0) && (
                      <img 
                        src={getImage(0)} 
                        alt="Person using product" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  
                  {/* Right - Text Content */}
                  <div className="flex-1 px-6 text-gray-900">
                    <h3 className="text-gray-900 text-2xl font-bold uppercase tracking-wide mb-2">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-gray-700 text-sm uppercase tracking-wider mb-3">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-gray-600 text-xs font-medium mb-4">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </p>
                    <button className="bg-gray-900 text-white text-sm px-6 py-2 font-semibold hover:bg-gray-800 transition-colors rounded">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Banner - Horizontal Layout */}
            <div className="bg-gradient-to-r from-slate-200 via-gray-100 to-stone-200 rounded-lg overflow-hidden shadow-lg h-32 relative">
              <div className="flex items-center h-full">
                {/* Left - Product Image */}
                <div className="w-24 h-24 ml-6 flex-shrink-0 flex items-center justify-center">
                  {getImage(1) && (
                    <img 
                      src={getImage(1)} 
                      alt="Premium Sound Product" 
                      className="w-full h-full object-contain filter drop-shadow-lg" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 ml-8 text-gray-900">
                  <h3 className="text-gray-900 text-xl font-bold uppercase tracking-wide mb-1">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-gray-700 text-sm uppercase tracking-wider mb-2">
                    MINIMALIST DESIGN
                  </p>
                  <p className="text-gray-600 text-xs font-medium">
                    WIRELESS BLUETOOTH CONNECTION WITH BASS RESONANCE
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-8 flex-shrink-0">
                  <button className="bg-gray-900 text-white text-sm px-8 py-3 font-semibold hover:bg-gray-800 transition-colors rounded-full">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Wide Horizontal Banner */}
            <div className="bg-gradient-to-r from-slate-200 via-gray-100 to-stone-200 rounded-lg overflow-hidden shadow-lg h-32 relative">
              <div className="flex items-center h-full">
                {/* Left - Product Image */}
                <div className="w-24 h-24 ml-6 flex-shrink-0 flex items-center justify-center">
                  {getImage(1) && (
                    <img 
                      src={getImage(1)} 
                      alt="Premium Sound Product" 
                      className="w-full h-full object-contain filter drop-shadow-lg" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 ml-8 text-gray-900">
                  <h3 className="text-gray-900 text-xl font-bold uppercase tracking-wide mb-1">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-gray-700 text-sm uppercase tracking-wider mb-2">
                    MINIMALIST DESIGN
                  </p>
                  <p className="text-gray-600 text-xs font-medium">
                    WIRELESS BLUETOOTH CONNECTION WITH BASS RESONANCE
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-8 flex-shrink-0">
                  <button className="bg-gray-900 text-white text-sm px-8 py-3 font-semibold hover:bg-gray-800 transition-colors rounded-full">
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