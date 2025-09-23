import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RibbedSphere from '@/components/RibbedSphere';
import type { CampaignCreationResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Share } from "lucide-react";

const CampaignResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignCreationResponse | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const fetchCampaignResults = async () => {
      try {
        const campaignId = location.state?.campaignId;
        if (!campaignId) {
          navigate('/');
          return;
        }

        const pollForResults = async () => {
          const { data, error } = await supabase
            .from('campaign_results')
            .select('result, image_url')
            .eq('id', campaignId)
            .single();

          if (error) {
            return false;
          }

          // Check if result has been populated by the AI
          if (data?.result && Object.keys(data.result).length > 0) {
            setCampaignData(data.result as CampaignCreationResponse);
            setUploadedImageUrl(data.image_url);
            setIsLoading(false);
            return true;
          }
          return false;
        };

        // Poll with async/await and while loop
        const startTime = Date.now();
        const maxDuration = 30000; // 30 seconds
        const pollInterval = 2000; // 2 seconds

        while (isLoadingRef.current && (Date.now() - startTime) < maxDuration) {
          const hasResults = await pollForResults();
          if (hasResults) {
            return; // Exit if we got results
          }
          
          // Wait 2 seconds before next poll, but only if still loading
          if (isLoadingRef.current) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
          }
        }

        // If we reach here, either timeout occurred or loading was stopped
        if (isLoadingRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchCampaignResults();
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDownload = () => {
    // Store campaign data and campaignId in session storage for QR page access
    const campaignId = location.state?.campaignId;
    const dataToStore = {
      ...campaignData,
      uploadedImageUrl: uploadedImageUrl
    };
    sessionStorage.setItem('qrCampaignData', JSON.stringify(dataToStore));
    sessionStorage.setItem('qrCampaignId', campaignId || '');
    navigate('/qr-download');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-3">
            <RibbedSphere className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Generating Your Campaign...</h2>
          <p className="text-muted-foreground">Please wait while AI creates your marketing content</p>
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Campaign Generation Failed</h2>
          <p className="text-muted-foreground mb-4">Unable to generate campaign content. Please try again.</p>
          <Button onClick={handleBackToHome}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-semibold">Campaign Results</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleBackToHome} variant="outline">
                Create New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-6">
            {/* Video Scripts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎥 Video Scripts
                  <Badge variant="secondary">{campaignData.video_scripts.length} platforms</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {campaignData.video_scripts.map((script, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{script.platform}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{script.script}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Copy */}
            <Card>
              <CardHeader>
                <CardTitle>📧 Email Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Subject Line</h4>
                    <p className="text-sm bg-muted p-3 rounded">{campaignData.email_copy.subject}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Email Body</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaignData.email_copy.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banner Ads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Display Banner Collection
                  <Badge variant="secondary">Industry Standard Formats</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Professional banner ads optimized for web advertising platforms</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Medium Rectangle 300x250 - Most Popular */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Medium Rectangle</h4>
                      <Badge variant="outline" className="text-xs">300×250px</Badge>
                      <Badge className="text-xs">Most Popular</Badge>
                    </div>
                    <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-lg" style={{ width: '300px', height: '250px' }}>
                      <div className="relative h-full flex">
                        {/* Left side - Content */}
                        <div className="relative flex-1 p-4 flex flex-col justify-between bg-gradient-to-br from-background/95 to-muted/40">
                          <div className="space-y-2">
                            <h5 className="text-sm font-bold text-foreground leading-tight">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand'}</h5>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{location.state?.campaignPrompt?.slice(0, 45) || 'Discover innovative solutions'}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-8 h-1 bg-primary rounded-full"></div>
                            <Button size="sm" className="text-xs font-semibold px-3 py-1.5 bg-primary hover:bg-primary/90">
                              {campaignData.banner_ads[0]?.cta || 'Learn More'}
                            </Button>
                          </div>
                        </div>
                        {/* Right side - Image */}
                        {uploadedImageUrl && (
                          <div className="w-24 relative">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign product" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/10"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard 728x90 - Header/Footer */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Leaderboard</h4>
                      <Badge variant="outline" className="text-xs">728×90px</Badge>
                      <Badge variant="secondary" className="text-xs">Header/Footer</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-r from-background to-muted/20 shadow-lg" style={{ width: '728px', height: '90px', minWidth: '728px' }}>
                        <div className="relative h-full flex items-center">
                          <div className="flex items-center gap-4 flex-1 px-6">
                            <div className="w-2 h-12 bg-primary rounded-full"></div>
                            {uploadedImageUrl && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                                <img 
                                  src={uploadedImageUrl} 
                                  alt="Campaign product" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="space-y-1 flex-1">
                              <h5 className="text-base font-bold text-foreground">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand Today'}</h5>
                              <p className="text-xs text-muted-foreground font-medium truncate max-w-md">{location.state?.campaignPrompt || 'Discover innovative solutions that drive results'}</p>
                            </div>
                          </div>
                          <div className="px-6">
                            <Button className="text-xs font-semibold px-6 py-2 bg-primary hover:bg-primary/90">
                              {campaignData.banner_ads[0]?.cta || 'Get Started'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wide Skyscraper 160x600 - Sidebar */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Wide Skyscraper</h4>
                      <Badge variant="outline" className="text-xs">160×600px</Badge>
                      <Badge variant="secondary" className="text-xs">Sidebar</Badge>
                    </div>
                    <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-b from-background via-muted/10 to-muted/20 shadow-lg" style={{ width: '160px', height: '600px' }}>
                      <div className="relative h-full flex flex-col">
                        {/* Top - Image */}
                        {uploadedImageUrl && (
                          <div className="h-32 w-full">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign product" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="text-center space-y-3">
                            <div className="w-8 h-1 bg-primary rounded-full mx-auto"></div>
                            <h5 className="text-sm font-bold text-foreground leading-tight">{campaignData.banner_ads[0]?.headline || 'Your Brand'}</h5>
                          </div>
                          <div className="flex-1 flex flex-col justify-end space-y-4 text-center">
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{location.state?.campaignPrompt?.slice(0, 120) || 'Discover innovative solutions that transform your business and drive exceptional results'}...</p>
                            <div className="space-y-3">
                              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                              <Button size="sm" className="text-xs font-semibold w-full bg-primary hover:bg-primary/90">
                                {campaignData.banner_ads[0]?.cta || 'Explore'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Leaderboard 320x50 - Mobile Optimized */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Mobile Leaderboard</h4>
                      <Badge variant="outline" className="text-xs">320×50px</Badge>
                      <Badge variant="secondary" className="text-xs">Mobile</Badge>
                    </div>
                    <div className="overflow-hidden rounded-lg border-2 border-border bg-gradient-to-r from-background to-muted/20 shadow-lg" style={{ width: '320px', height: '50px' }}>
                      <div className="relative h-full flex items-center">
                        <div className="flex items-center gap-2 flex-1 px-3 min-w-0">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          {uploadedImageUrl && (
                            <div className="w-8 h-8 rounded overflow-hidden">
                              <img 
                                src={uploadedImageUrl} 
                                alt="Campaign product" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h5 className="text-xs font-bold text-foreground truncate">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand'}</h5>
                        </div>
                        <div className="px-3">
                          <Button size="sm" className="text-xs font-semibold px-3 py-1 bg-primary hover:bg-primary/90 shrink-0">
                            {campaignData.banner_ads[0]?.cta || 'Try Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Half-Page 300x600 - Premium Placement */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Half-Page</h4>
                      <Badge variant="outline" className="text-xs">300×600px</Badge>
                      <Badge className="text-xs">Premium</Badge>
                    </div>
                    <div className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-b from-background via-muted/10 to-muted/20 shadow-lg" style={{ width: '300px', height: '600px' }}>
                      <div className="relative h-full flex flex-col">
                        {/* Top - Image */}
                        {uploadedImageUrl && (
                          <div className="h-48 w-full relative">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign product" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
                          </div>
                        )}
                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="text-center space-y-4">
                            <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
                            <h5 className="text-lg font-bold text-foreground leading-tight">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand Experience'}</h5>
                          </div>
                          <div className="flex-1 flex flex-col justify-end space-y-6 text-center">
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{location.state?.campaignPrompt || 'Discover innovative solutions that transform your business and drive exceptional results for your customers.'}</p>
                            <div className="space-y-4">
                              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                              <Button className="text-sm font-semibold px-8 py-3 bg-primary hover:bg-primary/90">
                                {campaignData.banner_ads[0]?.cta || 'Get Started Today'}
                              </Button>
                              <p className="text-xs text-muted-foreground font-medium">No commitment required</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Landing Page Concept */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 Landing Page Preview
                  <Badge variant="secondary">Responsive Design</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Professional landing page optimized for conversions</p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-2xl">
                  {/* Landing Page Preview */}
                  <div className="w-full max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <section className="relative min-h-[600px] bg-gradient-to-br from-background via-muted/20 to-primary/5">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10"></div>
                      
                      <div className="relative z-10 container mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
                        {/* Left Column - Content */}
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
                              ✨ New Product Launch
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                              {campaignData.landing_page_concept.hero_text}
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                              {campaignData.landing_page_concept.sub_text}
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg">
                              {campaignData.landing_page_concept.cta}
                            </Button>
                            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                              Learn More
                            </Button>
                          </div>
                          
                          {/* Trust Indicators */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Free shipping</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>30-day returns</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Premium quality</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column - Product Image */}
                        <div className="relative">
                          {uploadedImageUrl ? (
                            <div className="relative">
                              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-2xl"></div>
                              <div className="relative bg-gradient-to-br from-background to-muted/30 p-8 rounded-2xl border-2 border-border shadow-2xl">
                                <img 
                                  src={uploadedImageUrl} 
                                  alt="Product showcase" 
                                  className="w-full h-auto max-h-96 object-contain mx-auto"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border-2 border-dashed border-border p-16 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📱</span>
                              </div>
                              <p className="text-muted-foreground">Product Image</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                    
                    {/* Features Section */}
                    <section className="py-16 px-6 bg-muted/30">
                      <div className="container mx-auto">
                        <div className="text-center mb-12">
                          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Us?</h2>
                          <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover the key benefits that make our solution stand out from the competition.
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                          {/* Feature 1 */}
                          <div className="text-center space-y-4 p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Lightning Fast</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Experience unmatched speed and performance with our cutting-edge technology.
                            </p>
                          </div>
                          
                          {/* Feature 2 */}
                          <div className="text-center space-y-4 p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🛡️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Secure & Reliable</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Built with security in mind, ensuring your data and privacy are always protected.
                            </p>
                          </div>
                          
                          {/* Feature 3 */}
                          <div className="text-center space-y-4 p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">💎</span>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">Premium Quality</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Crafted with attention to detail and the highest quality materials and processes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                    
                    {/* CTA Section */}
                    <section className="py-16 px-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
                      <div className="container mx-auto text-center">
                        <div className="max-w-3xl mx-auto space-y-6">
                          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                            Ready to Get Started?
                          </h2>
                          <p className="text-lg text-muted-foreground">
                            Join thousands of satisfied customers who have already transformed their experience.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg">
                              {campaignData.landing_page_concept.cta}
                            </Button>
                            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                              View Demo
                            </Button>
                          </div>
                          
                          {/* Social Proof */}
                          <div className="pt-8">
                            <p className="text-sm text-muted-foreground mb-4">Trusted by industry leaders</p>
                            <div className="flex items-center justify-center gap-8 opacity-60">
                              <div className="w-16 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                                Brand 1
                              </div>
                              <div className="w-16 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                                Brand 2
                              </div>
                              <div className="w-16 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                                Brand 3
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CampaignResultsScreen;