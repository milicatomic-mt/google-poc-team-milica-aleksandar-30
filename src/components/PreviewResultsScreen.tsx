import React from 'react';
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

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage } = location.state || {};

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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 h-64">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                        {uploadedImage ? (
                          <img 
                            src={uploadedImage} 
                            alt={`Banner variation ${index}`}
                            className="w-full h-full object-cover"
                            style={{ opacity: 1 - (index - 1) * 0.2 }}
                          />
                        ) : (
                          <div className="text-muted-foreground text-sm">Banner {index}</div>
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
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">1</span>
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
                    {uploadedImage ? (
                      <img 
                        src={uploadedImage} 
                        alt="Web creative"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">Web Creative</div>
                    )}
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="h-64 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                    {uploadedImage ? (
                      <img 
                        src={uploadedImage} 
                        alt="Video script preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">Video Script</div>
                    )}
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-full"
                  >
                    Open
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3 h-64">
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Email template 1"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm">Email Template 1</div>
                      )}
                    </div>
                    <div className="h-[48%] bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Email template 2"
                          className="w-full h-full object-cover opacity-70"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm">Email Template 2</div>
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