import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QRDownloadModal from '@/components/QRDownloadModal';
import { OptimizedImage } from '@/components/ui/optimized-image';

const EmailTemplatesPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (!campaignResults) {
      navigate(returnTo || '/preview-results');
    }
  }, [campaignResults, navigate, returnTo]);

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

  const emailCopy = campaignResults.email_copy;
  const generatedImages = campaignResults.generated_images || [];
  
  // Use imageMapping for consistent images, fallback to generatedImages if not available
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || generatedImages?.[index]?.url || null;
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
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
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
          {/* Email Preview - Clean Layout */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Header with Background Image */}
            <div 
              className="relative text-center py-16 bg-cover bg-center bg-no-repeat min-h-[300px] flex flex-col justify-center"
              style={{
                backgroundImage: (getImage(0) || uploadedImage) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getImage(0) || uploadedImage})`
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
                backgroundImage: (getImage(1) || getImage(0) || uploadedImage) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${getImage(1) || getImage(0) || uploadedImage})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="container mx-auto px-8 max-w-4xl">
                <div className="flex items-center justify-center">
                  {(getImage(0) || uploadedImage) && (
                    <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-12 shadow-xl max-w-md">
                      <OptimizedImage 
                        src={getImage(0) || uploadedImage}
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
                backgroundImage: (getImage(2) || getImage(0) || uploadedImage) 
                  ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${getImage(2) || getImage(0) || uploadedImage})`
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Premium wireless headphones with a sleek ivory finish, designed for immersive sound and all-day comfort.
                </h2>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {emailCopy?.body || 'Experience high-quality audio with these stylish over-ear wireless headphones. Featuring soft cushioned ear pads, a minimalist design, and advanced noise isolation, they\'re perfect for music, calls, or daily use. Lightweight yet durable, these headphones combine performance with modern aesthetics, making them ideal for both casual listeners and professionals.'}
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-12 py-4 rounded-full text-lg shadow-lg"
                >
                  Shop Now
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/90 backdrop-blur-sm py-6 text-center">
              <p className="text-xs text-slate-300">
                © 2024 Premium Sound. All rights reserved.
              </p>
            </div>
          </div>

          {/* Email Details - Clean Layout */}
          {(emailCopy?.subject || emailCopy?.body) && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Email Content Details</h3>
              </div>
              
              {emailCopy?.subject && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject Line</label>
                  <div className="mt-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">{emailCopy.subject}</p>
                  </div>
                </div>
              )}
              
              {emailCopy?.body && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Body</label>
                  <div className="mt-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{emailCopy.body}</p>
                  </div>
                </div>
              )}
            </div>
          )}
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

export default EmailTemplatesPreview;