import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRDownloadModal from '@/components/QRDownloadModal';

const BannerAdsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const activeCampaignResults = campaignResults;
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

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

  const handleDownload = () => {
    setIsDownloadModalOpen(true);
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

        {/* QR Download Button - Absolute Top Right */}
        <div className="absolute top-8 right-8">
          <Button 
            onClick={handleDownload} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <QrCode className="w-4 h-4" />
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
              <div className="aspect-square bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg relative">
                <div className="flex items-center h-full">
                  {/* Left - Product Image */}
                  <div className="w-1/2 h-full flex items-center justify-center">
                    {getImage(1) && (
                      <img 
                        src={getImage(1)} 
                        alt="Premium Sound Product" 
                        className="w-full h-full object-cover filter drop-shadow-lg" 
                      />
                    )}
                  </div>
                  
                  {/* Right - Text Content */}
                  <div className="flex-1 px-8 text-white">
                    <h3 className="text-white text-6xl font-bold uppercase tracking-wide mb-2">
                      PREMIUM SOUND
                    </h3>
                    <p className="text-white/90 text-3xl uppercase tracking-wider mb-3">
                      MINIMALIST DESIGN
                    </p>
                    <p className="text-white/80 text-2xl font-medium mb-4">
                      WIRELESS BLUETOOTH CONNECTION<br/>
                      WITH BASS RESONANCE
                    </p>
                    <button className="bg-white text-gray-900 text-sm px-6 py-2 font-semibold hover:bg-gray-100 transition-colors rounded-full">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Banner - Full Image Design */}
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-lg relative">
                {/* Full Background Image */}
                {getImage(0) && (
                  <img 
                    src={getImage(0)} 
                    alt="Person using product" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Text Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-white text-6xl font-bold uppercase tracking-wide mb-2">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-white/90 text-3xl uppercase tracking-wider mb-3">
                    MINIMALIST DESIGN
                  </p>
                  <p className="text-white/80 text-2xl font-medium mb-4">
                    WIRELESS BLUETOOTH CONNECTION<br/>
                    WITH BASS RESONANCE
                  </p>
                  <button className="bg-white text-gray-900 text-sm px-6 py-2 font-semibold hover:bg-gray-100 transition-colors rounded-full">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Banner - Horizontal Layout */}
            <div className="bg-gradient-to-r from-slate-200 via-gray-100 to-stone-200 rounded-lg overflow-hidden shadow-lg h-[4.5rem] relative">
              <div className="flex items-center h-full">
                {/* Left - Product Image */}
                <div className="w-60 h-full flex items-center justify-center">
                  {getImage(1) && (
                    <img 
                      src={getImage(1)} 
                      alt="Premium Sound Product" 
                      className="w-full h-full object-cover filter drop-shadow-lg" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 ml-8 text-gray-900">
                  <h3 className="text-gray-900 text-2xl font-bold uppercase tracking-wide mb-2">
                    PREMIUM SOUND
                  </h3>
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
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg h-[4.5rem] relative">
              <div className="flex items-center h-full">
                {/* Left - Product Image */}
                <div className="w-60 h-full flex items-center justify-center">
                  {getImage(0) && (
                    <img 
                      src={getImage(0)} 
                      alt="Premium Sound Product" 
                      className="w-full h-full object-cover filter drop-shadow-lg" 
                    />
                  )}
                </div>
                
                {/* Middle - Text Content */}
                <div className="flex-1 ml-8 text-white">
                  <h3 className="text-white text-2xl font-bold uppercase tracking-wide mb-2">
                    PREMIUM SOUND
                  </h3>
                  <p className="text-white/80 text-xs font-medium">
                    WIRELESS BLUETOOTH CONNECTION WITH BASS RESONANCE
                  </p>
                </div>
                
                {/* Right - CTA Button */}
                <div className="pr-8 flex-shrink-0">
                  <button className="bg-white text-gray-900 text-sm px-8 py-3 font-semibold hover:bg-gray-100 transition-colors rounded-full">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Download Modal */}
      <QRDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        campaignData={{
          ...campaignResults,
          uploadedImageUrl: uploadedImage
        }}
        title="Download Campaign Assets"
      />
    </div>
  );
};

export default BannerAdsPreview;