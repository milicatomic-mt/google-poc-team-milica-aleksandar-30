import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Smartphone, Tablet } from "lucide-react";
import RibbedSphere from "@/components/RibbedSphere";
import type { CampaignCreationResponse } from "@/types/api";

// UTF-8 safe base64 encoding function
const utf8ToBase64 = (str: string): string => {
  // Convert string to UTF-8 bytes, then to base64
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

const QRDownloadScreen = () => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignCreationResponse | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<{
    txt: string;
    json: string;
  } | null>(null);

  useEffect(() => {
    // Get campaign data from session storage
    const storedData = sessionStorage.getItem('qrCampaignData');
    if (!storedData) {
      navigate('/campaign-results');
      return;
    }

    try {
      const data = JSON.parse(storedData) as CampaignCreationResponse;
      setCampaignData(data);
      
      // Create download URLs
      createDownloadUrls(data);
    } catch (error) {
      console.error('Failed to parse campaign data:', error);
      navigate('/campaign-results');
    }
  }, [navigate]);

  const createDownloadUrls = (data: CampaignCreationResponse) => {
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

    // Create blobs and URLs
    const txtBlob = new Blob([txtContent], { type: 'text/plain' });
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    const txtUrl = URL.createObjectURL(txtBlob);
    const jsonUrl = URL.createObjectURL(jsonBlob);

    setDownloadUrls({
      txt: txtUrl,
      json: jsonUrl
    });
  };

  const handleBack = () => {
    navigate('/campaign-results');
  };

  const handleDirectDownload = (type: 'txt' | 'json') => {
    if (!downloadUrls) return;
    
    const url = type === 'txt' ? downloadUrls.txt : downloadUrls.json;
    const filename = `campaign-results.${type}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate download URLs for QR codes (using the download-content route)
  const baseUrl = window.location.origin;
  const txtDownloadUrl = campaignData ? `${baseUrl}/download-content?type=txt&data=${encodeURIComponent(utf8ToBase64(JSON.stringify(campaignData)))}` : '';
  const jsonDownloadUrl = campaignData ? `${baseUrl}/download-content?type=json&data=${encodeURIComponent(utf8ToBase64(JSON.stringify(campaignData)))}` : '';

  if (!campaignData || !downloadUrls) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4">
            <RibbedSphere className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Preparing QR Codes...</h2>
          <p className="text-muted-foreground">Please wait while we generate download links</p>
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

        {/* QR Codes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* TXT Download QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download as TXT
                <Badge variant="secondary">Readable</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={txtDownloadUrl}
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan to download campaign content as readable text file
              </p>
              <Button onClick={() => handleDirectDownload('txt')} variant="outline" size="sm">
                Direct Download
              </Button>
            </CardContent>
          </Card>

          {/* JSON Download QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download as JSON
                <Badge variant="secondary">Structured</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={jsonDownloadUrl}
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan to download campaign content as structured JSON file
              </p>
              <Button onClick={() => handleDirectDownload('json')} variant="outline" size="sm">
                Direct Download
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
                <Badge variant="outline">Video Scripts</Badge>
                <span className="text-muted-foreground">{campaignData.video_scripts.length} platforms</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Email Marketing</Badge>
                <span className="text-muted-foreground">Subject + Body</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Banner Ads</Badge>
                <span className="text-muted-foreground">{campaignData.banner_ads.length} variations</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Landing Page</Badge>
                <span className="text-muted-foreground">Hero + CTA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRDownloadScreen;