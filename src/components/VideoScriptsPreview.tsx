import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRDownloadModal from '@/components/QRDownloadModal';
import { VideoPlayer } from '@/components/VideoPlayer';
import { OptimizedImage } from '@/components/ui/optimized-image';

const VideoScriptsPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { campaignResults, uploadedImage, campaignId, imageMapping, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Get generated video URL
  const generatedVideoUrl = campaignResults?.generated_video_url;
  const videoScripts = campaignResults?.video_scripts;

  // Function to get image with fallback
  const getImage = (index: number): string | null => {
    if (imageMapping && imageMapping[`image_${index}`]) {
      return imageMapping[`image_${index}`];
    }
    if (campaignResults?.generated_images && campaignResults.generated_images[index]) {
      return campaignResults.generated_images[index].url;
    }
    return null;
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo, { 
        state: { 
          campaignResults, 
          uploadedImage, 
          campaignId, 
          imageMapping 
        } 
      });
    } else {
      navigate('/');
    }
  };

  const handleDownload = () => {
    setIsDownloadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-10">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="tap-target hover-lift focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3 shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-center px-8 py-6 pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Scripts</h1>
          <p className="text-gray-600 text-sm mt-1">Optimized content for social media platforms</p>
        </div>

        {/* QR Download Button */}
        <div className="absolute top-8 right-8">
          <Button 
            onClick={handleDownload} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <QrCode className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-8 mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Video Content */}
          <div className="mb-8 bg-white rounded-lg p-8 shadow-lg">
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

          {/* Mobile Mockups Section */}
          <div className="mb-8 bg-white rounded-lg p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Previews</h2>
              <p className="text-gray-600">See how your content will appear on different platforms</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
              {/* Instagram Mobile Mockup */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm h-[814px] relative">
                <div className="bg-black text-white h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">Instagram</h3>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                    <p className="text-sm opacity-75">Your content preview</p>
                  </div>
                </div>
                
                {/* Instagram Bottom Navigation - Fixed */}
                <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
                  <div className="flex justify-around">
                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                    <div className="w-6 h-6 bg-white/60 rounded-sm"></div>
                    <div className="w-6 h-6 bg-white/60 rounded-sm"></div>
                    <div className="w-6 h-6 bg-white/60 rounded-sm"></div>
                    <div className="w-6 h-6 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* TikTok Mobile Mockup */}
              <div className="bg-black rounded-lg shadow-lg overflow-hidden max-w-sm h-[814px] relative">
                <div className="h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">TikTok</h3>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                    <p className="text-sm opacity-75">Your content preview</p>
                  </div>
                </div>

                {/* TikTok Bottom Navigation - Fixed */}
                <div className="absolute bottom-0 left-0 right-0 bg-black text-white py-4 px-3">
                  <div className="flex justify-around items-center">
                    <div className="text-center">
                      <div className="w-6 h-6 bg-white rounded-sm mx-auto"></div>
                      <span className="text-xs mt-1">Home</span>
                    </div>
                    <div className="text-center opacity-60">
                      <div className="w-6 h-6 bg-white/60 rounded-sm mx-auto"></div>
                      <span className="text-xs mt-1">Friends</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-6 bg-white rounded-md mx-auto"></div>
                    </div>
                    <div className="text-center opacity-60">
                      <div className="w-6 h-6 bg-white/60 rounded-sm mx-auto"></div>
                      <span className="text-xs mt-1">Inbox</span>
                    </div>
                    <div className="text-center opacity-60">
                      <div className="w-6 h-6 bg-white/60 rounded-full mx-auto"></div>
                      <span className="text-xs mt-1">Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Scripts Text Content */}
          {videoScripts && videoScripts.length > 0 && (
            <div className="space-y-6">
              {videoScripts.map((script, index) => (
                <div key={index} className="bg-white rounded-lg p-8 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {script.platform}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {script.script.split('\n\n').map((scene, sceneIndex) => {
                      if (scene.trim()) {
                        return (
                          <div key={sceneIndex} className="bg-primary/5 p-4 rounded-lg">
                            <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full inline-block mb-3">
                              Scene {sceneIndex + 1}
                            </div>
                            <div className="text-sm leading-relaxed">{scene.trim()}</div>
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
      {campaignResults && (
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
      )}
    </div>
  );
};

export default VideoScriptsPreview;