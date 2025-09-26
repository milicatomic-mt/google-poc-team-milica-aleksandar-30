import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/VideoPlayer';
import QRDownloadModal from '@/components/QRDownloadModal';
import type { CampaignCreationResponse } from '@/types/api';
import { OptimizedImage } from '@/components/ui/optimized-image';

const VideoScriptsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Ensure page starts at the top on mount
  useEffect(() => {
    const prev = history.scrollRestoration as any;
    try { (history as any).scrollRestoration = 'manual'; } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    try { sessionStorage.removeItem('gallery-restore'); } catch {}
    return () => {
      try { (history as any).scrollRestoration = prev; } catch {}
    };
  }, []);

  useEffect(() => {
    if (!campaignResults) {
      navigate(returnTo || '/preview-results');
    }
  }, [campaignResults, navigate, returnTo]);

  const handleBack = () => {
    navigate(returnTo || '/preview-results', {
      state: { 
        campaignResults, 
        uploadedImage, 
        campaignId, 
        imageMapping,
        fromDetail: true 
      }
    });
  };

  const handleDownload = () => {
    setIsDownloadModalOpen(true);
  };

  if (!campaignResults) {
    return null;
  }

  const videoScripts = campaignResults.video_scripts || [];
  const generatedImages = campaignResults.generated_images || [];
  const generatedVideoUrl = campaignResults.generated_video_url;
  
  // Use imageMapping for consistent images, fallback to generatedImages if not available
  const getImage = (index: number) => {
    return imageMapping?.[`image_${index}`] || generatedImages?.[index]?.url || null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-2 shadow-sm"
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
              <Download className="w-3 h-3" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Video Content */}
          <div className="mb-8">
            {generatedVideoUrl ? (
              <VideoPlayer
                videoUrl={generatedVideoUrl}
                posterUrl={getImage(0) || uploadedImage}
                title="Elevate your Music Experience"
                className="aspect-video rounded-lg"
              />
            ) : (
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  {(getImage(0) || uploadedImage) && (
                    <OptimizedImage 
                      src={getImage(0) || uploadedImage}
                      alt="Video preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-700 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Scripts Text Content */}
          {videoScripts && videoScripts.length > 0 && (
            <div className="space-y-6">
              {videoScripts.map((script, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {script.platform}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {script.script.split('\n\n').map((scene, sceneIndex) => {
                      if (scene.trim()) {
                        return (
                          <div key={sceneIndex} className="bg-primary/5 p-4 rounded-lg">
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
          )}
        </div>
      </div>

      {/* QR Download Modal */}
      <QRDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        campaignData={{
          video_scripts: campaignResults?.video_scripts || [],
          generated_images: campaignResults?.generated_images || [],
          email_copy: { subject: '', body: '' },
          banner_ads: [],
          landing_page_concept: { hero_text: '', sub_text: '', cta: '' },
          generated_video_url: campaignResults?.generated_video_url,
          uploadedImageUrl: uploadedImage
        }}
        title="Download Video Scripts"
      />
    </div>
  );
};

export default VideoScriptsPreview;