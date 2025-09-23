import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RibbedSphere from '@/components/RibbedSphere';
import type { CampaignCreationResponse } from '@/types/api';

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, campaignResults } = location.state || {};
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenCategory = (category: string) => {
    setSelectedSection(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  const renderModalContent = () => {
    if (!campaignResults || !selectedSection) return null;

    switch (selectedSection) {
      case 'Banner Ads':
        return (
          <div className="space-y-4">
            {campaignResults.banner_ads?.map((banner, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Banner Ad #{index + 1}</h4>
                <p><strong>Headline:</strong> {banner.headline}</p>
                <p><strong>CTA:</strong> {banner.cta}</p>
              </div>
            ))}
          </div>
        );
      case 'Web Creative':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Landing Page Concept</h4>
              <p><strong>Hero Text:</strong> {campaignResults.landing_page_concept?.hero_text}</p>
              <p><strong>Sub Text:</strong> {campaignResults.landing_page_concept?.sub_text}</p>
              <p><strong>CTA:</strong> {campaignResults.landing_page_concept?.cta}</p>
            </div>
          </div>
        );
      case 'Video Scripts':
        return (
          <div className="space-y-4">
            {campaignResults.video_scripts?.map((video, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{video.platform} Script</h4>
                <p className="whitespace-pre-wrap">{video.script}</p>
              </div>
            ))}
          </div>
        );
      case 'Email Templates':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Email Campaign</h4>
              <p><strong>Subject:</strong> {campaignResults.email_copy?.subject}</p>
              <p><strong>Body:</strong></p>
              <p className="whitespace-pre-wrap mt-2">{campaignResults.email_copy?.body}</p>
            </div>
          </div>
        );
      default:
        return <p>No content available for this section.</p>;
    }
  };

  const renderImageWithVariation = (src: string | null, alt: string, variation: 'original' | 'light' | 'medium' | 'dark' = 'original') => {
    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          {alt}
        </div>
      );
    }

    const opacityMap = {
      original: 1,
      light: 0.8,
      medium: 0.6,
      dark: 0.4
    };

    const filterMap = {
      original: '',
      light: 'brightness(1.2) contrast(0.9)',
      medium: 'saturate(1.2) contrast(1.1)',
      dark: 'brightness(0.8) sepia(0.2)'
    };
    
    return (
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
        style={{ 
          opacity: opacityMap[variation],
          filter: filterMap[variation]
        }}
      />
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex min-h-screen flex-col overflow-y-auto">
        {/* Header */}
        <header className="container-padding pt-12 relative">
          <div className="absolute top-12 left-8">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Creative Assets Preview</h1>
            </div>
          </div>
          
          <div className="absolute top-12 right-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3">
                  <X className="h-4 w-4 text-black" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exit to Homepage?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to exit? Your generated content preview will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                  <Button onClick={handleStartOver} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Back Button */}
        <div className="fixed top-1/2 left-8 transform -translate-y-1/2 z-20">
          <Button 
            variant="secondary" 
            onClick={handleBack}
            className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </div>

        {/* Title */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Creative Assets Generated
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            Your comprehensive marketing campaign is ready
          </p>
        </div>

        {/* Main Content */}
        <main className="flex-1 container-padding pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Banner Ads Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Banner Ads</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">4</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Banner Ads')}
                    className="bg-black hover:bg-black/90 text-white px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 h-64">
                    {/* Four variations of the uploaded image */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Original banner', 'original')}
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Banner variation 2', 'light')}
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Banner variation 3', 'medium')}
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Banner variation 4', 'dark')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Web Creative Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Web Creative</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">1</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Web Creative')}
                    className="bg-black hover:bg-black/90 text-white px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageWithVariation(uploadedImage, 'Web creative', 'original')}
                  </div>
                </CardContent>
              </Card>

              {/* Video Scripts Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Video Scripts</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">1</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Video Scripts')}
                    className="bg-black hover:bg-black/90 text-white px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageWithVariation(uploadedImage, 'Video script preview', 'original')}
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">2</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Email Templates')}
                    className="bg-black hover:bg-black/90 text-white px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3 h-64">
                    {/* Two variations for email templates */}
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Email template - original', 'original')}
                    </div>
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageWithVariation(uploadedImage, 'Email template variation', 'light')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-foreground hover:bg-white/20 rounded-full px-8"
              >
                Create New Campaign
              </Button>
              <Button 
                onClick={() => navigate('/campaign-results', { state: location.state })}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
              >
                View Full Results
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Campaign Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSection} Results</DialogTitle>
            <DialogDescription>
              Generated campaign content for {selectedSection?.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderModalContent()}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal} className="rounded-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewResultsScreen;