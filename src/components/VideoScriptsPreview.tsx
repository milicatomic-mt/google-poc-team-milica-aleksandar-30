import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import type { CampaignCreationResponse } from '@/types/api';

const VideoScriptsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (!campaignResults) {
      navigate('/preview-results');
    }
  }, [campaignResults, navigate]);

  const handleBack = () => {
    navigate('/preview-results', {
      state: { campaignResults, uploadedImage, campaignId }
    });
  };

  const handleDownload = async () => {
    try {
      const { createDownloadSession } = await import('@/lib/download-session');
      const videoData = {
        video_scripts: campaignResults?.video_scripts,
        generated_images: campaignResults?.generated_images,
        email_copy: { subject: '', body: '' },
        banner_ads: [],
        landing_page_concept: { hero_text: '', sub_text: '', cta: '' },
        generated_video_url: campaignResults?.generated_video_url,
        uploadedImageUrl: uploadedImage
      };
      
      const sessionToken = await createDownloadSession(videoData as CampaignCreationResponse);
      setDownloadUrl(window.location.origin + `/download?session=${sessionToken}&type=video-scripts`);
      setIsDownloadModalOpen(true);
    } catch (error) {
      console.error('Failed to create download session:', error);
      toast.error('Failed to prepare download. Please try again.');
    }
  };

  if (!campaignResults) {
    return null;
  }

  const videoScripts = campaignResults.video_scripts || [];
  const generatedImages = campaignResults.generated_images || [];
  const generatedVideoUrl = campaignResults.generated_video_url;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Results
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Video Scripts</h1>
                <p className="text-sm text-muted-foreground">Review your AI-generated designs before download</p>
              </div>
            </div>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Video Examples Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-4 border-b">
                <h2 className="text-lg font-semibold mb-1">Video Examples</h2>
                <p className="text-sm text-muted-foreground">Elevate your Music Experience</p>
              </div>
              
              <div className="p-6">
                {/* Main Video Player */}
                <div className="mb-6">
                  <div className="relative aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-lg">
                    {generatedVideoUrl ? (
                      <video
                        src={generatedVideoUrl}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        poster={generatedImages[0]?.url || uploadedImage}
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage}
                            alt="Video preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-gray-700 ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          Elevate your Music Experience
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Examples */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* TikTok */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                      </div>
                      <span className="font-semibold text-sm">TikTok</span>
                    </div>
                    <div className="aspect-[9/16] w-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-md relative">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage}
                          alt="TikTok preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="text-white text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                            <span>@musicbrand</span>
                          </div>
                        </div>
                      </div>
                      {/* TikTok UI elements */}
                      <div className="absolute bottom-4 right-2 space-y-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                          ♥
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                          💬
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                          ↗
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg"></div>
                      <span className="font-semibold text-sm">Instagram</span>
                    </div>
                    <div className="aspect-[9/16] w-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-md relative">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage}
                          alt="Instagram preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Instagram UI */}
                      <div className="absolute top-2 left-2 right-2">
                        <div className="bg-black/50 rounded-full px-2 py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white/30 rounded-full"></div>
                            <span className="text-white text-xs">musicbrand</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Shorts */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                        <div className="w-3 h-2 bg-white rounded-sm"></div>
                      </div>
                      <span className="font-semibold text-sm">YouTube</span>
                    </div>
                    <div className="aspect-[9/16] w-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-md relative">
                      {(generatedImages[0]?.url || uploadedImage) && (
                        <img 
                          src={generatedImages[0]?.url || uploadedImage}
                          alt="YouTube preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="text-white text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <span>👍</span>
                              <span>💬</span>
                              <span>↗</span>
                            </div>
                            <span>Shop Now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Scripts Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Video Script</h3>
              <p className="text-sm text-muted-foreground mb-6">Storyboard for your product</p>
              
              <div className="space-y-4">
                {videoScripts.map((script, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {script.platform}
                      </Badge>
                    </div>
                    
                    {/* Break script into scenes */}
                    <div className="space-y-3">
                      {script.script.split('\n\n').map((scene, sceneIndex) => {
                        if (scene.trim()) {
                          return (
                            <div key={sceneIndex} className="bg-primary/5 rounded-lg p-4">
                              <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full inline-block mb-3">
                                Scene {sceneIndex + 1}: {sceneIndex === 0 ? 'Opening Shot' : sceneIndex === 1 ? 'Product Highlight' : 'Call to Action'}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                                    Visual: {sceneIndex === 0 ? 'Close-up of a woman wearing sleek white headphones.' : 
                                            sceneIndex === 1 ? 'Smooth pan across the headphones on a neutral background.' :
                                            'Wireless freedom, all-day comfort, and powerful sound'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground mb-1">Voiceover:</div>
                                  <div className="text-sm leading-relaxed">{scene.trim()}</div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Download Video Scripts
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG value={downloadUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Scan with your mobile device to download
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(downloadUrl);
                  toast.success('Download link copied to clipboard');
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoScriptsPreview;