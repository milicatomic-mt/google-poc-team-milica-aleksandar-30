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

                {/* Platform Examples - Professional Social Media Mockups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* TikTok */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-7 h-7 bg-black rounded-2xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-base">TikTok</span>
                    </div>
                    <div className="w-48 mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                      {/* Phone Frame */}
                      <div className="aspect-[9/19.5] relative bg-black">
                        {/* Status Bar */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center z-20">
                          <span className="text-white text-xs font-medium">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 bg-white rounded-sm opacity-90"></div>
                            <div className="w-6 h-3 border border-white rounded-sm">
                              <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
                            </div>
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
                        <div className="absolute right-3 bottom-20 space-y-6">
                          {/* Profile */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-300 rounded-full border-2 border-white overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500"></div>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </div>
                          </div>
                          
                          {/* Like */}
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">124K</span>
                          </div>
                          
                          {/* Comment */}
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">2.1K</span>
                          </div>
                          
                          {/* Share */}
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">Share</span>
                          </div>
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <div className="text-white mb-16">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                              <span className="font-semibold text-sm">@musicbrand</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-2">Transform your music experience with premium wireless headphones 🎧✨ #MusicLovers #Headphones</p>
                          </div>
                        </div>
                        
                        {/* Bottom Navigation */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
                          <div className="flex justify-around items-center py-2">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-lg font-bold">+</span>
                            </div>
                            <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                            </svg>
                            <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-7 h-7 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-400 rounded-2xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-base">Instagram</span>
                    </div>
                    <div className="w-48 mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                      <div className="aspect-[9/19.5] relative bg-white">
                        {/* Status Bar */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center z-20">
                          <span className="text-black text-xs font-medium">9:41</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-2 text-black" viewBox="0 0 24 12" fill="currentColor">
                              <rect x="2" y="3" width="5" height="6" rx="1"/>
                              <rect x="9" y="3" width="5" height="6" rx="1"/>
                              <rect x="16" y="3" width="5" height="6" rx="1"/>
                            </svg>
                            <svg className="w-5 h-3 text-black" viewBox="0 0 24 12" fill="currentColor">
                              <rect x="1" y="1" width="22" height="10" rx="2" stroke="currentColor" fill="none"/>
                              <rect x="2" y="2" width="18" height="8" rx="1"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Instagram Header */}
                        <div className="pt-10 pb-2 px-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="text-black font-bold text-lg">Instagram</div>
                            <div className="flex items-center gap-4">
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                              </svg>
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Post Header */}
                        <div className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-semibold text-black">musicbrand</p>
                            <p className="text-xs text-gray-500">Sponsored</p>
                          </div>
                          <div className="ml-auto">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="12" cy="19" r="2"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Post Image */}
                        <div className="relative">
                          {(generatedImages[0]?.url || uploadedImage) && (
                            <img 
                              src={generatedImages[0]?.url || uploadedImage}
                              alt="Instagram post"
                              className="w-full aspect-square object-cover"
                            />
                          )}
                        </div>
                        
                        {/* Post Actions */}
                        <div className="p-3">
                          <div className="flex items-center gap-4 mb-2">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                              <polyline points="16,6 12,2 8,6"/>
                              <line x1="12" y1="2" x2="12" y2="15"/>
                            </svg>
                            <div className="ml-auto">
                              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                              </svg>
                            </div>
                          </div>
                          
                          <p className="text-sm text-black font-semibold mb-1">15,847 likes</p>
                          <p className="text-sm text-black">
                            <span className="font-semibold">musicbrand</span> Transform your music experience with premium wireless headphones 🎧✨ #MusicLovers #Headphones
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Shorts */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-7 h-7 bg-red-600 rounded-2xl flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-base">YouTube Shorts</span>
                    </div>
                    <div className="w-48 mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                      <div className="aspect-[9/19.5] relative bg-black">
                        {/* Status Bar */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center z-20">
                          <span className="text-white text-xs font-medium">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 bg-white rounded-sm opacity-90"></div>
                            <div className="w-6 h-3 border border-white rounded-sm">
                              <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* YouTube Shorts Header */}
                        <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-20">
                          <svg className="w-20 h-6 text-white" viewBox="0 0 90 20" fill="currentColor">
                            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5701 5.35042 27.9727 3.12324Z"/>
                            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="black"/>
                          </svg>
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="11" cy="11" r="8"/>
                              <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <div className="w-7 h-7 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Video Content */}
                        {(generatedImages[0]?.url || uploadedImage) && (
                          <img 
                            src={generatedImages[0]?.url || uploadedImage}
                            alt="YouTube Shorts video"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Right Side Actions */}
                        <div className="absolute right-3 bottom-32 space-y-6">
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">8.2K</span>
                          </div>
                          
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">Dislike</span>
                          </div>
                          
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">Comments</span>
                          </div>
                          
                          <div className="text-center">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium">Share</span>
                          </div>
                        </div>
                        
                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <div className="text-white mb-20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">M</span>
                              </div>
                              <span className="font-semibold text-sm">MusicBrand</span>
                              <button className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Subscribe
                              </button>
                            </div>
                            <p className="text-sm leading-relaxed">Transform your music experience with premium wireless headphones 🎧✨ #Shorts #MusicLovers</p>
                          </div>
                        </div>
                        
                        {/* Bottom Navigation */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
                          <div className="flex justify-center items-center py-2">
                            <div className="text-white text-xs font-medium">Shorts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Scripts Content */}
          {videoScripts.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/30 p-4 border-b">
                  <h2 className="text-lg font-semibold mb-1">Video Scripts</h2>
                  <p className="text-sm text-muted-foreground">AI-generated scripts for your video content</p>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-6">
                    {videoScripts.map((script, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg capitalize">
                            {script.platform.replace('_', ' ')} Script
                          </h3>
                          <Badge variant="outline" className="capitalize">
                            {script.duration}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Hook</h4>
                            <p className="text-sm">{script.hook}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Main Content</h4>
                            <p className="text-sm">{script.main_content}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Call to Action</h4>
                            <p className="text-sm">{script.cta}</p>
                          </div>
                          
                          {script.visual_direction && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Visual Direction</h4>
                              <p className="text-sm text-muted-foreground">{script.visual_direction}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              {downloadUrl && (
                <QRCodeSVG
                  value={downloadUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code with your mobile device to download your video scripts
            </p>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(downloadUrl);
                toast.success('Download link copied to clipboard');
              }}
              className="w-full"
            >
              Copy Download Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoScriptsPreview;