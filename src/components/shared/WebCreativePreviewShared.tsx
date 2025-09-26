import React from 'react';
import { Button } from '@/components/ui/button';

interface WebCreativePreviewSharedProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  variant: 'full' | 'modal' | 'gallery';
}

export const WebCreativePreviewShared: React.FC<WebCreativePreviewSharedProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  variant
}) => {
  const activeCampaignResults = campaignResults;
  
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || activeCampaignResults?.generated_images?.[index]?.url || uploadedImage;
  };

  if (variant === 'gallery') {
    return (
      <div className="h-80 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
        {/* Browser-like Screenshot Mockup */}
        <div className="h-full bg-white">
          {/* Browser Header */}
          <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
              <div className="text-[6px] text-gray-500">https://yoursite.com</div>
            </div>
          </div>

          {/* Landing Page Mini Preview */}
          <div className="h-full relative overflow-hidden">
            <div 
              className="relative bg-gradient-to-br from-slate-800 via-gray-700 to-slate-900 text-white px-3 py-4 text-center"
              style={{
                backgroundImage: getImage(0) 
                  ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getImage(0)})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h1 className="text-[8px] font-bold text-white mb-1 drop-shadow-lg leading-tight">
                {activeCampaignResults?.landing_page_concept?.hero_text ||
                 activeCampaignResults?.banner_ads?.[0]?.headline || 
                 'Transform Your Experience'}
              </h1>
              
              <p className="text-[5px] text-white/90 leading-relaxed mb-2 max-w-24 drop-shadow-md">
                {activeCampaignResults?.landing_page_concept?.sub_text ||
                 activeCampaignResults?.banner_ads?.[0]?.description || 
                 'Your custom description here'}
              </p>
              
              <div className="text-[4px] text-slate-300 mb-3 font-medium">+ Standard Template Sections Below</div>
              
              <div className="bg-white text-gray-900 text-[6px] px-3 py-1 rounded-full font-medium shadow-lg hover:bg-white/90 transition-all mb-3">
                {activeCampaignResults?.landing_page_concept?.cta ||
                 activeCampaignResults?.banner_ads?.[0]?.cta || 
                 'Your CTA'}
              </div>

              {/* Standard Template Features Preview */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded px-1 py-1 border border-white/20">
                  <div className="text-[4px] text-white font-medium">Premium</div>
                  <div className="text-[3px] text-white/80">Quality</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded px-1 py-1 border border-white/20">
                  <div className="text-[4px] text-white font-medium">Fast</div>
                  <div className="text-[3px] text-white/80">Delivery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded px-1 py-1 border border-white/20">
                  <div className="text-[4px] text-white font-medium">Money</div>
                  <div className="text-[3px] text-white/80">Back</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-2 py-2">
              <div className="text-[5px] font-semibold text-gray-700 mb-1">Key Features</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span className="text-[4px] text-gray-600">Advanced Technology</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span className="text-[4px] text-gray-600">Sustainable Materials</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span className="text-[4px] text-gray-600">Expert Support</span>
                </div>
              </div>
            </div>

            <div className="bg-primary px-2 py-2 text-center">
              <div className="text-[5px] font-bold text-primary-foreground mb-1">Ready to Get Started?</div>
              <div className="bg-secondary text-secondary-foreground text-[4px] px-2 py-0.5 rounded font-medium">
                {activeCampaignResults?.landing_page_concept?.cta || 'Get Started Today'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal and Full variants use the same layout (full web creative sections)
  return (
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
                {activeCampaignResults?.landing_page_concept?.hero_text || 
                 activeCampaignResults?.banner_ads?.[0]?.headline || 
                 'Transform Your Experience Today'}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {activeCampaignResults?.landing_page_concept?.sub_text || 
                 activeCampaignResults?.banner_ads?.[0]?.description || 
                 'Discover innovative solutions that drive exceptional results for your business.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-lg px-8 py-4">
                  {activeCampaignResults?.landing_page_concept?.cta || 
                   activeCampaignResults?.banner_ads?.[0]?.cta || 
                   'Get Started Now'}
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              {getImage(0) && (
                <img 
                  src={getImage(0)} 
                  alt="Product showcase"
                  className={variant === 'modal' ? "w-full h-80 object-cover rounded-lg shadow-xl" : "w-full h-[400px] object-cover rounded-lg shadow-xl"}
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
              {activeCampaignResults?.generated_images?.slice(0, 4).map((img: any, idx: number) => (
                <img 
                  key={idx}
                  src={img.url} 
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )) || 
              // Fallback if no generated images
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="w-full h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Product View {idx + 1}
                </div>
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
              {activeCampaignResults?.landing_page_concept?.cta || 'Get Started Today'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};