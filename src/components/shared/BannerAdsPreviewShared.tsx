import React from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface BannerAdsPreviewSharedProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  variant: 'full' | 'modal' | 'gallery';
}

export const BannerAdsPreviewShared: React.FC<BannerAdsPreviewSharedProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  variant
}) => {
  const activeCampaignResults = campaignResults;
  
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || uploadedImage;
  };

  if (variant === 'gallery') {
    return (
      <div className="h-72 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
        {/* Browser-like Screenshot Mockup */}
        <div className="h-full bg-white">
          {/* Browser Header */}
          <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
              <div className="text-[6px] text-gray-500">https://yourads.com</div>
            </div>
          </div>

          {/* Banner Ads Content - Mini versions */}
          <div className="h-full p-2 pb-2 overflow-hidden space-y-1">
            {/* Leaderboard Banner (mini) */}
            <div className="bg-gradient-to-r from-slate-200 to-stone-200 overflow-hidden relative" style={{height: '24px', borderRadius: '1px'}}>
              <div className="flex items-center h-full">
                <div className="w-6 h-full relative overflow-hidden flex-shrink-0">
                  {getImage(0) && (
                    <OptimizedImage
                      src={getImage(0)}
                      alt="Person with headphones" 
                      className="w-full h-full object-cover"
                      priority={true}
                    />
                  )}
                </div>
                <div className="flex-1 px-2">
                  <h3 className="text-gray-900 text-[6px] font-bold uppercase leading-none">
                    {activeCampaignResults?.banner_ads?.[0]?.headline || 'Premium Sound'}
                  </h3>
                  <p className="text-gray-700 text-[4px] uppercase leading-none">Minimalist Design</p>
                </div>
                <div className="pr-1 flex-shrink-0">
                  <button className="bg-white/90 text-gray-900 text-[4px] px-1 py-0.5 font-semibold border border-gray-200 leading-none">
                    {activeCampaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Half Page and Medium Rectangle (mini) */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-gradient-to-b from-slate-200 to-stone-200 overflow-hidden relative" style={{height: '36px', borderRadius: '1px'}}>
                <div className="h-6 relative overflow-hidden">
                  {getImage(0) && (
                    <OptimizedImage
                      src={getImage(0)}
                      alt="Person with headphones" 
                      className="w-full h-full object-cover"
                      priority={true}
                    />
                  )}
                </div>
                <div className="h-3 bg-black text-white flex flex-col justify-center px-1 text-center">
                  <h3 className="text-white text-[4px] font-bold uppercase leading-none">
                    {activeCampaignResults?.banner_ads?.[0]?.headline || 'Premium Sound'}
                  </h3>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative" style={{height: '36px', borderRadius: '1px'}}>
                <div className="h-6 relative overflow-hidden flex items-center justify-center">
                  {getImage(1) && (
                    <OptimizedImage
                      src={getImage(1)}
                      alt="Headphones product" 
                      className="w-4 h-4 object-contain"
                      priority={true}
                    />
                  )}
                </div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-stone-200 flex flex-col justify-center px-1 text-center">
                  <button className="bg-black text-white text-[3px] px-1 font-semibold leading-none">
                    {activeCampaignResults?.banner_ads?.[0]?.cta || 'Shop Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal and Full variants use the same layout (full-sized banners)
  return (
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
    </div>
  );
};