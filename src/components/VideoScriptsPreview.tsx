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

        {/* Download Button - Absolute Top Right */}
        <div className="absolute top-8 right-8">
          <Button 
            onClick={handleDownload} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <Download className="w-4 h-4" />
            Download
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

          {/* Social Media Mockups Container */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-2xl mx-auto">
              
              {/* Instagram Mobile Mockup */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm mx-auto">
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
                <div className="relative aspect-square bg-gradient-to-br from-cyan-300 to-blue-500">
                  {/* Page indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                    1/3
                  </div>
                  
                  {/* Actual Video or Preview */}
                  {generatedVideoUrl ? (
                    <VideoPlayer
                      videoUrl={generatedVideoUrl}
                      posterUrl={getImage(0) || uploadedImage}
                      title="Instagram Video Post"
                      className="w-full h-full object-cover rounded-none"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {(getImage(0) || uploadedImage) && (
                        <OptimizedImage 
                          src={getImage(0) || uploadedImage}
                          alt="Video preview"
                          className="w-full h-full object-cover opacity-30"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/80 to-blue-500/80 flex items-center justify-center">
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

              {/* TikTok Mobile Mockup */}
              <div className="bg-black rounded-lg shadow-lg overflow-hidden max-w-sm mx-auto">
                {/* TikTok Header */}
                <div className="bg-black text-white p-4 pt-12">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8">
                        <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                          <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.948-1.349-2.143-1.349-3.394C16.392.629 16.759 0 17.07 0h2.552c.31 0 .678.629.678.944 0 1.251-.5 2.446-1.349 3.394a6.228 6.228 0 0 1-1.137.966c-.147.097-.296.186-.443.258z"/>
                          <path d="M9.79 10.624c-1.85 0-3.352 1.502-3.352 3.352s1.502 3.352 3.352 3.352 3.352-1.502 3.352-3.352V6.042c.63.6 1.463 1.02 2.39 1.2v-2.95C13.15 4.145 11.64 2.635 9.79 2.635V10.624z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-2xl">TikTok</span>
                    </div>
                  </div>
                </div>
                
                {/* Video Content Area */}
                <div className="relative aspect-square bg-gradient-to-br from-teal-300 to-cyan-500">
                  {/* Actual Video or Preview */}
                  {generatedVideoUrl ? (
                    <VideoPlayer
                      videoUrl={generatedVideoUrl}
                      posterUrl={getImage(0) || uploadedImage}
                      title="TikTok Video"
                      className="w-full h-full object-cover rounded-none"
                    />
                  ) : (
                    <div className="absolute inset-0">
                      {(getImage(0) || uploadedImage) && (
                        <OptimizedImage 
                          src={getImage(0) || uploadedImage}
                          alt="Video preview"
                          className="w-full h-full object-cover opacity-40"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-300/80 to-cyan-500/80 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Right Side Actions */}
                  <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-white"></div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+</span>
                      </div>
                    </div>
                    
                    {/* Like */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF0050" className="drop-shadow-lg">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <span className="text-white text-xs font-semibold">87.2K</span>
                    </div>
                    
                    {/* Comment */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                      </div>
                      <span className="text-white text-xs font-semibold">2.1K</span>
                    </div>
                    
                    {/* Share */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      </div>
                      <span className="text-white text-xs font-semibold">Share</span>
                    </div>
                    
                    {/* TikTok Logo */}
                    <div className="w-12 h-12 border-2 border-white rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" className="fill-white">
                        <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.948-1.349-2.143-1.349-3.394C16.392.629 16.759 0 17.07 0h2.552c.31 0 .678.629.678.944 0 1.251-.5 2.446-1.349 3.394a6.228 6.228 0 0 1-1.137.966c-.147.097-.296.186-.443.258z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="mb-2">
                      <span className="font-semibold">@joshua_l</span>
                    </div>
                    <div className="text-sm mb-3">
                      {videoScripts && videoScripts.length > 0 
                        ? videoScripts[0].script.split('\n\n')[0]?.trim().substring(0, 80) + '...'
                        : 'Check out this amazing product! 🎧✨'
                      }
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>#music</span>
                      <span>#tech</span>
                      <span>#viral</span>
                      <span>#fyp</span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Navigation */}
                <div className="bg-black p-4">
                  <div className="flex justify-around items-center">
                    <button>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </button>
                    <button>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                    </button>
                    <button className="relative">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                    </button>
                    <button>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <button>
                      <div className="w-7 h-7 rounded-full bg-gray-300"></div>
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