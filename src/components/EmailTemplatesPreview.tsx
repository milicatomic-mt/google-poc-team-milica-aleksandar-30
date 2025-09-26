import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';
import { EmailTemplatesPreviewShared } from '@/components/shared/EmailTemplatesPreviewShared';

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
          <EmailTemplatesPreviewShared 
            campaignResults={campaignResults}
            imageMapping={imageMapping}
            uploadedImage={uploadedImage}
            variant="full"
          />

          {/* Email Details - Clean Layout */}
          {(emailCopy?.subject || emailCopy?.body) && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 mt-8">
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