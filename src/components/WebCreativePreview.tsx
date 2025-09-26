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
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {landingPage?.product_highlights?.features?.map((feature, idx) => {
              const [title, description] = feature.split(': ');
              const icons = ["⭐", "💰", "🎨", "❤️"];
              return (
                <div key={idx} className="text-center space-y-4 p-6 rounded-lg bg-card border border-border">
                  <div className="text-4xl">{icons[idx] || "✨"}</div>
                  <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              );
            }) || [
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
                {landingPage?.detailed_product_section ? "Product Details" : "Why Choose Our Product?"}
              </h2>
              {landingPage?.detailed_product_section?.copy ? (
                <p className="text-muted-foreground leading-relaxed">
                  {landingPage.detailed_product_section.copy}
                </p>
              ) : landingPage?.value_proposition?.scannable_bullets ? (
                <div className="space-y-4">
                  {landingPage.value_proposition.scannable_bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{bullet}</h3>
                        <p className="text-muted-foreground">Experience the benefits of our innovative approach.</p>
                      </div>
                    </div>
                  ))}
                  {landingPage?.value_proposition?.unique_selling_points && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-muted-foreground italic">{landingPage.value_proposition.unique_selling_points}</p>
                    </div>
                  )}
                </div>
              ) : (
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
              )}
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

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {landingPage?.social_proof ? (
              <>
                {landingPage.social_proof.testimonials && (
                  <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500">⭐</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{landingPage.social_proof.testimonials}"</p>
                  </div>
                )}
                {landingPage.social_proof.reviews_ratings && (
                  <div className="p-6 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500">⭐</span>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{landingPage.social_proof.reviews_ratings}"</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"Absolutely amazing quality! Exceeded all my expectations and arrived faster than promised."</p>
                  <div>
                    <div className="font-semibold text-foreground">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">Verified Buyer</div>
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"I've ordered multiple times and the consistency is incredible. Highly recommend to everyone."</p>
                  <div>
                    <div className="font-semibold text-foreground">Mike Chen</div>
                    <div className="text-sm text-muted-foreground">Repeat Customer</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Choose Your Package</h2>
            <p className="text-lg text-muted-foreground">Select the perfect option for your needs</p>
          </div>
          {landingPage?.pricing_section?.pricing_cards ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {landingPage.pricing_section.pricing_cards.split(', ').map((card, idx) => {
                const [name, price] = card.split(': ');
                const isPopular = idx === 1; // Make second option popular by default
                return (
                  <div key={idx} className={`p-6 rounded-lg ${isPopular ? 'border-2 border-primary bg-card relative' : 'border border-border bg-card'}`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-foreground mb-2">{name}</h3>
                    <div className="text-3xl font-bold text-foreground mb-4">{price}</div>
                    {landingPage.pricing_section.guarantees && (
                      <div className="text-sm text-muted-foreground mb-4 p-3 bg-primary/10 rounded-lg">
                        {landingPage.pricing_section.guarantees}
                      </div>
                    )}
                    <Button className={`w-full ${isPopular ? '' : 'variant-outline'}`}>
                      {landingPage?.cta_section?.repeated_cta?.split('!')[0] || landingPage?.cta || 'Buy Now'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">Starter</h3>
                <div className="text-3xl font-bold text-foreground mb-4">$29</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Basic features
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Email support
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Choose Starter</Button>
              </div>
              <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
                <div className="text-3xl font-bold text-foreground mb-4">$59</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    All features
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Advanced analytics
                  </li>
                </ul>
                <Button className="w-full">Choose Pro</Button>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-foreground mb-4">$99</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Custom integrations
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              {landingPage?.cta_section?.repeated_cta?.split('!')[0] || "Ready to Get Started?"}
            </h2>
            <p className="text-lg opacity-90">
              {landingPage?.cta_section?.urgency || "Join thousands of satisfied customers today. Limited stock available!"}
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              {landingPage?.cta_section?.repeated_cta || landingPage?.cta || "Order Yours Today"}
            </Button>
            <div className="flex items-center justify-center gap-6 pt-6 text-sm opacity-80">
              {landingPage?.pricing_section?.guarantees ? (
                landingPage.pricing_section.guarantees.split(', ').map((guarantee, idx) => (
                  <span key={idx}>✓ {guarantee}</span>
                ))
              ) : (
                <>
                  <span>✓ Free shipping worldwide</span>
                  <span>✓ 30-day money-back guarantee</span>
                  <span>✓ 24/7 support</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {landingPage?.footer?.support_links ? "Support" : "Support"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {landingPage?.footer?.support_links ? 
                  landingPage.footer.support_links.split(', ').map((link, idx) => (
                    <li key={idx}><a href="#" className="hover:text-foreground">{link}</a></li>
                  )) : (
                  <>
                    <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                    <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                    <li><a href="#" className="hover:text-foreground">Live Chat</a></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Policies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {landingPage?.footer?.policies ? 
                  landingPage.footer.policies.split(', ').map((policy, idx) => (
                    <li key={idx}><a href="#" className="hover:text-foreground">{policy}</a></li>
                  )) : (
                  <>
                    <li><a href="#" className="hover:text-foreground">Shipping & Returns</a></li>
                    <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {landingPage?.footer?.social_media ? 
                  landingPage.footer.social_media.split(', ').map((social, idx) => (
                    <li key={idx}><a href="#" className="hover:text-foreground">{social}</a></li>
                  )) : (
                  <>
                    <li><a href="#" className="hover:text-foreground">Twitter</a></li>
                    <li><a href="#" className="hover:text-foreground">Instagram</a></li>
                    <li><a href="#" className="hover:text-foreground">LinkedIn</a></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Your Company. All rights reserved.
          </div>
        </div>
      </footer>

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