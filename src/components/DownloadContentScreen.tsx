import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import RibbedSphere from "@/components/RibbedSphere";
import type { CampaignCreationResponse } from "@/types/api";

const DownloadContentScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const encodedData = searchParams.get('data');

    if (!type || !encodedData) {
      setError('Invalid download link');
      return;
    }

    if (type !== 'txt' && type !== 'json') {
      setError('Unsupported file type');
      return;
    }

    // Auto-start download
    handleDownload(type, encodedData);
  }, [searchParams]);

  const handleDownload = async (type: string, encodedData: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      // Decode the campaign data
      const decodedData = atob(decodeURIComponent(encodedData));
      const campaignData: CampaignCreationResponse = JSON.parse(decodedData);

      let content: string;
      let mimeType: string;
      let filename: string;

      if (type === 'txt') {
        // Create TXT content
        content = "CAMPAIGN RESULTS\n";
        content += "================\n\n";
        
        // Video Scripts
        content += "🎥 VIDEO SCRIPTS\n";
        content += "-----------------\n";
        campaignData.video_scripts.forEach((script) => {
          content += `${script.platform.toUpperCase()}:\n${script.script}\n\n`;
        });
        
        // Email Copy
        content += "📧 EMAIL MARKETING\n";
        content += "-------------------\n";
        content += `Subject: ${campaignData.email_copy.subject}\n\n`;
        content += `Body:\n${campaignData.email_copy.body}\n\n`;
        
        // Banner Ads
        content += "🎯 BANNER ADS\n";
        content += "--------------\n";
        campaignData.banner_ads.forEach((ad, index) => {
          content += `Variation ${index + 1}:\n`;
          content += `Headline: ${ad.headline}\n`;
          content += `CTA: ${ad.cta}\n\n`;
        });
        
        // Landing Page
        content += "🚀 LANDING PAGE CONCEPT\n";
        content += "------------------------\n";
        content += `Hero Text: ${campaignData.landing_page_concept.hero_text}\n`;
        content += `Sub Text: ${campaignData.landing_page_concept.sub_text}\n`;
        content += `CTA: ${campaignData.landing_page_concept.cta}\n`;

        mimeType = 'text/plain';
        filename = 'campaign-results.txt';
      } else {
        // JSON format
        content = JSON.stringify(campaignData, null, 2);
        mimeType = 'application/json';
        filename = 'campaign-results.json';
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadComplete(true);
    } catch (err) {
      setError('Failed to process download');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = () => {
    const type = searchParams.get('type');
    const encodedData = searchParams.get('data');
    if (type && encodedData) {
      setDownloadComplete(false);
      setError(null);
      handleDownload(type, encodedData);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Download Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={handleGoHome} size="sm">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (downloadComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Download Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your campaign content has been downloaded successfully. Check your device's Downloads folder.
            </p>
            <Button onClick={handleGoHome} className="w-full">
              Create New Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {isDownloading ? 'Downloading...' : 'Preparing Download...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12">
              <RibbedSphere className="w-full h-full" />
            </div>
          </div>
          <p className="text-muted-foreground text-center">
            {isDownloading 
              ? 'Your campaign content is being downloaded...' 
              : 'Please wait while we prepare your download...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadContentScreen;