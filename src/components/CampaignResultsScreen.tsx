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
import jsPDF from 'jspdf';

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

  const generatePDF = async () => {
    if (!campaignData) return;

    try {
      const pdf = new jsPDF();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Campaign Results', 20, yPosition);
      yPosition += 15;

      // Add uploaded image if available
      if (uploadedImageUrl) {
        try {
          // Convert image to base64 and add to PDF
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Could not get canvas context');
                
                // Calculate dimensions to fit within PDF
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
            img.src = uploadedImageUrl;
          });
        } catch (error) {
          console.warn('Could not add image to PDF:', error);
          // Continue without image
        }
      }

      // Add Video Scripts
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

      // Add Email Copy
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

      // Add Banner Ads
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

      // Add Landing Page Concept
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

      // Save the PDF
      pdf.save('campaign-results.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
              <Button onClick={generatePDF} variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Generate PDF
              </Button>
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
                  <Badge variant="secondary">{campaignData.banner_ads.length} variations</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {campaignData.banner_ads.map((ad, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Variation {index + 1}</h4>
                      <p className="text-sm mb-2">{ad.headline}</p>
                      <Badge variant="outline">{ad.cta}</Badge>
                    </div>
                  ))}
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