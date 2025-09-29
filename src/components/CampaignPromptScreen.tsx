import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, RefreshCw, X, Sparkles } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
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
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  
  const uploadedImage = location.state?.uploadedImage;
  const uploadedFile = location.state?.uploadedFile;
  const editMode = location.state?.editMode;
  const campaignId = location.state?.campaignId;

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

  const animateAudienceSelection = (audiences: string[]) => {
    if (audiences.length === 0) return;
    
    setIsAutoSelecting(true);
    setSelectedAudiences([]); // Clear current selection
    
    // Select audiences one by one with smooth animation
    audiences.forEach((audience, index) => {
      setTimeout(() => {
        setSelectedAudiences(prev => [...prev, audience]);
        
        // Stop auto-selecting when we've processed all audiences
        if (index === audiences.length - 1) {
          setTimeout(() => {
            setIsAutoSelecting(false);
          }, 250);
        }
      }, index * 250); // Shorter delay for smoother experience
    });
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

  const handleRegenerate = () => {
    if (allSuggestions.length === 0) {
      toast.error('No suggestions available');
      return;
    }

    setIsRegenerating(true);
    
    // Move to next suggestion (cycle back to 0 when reaching the end)
    const nextIndex = (currentSuggestionIndex + 1) % allSuggestions.length;
    setCurrentSuggestionIndex(nextIndex);
    
    const nextSuggestion = allSuggestions[nextIndex];
    setPrompt(nextSuggestion);
    typePrompt(nextSuggestion);
    
    // Add a small delay to show the regenerating state
    setTimeout(() => {
      setIsRegenerating(false);
      toast.success('New prompt loaded!');
    }, 500);
  };

  const handleCreateCampaign = () => {
    if (prompt.trim()) {
      // Navigate directly to generate campaign with properly mapped data
      navigate('/generate-campaign', { 
        state: { 
          ...location.state, 
          campaignPrompt: prompt.trim(), // Map prompt to campaignPrompt
          selectedAudiences: selectedAudiences,
          editMode: editMode, // Pass edit mode to generate screen
          campaignId: editMode ? campaignId : undefined // Pass campaign ID for updates
        } 
      });
    }
  };

  const handleBack = () => {
    const mode = location.state?.mode || 'campaign';
    navigate(`/upload/${mode}`);
  };

  // Load existing campaign data in edit mode or AI-generated prompt for new campaigns
  useEffect(() => {
    const loadExistingCampaignData = async () => {
      if (editMode && campaignId && !isLoadingExistingData) {
        setIsLoadingExistingData(true);
        try {
          const { data, error } = await supabase
            .from('campaign_results')
            .select('campaign_prompt, target_audience, image_url')
            .eq('id', campaignId)
            .single();

          if (error) {
            console.error('Error fetching campaign data:', error);
            toast.error('Failed to load campaign data');
          } else if (data) {
            // Set the prompt
            if (data.campaign_prompt) {
              setPrompt(data.campaign_prompt);
              setDisplayedPrompt(data.campaign_prompt);
            }
            
            // Parse and set target audiences
            if (data.target_audience) {
              const audiences = data.target_audience.split(', ').filter(Boolean);
              setSelectedAudiences(audiences);
            }
          }
        } catch (error) {
          console.error('Error loading campaign data:', error);
          toast.error('Failed to load campaign data');
        } finally {
          setIsLoadingExistingData(false);
        }
        return; // Exit early in edit mode
      }

      // Original logic for new campaigns
      const aiGeneratedPrompt = location.state?.aiGeneratedPrompt;
      const aiAnalysisData = location.state?.aiAnalysisData;
      
      if (aiGeneratedPrompt && !prompt) {
        setPrompt(aiGeneratedPrompt);
        typePrompt(aiGeneratedPrompt);
      }
      
      // Store all suggestions from AI analysis
      if (aiAnalysisData?.suggestions && allSuggestions.length === 0) {
        setAllSuggestions(aiAnalysisData.suggestions);
        setCurrentSuggestionIndex(0);
      }
      
      // Auto-fill target audience from AI analysis with animation
      if (aiAnalysisData?.targetAudience && selectedAudiences.length === 0) {
        animateAudienceSelection(aiAnalysisData.targetAudience);
      }
    };

    loadExistingCampaignData();
  }, [editMode, campaignId]);

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

      <div className="relative z-10 flex h-screen flex-col">
        {/* Header */}
        <header className="container-padding pt-12 relative flex-shrink-0">
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
                <Button variant="secondary" className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3 shadow-sm">
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
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">Cancel</Button>
                  </DialogClose>
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
            className="tap-target hover-lift focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3 shadow-sm"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </div>

        {/* Main Container - Fixed Height, No Scroll */}
        <div className="flex-1 flex flex-col container-padding py-8 overflow-hidden">
          
          {/* Header Section */}
          <div className="w-full max-w-6xl mx-auto text-center mb-6 animate-fade-in flex-shrink-0">
            <h1 className="text-4xl font-semibold text-foreground mb-4">
              {editMode ? 'Edit Your Campaign' : 'Turn Your Image Into a Campaign'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {editMode 
                ? 'Update your campaign prompt and target audience settings below.'
                : 'We\'ve generated a prompt from your photo. You can use it as is, tweak it, or start fresh.'
              }
            </p>
            {isLoadingExistingData && (
              <p className="text-sm text-muted-foreground mt-2">Loading existing campaign data...</p>
            )}
          </div>

          {/* Image and Prompt Section */}
          <div className="w-full max-w-4xl mx-auto mb-8 animate-scale-in flex-shrink-0">
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
                       className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-sm"
                     >
                       <RefreshCw className={`w-4 h-4 text-white ${isRegenerating ? 'animate-spin' : ''}`} />
                     </Button>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Target Audience Section - Flexible Height */}
          <div className="w-full max-w-6xl mx-auto flex-1 animate-fade-in min-h-0">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Define Target Audience <span className="text-lg text-muted-foreground font-normal">(Optional)</span>
            </h2>
            
            <div className="space-y-4">
              {/* Age Groups - First row (4 items) */}
              <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
                 {ageGroups.map((age) => (
                   <button
                     key={age}
                     data-audience={age}
                     onClick={() => !isAutoSelecting && toggleAudience(age)}
                     disabled={isAutoSelecting}
                      className={`px-3 py-2 rounded-full transition-all duration-300 ease-out tap-target font-medium backdrop-blur-md text-sm ${
                        selectedAudiences.includes(age)
                           ? 'bg-white border border-black text-primary shadow-lg transform scale-105'
                          : 'bg-white/30 border-2 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 hover:scale-[1.02] transform scale-100'
                      } ${isAutoSelecting && !selectedAudiences.includes(age) ? 'opacity-50' : 'opacity-100'}`}
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
                     data-audience={interest}
                     onClick={() => !isAutoSelecting && toggleAudience(interest)}
                     disabled={isAutoSelecting}
                      className={`px-3 py-2 rounded-full transition-all duration-300 ease-out tap-target font-medium backdrop-blur-md text-sm ${
                        selectedAudiences.includes(interest)
                           ? 'bg-white border border-black text-primary shadow-lg transform scale-105'
                          : 'bg-white/30 border-2 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 hover:scale-[1.02] transform scale-100'
                      } ${isAutoSelecting && !selectedAudiences.includes(interest) ? 'opacity-50' : 'opacity-100'}`}
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
                     data-audience={interest}
                     onClick={() => !isAutoSelecting && toggleAudience(interest)}
                     disabled={isAutoSelecting}
                      className={`px-3 py-2 rounded-full transition-all duration-300 ease-out tap-target font-medium backdrop-blur-md text-sm ${
                        selectedAudiences.includes(interest)
                          ? 'bg-white border border-black text-primary shadow-lg transform scale-105'
                          : 'bg-white/30 border-2 border-gray-200 text-black hover:border-gray-300 hover:shadow-sm hover:bg-white/40 hover:scale-[1.02] transform scale-100'
                      } ${isAutoSelecting && !selectedAudiences.includes(interest) ? 'opacity-50' : 'opacity-100'}`}
                   >
                     {interest}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Create Campaign Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0 border-t border-white/10 backdrop-blur-sm">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleCreateCampaign}
              className={`tap-target focus-ring w-96 px-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-opacity duration-300 rounded-full ${prompt.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label={editMode ? "Update campaign" : "Create campaign"}
            >
              <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/>
                <path d="M18 4L19 6L21 7L19 8L18 10L17 8L15 7L17 6L18 4Z"/>
              </svg>
              {editMode ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default CampaignPromptScreen;