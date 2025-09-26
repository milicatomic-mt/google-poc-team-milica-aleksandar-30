import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';
import { OptimizedImage } from '@/components/ui/optimized-image';

const EmailTemplatesPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (!campaignResults) {
      navigate(returnTo || '/preview-results');
    }
  }, [campaignResults, navigate, returnTo]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDownload = async () => {
    try {
      const { createDownloadSession } = await import('@/lib/download-session');
      const emailData = {
        email_copy: campaignResults?.email_copy,
        generated_images: campaignResults?.generated_images,
        video_scripts: [],
        banner_ads: [],
        landing_page_concept: { hero_text: '', sub_text: '', cta: '' },
        uploadedImageUrl: uploadedImage
      };
      
      const sessionToken = await createDownloadSession(emailData as CampaignCreationResponse);
      setDownloadUrl(window.location.origin + `/download?session=${sessionToken}&type=email-templates`);
      setIsDownloadModalOpen(true);
    } catch (error) {
      console.error('Failed to create download session:', error);
      toast.error('Failed to prepare download. Please try again.');
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Results
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
                <p className="text-sm text-muted-foreground">Review your AI-generated designs before download</p>
              </div>
            </div>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Email Preview - Clean Layout */}
          <div className="overflow-hidden">
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
            <div className="mt-8 space-y-6">
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

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Email Templates
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {downloadUrl && (
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={downloadUrl} size={200} />
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code with your mobile device to download the email templates.
            </p>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(downloadUrl);
                  toast.success('Link copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.open(downloadUrl, '_blank')}
              >
                Open Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplatesPreview;