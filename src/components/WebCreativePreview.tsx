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

                  {/* Hero Section */}
                  <div className="flex min-h-[500px]">
                    {/* Left content */}
                    <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-gradient-to-r from-gray-50 to-white">
                      <div className="max-w-md">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          PREMIUM QUALITY
                        </div>
                        
                        <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                          {landingPage?.hero_text || 'Experience Premium Quality Like Never Before'}
                        </h1>
                        
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          {landingPage?.sub_text || 'Discover our premium collection designed for the modern lifestyle. Quality meets innovation.'}
                        </p>
                        
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 text-lg">
                          {landingPage?.cta || 'Shop Now - $299'}
                        </Button>
                      </div>
                    </div>

                    {/* Right hero image */}
                    <div className="flex-1 relative bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
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

                  {/* Product Highlights */}
                  <div className="px-8 py-12 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Why Choose Our Product</h2>
                      <div className="grid grid-cols-3 gap-8">
                        {[
                          { 
                            title: 'Premium Materials', 
                            description: 'Crafted with the finest materials for lasting durability',
                            icon: '✨'
                          },
                          { 
                            title: 'Advanced Technology', 
                            description: 'State-of-the-art features for superior performance',
                            icon: '⚡'
                          },
                          { 
                            title: 'Lifetime Warranty', 
                            description: 'Complete peace of mind with our lifetime guarantee',
                            icon: '🛡️'
                          }
                        ].map((feature, index) => (
                          <div key={index} className="text-center bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-600">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Product Section */}
                  <div className="px-8 py-12 bg-white">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-slate-900">Product Details</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                          Every detail has been carefully crafted to deliver an exceptional experience. From the premium materials to the innovative design, this product represents the perfect fusion of form and function.
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-slate-900 rounded-full mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-slate-900">Superior Construction</h4>
                              <p className="text-slate-600">Built to last with premium materials and expert craftsmanship</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-slate-900 rounded-full mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-slate-900">Innovative Features</h4>
                              <p className="text-slate-600">Advanced technology that enhances your daily experience</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 h-80 flex items-center justify-center">
                        {generatedImages[1]?.url || uploadedImage ? (
                          <img 
                            src={generatedImages[1]?.url || uploadedImage}
                            alt="Product details"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-slate-500">Product Detail Image</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="px-8 py-12 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">Loved by Thousands</h2>
                      <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className="text-yellow-400 text-2xl">★</span>
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-slate-900">4.9/5</span>
                        <span className="text-slate-600">(2,847 reviews)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          {
                            name: "Sarah Johnson",
                            review: "Absolutely amazing quality! Exceeded all my expectations.",
                            rating: 5
                          },
                          {
                            name: "Michael Chen", 
                            review: "Best purchase I've made this year. Highly recommended!",
                            rating: 5
                          },
                          {
                            name: "Emily Rodriguez",
                            review: "Perfect blend of style and functionality. Love it!",
                            rating: 5
                          }
                        ].map((testimonial, index) => (
                          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex mb-3">
                              {[1,2,3,4,5].map(star => (
                                <span key={star} className="text-yellow-400">★</span>
                              ))}
                            </div>
                            <p className="text-slate-600 mb-3 italic">"{testimonial.review}"</p>
                            <p className="font-semibold text-slate-900">- {testimonial.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Purchase Options */}
                  <div className="px-8 py-12 bg-white">
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-3xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
                      <p className="text-lg text-slate-600 mb-8">Choose the perfect option for your needs</p>
                      
                      <div className="bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200 rounded-xl p-8 mb-8">
                        <div className="text-6xl font-bold text-slate-900 mb-2">$299</div>
                        <div className="text-lg text-slate-600 mb-6">One-time purchase</div>
                        <div className="space-y-2 text-slate-600 mb-6">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Free shipping worldwide</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>30-day money-back guarantee</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Lifetime warranty</span>
                          </div>
                        </div>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 text-lg">
                          Order Now - Limited Stock!
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Call-to-Action Section */}
                  <div className="px-8 py-12 bg-slate-900 text-white">
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
                      <p className="text-xl text-slate-300 mb-8">Join thousands of satisfied customers who've made the switch</p>
                      <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 w-32 h-32 flex items-center justify-center">
                          {generatedImages[0]?.url || uploadedImage ? (
                            <img 
                              src={generatedImages[0]?.url || uploadedImage}
                              alt="Product"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400">Product</div>
                          )}
                        </div>
                      </div>
                      <Button className="bg-white hover:bg-gray-100 text-slate-900 font-semibold px-8 py-3 text-lg">
                        Order Yours Today - Limited Stock!
                      </Button>
                      <p className="text-sm text-slate-400 mt-4">✓ Free shipping ✓ 30-day returns ✓ Lifetime warranty</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-8 bg-gray-100 border-t">
                    <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-4 gap-8 mb-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>Help Center</div>
                            <div>Contact Us</div>
                            <div>Live Chat</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Policies</h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>Shipping</div>
                            <div>Returns</div>
                            <div>Privacy</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>About Us</div>
                            <div>Careers</div>
                            <div>Press</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3">Follow Us</h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>Facebook</div>
                            <div>Instagram</div>
                            <div>Twitter</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4 text-center text-xs text-slate-500">
                        © 2024 Premium Brand. All rights reserved.
                      </div>
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