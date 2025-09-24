import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Smartphone, Archive } from "lucide-react";
import RibbedSphere from "@/components/RibbedSphere";
import type { CampaignCreationResponse } from "@/types/api";
import { createDownloadSession } from "@/lib/download-session";
import JSZip from 'jszip';

const QRDownloadScreen = () => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignCreationResponse & { uploadedImageUrl?: string } | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<{
    zip: string;
  } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    // Get campaign data from session storage
    const storedData = sessionStorage.getItem('qrCampaignData');
    if (!storedData) {
      navigate('/preview-results');
      return;
    }

    try {
      const data = JSON.parse(storedData) as CampaignCreationResponse & { uploadedImageUrl?: string };
      setCampaignData(data);
      
      // Create download URLs and session
      createDownloadUrls(data);
      createSessionForQR(data);
    } catch (error) {
      console.error('Failed to parse campaign data:', error);
      navigate('/preview-results');
    }
  }, [navigate]);

  const createSessionForQR = async (data: CampaignCreationResponse & { uploadedImageUrl?: string }) => {
    setIsCreatingSession(true);
    try {
      const token = await createDownloadSession(data);
      setSessionToken(token);
    } catch (error) {
      console.error('Failed to create download session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const createDownloadUrls = async (data: CampaignCreationResponse & { uploadedImageUrl?: string }) => {
    try {
      const zip = new JSZip();
      
      // Create TXT content
      let txtContent = "CAMPAIGN RESULTS\n";
      txtContent += "================\n\n";
      
      // Video Scripts
      txtContent += "🎥 VIDEO SCRIPTS\n";
      txtContent += "-----------------\n";
      data.video_scripts.forEach((script) => {
        txtContent += `${script.platform.toUpperCase()}:\n${script.script}\n\n`;
      });
      
      // Email Copy
      txtContent += "📧 EMAIL MARKETING\n";
      txtContent += "-------------------\n";
      txtContent += `Subject: ${data.email_copy.subject}\n\n`;
      txtContent += `Body:\n${data.email_copy.body}\n\n`;
      
      // Banner Ads
      txtContent += "🎯 BANNER ADS\n";
      txtContent += "--------------\n";
      data.banner_ads.forEach((ad, index) => {
        txtContent += `Variation ${index + 1}:\n`;
        txtContent += `Headline: ${ad.headline}\n`;
        txtContent += `CTA: ${ad.cta}\n\n`;
      });
      
      // Landing Page
      txtContent += "🚀 LANDING PAGE CONCEPT\n";
      txtContent += "------------------------\n";
      txtContent += `Hero Text: ${data.landing_page_concept.hero_text}\n`;
      txtContent += `Sub Text: ${data.landing_page_concept.sub_text}\n`;
      txtContent += `CTA: ${data.landing_page_concept.cta}\n`;

      // Add TXT file to ZIP
      zip.file("campaign-results.txt", txtContent);

      // Add uploaded image to ZIP if available
      if (data.uploadedImageUrl) {
        try {
          const response = await fetch(data.uploadedImageUrl);
          if (response.ok) {
            const imageBlob = await response.blob();
            const fileExtension = data.uploadedImageUrl.includes('.png') ? 'png' : 
                                data.uploadedImageUrl.includes('.gif') ? 'gif' : 'jpg';
            zip.file(`uploaded-image.${fileExtension}`, imageBlob);
          }
        } catch (error) {
          console.warn('Could not add image to ZIP:', error);
        }
      }

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      setDownloadUrls({
        zip: zipUrl
      });
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  };

  const handleBack = () => {
    // Get the campaignId from session storage to properly navigate back
    const campaignId = sessionStorage.getItem('qrCampaignId');
    
    // Clean up session storage
    sessionStorage.removeItem('qrCampaignData');
    sessionStorage.removeItem('qrCampaignId');
    
    if (campaignId) {
      navigate('/preview-results', { state: { campaignId } });
    } else {
      navigate('/preview-results');
    }
  };

  const handleDirectDownload = (type: 'zip') => {
    if (!downloadUrls) return;
    
    const url = downloadUrls.zip;
    const filename = 'campaign-results.zip';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate download URLs for QR codes using session token
  const baseUrl = window.location.origin;
  const zipDownloadUrl = sessionToken ? `${baseUrl}/download-content?type=zip&token=${sessionToken}` : '';

  if (!campaignData || !downloadUrls || isCreatingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4">
            <RibbedSphere className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {isCreatingSession ? 'Creating Session...' : 'Preparing QR Codes...'}
          </h2>
          <p className="text-muted-foreground">
            {isCreatingSession 
              ? 'Creating secure download session...' 
              : 'Please wait while we generate download links'
            }
          </p>
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
              <Button onClick={handleBack} variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-semibold">Mobile Download</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              How to Download on Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Open your mobile device's camera or QR code scanner</p>
              <p>2. Point it at the QR code below</p>
              <p>3. Tap the notification to download the campaign content</p>
              <p>4. Choose between TXT (readable) or JSON (structured data) format</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code and Direct Download */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Archive className="w-5 h-5" />
                Download Campaign Package
                <Badge variant="secondary">ZIP with Image</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={zipDownloadUrl}
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scan with your mobile device to download a ZIP file containing:
                </p>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-xs">📄 campaign-results.txt</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-xs">🖼️ uploaded-image</Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleDirectDownload('zip')} variant="default" size="sm" className="w-full">
                <Archive className="w-4 h-4 mr-2" />
                Direct Download ZIP
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline">Campaign ZIP</Badge>
                <span className="text-muted-foreground">TXT file + Uploaded image</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRDownloadScreen;