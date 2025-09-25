import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const BannerAdsPreview: React.FC = () => {
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

  const bannerAds = campaignResults.banner_ads || [];
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
                <h1 className="text-2xl font-bold text-foreground">Banner Ads</h1>
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
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Leaderboard Banner */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Leaderboard Banner</h2>
                  <p className="text-sm text-muted-foreground">(728×90)</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Most Popular</Badge>
              </div>
              
              <div className="p-6">
                <div 
                  className="relative bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg overflow-hidden border-2 border-border shadow-lg mx-auto"
                  style={{ width: '728px', height: '90px', maxWidth: '100%' }}
                >
                  <div className="relative h-full flex items-center">
                    {/* Left Product Image */}
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <div className="w-20 h-full bg-white/50 flex items-center justify-center p-2">
                        <img 
                          src={generatedImages[0]?.url || uploadedImage} 
                          alt="Product" 
                          className="w-full h-auto max-h-12 object-contain drop-shadow-sm" 
                        />
                      </div>
                    )}
                    
                    {/* Content Area */}
                    <div className="flex-1 px-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                          PREMIUM SOUND
                        </h3>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                          MINIMALIST DESIGN
                        </p>
                        <p className="text-xs text-slate-700 font-medium">
                          SMASH THE COMPETITION WITH 30% DISCOUNT
                        </p>
                      </div>
                      
                      <Button className="bg-amber-200 hover:bg-amber-300 text-slate-900 font-semibold px-6">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Half Page & Medium Rectangle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Half Page Banner */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/30 p-4 border-b">
                  <h2 className="text-lg font-semibold">Half Page Banner</h2>
                  <p className="text-sm text-muted-foreground">(300×600)</p>
                </div>
                
                <div className="p-6 flex justify-center">
                  <div 
                    className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg overflow-hidden border-2 border-border shadow-lg"
                    style={{ width: '300px', height: '600px' }}
                  >
                    {/* Top Product Area */}
                    {(generatedImages[0]?.url || uploadedImage) && (
                      <div className="h-72 bg-white/30 flex items-center justify-center p-4">
                        <img 
                          src={generatedImages[0]?.url || uploadedImage} 
                          alt="Product" 
                          className="w-full h-auto max-h-64 object-contain drop-shadow-lg" 
                        />
                      </div>
                    )}
                    
                    {/* Content Area */}
                    <div className="p-6 text-center space-y-4 bg-gradient-to-t from-amber-100 to-transparent">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide mb-2">
                          PREMIUM SOUND
                        </h3>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mb-4">
                          MINIMALIST DESIGN
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-700">
                        <p className="font-medium">SMASH THE COMPETITION</p>
                        <p className="font-bold text-slate-900">WITH 30% DISCOUNT</p>
                      </div>
                      
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medium Rectangle Banner */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/30 p-4 border-b">
                  <h2 className="text-lg font-semibold">Medium Rectangle Banner</h2>
                  <p className="text-sm text-muted-foreground">(300×250)</p>
                </div>
                
                <div className="p-6 flex justify-center">
                  <div 
                    className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-border shadow-lg"
                    style={{ width: '300px', height: '250px' }}
                  >
                    <div className="relative h-full flex flex-col">
                      {/* Product showcase area */}
                      <div className="flex-1 flex items-center justify-center p-4">
                        {(generatedImages[1]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[1]?.url || uploadedImage} 
                            alt="Product" 
                            className="w-32 h-32 object-contain drop-shadow-lg" 
                          />
                        )}
                      </div>
                      
                      {/* Bottom text area */}
                      <div className="bg-amber-100 p-4 text-center">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                            PREMIUM SOUND
                          </h3>
                          <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                            MINIMALIST DESIGN
                          </p>
                          <div className="pt-2">
                            <div className="text-xs text-slate-700 font-medium mb-2">
                              SMASH THE COMPETITION WITH 30% DISCOUNT
                            </div>
                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                              Shop Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Banner Content Details */}
          {bannerAds.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Banner Ad Content</h3>
                <div className="space-y-4">
                  {bannerAds.map((ad, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Headline</label>
                          <p className="mt-1 text-sm font-medium">{ad.headline}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Call to Action</label>
                          <p className="mt-1 text-sm font-medium text-primary">{ad.cta}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Banner Ads
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

export default BannerAdsPreview;