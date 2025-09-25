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
  const { campaignResults, uploadedImage, campaignId, returnTo } = location.state || {};
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!campaignResults) {
      navigate(returnTo || '/preview-results');
    }
  }, [campaignResults, navigate, returnTo]);

  const handleBack = () => {
    navigate(returnTo || '/preview-results', {
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
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Video Examples</h2>
              <p className="text-sm text-muted-foreground">Elevate your Music Experience</p>
            </div>
            
            <div>
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

                {/* Platform Examples - Professional Social Media Mockups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* TikTok */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-black rounded-xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </div>
                      <span className="font-semibold text-sm">TikTok</span>
                    </div>
                    <div className="w-36 mx-auto bg-black rounded-2xl overflow-hidden shadow-xl relative">
                      <div className="aspect-[9/19.5] relative bg-black">
                        {/* Status Bar */}
                        <div className="absolute top-1 left-3 right-3 flex justify-between items-center z-20">
                          <span className="text-white text-[10px] font-medium">9:41</span>
                          <div className="flex items-center gap-0.5">
                            <div className="w-3 h-1.5 bg-white rounded-sm opacity-90"></div>
                          </div>
                        </div>
                        
                        {/* Video Content */}
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage}
                            alt="TikTok video content"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Right Side Actions */}
                        <div className="absolute right-2 bottom-16 space-y-3">
                          {/* Profile */}
                          <div className="relative">
                            <div className="w-8 h-8 bg-gray-300 rounded-full border border-white overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500"></div>
                            </div>
                            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">+</span>
                            </div>
                          </div>
                          
                          {/* Like */}
                          <div className="text-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-medium">124K</span>
                          </div>
                          
                          {/* Comment */}
                          <div className="text-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-medium">2.1K</span>
                          </div>
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                          <div className="text-white mb-10">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                              <span className="font-semibold text-[10px]">@musicbrand</span>
                            </div>
                            <p className="text-[9px] leading-tight mb-1">Transform your music experience with premium wireless headphones 🎧✨</p>
                            <p className="text-[8px] text-blue-300">#MusicLovers #Headphones</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-400 rounded-xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                        </svg>
                      </div>
                      <span className="font-semibold text-sm">Instagram</span>
                    </div>
                    <div className="w-36 mx-auto bg-black rounded-2xl overflow-hidden shadow-xl relative">
                      <div className="aspect-[9/19.5] relative bg-white">
                        {/* Status Bar */}
                        <div className="absolute top-1 left-3 right-3 flex justify-between items-center z-20">
                          <span className="text-black text-[10px] font-medium">9:41</span>
                          <div className="flex items-center gap-0.5">
                            <div className="w-3 h-1.5 bg-black rounded-sm opacity-90"></div>
                          </div>
                        </div>
                        
                        {/* Instagram Header */}
                        <div className="pt-6 pb-1 px-2 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-black text-[10px] font-bold">Instagram</div>
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                              </svg>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Stories */}
                        <div className="px-2 py-2 flex gap-2">
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 p-0.5">
                              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <span className="text-[8px]">Your Story</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gray-300">
                              <span className="text-[6px]">music</span>
                            </div>
                          </div>
                        </div>

                        {/* Post Header */}
                        <div className="px-2 py-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                            <span className="font-semibold text-[10px]">musicbrand</span>
                          </div>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="5" cy="12" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="19" cy="12" r="2"/>
                          </svg>
                        </div>

                        {/* Post Image */}
                        <div className="aspect-square bg-gray-100">
                          {(generatedImages[0]?.url || uploadedImage) && (
                            <img 
                              src={generatedImages[0]?.url || uploadedImage}
                              alt="Instagram post"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Post Actions */}
                        <div className="px-2 py-1">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex gap-2">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                              </svg>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                              </svg>
                            </div>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                            </svg>
                          </div>
                          
                          <div className="text-[9px]">
                            <p className="font-medium mb-0.5">Liked by craig_love and 44,686 others</p>
                            <p><span className="font-semibold">musicbrand</span> Premium wireless headphones for the ultimate music experience 🎧✨</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Shorts */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-red-600 rounded-xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <span className="font-semibold text-sm">YouTube</span>
                    </div>
                    <div className="w-36 mx-auto bg-black rounded-2xl overflow-hidden shadow-xl relative">
                      <div className="aspect-[9/19.5] relative bg-black">
                        {/* Status Bar */}
                        <div className="absolute top-1 left-3 right-3 flex justify-between items-center z-20">
                          <span className="text-white text-[10px] font-medium">9:41</span>
                          <div className="flex items-center gap-0.5">
                            <div className="w-3 h-1.5 bg-white rounded-sm opacity-90"></div>
                          </div>
                        </div>
                        
                        {/* Video Content */}
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage}
                            alt="YouTube Shorts content"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* YouTube Shorts UI */}
                        <div className="absolute top-8 right-2">
                          <div className="bg-black/50 text-white px-1 py-0.5 rounded text-[8px] font-medium">
                            Premium
                          </div>
                        </div>
                        
                        {/* Right Side Actions */}
                        <div className="absolute right-2 bottom-16 space-y-3">
                          {/* Like */}
                          <div className="text-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-medium">125</span>
                          </div>
                          
                          {/* Dislike */}
                          <div className="text-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-medium">12</span>
                          </div>
                          
                          {/* Comment */}
                          <div className="text-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-medium">8</span>
                          </div>
                          
                          {/* Subscribe */}
                          <div className="text-center">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">Subscribe</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                          <div className="text-white mb-10">
                            <p className="text-[9px] leading-tight mb-1">Experience premium sound quality with our wireless headphones. Perfect for music lovers! #Shorts</p>
                          </div>
                        </div>
                        
                        {/* YouTube Navigation */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
                          <div className="flex justify-around items-center py-1">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9.5 16c-1.61 0-3.09-.59-4.23-1.57L4 15.64l1.41 1.41C6.59 18.41 8.07 19 9.5 19s2.91-.59 4.09-1.95L15 15.64l-1.27-1.21C12.59 15.41 11.11 16 9.5 16z"/>
                            </svg>
                            <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5,3 19,12 5,21"/>
                              </svg>
                            </div>
                            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14 6V4h-4v2H5v5h2v6h2v2h6v-2h2v-6h2V6h-5z"/>
                            </svg>
                            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Video Scripts Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">AI Generated Video Scripts</h2>
              <p className="text-sm text-muted-foreground mb-6">Storyboard for your product</p>
            </div>
            
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
          </div>
        </div>
      </div>

      {/* QR Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Video Scripts</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              {downloadUrl && <QRCodeSVG value={downloadUrl} size={200} />}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code with your mobile device to download the video scripts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(downloadUrl, '_blank')}
              >
                Open Link
              </Button>
              <Button onClick={() => setIsDownloadModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoScriptsPreview;