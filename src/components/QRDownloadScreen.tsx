import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Smartphone, Tablet } from "lucide-react";
import RibbedSphere from "@/components/RibbedSphere";
import type { CampaignCreationResponse } from "@/types/api";
import { createDownloadSession } from "@/lib/download-session";

const QRDownloadScreen = () => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignCreationResponse & { uploadedImageUrl?: string } | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<{
    txt: string;
    json: string;
  } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    // Get campaign data from session storage
    const storedData = sessionStorage.getItem('qrCampaignData');
    if (!storedData) {
      navigate('/campaign-results');
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
      navigate('/campaign-results');
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

  const createDownloadUrls = (data: CampaignCreationResponse & { uploadedImageUrl?: string }) => {
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
    // Get the campaignId from session storage to properly navigate back
    const campaignId = sessionStorage.getItem('qrCampaignId');
    
    // Clean up session storage
    sessionStorage.removeItem('qrCampaignData');
    sessionStorage.removeItem('qrCampaignId');
    
    if (campaignId) {
      navigate('/campaign-results', { state: { campaignId } });
    } else {
      navigate('/campaign-results');
    }
  };

  const handleDirectDownload = (type: 'txt' | 'json' | 'pdf') => {
    if (type === 'pdf') {
      generatePDF();
      return;
    }
    
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

  const generatePDF = async () => {
    if (!campaignData) return;

    try {
      const pdf = new (await import('jspdf')).default();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Campaign Results', 20, yPosition);
      yPosition += 15;

      // Add uploaded image if available
      if (campaignData.uploadedImageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Could not get canvas context');
                
                const maxWidth = 170;
                const maxHeight = 100;
                let { width, height } = img;
                
                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }
                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                pdf.addImage(imgData, 'JPEG', 20, yPosition, width, height);
                yPosition += height + 15;
                resolve(null);
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = reject;
            img.src = campaignData.uploadedImageUrl;
          });
        } catch (error) {
          console.warn('Could not add image to PDF:', error);
        }
      }

      // Add content sections (same as in CampaignResultsScreen)
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎥 Video Scripts', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      campaignData.video_scripts.forEach((script) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${script.platform.toUpperCase()}:`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        const scriptLines = pdf.splitTextToSize(script.script, 170);
        pdf.text(scriptLines, 20, yPosition);
        yPosition += scriptLines.length * 4 + 10;
      });

      // Email Copy
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📧 Email Marketing', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text('Subject:', 20, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const subjectLines = pdf.splitTextToSize(campaignData.email_copy.subject, 170);
      pdf.text(subjectLines, 20, yPosition);
      yPosition += subjectLines.length * 4 + 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Body:', 20, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const bodyLines = pdf.splitTextToSize(campaignData.email_copy.body, 170);
      pdf.text(bodyLines, 20, yPosition);
      yPosition += bodyLines.length * 4 + 15;

      // Banner Ads
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎯 Banner Ads', 20, yPosition);
      yPosition += 10;
      
      campaignData.banner_ads.forEach((ad, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Variation ${index + 1}:`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Headline: ${ad.headline}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`CTA: ${ad.cta}`, 20, yPosition);
        yPosition += 10;
      });

      // Landing Page Concept
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🚀 Landing Page Concept', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text('Hero Text:', 20, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const heroLines = pdf.splitTextToSize(campaignData.landing_page_concept.hero_text, 170);
      pdf.text(heroLines, 20, yPosition);
      yPosition += heroLines.length * 4 + 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sub Text:', 20, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const subLines = pdf.splitTextToSize(campaignData.landing_page_concept.sub_text, 170);
      pdf.text(subLines, 20, yPosition);
      yPosition += subLines.length * 4 + 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CTA:', 20, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(campaignData.landing_page_concept.cta, 20, yPosition);

      pdf.save('campaign-results.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Generate download URLs for QR codes using session token
  const baseUrl = window.location.origin;
  const txtDownloadUrl = sessionToken ? `${baseUrl}/download-content?type=txt&token=${sessionToken}` : '';
  const jsonDownloadUrl = sessionToken ? `${baseUrl}/download-content?type=json&token=${sessionToken}` : '';

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

        {/* QR Codes */}
        <div className="grid gap-6 md:grid-cols-3">
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

          {/* PDF Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Generate PDF
                <Badge variant="secondary">With Image</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <Download className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">PDF with Uploaded Image</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Generate a PDF that includes your uploaded image and all campaign content
              </p>
              <Button onClick={() => handleDirectDownload('pdf')} variant="default" size="sm">
                Generate PDF
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