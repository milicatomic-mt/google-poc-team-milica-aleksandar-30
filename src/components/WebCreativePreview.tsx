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
              
              {/* Complete Landing Page Preview */}
              <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-2xl max-h-[70vh] overflow-y-auto">
                <div className="w-full">
                  
                  {/* Hero Section */}
                  <section className="relative min-h-[500px] bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                    
                    <div className="relative z-10 container mx-auto px-8 py-12 grid lg:grid-cols-2 gap-8 items-center min-h-[500px]">
                      {/* Left Column - Content */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                            ✨ {campaignResults.banner_ads?.[0]?.headline ? 'New Launch' : 'Premium Product'}
                          </div>
                          <h1 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                            {landingPage?.hero_text || 
                             campaignResults.banner_ads?.[0]?.headline || 
                             'Transform Your Experience Today'}
                          </h1>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {landingPage?.sub_text || 
                             campaignResults.banner_ads?.[0]?.description || 
                             'Discover innovative solutions that drive exceptional results and elevate your lifestyle to new heights.'}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button size="lg" className="text-lg px-8 py-3 shadow-lg">
                            {landingPage?.cta || 
                             campaignResults.banner_ads?.[0]?.cta || 
                             'Get Started Now'}
                          </Button>
                          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                            Learn More
                          </Button>
                        </div>
                        
                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Free Shipping</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>30-Day Returns</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Premium Quality</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Hero Image */}
                      <div className="relative flex justify-center">
                        {(generatedImages?.[0]?.url || uploadedImage) && (
                          <div className="relative">
                            <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-60"></div>
                            <div className="relative bg-background/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-border">
                              <img 
                                src={generatedImages?.[0]?.url || uploadedImage} 
                                alt="Hero product showcase" 
                                className="w-full h-auto max-h-80 object-contain rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Features/Benefits Section */}
                  <section className="py-16 bg-muted/20">
                    <div className="container mx-auto px-8">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Solution</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                          Discover the features that make us the preferred choice for thousands of customers
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                              <div className="w-8 h-8 bg-primary rounded-full"></div>
                            </div>
                            {generatedImages?.[1]?.url && (
                              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                                <img src={generatedImages[1].url} alt="Feature 1" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">
                            {campaignResults.banner_ads?.[0]?.headline || 'Premium Quality'}
                          </h3>
                          <p className="text-muted-foreground">
                            {campaignResults.banner_ads?.[0]?.description || 'Experience unmatched quality with our carefully crafted solutions designed for excellence.'}
                          </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                              <div className="w-8 h-8 bg-secondary rounded-full"></div>
                            </div>
                            {generatedImages?.[2]?.url && (
                              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                                <img src={generatedImages[2].url} alt="Feature 2" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">
                            {campaignResults.banner_ads?.[1]?.headline || 'Fast & Reliable'}
                          </h3>
                          <p className="text-muted-foreground">
                            {campaignResults.banner_ads?.[1]?.description || 'Lightning-fast performance with 99.9% reliability ensures you never miss a beat.'}
                          </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center space-y-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                              <div className="w-8 h-8 bg-accent rounded-full"></div>
                            </div>
                            {generatedImages?.[3]?.url && (
                              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-background shadow-lg">
                                <img src={generatedImages[3].url} alt="Feature 3" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">
                            {campaignResults.banner_ads?.[2]?.headline || '24/7 Support'}
                          </h3>
                          <p className="text-muted-foreground">
                            {campaignResults.banner_ads?.[2]?.description || 'Round-the-clock expert support to help you succeed every step of the way.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Product/Service Details Section */}
                  <section className="py-16">
                    <div className="container mx-auto px-8">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">
                              Complete Solution for Your Needs
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                              {landingPage?.sub_text || 
                               'Our comprehensive approach ensures you get everything you need to succeed, backed by industry-leading technology and expert support.'}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {(campaignResults.banner_ads || [
                              { headline: "Advanced Technology", description: "Cutting-edge solutions that stay ahead of the curve" },
                              { headline: "Expert Team", description: "Dedicated professionals committed to your success" },
                              { headline: "Proven Results", description: "Track record of delivering exceptional outcomes" }
                            ]).slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1">
                                    {item.headline}
                                  </h4>
                                  <p className="text-muted-foreground text-sm">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button size="lg" className="px-8 py-3">
                            Explore Features
                          </Button>
                        </div>

                        <div className="relative">
                          {uploadedImage && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl blur-xl transform rotate-2"></div>
                              <div className="relative bg-background/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border">
                                <img 
                                  src={uploadedImage} 
                                  alt="Product details showcase" 
                                  className="w-full h-auto rounded-lg"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Social Proof Section */}
                  <section className="py-16 bg-muted/20">
                    <div className="container mx-auto px-8">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by Industry Leaders</h2>
                        <p className="text-lg text-muted-foreground">
                          Join thousands of satisfied customers who have transformed their business
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {[
                          {
                            quote: "This solution completely transformed our workflow. The results exceeded our expectations by 300%.",
                            author: "Sarah Johnson",
                            role: "CEO, TechCorp",
                            rating: 5
                          },
                          {
                            quote: "Outstanding quality and support. The team went above and beyond to ensure our success.",
                            author: "Michael Chen", 
                            role: "Director, InnovateNow",
                            rating: 5
                          },
                          {
                            quote: "The ROI was immediate. We saw improvements within the first week of implementation.",
                            author: "Emily Rodriguez",
                            role: "Manager, GrowthLab",
                            rating: 5
                          }
                        ].map((testimonial, index) => (
                          <div key={index} className="p-6 bg-background rounded-xl border border-border">
                            <div className="flex items-center gap-1 text-yellow-500 mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                              ))}
                            </div>
                            <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                            <div>
                              <div className="font-semibold text-foreground">{testimonial.author}</div>
                              <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Trust Badges */}
                      <div className="flex justify-center items-center gap-8 opacity-60">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">10K+</div>
                          <div className="text-sm text-muted-foreground">Happy Customers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">99.9%</div>
                          <div className="text-sm text-muted-foreground">Uptime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">24/7</div>
                          <div className="text-sm text-muted-foreground">Support</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Final CTA Section */}
                  <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                    <div className="container mx-auto px-8 text-center">
                      <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-4xl font-bold text-foreground">
                          Ready to Transform Your Business?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                          Join thousands of successful businesses and start your journey today. 
                          No setup fees, no long-term contracts.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                          <Button size="lg" className="text-lg px-12 py-4 shadow-lg">
                            {landingPage?.cta || 'Start Free Trial'}
                          </Button>
                          <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                            Schedule Demo
                          </Button>
                        </div>

                        {/* Supporting Visual */}
                        {generatedImages?.[0]?.url && (
                          <div className="mt-8 flex justify-center">
                            <div className="relative">
                              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-60"></div>
                              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-2xl">
                                <img 
                                  src={generatedImages[0].url} 
                                  alt="Success guarantee" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="bg-background border-t border-border py-12">
                    <div className="container mx-auto px-8">
                      <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                          <h3 className="font-bold text-foreground">Company</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>About Us</div>
                            <div>Careers</div>
                            <div>Press</div>
                            <div>Contact</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-bold text-foreground">Product</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Features</div>
                            <div>Pricing</div>
                            <div>Integrations</div>
                            <div>API</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-bold text-foreground">Support</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Help Center</div>
                            <div>Documentation</div>
                            <div>Community</div>
                            <div>Status</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-bold text-foreground">Legal</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Privacy Policy</div>
                            <div>Terms of Service</div>
                            <div>Cookie Policy</div>
                            <div>GDPR</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-border pt-8 mt-8 text-center text-sm text-muted-foreground">
                        © 2024 Your Company. All rights reserved.
                      </div>
                    </div>
                  </footer>
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