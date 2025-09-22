import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X, ArrowRight, Package, Megaphone, Check } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import catalogSample from '@/assets/catalog-sample.jpg';
import campaignSample from '@/assets/campaign-sample.jpg';

const TypingText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 25);
    
    return () => clearInterval(timer);
  }, [text]);
  
  return <span className="transition-all duration-75 ease-out">{displayText}</span>;
};
const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleCardClick = (option: string) => {
    setSelectedOption(option);
    resetInactivityTimer();
  };

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    const newTimer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 seconds

    inactivityTimerRef.current = newTimer;
  }, [navigate]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Set up activity listeners
  useEffect(() => {
    // Start the timer when component mounts
    resetInactivityTimer();

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [handleUserActivity, resetInactivityTimer]);
  return <div className="relative min-h-screen w-full overflow-hidden bg-background">
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

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="container-padding pt-12 relative">
          {/* Exit Button - Top Right */}
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
                    Are you sure you want to exit? Any current selection will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => navigate('/')} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="animate-fade-in max-w-6xl mx-auto text-center mt-8">
            <div className="flex items-center justify-center mb-4">
              {/* Sphere beside title */}
              <div className="h-10 w-10 mr-4">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground">
                <TypingText text="What would you like to try first?" />
              </h2>
            </div>
          </div>
        </header>

        {/* Main Options */}
        <main className="flex-1 flex items-center justify-center container-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            {/* Catalog Enrichment Card */}
            <div className={`card-elegant cursor-pointer group relative overflow-hidden transition-all duration-smooth border-2 backdrop-blur-md bg-white/20 border-white/30 ${selectedOption === 'catalog' ? 'shadow-elegant-lg border-white/50 bg-white/30' : 'hover:shadow-elegant-lg hover:border-white/50 hover:bg-white/30'}`} onClick={() => handleCardClick('catalog')}>
              {/* Hero Image */}
              <div className="relative h-64 mb-6 overflow-hidden rounded-lg">
                <img src={catalogSample} alt="Catalog enrichment sample" className="w-full h-full object-cover transition-transform duration-smooth group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                <div className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md">
                  <Package className="w-6 h-6 text-black" />
                </div>
                {/* Selection Checkmark Overlay */}
                {selectedOption === 'catalog' && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-scale-in">
                    <div className="bg-primary rounded-full p-3 shadow-lg">
                      <Check className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-h2 font-semibold text-foreground">
                  Catalog Enrichment
                </h3>
                <p className="text-body-lg text-muted-foreground leading-relaxed">
                  Transform product images into complete marketing packages with AI-generated titles, 
                  descriptions, features, and SEO-optimized content.
                </p>
              </div>

            </div>

            {/* Campaign Creation Card */}
            <div className={`card-elegant cursor-pointer group relative overflow-hidden transition-all duration-smooth border-2 backdrop-blur-md bg-white/20 border-white/30 ${selectedOption === 'campaign' ? 'shadow-elegant-lg border-white/50 bg-white/30' : 'hover:shadow-elegant-lg hover:border-white/50 hover:bg-white/30'}`} onClick={() => handleCardClick('campaign')}>
              {/* Hero Image */}
              <div className="relative h-64 mb-6 overflow-hidden rounded-lg">
                <img src={campaignSample} alt="Campaign advertisement mockup" className="w-full h-full object-cover transition-transform duration-smooth group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                <div className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md">
                  <Megaphone className="w-6 h-6 text-black" />
                </div>
                {/* Selection Checkmark Overlay */}
                {selectedOption === 'campaign' && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-scale-in">
                    <div className="bg-primary rounded-full p-3 shadow-lg">
                      <Check className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-h2 font-semibold text-foreground">
                  Image to Campaign
                </h3>
                <p className="text-body-lg text-muted-foreground leading-relaxed">
                  Create comprehensive marketing campaigns with social media content, email designs, web banners, and video concepts from your inspiration.
                </p>
              </div>

            </div>
          </div>
        </main>

        {/* Navigation Footer */}
        <footer className="container-padding pb-12 pt-4">
          {/* Centered Continue Button - Always reserve space */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className={`tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-opacity duration-300 rounded-full ${selectedOption ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => {
                if (selectedOption === 'catalog') {
                  navigate('/upload/catalog');
                } else if (selectedOption === 'campaign') {
                  navigate('/upload/campaign');
                }
              }}
            >
              <span className="mr-2">Continue</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </footer>
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        <h2>Choose your content creation path</h2>
        <p>Select between catalog enrichment for product images or campaign creation for marketing materials</p>
      </div>
    </div>;
};
export default WelcomeScreen;