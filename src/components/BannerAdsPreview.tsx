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
  const { campaignResults, uploadedImage, campaignId, imageMapping } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!campaignResults) {
      navigate('/preview-results');
    }
  }, [campaignResults, navigate]);

  const handleBack = () => {
    navigate('/preview-results', {
      state: { campaignResults, uploadedImage, campaignId, imageMapping }
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
    <div className="h-screen overflow-hidden relative">
      {/* Fullscreen Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: (imageMapping?.image_0 || uploadedImage) 
            ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageMapping?.image_0 || uploadedImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      />
      
      {/* Navigation Bar */}
      <div className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl w-full space-y-6">
          
          {/* Top Row - Two Square Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Banner - Person with Headphones */}
            <div className="aspect-square bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl overflow-hidden relative shadow-2xl max-w-sm mx-auto w-full">
              {(imageMapping?.image_0 || uploadedImage) && (
                <img 
                  src={imageMapping?.image_0 || uploadedImage} 
                  alt="Person with headphones" 
                  className="w-full h-full object-cover" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold uppercase tracking-wide">
                    Premium Sound
                  </h3>
                  <p className="text-white/90 text-sm uppercase tracking-wider">
                    Minimalist Design
                  </p>
                  <div className="flex items-start justify-between mt-4">
                    <span className="text-white/80 text-xs leading-tight">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </span>
                    <button className="bg-white text-gray-900 text-sm px-4 py-2 rounded-lg font-semibold ml-4">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Banner - Product Focus */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative shadow-2xl max-w-sm mx-auto w-full">
              {(imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage) && (
                <img 
                  src={imageMapping?.image_1 || imageMapping?.image_0 || uploadedImage} 
                  alt="Headphones product" 
                  className="w-full h-full object-cover" 
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-200 to-amber-100 p-6">
                <div className="space-y-2">
                  <h3 className="text-gray-900 text-xl font-bold uppercase tracking-wide">
                    Premium Sound
                  </h3>
                  <p className="text-gray-700 text-sm uppercase tracking-wider">
                    Minimalist Design
                  </p>
                  <div className="flex items-start justify-between mt-4">
                    <span className="text-gray-600 text-xs leading-tight">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </span>
                    <button className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg font-semibold ml-4">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Row - Wide Horizontal Banner */}
          <div className="bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl overflow-hidden relative shadow-2xl mx-auto max-w-4xl">
            <div className="flex items-center h-32 md:h-40">
              
              {/* Left - Person Image */}
              <div className="w-32 md:w-40 h-full relative overflow-hidden flex-shrink-0">
                {(imageMapping?.image_0 || uploadedImage) && (
                  <img 
                    src={imageMapping?.image_0 || uploadedImage} 
                    alt="Person with headphones" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              
              {/* Middle - Text Content */}
              <div className="flex-1 px-6 md:px-8 py-4">
                <h3 className="text-gray-900 text-xl md:text-2xl font-bold uppercase tracking-wide mb-2">
                  Premium Sound
                </h3>
                <p className="text-gray-700 text-sm uppercase tracking-wider mb-3">
                  Minimalist Design
                </p>
                <p className="text-gray-600 text-sm leading-tight">
                  WIRELESS BLUETOOTH CONNECTION<br/>
                  WITH BASS RESONANCE
                </p>
              </div>
              
              {/* Right - CTA Button */}
              <div className="pr-6 md:pr-8 flex-shrink-0">
                <button className="bg-gray-900 text-white text-lg px-6 py-3 rounded-2xl font-semibold shadow-lg hover:bg-gray-800 transition-colors">
                  Shop Now
                </button>
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