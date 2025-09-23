import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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

interface GeneratedImages {
  'banner-ads': string[];
  'web-creative': string[];
  'video-scripts': string[];
  'email-templates': string[];
}

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, campaignPrompt } = location.state || {};
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({
    'banner-ads': [],
    'web-creative': [],
    'video-scripts': [],
    'email-templates': []
  });
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenCategory = (category: string) => {
    // Navigate to specific category results
    console.log(`Opening ${category} results`);
  };

  const generateRelatedImages = async () => {
    if (!campaignPrompt) {
      console.warn('No campaign prompt available for image generation');
      return;
    }

    setIsGeneratingImages(true);
    
    try {
      // Generate images for each category
      const categories: (keyof GeneratedImages)[] = ['banner-ads', 'web-creative', 'video-scripts', 'email-templates'];
      const counts = { 'banner-ads': 3, 'web-creative': 1, 'video-scripts': 1, 'email-templates': 1 };
      
      const results = await Promise.allSettled(
        categories.map(async (category) => {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-related-images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              basePrompt: campaignPrompt,
              category,
              count: counts[category]
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate images for ${category}`);
          }

          const data = await response.json();
          return { category, images: data.images };
        })
      );

      // Process results and update state
      const newImages = { ...generatedImages };
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newImages[result.value.category] = result.value.images;
        } else {
          console.error(`Failed to generate images for ${categories[index]}:`, result.reason);
        }
      });

      setGeneratedImages(newImages);
      toast.success('Related images generated successfully!');
      
    } catch (error) {
      console.error('Error generating related images:', error);
      toast.error('Failed to generate related images');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  useEffect(() => {
    if (uploadedImage && campaignPrompt) {
      generateRelatedImages();
    }
  }, [uploadedImage, campaignPrompt]);

  const renderImageSlot = (src: string | null, alt: string, isLoading: boolean = false) => {
    if (isLoading) {
      return <Skeleton className="w-full h-full rounded-lg" />;
    }
    
    if (src) {
      return (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        {alt}
      </div>
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
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      {uploadedImage ? (1 + generatedImages['banner-ads'].length) : 0}
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Banner Ads')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 h-64">
                    {/* First slot: Original uploaded image */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageSlot(uploadedImage, 'Original product', isGeneratingImages && !uploadedImage)}
                    </div>
                    {/* Remaining slots: Generated variations */}
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                        {renderImageSlot(
                          generatedImages['banner-ads'][index] || null,
                          `Banner variation ${index + 2}`,
                          isGeneratingImages
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Web Creative Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Web Creative</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      {uploadedImage ? (1 + generatedImages['web-creative'].length) : 0}
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Web Creative')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageSlot(uploadedImage, 'Web creative', isGeneratingImages && !uploadedImage)}
                  </div>
                </CardContent>
              </Card>

              {/* Video Scripts Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Video Scripts</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      {uploadedImage ? (1 + generatedImages['video-scripts'].length) : 0}
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Video Scripts')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {renderImageSlot(uploadedImage, 'Video script preview', isGeneratingImages && !uploadedImage)}
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Card */}
              <Card className="bg-white/20 border-white/30 backdrop-blur-sm shadow-lg">
                <div className="bg-white/30 px-4 py-3 flex items-center justify-between rounded-t-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-foreground font-medium">Email Templates</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      {uploadedImage ? (1 + generatedImages['email-templates'].length) : 0}
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenCategory('Email Templates')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3 h-64">
                    {/* First slot: Original uploaded image */}
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageSlot(uploadedImage, 'Email template - original', isGeneratingImages && !uploadedImage)}
                    </div>
                    {/* Second slot: Generated variation or placeholder */}
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {renderImageSlot(
                        generatedImages['email-templates'][0] || null,
                        'Email template variation',
                        isGeneratingImages
                      )}
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
    </div>
  );
};

export default PreviewResultsScreen;