import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, RefreshCw, X } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CampaignPromptScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  
  const uploadedImage = location.state?.uploadedImage;
  const uploadedFile = location.state?.uploadedFile;

  // Target audience options
  const ageGroups = ['Gen Z (18-24)', 'Millennials (25-40)', 'Gen X (41-56)', 'Baby Boomers (57+)'];
  const interests = [
    'Urban professionals', 'Outdoor enthusiasts', 'Health & wellness focused', 'Tech enthusiasts',
    'Eco-conscious consumers', 'Budget-conscious shoppers'
  ];

  const toggleAudience = (audience: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const typePrompt = (text: string) => {
    setIsTyping(true);
    setDisplayedPrompt('');
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedPrompt(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 15); // Faster typing speed
  };

  const handleRegenerate = async () => {
    if (!uploadedFile) {
      toast.error('No image file available for regeneration');
      return;
    }

    setIsRegenerating(true);
    try {
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedFile);
      });

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageBase64: base64Image }
      });

      if (error || !data) {
        throw new Error('Failed to regenerate prompt');
      }

      if (data.suggestions && data.suggestions.length > 0) {
        // Pick a random suggestion instead of always the first one
        const randomIndex = Math.floor(Math.random() * data.suggestions.length);
        const selectedSuggestion = data.suggestions[randomIndex];
        setPrompt(selectedSuggestion);
        typePrompt(selectedSuggestion);
        
        // Auto-fill target audience if available
        if (data.targetAudience && data.targetAudience.length > 0) {
          setSelectedAudiences(data.targetAudience);
        }
        
        toast.success('New prompt generated!');
      }
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      toast.error('Failed to regenerate prompt. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCreateCampaign = () => {
    if (prompt.trim()) {
      // Navigate directly to generate campaign with properly mapped data
      navigate('/generate-campaign', { 
        state: { 
          ...location.state, 
          campaignPrompt: prompt.trim(), // Map prompt to campaignPrompt
          selectedAudiences: selectedAudiences
        } 
      });
    }
  };

  const handleBack = () => {
    const mode = location.state?.mode || 'campaign';
    navigate(`/upload/${mode}`);
  };

  // Load initial AI-generated prompt and auto-fill fields
  useEffect(() => {
    const aiGeneratedPrompt = location.state?.aiGeneratedPrompt;
    const aiAnalysisData = location.state?.aiAnalysisData;
    
    if (aiGeneratedPrompt && !prompt) {
      setPrompt(aiGeneratedPrompt);
      typePrompt(aiGeneratedPrompt);
    }
    
    // Auto-fill target audience from AI analysis
    if (aiAnalysisData?.targetAudience && selectedAudiences.length === 0) {
      setSelectedAudiences(aiAnalysisData.targetAudience);
    }
  }, [location.state, prompt, selectedAudiences]);

  // Auto-adjust height when prompt changes
  useEffect(() => {
    if (textareaRef.current && prompt) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';
    }
  }, [prompt]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
        preload="metadata"
        onError={(e) => {
          console.warn('Background video failed to load');
          e.currentTarget.style.display = 'none';
        }}
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
      <div className="flex-1 flex flex-col container-padding py-8 overflow-y-auto">
        
        {/* Header Section */}
        <div className="w-full max-w-6xl mx-auto text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-semibold text-foreground mb-4">
            Turn Your Image Into a Campaign
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've generated a prompt from your photo. You can use it as is, tweak it, or start fresh.
          </p>
        </div>

        {/* Image and Prompt Section */}
        <div className="w-full max-w-4xl mx-auto mb-12 animate-scale-in">
          <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex gap-6 items-start">
              {/* Image Preview - smaller */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-xl overflow-hidden">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded product"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100 rounded-xl">
                      No image available
                    </div>
                  )}
                </div>
              </div>
              
               {/* Prompt Section */}
               <div className="flex-1 relative">
                 {/* Glass effect input field - same height as image */}
                 <div className="backdrop-blur-md rounded-xl border border-white shadow-sm h-40 p-4 relative" style={{backgroundColor: '#FFFFFF'}}>
                    <Textarea
                      ref={textareaRef}
                      value={isTyping ? displayedPrompt + '|' : displayedPrompt}
                      onChange={(e) => {
                        const newValue = e.target.value.replace('|', '');
                        setPrompt(newValue);
                        setDisplayedPrompt(newValue);
                      }}
                      placeholder="Enter your campaign description..."
                      className="h-full w-full text-base resize-none bg-transparent border-0 p-0 focus-visible:ring-0 leading-relaxed text-gray-800 placeholder:text-gray-500 pr-28"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        // Remove auto-height adjustment since we want fixed height
                      }}
                    />
                   
                   {/* Wave loading animation overlay */}
                   {isRegenerating && (
                     <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                       <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-200/50 to-transparent animate-wave"></div>
                     </div>
                   )}
                   
                   {/* Regenerate button inside input at bottom right */}
                   <Button
                     onClick={handleRegenerate}
                     disabled={isRegenerating}
                     className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-sm"
                   >
                     <RefreshCw className={`w-4 h-4 text-white ${isRegenerating ? 'animate-spin' : ''}`} />
                   </Button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="w-full max-w-6xl mx-auto mb-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Define Target Audience <span className="text-lg text-muted-foreground font-normal">(Optional)</span>
          </h2>
          
          <div className="space-y-4">
            {/* Age Groups - First row (4 items) */}
            <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
              {ageGroups.map((age) => (
                <button
                  key={age}
                  onClick={() => toggleAudience(age)}
                  className={`px-2 py-3 rounded-full border-2 transition-all duration-300 tap-target font-medium backdrop-blur-md text-sm transform hover:scale-105 active:scale-95 ${
                    selectedAudiences.includes(age)
                      ? 'bg-white border-indigo-600 text-indigo-600 scale-105 shadow-lg animate-scale-in'
                      : 'bg-white/30 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 scale-100'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* Interests - Second row (4 items) */}
            <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
              {interests.slice(0, 4).map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleAudience(interest)}
                  className={`px-2 py-3 rounded-full border-2 transition-all duration-300 tap-target font-medium backdrop-blur-md text-sm transform hover:scale-105 active:scale-95 ${
                    selectedAudiences.includes(interest)
                      ? 'bg-white border-indigo-600 text-indigo-600 scale-105 shadow-lg animate-scale-in'
                      : 'bg-white/30 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 scale-100'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {/* Interests - Third row (2 items) */}
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {interests.slice(4, 6).map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleAudience(interest)}
                  className={`px-2 py-3 rounded-full border-2 transition-all duration-300 tap-target font-medium backdrop-blur-md text-sm transform hover:scale-105 active:scale-95 ${
                    selectedAudiences.includes(interest)
                      ? 'bg-white border-indigo-600 text-indigo-600 scale-105 shadow-lg animate-scale-in'
                      : 'bg-white/30 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 scale-100'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        </div>

        {/* Footer with Create Campaign Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleCreateCampaign}
              className={`tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-opacity duration-300 rounded-full ${prompt.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Create campaign"
            >
              Create Campaign
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default CampaignPromptScreen;