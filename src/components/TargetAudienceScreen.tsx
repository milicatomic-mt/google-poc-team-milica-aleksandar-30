import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, X, Check } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const TargetAudienceScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

  const audienceRows = [
    ["Gen Z (18-24)", "Millennials (25-40)"],
    ["Gen X (41-56)", "Baby Boomers (57+)", "Urban professionals"],
    ["Outdoor enthusiasts", "Health & wellness focused", "Tech enthusiasts"],
    ["Eco-conscious consumers", "Budget-conscious shoppers"]
  ];

  const handleContinue = () => {
    // Navigate to next step with all collected data, preserving prior state
    const campaignData = {
      ...location.state,
      campaignPrompt: location.state?.prompt,
      selectedAudiences,
      type: 'campaign',
      uploadedImage: location.state?.uploadedImage,
    };
    navigate('/generate-campaign', { state: campaignData });
  };
  const handleBack = () => {
    navigate('/campaign-prompt', { state: location.state });
  };

  const toggleAudience = (audience: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audience)
        ? prev.filter(item => item !== audience)
        : [...prev, audience]
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
          {/* Logo and Flow Name - Top Left */}
          <div className="absolute top-12 left-8">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Image to Campaign</h1>
            </div>
          </div>
          
          {/* Exit Button - Top Right (aligned with logo) */}
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
                    Are you sure you want to exit? Any current progress will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                  <Button onClick={() => navigate('/')} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Back Button - Centered Vertically on Left */}
        <div className="fixed top-1/2 left-8 transform -translate-y-1/2 z-20">
          <Button
            variant="secondary"
            onClick={handleBack}
            className="tap-target hover-lift focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </div>


        {/* Main Container - Scrollable */}
        <div className="flex-1 flex flex-col items-center justify-center container-padding py-4 overflow-y-auto">
          
          {/* Header Section */}
          <div className="w-full max-w-4xl mx-auto text-center mb-8 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Optional</p>
            <h1 className="text-4xl font-semibold text-foreground mb-4">
              Define Target Audience
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select one or more audience segments that best match your target customers.
            </p>
          </div>

          {/* Tag Selection */}
          <div className="w-full max-w-4xl mx-auto mb-8 animate-scale-in">
            <div className="space-y-4">
              {audienceRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-3 flex-wrap">
                  {row.map((audience) => (
                    <button
                      key={audience}
                      onClick={() => toggleAudience(audience)}
                      className={`
                        px-6 py-3 rounded-full border-2 transition-all duration-200 tap-target font-medium backdrop-blur-md
                        ${selectedAudiences.includes(audience)
                          ? 'bg-white border-0 text-indigo-600 shadow-lg'
                          : 'bg-white/30 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40'
                        }
                      `}
                    >
                      {audience}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              className="tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
              aria-label="Continue to next step"
            >
              <span className="mr-2">Generate Campaign</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default TargetAudienceScreen;