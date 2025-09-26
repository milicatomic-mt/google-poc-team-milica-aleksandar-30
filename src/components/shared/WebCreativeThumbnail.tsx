import React from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface WebCreativeThumbnailProps {
  campaignResults: any;
  imageMapping?: Record<string, string | null>;
  uploadedImage?: string;
}

export const WebCreativeThumbnail: React.FC<WebCreativeThumbnailProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage
}) => {
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || campaignResults?.generated_images?.[index]?.url || uploadedImage || null;
  };

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
            <div className="text-[6px] text-gray-500">https://yourlandingpage.com</div>
          </div>
        </div>

        {/* Landing Page Content - Simplified thumbnail version */}
        <div className="h-full p-1 pb-1 overflow-hidden bg-white">
          {/* Hero Section (mini) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 mb-1 text-center relative overflow-hidden" style={{height: '40px', borderRadius: '1px'}}>
            <div className="absolute inset-0 flex items-center justify-center">
              {getImage(0) && (
                <OptimizedImage
                  src={getImage(0)}
                  alt="Hero image" 
                  className="w-8 h-8 object-contain"
                  priority={true}
                />
              )}
            </div>
            <div className="relative z-10">
              <h1 className="text-[7px] font-bold text-gray-900 leading-none mb-0.5">
                {campaignResults?.landing_page_concept?.hero_section?.headline || 'Transform Your Sound Experience'}
              </h1>
              <p className="text-[4px] text-gray-700 leading-none">
                {campaignResults?.landing_page_concept?.hero_section?.description?.substring(0, 40) || 'Premium audio quality'}...
              </p>
            </div>
          </div>

          {/* Features Section (mini) */}
          <div className="grid grid-cols-3 gap-0.5 mb-1" style={{height: '16px'}}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-gray-50 p-0.5 text-center" style={{borderRadius: '1px'}}>
                <div className="text-[4px] font-bold text-gray-800 leading-none">Feature {i + 1}</div>
              </div>
            ))}
          </div>

          {/* Product Showcase (mini) */}
          <div className="bg-white border border-gray-200 p-1 mb-1 text-center" style={{height: '32px', borderRadius: '1px'}}>
            <div className="flex items-center justify-center h-full">
              {getImage(1) && (
                <OptimizedImage
                  src={getImage(1)}
                  alt="Product" 
                  className="w-6 h-6 object-contain mr-1"
                  priority={true}
                />
              )}
              <div>
                <div className="text-[5px] font-bold text-gray-900 leading-none">Product Name</div>
                <div className="text-[4px] text-gray-600 leading-none">Premium Quality</div>
              </div>
            </div>
          </div>

          {/* CTA Section (mini) */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1 text-center text-white" style={{height: '12px', borderRadius: '1px'}}>
            <div className="text-[5px] font-bold leading-none">
              {campaignResults?.landing_page_concept?.hero_section?.cta_text || 'Get Started Today'}
            </div>
          </div>

          {/* Footer placeholder (mini) */}
          <div className="bg-gray-100 mt-0.5" style={{height: '8px', borderRadius: '1px'}}>
            <div className="h-full flex items-center justify-center">
              <div className="text-[3px] text-gray-500">Footer Content</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};