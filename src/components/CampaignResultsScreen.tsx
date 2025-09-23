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
                  🎯 Banner Ads
                  <Badge variant="secondary">5 standard sizes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Medium Rectangle 300x250 */}
                  <div>
                    <h4 className="font-semibold mb-2">Medium Rectangle (300x250)</h4>
                    <div className="relative bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 rounded-lg overflow-hidden" style={{ width: '300px', height: '250px' }}>
                      {uploadedImageUrl && (
                        <img 
                          src={uploadedImageUrl} 
                          alt="Campaign" 
                          className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                      )}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between text-center">
                        <h5 className="text-sm font-bold text-primary">{campaignData.banner_ads[0]?.headline || 'Your Brand Message'}</h5>
                        <div className="space-y-2">
                          <p className="text-xs opacity-80">{location.state?.campaign_prompt || 'Campaign content'}</p>
                          <Badge className="text-xs">{campaignData.banner_ads[0]?.cta || 'Learn More'}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard 728x90 */}
                  <div>
                    <h4 className="font-semibold mb-2">Leaderboard (728x90)</h4>
                    <div className="relative bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 rounded-lg overflow-hidden" style={{ width: '728px', height: '90px', maxWidth: '100%' }}>
                      {uploadedImageUrl && (
                        <img 
                          src={uploadedImageUrl} 
                          alt="Campaign" 
                          className="absolute right-0 top-0 h-full w-20 object-cover opacity-30"
                        />
                      )}
                      <div className="absolute inset-0 px-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-primary mb-1">{campaignData.banner_ads[0]?.headline || 'Your Brand Message'}</h5>
                          <p className="text-xs opacity-80 truncate">{location.state?.campaign_prompt || 'Campaign content'}</p>
                        </div>
                        <Badge className="text-xs ml-4">{campaignData.banner_ads[0]?.cta || 'Learn More'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Wide Skyscraper 160x600 */}
                  <div>
                    <h4 className="font-semibold mb-2">Wide Skyscraper (160x600)</h4>
                    <div className="relative bg-gradient-to-b from-primary/10 to-primary/20 border border-primary/20 rounded-lg overflow-hidden" style={{ width: '160px', height: '600px' }}>
                      {uploadedImageUrl && (
                        <img 
                          src={uploadedImageUrl} 
                          alt="Campaign" 
                          className="absolute top-0 left-0 w-full h-32 object-cover opacity-20"
                        />
                      )}
                      <div className="absolute inset-0 p-3 flex flex-col justify-between text-center">
                        <div className="mt-8">
                          <h5 className="text-xs font-bold text-primary mb-2">{campaignData.banner_ads[0]?.headline || 'Your Brand'}</h5>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs opacity-80 leading-tight">{location.state?.campaign_prompt?.slice(0, 80) || 'Campaign content'}...</p>
                          <Badge className="text-xs">{campaignData.banner_ads[0]?.cta || 'Learn More'}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Leaderboard 320x50 */}
                  <div>
                    <h4 className="font-semibold mb-2">Mobile Leaderboard (320x50)</h4>
                    <div className="relative bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 rounded-lg overflow-hidden" style={{ width: '320px', height: '50px' }}>
                      {uploadedImageUrl && (
                        <img 
                          src={uploadedImageUrl} 
                          alt="Campaign" 
                          className="absolute right-0 top-0 h-full w-12 object-cover opacity-30"
                        />
                      )}
                      <div className="absolute inset-0 px-3 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-primary truncate">{campaignData.banner_ads[0]?.headline || 'Your Brand Message'}</h5>
                        </div>
                        <Badge className="text-xs ml-2 shrink-0">{campaignData.banner_ads[0]?.cta || 'Learn More'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Half-Page 300x600 */}
                  <div>
                    <h4 className="font-semibold mb-2">Half-Page (300x600)</h4>
                    <div className="relative bg-gradient-to-b from-primary/10 to-primary/20 border border-primary/20 rounded-lg overflow-hidden" style={{ width: '300px', height: '600px' }}>
                      {uploadedImageUrl && (
                        <img 
                          src={uploadedImageUrl} 
                          alt="Campaign" 
                          className="absolute top-0 left-0 w-full h-48 object-cover opacity-20"
                        />
                      )}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between text-center">
                        <div className="mt-12">
                          <h5 className="text-lg font-bold text-primary mb-4">{campaignData.banner_ads[0]?.headline || 'Your Brand Message'}</h5>
                        </div>
                        <div className="space-y-4">
                          <p className="text-sm opacity-80 leading-relaxed">{location.state?.campaign_prompt || 'Campaign content here with more detailed description of your amazing product or service.'}</p>
                          <Badge className="text-sm px-6 py-2">{campaignData.banner_ads[0]?.cta || 'Learn More'}</Badge>
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