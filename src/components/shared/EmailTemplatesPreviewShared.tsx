import React from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface EmailTemplatesPreviewSharedProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  variant: 'full' | 'modal' | 'gallery';
}

export const EmailTemplatesPreviewShared: React.FC<EmailTemplatesPreviewSharedProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  variant
}) => {
  const activeCampaignResults = campaignResults;
  
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || activeCampaignResults?.generated_images?.[index]?.url || uploadedImage;
  };

  if (variant === 'gallery') {
    return (
      <div className="h-80 relative">
        {/* Modern Email Client Interface */}
        <div className="bg-white backdrop-blur-sm overflow-hidden h-full border border-white/20 shadow-inner">
          {/* Email Client Header */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="text-[8px] font-semibold text-gray-900">
                  {activeCampaignResults?.email_copy?.subject || 'Premium Sound - New Collection'}
                </div>
              </div>
              <div className="text-[6px] text-slate-500">Inbox</div>
            </div>
            <div className="text-[6px] text-slate-600 mt-1">
              From: premium@sound.com
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="p-3 space-y-3 overflow-hidden">
            {/* Header with Background */}
            <div 
              className="relative text-center py-6 bg-cover bg-center bg-no-repeat rounded text-white"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImage(0)})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100px'
              }}
            >
              <h1 className="text-[12px] font-bold text-white mb-1 drop-shadow-lg">Premium sound</h1>
              <p className="text-[6px] text-white/90 uppercase tracking-wider drop-shadow">MINIMALIST DESIGN</p>
            </div>

            {/* Product Showcase */}
            <div className="py-4 text-center">
              {getImage(0) && (
                <div className="inline-block bg-white/80 rounded-lg p-2 shadow-lg max-w-[80px]">
                  <OptimizedImage 
                    src={getImage(0)}
                    alt="Premium product"
                    className="w-full h-auto object-contain max-h-12"
                  />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="text-center space-y-2">
              <h2 className="text-[8px] font-bold text-slate-900">
                Premium wireless headphones with a sleek ivory finish
              </h2>
              
              <p className="text-[6px] text-slate-600 leading-relaxed">
                {activeCampaignResults?.email_copy?.body?.substring(0, 100) || "Experience high-quality audio with these stylish over-ear wireless headphones..."}
              </p>
              
              <button className="bg-slate-900 text-white text-[6px] px-3 py-1 rounded-full font-semibold">
                Shop Now
              </button>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/90 py-1 text-center rounded">
              <p className="text-[4px] text-slate-300">
                © 2024 Premium Sound. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal and Full variants use the same layout (full email template)
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with Background Image */}
      <div 
        className="relative text-center py-16 bg-cover bg-center bg-no-repeat min-h-[300px] flex flex-col justify-center"
        style={{
          backgroundImage: getImage(0) 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImage(0)})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Premium sound</h1>
        <p className="text-lg text-white/90 uppercase tracking-wider drop-shadow">MINIMALIST DESIGN</p>
      </div>

      {/* Product Showcase Section */}
      <div 
        className="py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: (getImage(1) || getImage(0)) 
            ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${getImage(1) || getImage(0)})`
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="flex items-center justify-center">
            {getImage(0) && (
              <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-12 shadow-xl max-w-md">
                <OptimizedImage 
                  src={getImage(0)}
                  alt="Premium product"
                  className="w-full h-auto object-contain max-h-80"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div 
        className="container mx-auto px-8 py-12 max-w-3xl bg-gradient-to-b from-transparent to-black/5"
        style={{
          backgroundImage: (getImage(2) || getImage(0)) 
            ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${getImage(2) || getImage(0)})`
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Premium wireless headphones with a sleek ivory finish, designed for immersive sound and all-day comfort.
          </h2>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {activeCampaignResults?.email_copy?.body || 'Experience high-quality audio with these stylish over-ear wireless headphones. Featuring soft cushioned ear pads, a minimalist design, and advanced noise isolation, they\'re perfect for music, calls, or daily use. Lightweight yet durable, these headphones combine performance with modern aesthetics, making them ideal for both casual listeners and professionals.'}
          </p>
          
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-12 py-4 rounded-full text-lg shadow-lg">
            Shop Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/90 backdrop-blur-sm py-6 text-center">
        <p className="text-xs text-slate-300">
          © 2024 Premium Sound. All rights reserved.
        </p>
      </div>
    </div>
  );
};