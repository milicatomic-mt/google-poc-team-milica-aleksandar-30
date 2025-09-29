import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Play } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-8 left-8 z-20">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="tap-target hover-lift focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3 shadow-sm"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-center px-8 py-6 pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Scripts</h1>
          <p className="text-gray-600 text-sm mt-1">Review your AI-generated designs before download</p>
        </div>

        {/* QR Download Button - Absolute Top Right */}
        <div className="absolute top-8 right-8">
          <Button 
            onClick={handleDownload} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <QrCode className="w-4 h-4" />
            Download All
          </Button>
        </div>
      </div>

      {/* Content with increased spacing */}
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
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
                {/* Instagram Header */}
                <div className="bg-black text-white p-4">
                  <div className="flex items-center justify-between text-sm font-medium mb-4">
                    <span>9:41</span>
                    <span className="font-bold text-lg">Instagram</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="w-6 h-3 bg-white rounded-sm ml-2"></div>
                    </div>
                  </div>
                  
                  {/* Stories Section */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-black border-2 border-black"></div>
                      </div>
                      <span className="text-xs mt-1">Your Story</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-300"></div>
                      </div>
                      <span className="text-xs mt-1">karenme</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-400"></div>
                      </div>
                      <span className="text-xs mt-1">zackjohn</span>
                    </div>
                  </div>
                  
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm">joshua_l</span>
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">Tokyo, Japan</span>
                      </div>
                    </div>
                    <button className="text-white">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="12" cy="19" r="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Video Content Area with Generated Content */}
                <div className="relative aspect-square bg-black">
                  {/* Page indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
                    1/3
                  </div>
                  
                  {/* Actual Video or Preview */}
                  {generatedVideoUrl ? (
                    <div className="w-full h-full">
                      <VideoPlayer
                        videoUrl={generatedVideoUrl}
                        posterUrl={getImage(0) || uploadedImage}
                        title=""
                        className="w-full h-full rounded-none aspect-square"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
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
                  )}
                </div>
                
                {/* Instagram Post Actions */}
                <div className="bg-black text-white p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-4">
                      <button>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <button>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </button>
                      <button>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22,2 15,22 11,13 2,9 22,2" />
                        </svg>
                      </button>
                    </div>
                    <button>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Engagement */}
                  <div className="mb-2">
                    <span className="text-sm">Liked by <span className="font-semibold">craig_love</span> and <span className="font-semibold">44,686 others</span></span>
                  </div>
                  
                  {/* Caption */}
                  <div className="text-sm">
                    <span className="font-semibold">joshua_l</span> {videoScripts && videoScripts.length > 0 
                      ? videoScripts[0].script.split('\n\n')[0]?.trim().substring(0, 100) + '...'
                      : 'Check out this amazing new product launch! 🎧 #tech #music #lifestyle'
                    }
                  </div>
                  
                  {/* View Comments */}
                  <button className="text-gray-400 text-sm mt-2">
                    View all 1,234 comments
                  </button>
                  
                  {/* Time */}
                  <div className="text-gray-400 text-xs mt-2">
                    2 hours ago
                  </div>
                </div>
                
                {/* Bottom Navigation */}
                <div className="bg-black border-t border-gray-800 p-4">
                  <div className="flex justify-around">
                    <button>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </button>
                    <button>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                    </button>
                    <button>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </button>
                    <button>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <button>
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                    </button>
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
                                <div className="text-xs font-semibold text-muted-foreground mb-1">Voriceover:</div>
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