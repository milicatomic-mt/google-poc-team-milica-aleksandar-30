import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const WebCreativePreview: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Web Creative</h1>
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
          {/* Web Creative Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                      ✨ New Launch
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                      {landingPage?.hero_text || 
                       campaignResults.banner_ads?.[0]?.headline || 
                       'Transform Your Experience Today'}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {landingPage?.sub_text || 
                       campaignResults.banner_ads?.[0]?.description || 
                       'Discover innovative solutions that drive exceptional results for your business.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="text-lg px-8 py-4">
                        {landingPage?.cta || 
                         campaignResults.banner_ads?.[0]?.cta || 
                         'Get Started Now'}
                      </Button>
                      <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                        Learn More
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    {(getImage(0) || uploadedImage) && (
                      <img 
                        src={getImage(0) || uploadedImage} 
                        alt="Product showcase"
                        className="w-full h-[400px] object-cover rounded-lg shadow-xl"
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Product Highlights */}
            <section className="py-20 bg-muted/30">
              <div className="container mx-auto px-6">
                <div className="text-center space-y-6 mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Key Features</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover what makes this product special for you.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { title: "Premium Quality", description: "Built with the finest materials for lasting durability", icon: "⭐" },
                    { title: "Fast Delivery", description: "Get your order delivered in 24-48 hours", icon: "🚀" },
                    { title: "Money Back", description: "30-day satisfaction guarantee or full refund", icon: "💎" }
                  ].map((feature, idx) => (
                    <div key={idx} className="text-center space-y-4 p-6 rounded-lg bg-card border border-border">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Detailed Product Section */}
            <section className="py-20">
              <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Why Choose Our Product?
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Advanced Technology</h3>
                          <p className="text-muted-foreground">Cutting-edge innovation meets practical design for optimal performance.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Sustainable Materials</h3>
                          <p className="text-muted-foreground">Eco-friendly construction that doesn't compromise on quality.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Expert Support</h3>
                          <p className="text-muted-foreground">24/7 customer service from our dedicated support team.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.slice(0, 4).map((img, idx) => (
                      <img 
                        key={idx}
                        src={img.url} 
                        alt={`Product view ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-primary text-primary-foreground">
              <div className="container mx-auto px-6">
                <div className="text-center space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
                  <p className="text-lg max-w-2xl mx-auto">
                    Join thousands of satisfied customers who have transformed their experience.
                  </p>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    {landingPage?.cta || 'Get Started Today'}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Web Creative
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Scan the QR code or copy the link to download your web creative assets:
            </div>
            {downloadUrl && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={downloadUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">Scan with your phone</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(downloadUrl);
                      toast.success("Download link copied to clipboard!");
                    }}
                  >
                    Copy Download Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebCreativePreview;