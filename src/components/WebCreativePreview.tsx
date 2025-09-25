import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const WebCreativePreview: React.FC = () => {
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
      const webCreativeData = {
        landing_page_concept: campaignResults?.landing_page_concept,
        generated_images: campaignResults?.generated_images,
        video_scripts: [],
        email_copy: { subject: '', body: '' },
        banner_ads: [],
        uploadedImageUrl: uploadedImage
      };
      
      const sessionToken = await createDownloadSession(webCreativeData as CampaignCreationResponse);
      setDownloadUrl(window.location.origin + `/download?session=${sessionToken}&type=web-creative`);
      setIsDownloadModalOpen(true);
    } catch (error) {
      console.error('Failed to create download session:', error);
      toast.error('Failed to prepare download. Please try again.');
    }
  };

  if (!campaignResults) {
    return null;
  }

  const landingPage = campaignResults.landing_page_concept;
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
                <h1 className="text-2xl font-bold text-foreground">Web Creative</h1>
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
          {/* Landing Page Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-6 border-b">
                <h2 className="text-xl font-semibold mb-2">Landing Page</h2>
              </div>
              
              {/* Browser mockup */}
              <div className="bg-white">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded px-3 py-1 text-xs text-muted-foreground border">
                      headphones-logo.com
                    </div>
                  </div>
                </div>

                {/* Website content */}
                <div className="relative">
                  {/* Header navigation */}
                  <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
                    <div className="text-sm font-semibold">Headphones Logo</div>
                    <nav className="flex gap-6 text-sm">
                      <span>Kit</span>
                      <span>Collections</span>
                      <span>Collections</span>
                      <span>Variables Set</span>
                    </nav>
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🇺🇸</div>
                      <div className="text-xs">🛍️ 1</div>
                    </div>
                  </div>

                  {/* Hero section */}
                  <div className="flex min-h-[400px]">
                    {/* Left content */}
                    <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-gradient-to-r from-gray-50 to-white">
                      <div className="max-w-md">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          PREMIUM SOUND
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                          MINIMALIST DESIGN
                        </div>
                        
                        <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                          {landingPage?.hero_text || 'Elevate your Music Experience'}
                        </h1>
                        
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          {landingPage?.sub_text || 'Experience premium wireless headphones with sleek design and immersive sound quality.'}
                        </p>
                        
                        <Button className="bg-amber-100 hover:bg-amber-200 text-slate-900 font-semibold px-6">
                          {landingPage?.cta || 'Shop Now'}
                        </Button>
                      </div>
                    </div>

                    {/* Right hero image */}
                    <div className="flex-1 relative bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                      {/* View all collection button */}
                      <div className="absolute top-6 right-6 z-10">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white/80 backdrop-blur text-slate-600 border-white/50"
                        >
                          View all collection →
                        </Button>
                      </div>
                      
                      {generatedImages[0]?.url || uploadedImage ? (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage}
                          alt="Product showcase"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-48 h-48 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product categories */}
                  <div className="px-8 py-8 bg-white">
                    <div className="grid grid-cols-3 gap-4 max-w-2xl">
                      {[
                        { name: 'Classic', color: 'from-red-400 to-teal-500' },
                        { name: 'Track', color: 'from-slate-600 to-slate-400' },
                        { name: 'Double', color: 'from-teal-400 to-blue-400' }
                      ].map((category, index) => (
                        <div key={category.name} className="text-center">
                          <div className={`w-full aspect-square bg-gradient-to-br ${category.color} rounded-lg mb-2`}></div>
                          <div className="text-xs font-medium text-slate-600">{category.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Landing Page Content</h3>
              <div className="space-y-4">
                {landingPage?.hero_text && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hero Text</label>
                    <p className="mt-1 text-sm">{landingPage.hero_text}</p>
                  </div>
                )}
                {landingPage?.sub_text && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subheading</label>
                    <p className="mt-1 text-sm">{landingPage.sub_text}</p>
                  </div>
                )}
                {landingPage?.cta && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Call to Action</label>
                    <p className="mt-1 text-sm font-medium text-primary">{landingPage.cta}</p>
                  </div>
                )}
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
              Download Web Creative
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

export default WebCreativePreview;