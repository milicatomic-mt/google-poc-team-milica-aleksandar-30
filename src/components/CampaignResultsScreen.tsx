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
                      <div className="relative h-full">
                        {uploadedImageUrl && (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign visual" 
                              className="w-full h-full object-cover mix-blend-soft-light opacity-40"
                            />
                          </div>
                        )}
                        <div className="relative h-full p-6 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h5 className="text-lg font-bold text-foreground leading-tight">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand'}</h5>
                            <p className="text-xs text-muted-foreground font-medium">{location.state?.campaignPrompt?.slice(0, 60) || 'Discover innovative solutions'}</p>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="w-8 h-1 bg-primary rounded-full"></div>
                            <Button size="sm" className="text-xs font-semibold px-4 py-2 bg-primary hover:bg-primary/90">
                              {campaignData.banner_ads[0]?.cta || 'Learn More'}
                            </Button>
                          </div>
                        </div>
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
                        <div className="relative h-full">
                          {uploadedImageUrl && (
                            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-primary/10 to-transparent">
                              <img 
                                src={uploadedImageUrl} 
                                alt="Campaign visual" 
                                className="w-full h-full object-cover mix-blend-soft-light opacity-50"
                              />
                            </div>
                          )}
                          <div className="relative h-full px-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-2 h-12 bg-primary rounded-full"></div>
                              <div className="space-y-1">
                                <h5 className="text-base font-bold text-foreground">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand Today'}</h5>
                                <p className="text-xs text-muted-foreground font-medium truncate max-w-md">{location.state?.campaignPrompt || 'Discover innovative solutions that drive results'}</p>
                              </div>
                            </div>
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
                      <div className="relative h-full">
                        {uploadedImageUrl && (
                          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign visual" 
                              className="w-full h-full object-cover mix-blend-soft-light opacity-30"
                            />
                          </div>
                        )}
                        <div className="relative h-full p-4 flex flex-col">
                          <div className="mt-8 text-center space-y-3">
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
                      <div className="relative h-full">
                        {uploadedImageUrl && (
                          <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-primary/10 to-transparent">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign visual" 
                              className="w-full h-full object-cover mix-blend-soft-light opacity-60"
                            />
                          </div>
                        )}
                        <div className="relative h-full px-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            <h5 className="text-xs font-bold text-foreground truncate">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand'}</h5>
                          </div>
                          <Button size="sm" className="text-xs font-semibold px-3 py-1 ml-2 bg-primary hover:bg-primary/90 shrink-0">
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
                      <div className="relative h-full">
                        {uploadedImageUrl && (
                          <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-primary/5 to-transparent">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Campaign visual" 
                              className="w-full h-full object-cover mix-blend-soft-light opacity-40"
                            />
                          </div>
                        )}
                        <div className="relative h-full p-6 flex flex-col">
                          <div className="mt-16 text-center space-y-4">
                            <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
                            <h5 className="text-xl font-bold text-foreground leading-tight">{campaignData.banner_ads[0]?.headline || 'Transform Your Brand Experience'}</h5>
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
                <CardTitle>🚀 Landing Page Concept</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Hero Text</h4>
                    <p className="text-lg font-medium">{campaignData.landing_page_concept.hero_text}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sub Text</h4>
                    <p className="text-muted-foreground">{campaignData.landing_page_concept.sub_text}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Call to Action</h4>
                    <Badge className="text-base px-4 py-2">{campaignData.landing_page_concept.cta}</Badge>
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