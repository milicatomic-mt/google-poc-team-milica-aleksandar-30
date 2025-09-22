import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Lightbulb, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CampaignPromptScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const getExamples = () => {
    if (aiSuggestions.length > 0) {
      // Use AI suggestions with "Enter your campaign description" interspersed
      const examples = [];
      aiSuggestions.forEach((suggestion, index) => {
        examples.push("Enter your campaign description");
        examples.push(`e.g. ${suggestion}`);
      });
      return examples;
    }
    
    // Fallback to default examples
    return [
      "Enter your campaign description",
      "e.g. Launching a new eco-friendly sneaker for everyday wear.",
      "Enter your campaign description", 
      "e.g. Highlighting a limited-edition smartwatch with advanced health tracking.",
      "Enter your campaign description",
      "e.g. Showcasing a sustainable bamboo toothbrush for eco-conscious families."
    ];
  };

  // Typing animation effect
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let cycleTimeout: NodeJS.Timeout;
    
    const startTyping = () => {
      const examples = getExamples();
      const currentExample = examples[currentExampleIndex];
      let currentIndex = 0;
      setDisplayedPlaceholder('|');
      setIsTyping(true);
      
      // Small delay before starting to type
      setTimeout(() => {
        typingInterval = setInterval(() => {
          if (currentIndex < currentExample.length) {
            currentIndex++;
            setDisplayedPlaceholder(currentExample.slice(0, currentIndex));
          } else {
            setIsTyping(false);
            clearInterval(typingInterval);
            
            // Wait remaining time to complete 8 second cycle
            const typingDuration = currentExample.length * 50;
            const remainingTime = 8000 - typingDuration;
            
            cycleTimeout = setTimeout(() => {
              setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
            }, Math.max(remainingTime, 1000));
          }
        }, 50); // Typing speed
      }, 300); // Initial delay to show cursor
    };
    
    startTyping();
    
    return () => {
      clearInterval(typingInterval);
      clearTimeout(cycleTimeout);
    };
  }, [currentExampleIndex, aiSuggestions]);

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    // Focus the textarea and adjust its height
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Trigger height adjustment after the value is set
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';
        }
      }, 0);
    }
  };

  const handleContinue = () => {
    if (prompt.trim()) {
      // Navigate to target audience step with prompt data and preserve previous state
      navigate('/target-audience', { state: { ...location.state, prompt: prompt.trim() } });
    }
  };

  const handleBack = () => {
    const mode = location.state?.mode || 'campaign';
    navigate(`/upload/${mode}`);
  };

  // Auto-focus textarea on mount and load AI suggestions
  // Auto-adjust height when prompt changes
  useEffect(() => {
    if (textareaRef.current && prompt) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';
    }
  }, [prompt]);

  useEffect(() => {
    textareaRef.current?.focus();
    
    // Load AI suggestions from session storage
    const suggestions = sessionStorage.getItem('aiSuggestions');
    if (suggestions) {
      try {
        const parsedSuggestions = JSON.parse(suggestions);
        if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
          setAiSuggestions(parsedSuggestions);
        }
      } catch (error) {
        console.error('Failed to parse AI suggestions:', error);
      }
    }
  }, []);

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
              <h1 className="text-lg font-semibold text-foreground">Campaign Creation</h1>
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

        {/* Step Indicator - Lower position */}
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-12">
            {/* Step 1 - Completed */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-black">Upload Image</span>
            </div>
            
            {/* Step 2 - Current */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-sm font-semibold text-indigo-500">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-black">Enter Prompt</span>
            </div>
            
            {/* Step 3 - Future */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-black">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-black">Target Audience</span>
            </div>
          </div>
        </div>

      {/* Main Container - Scrollable */}
      <div className="flex-1 flex flex-col items-center justify-center container-padding py-4 overflow-y-auto">
        
        {/* Header Section */}
        <div className="w-full max-w-4xl mx-auto text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-semibold text-foreground mb-4">
            Campaign Prompt
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your campaign idea in two sentences max.
          </p>
        </div>

        {/* Main Input Section */}
        <div className="w-full max-w-2xl mx-auto mb-8 animate-scale-in">
          <label 
            htmlFor="campaign-prompt" 
            className="sr-only"
          >
            Campaign description
          </label>
          <Textarea
            id="campaign-prompt"
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={displayedPlaceholder}
            className="min-h-[120px] text-lg resize-none backdrop-blur-md bg-white/80 rounded-lg shadow-sm border border-white/40 focus-visible:border-primary transition-all duration-smooth placeholder:text-gray-400 p-4 leading-relaxed"
            style={{ 
              height: 'auto',
              minHeight: '120px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.max(120, target.scrollHeight) + 'px';
            }}
            aria-describedby="example-help"
          />
        </div>

        {/* Suggestions Section */}
        <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
          <h3 className="text-lg font-medium text-foreground mb-4 text-center">
            {aiSuggestions.length > 0 ? 'AI-Generated Campaign Ideas Based on Your Image' : 'Not Sure What to Write? Here\'s How to Start'}
          </h3>
          <div className="space-y-3">
            {aiSuggestions.length > 0 ? (
              // Show AI-generated suggestions (max 3)
              aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(suggestion)}
                  className="w-full flex items-start p-4 backdrop-blur-md bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100/90 hover:to-purple-100/90 rounded-lg border border-indigo-200/60 hover:border-indigo-400/80 transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0">
                    <RibbedSphere className="w-full h-full" />
                  </div>
                  <span className="text-foreground group-hover:text-primary">
                    {suggestion}
                  </span>
                </button>
              ))
            ) : (
              // Fallback to default suggestions
              <>
                <button
                  onClick={() => handleExampleClick("Launching a new eco-friendly sneaker for everyday wear.")}
                  className="w-full flex items-start p-4 backdrop-blur-md bg-white/30 hover:bg-white rounded-lg border border-white/40 hover:border-primary transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0">
                    <RibbedSphere className="w-full h-full" />
                  </div>
                  <span className="text-foreground group-hover:text-primary">
                    Launching a new eco-friendly sneaker for everyday wear.
                  </span>
                </button>
                <button
                  onClick={() => handleExampleClick("Highlighting a limited-edition smartwatch with advanced health tracking.")}
                  className="w-full flex items-start p-4 backdrop-blur-md bg-white/30 hover:bg-white rounded-lg border border-white/40 hover:border-primary transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0">
                    <RibbedSphere className="w-full h-full" />
                  </div>
                  <span className="text-foreground group-hover:text-primary">
                    Highlighting a limited-edition smartwatch with advanced health tracking.
                  </span>
                </button>
                <button
                  onClick={() => handleExampleClick("Showcasing a sustainable bamboo toothbrush for eco-conscious families.")}
                  className="w-full flex items-start p-4 backdrop-blur-md bg-white/30 hover:bg-white rounded-lg border border-white/40 hover:border-primary transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0">
                    <RibbedSphere className="w-full h-full" />
                  </div>
                  <span className="text-foreground group-hover:text-primary">
                    Showcasing a sustainable bamboo toothbrush for eco-conscious families.
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        </div>

        {/* Footer with Next Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              className={`tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-opacity duration-300 rounded-full ${prompt.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Continue to next step"
            >
              <span className="mr-2">Next</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default CampaignPromptScreen;