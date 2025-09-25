import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const EmailTemplatesPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (!campaignResults) {
      navigate('/preview-results');
    }
  }, [campaignResults, navigate]);

  const handleBack = () => {
    navigate('/preview-results', {
      state: { campaignResults, uploadedImage, campaignId }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Email Preview */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Logo header */}
              <div className="bg-muted/30 p-4 border-b">
                <h2 className="text-lg font-semibold">Logo</h2>
              </div>
              
              {/* Email content */}
              <div className="bg-white">
                {/* Header */}
                <div className="text-center py-8 bg-gradient-to-r from-amber-50 to-amber-100">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Premium sound</h1>
                  <p className="text-sm text-slate-600 uppercase tracking-wider">MINIMALIST DESIGN</p>
                </div>

                {/* Hero Image */}
                <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 py-12">
                  <div className="container mx-auto px-8 max-w-2xl">
                    <div className="flex items-center justify-center">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage}
                          alt="Premium wireless headphones"
                          className="w-64 h-64 object-contain drop-shadow-xl"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="container mx-auto px-8 py-8 max-w-2xl">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      Premium wireless headphones with a sleek ivory finish, designed for immersive sound and all-day comfort.
                    </h2>
                    
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {emailCopy?.body || 'Experience high-quality audio with these stylish over-ear wireless headphones. Featuring soft cushioned ear pads, a minimalist design, and advanced noise isolation, they\'re perfect for music, calls, or daily use. Lightweight yet durable, these headphones combine performance with modern aesthetics, making them ideal for both casual listeners and professionals.'}
                    </p>
                    
                    <Button 
                      size="lg" 
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-full"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 py-6 text-center border-t">
                  <p className="text-xs text-slate-500">
                    © 2024 Premium Sound. All rights reserved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Email Content Details</h3>
              </div>
              
              <div className="space-y-4">
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
                      <p className="text-sm leading-relaxed">{emailCopy.body}</p>
                    </div>
                  </div>
                )}

                {/* Email Stats Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">24.5%</div>
                    <div className="text-xs text-muted-foreground">Expected Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3.2%</div>
                    <div className="text-xs text-muted-foreground">Expected Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">8.7%</div>
                    <div className="text-xs text-muted-foreground">Conversion Potential</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Email Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">✅ What's Working</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clear, compelling subject line</li>
                    <li>• Strong visual hierarchy</li>
                    <li>• Single clear call-to-action</li>
                    <li>• Mobile-responsive design</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">💡 Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• A/B test subject variations</li>
                    <li>• Add personalization tokens</li>
                    <li>• Include social proof elements</li>
                    <li>• Test send times for your audience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Email Template
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG value={downloadUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Scan with your mobile device to download
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(downloadUrl);
                  toast.success('Download link copied to clipboard');
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplatesPreview;