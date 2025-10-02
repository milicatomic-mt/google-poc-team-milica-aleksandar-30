import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import RibbedSphere from "@/components/RibbedSphere";
import type { CampaignCreationResponse } from "@/types/api";
import { getDownloadSession } from "@/lib/download-session";
import JSZip from 'jszip';

const DownloadContentScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    if (!type || !token) {
      setError('Invalid download link');
      return;
    }

    if (type !== 'zip') {
      setError('Unsupported file type');
      return;
    }

    // Auto-start download
    handleDownload(type, token);
  }, [searchParams]);

  const handleDownload = async (type: string, token: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      // Get campaign data from download session
      const campaignData = await getDownloadSession(token);
      
      if (!campaignData) {
        setError('Download session expired or not found');
        return;
      }

      let content: Blob;
      let filename: string;

      if (type === 'zip') {
        // Create ZIP content
        const zip = new JSZip();
        
        // Create TXT content
        let txtContent = "CAMPAIGN RESULTS\n";
        txtContent += "================\n\n";
        
        // Video Scripts
        txtContent += "🎥 SOCIAL VIDEO COLLECTION\n";
        txtContent += "-----------------\n";
        campaignData.video_scripts.forEach((script) => {
          txtContent += `${script.platform.toUpperCase()}:\n${script.script}\n\n`;
        });
        
        // Email Copy
        txtContent += "📧 EMAIL MARKETING\n";
        txtContent += "-------------------\n";
        txtContent += `Subject: ${campaignData.email_copy.subject}\n\n`;
        txtContent += `Body:\n${campaignData.email_copy.body}\n\n`;
        
        // Banner Ads
        txtContent += "🎯 BANNER ADS\n";
        txtContent += "--------------\n";
        campaignData.banner_ads.forEach((ad, index) => {
          txtContent += `Variation ${index + 1}:\n`;
          txtContent += `Headline: ${ad.headline}\n`;
          txtContent += `CTA: ${ad.cta}\n\n`;
        });
        
        // Landing Page
        txtContent += "🚀 LANDING PAGE CONCEPT\n";
        txtContent += "------------------------\n";
        txtContent += `Hero Text: ${campaignData.landing_page_concept.hero_text}\n`;
        txtContent += `Sub Text: ${campaignData.landing_page_concept.sub_text}\n`;
        txtContent += `CTA: ${campaignData.landing_page_concept.cta}\n`;

        // Add TXT file to ZIP
        zip.file("campaign-results.txt", txtContent);

        // Add uploaded image to ZIP if available
        const typedCampaignData = campaignData as CampaignCreationResponse & { uploadedImageUrl?: string };
        if (typedCampaignData.uploadedImageUrl) {
          try {
            const response = await fetch(typedCampaignData.uploadedImageUrl);
            if (response.ok) {
              const imageBlob = await response.blob();
              const fileExtension = typedCampaignData.uploadedImageUrl.includes('.png') ? 'png' : 
                                  typedCampaignData.uploadedImageUrl.includes('.gif') ? 'gif' : 'jpg';
              zip.file(`uploaded-image.${fileExtension}`, imageBlob);
            }
          } catch (error) {
            // Could not add image to ZIP
          }
        }

        // Generate ZIP blob
        content = await zip.generateAsync({ type: "blob" });
        filename = 'campaign-results.zip';
      } else {
        throw new Error('Unsupported file type');
      }

      // Create and trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // Mobile-friendly download handling
      try {
        document.body.appendChild(a);
        a.click();
        
        // Set success immediately after click on mobile
        setDownloadComplete(true);
        
        // Clean up DOM and URL safely
        setTimeout(() => {
          try {
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            // Cleanup error (non-critical)
          }
        }, 100);
      } catch (downloadError) {
        // Even if click fails, try direct navigation for mobile
        try {
          window.open(url, '_blank');
          setDownloadComplete(true);
        } catch (fallbackError) {
          throw new Error('Download failed on all attempts');
        }
      }
    } catch (err) {
      setError('Failed to process download');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = () => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    if (type && token) {
      setDownloadComplete(false);
      setError(null);
      handleDownload(type, token);
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
            <div className="h-[53px] w-[53px]">
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