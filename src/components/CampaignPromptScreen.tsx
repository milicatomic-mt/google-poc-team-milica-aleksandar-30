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
    console.log('Create campaign clicked with prompt:', prompt.trim());
    console.log('Selected audiences:', selectedAudiences);
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
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0" 
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
              <h1 className="text-sm font-semibold text-foreground">Image to Campaign</h1>
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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
                        placeholder="Enter your campaign description... (e.g., 'Create an ad for premium headphones targeting young professionals')"
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
              {/* Age Groups - First row */}
              <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                 {ageGroups.map((age) => (
                   <button
                     key={age}
                     data-audience={age}
                     onClick={() => !isAutoSelecting && toggleAudience(age)}
                     disabled={isAutoSelecting}
                           className={`px-6 py-2 rounded-full transition-all duration-300 ease-out tap-target backdrop-blur-md text-sm ${
                           selectedAudiences.includes(age)
                               ? 'bg-white border-2 border-white text-primary shadow-lg transform scale-105 font-semibold'
                              : 'bg-white/35 border-2 border-white text-black hover:bg-white/10 hover:scale-[1.02] transform scale-100 font-normal'
                         } ${isAutoSelecting && !selectedAudiences.includes(age) ? 'opacity-50' : 'opacity-100'}`}
                   >
                     {age}
                   </button>
                 ))}
              </div>

              {/* Interests - Second row */}
              <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                 {interests.slice(0, 4).map((interest) => (
                   <button
                     key={interest}
                     data-audience={interest}
                     onClick={() => !isAutoSelecting && toggleAudience(interest)}
                     disabled={isAutoSelecting}
                           className={`px-6 py-2 rounded-full transition-all duration-300 ease-out tap-target backdrop-blur-md text-sm ${
                           selectedAudiences.includes(interest)
                               ? 'bg-white border-2 border-white text-primary shadow-lg transform scale-105 font-semibold'
                              : 'bg-white/35 border-2 border-white text-black hover:bg-white/10 hover:scale-[1.02] transform scale-100 font-normal'
                         } ${isAutoSelecting && !selectedAudiences.includes(interest) ? 'opacity-50' : 'opacity-100'}`}
                   >
                     {interest}
                   </button>
                 ))}
              </div>

              {/* Interests - Third row */}
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                 {interests.slice(4, 6).map((interest) => (
                   <button
                     key={interest}
                     data-audience={interest}
                     onClick={() => !isAutoSelecting && toggleAudience(interest)}
                     disabled={isAutoSelecting}
                          className={`px-6 py-2 rounded-full transition-all duration-300 ease-out tap-target backdrop-blur-md text-sm ${
                           selectedAudiences.includes(interest)
                             ? 'bg-white border-2 border-white text-primary shadow-lg transform scale-105 font-semibold'
                             : 'bg-white/35 border-2 border-white text-black hover:bg-white/10 hover:scale-[1.02] transform scale-100 font-normal'
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
               disabled={!prompt.trim()}
              size="lg"
              onClick={handleCreateCampaign}
              className={`tap-target focus-ring w-96 px-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-full ${prompt.trim() ? 'opacity-100' : 'opacity-50'}`}
              aria-label={editMode ? "Update campaign" : "Create campaign"}
            >
              {editMode ? 'Update Campaign' : 'Create Campaign'}
              <svg className="w-5 h-5 ml-3 fill-current" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C12.7 0 13.4 0.6 13.9 1.6C14.4 2.6 14.7 4 14.7 5.5C14.7 6.2 14.6 6.8 14.5 7.4C15.1 7.3 15.8 7.2 16.5 7.2C18 7.2 19.4 7.5 20.4 8C21.4 8.5 22 9.3 22 10C22 10.7 21.4 11.5 20.4 12C19.4 12.5 18 12.8 16.5 12.8C15.8 12.8 15.1 12.7 14.5 12.6C14.6 13.2 14.7 13.8 14.7 14.5C14.7 16 14.4 17.4 13.9 18.4C13.4 19.4 12.7 20 12 20C11.3 20 10.6 19.4 10.1 18.4C9.6 17.4 9.3 16 9.3 14.5C9.3 13.8 9.4 13.2 9.5 12.6C8.9 12.7 8.2 12.8 7.5 12.8C6 12.8 4.6 12.5 3.6 12C2.6 11.5 2 10.7 2 10C2 9.3 2.6 8.5 3.6 8C4.6 7.5 6 7.2 7.5 7.2C8.2 7.2 8.9 7.3 9.5 7.4C9.4 6.8 9.3 6.2 9.3 5.5C9.3 4 9.6 2.6 10.1 1.6C10.6 0.6 11.3 0 12 0Z"/>
                <path d="M19 2C19.4 2 19.8 2.3 20 2.8C20.2 3.3 20.3 4 20.3 4.7C20.3 5 20.3 5.3 20.2 5.6C20.5 5.5 20.8 5.5 21.2 5.5C21.9 5.5 22.5 5.6 23 5.9C23.5 6.1 23.8 6.5 23.8 6.9C23.8 7.3 23.5 7.7 23 7.9C22.5 8.2 21.9 8.3 21.2 8.3C20.8 8.3 20.5 8.3 20.2 8.2C20.3 8.5 20.3 8.8 20.3 9.1C20.3 9.8 20.2 10.5 20 11C19.8 11.5 19.4 11.8 19 11.8C18.6 11.8 18.2 11.5 18 11C17.8 10.5 17.7 9.8 17.7 9.1C17.7 8.8 17.7 8.5 17.8 8.2C17.5 8.3 17.2 8.3 16.8 8.3C16.1 8.3 15.5 8.2 15 7.9C14.5 7.7 14.2 7.3 14.2 6.9C14.2 6.5 14.5 6.1 15 5.9C15.5 5.6 16.1 5.5 16.8 5.5C17.2 5.5 17.5 5.5 17.8 5.6C17.7 5.3 17.7 5 17.7 4.7C17.7 4 17.8 3.3 18 2.8C18.2 2.3 18.6 2 19 2Z"/>
                <path d="M19 13C19.3 13 19.6 13.2 19.8 13.6C20 14 20.1 14.5 20.1 15C20.1 15.2 20.1 15.4 20 15.6C20.2 15.5 20.4 15.5 20.7 15.5C21.2 15.5 21.6 15.6 22 15.8C22.3 16 22.5 16.2 22.5 16.5C22.5 16.8 22.3 17 22 17.2C21.6 17.4 21.2 17.5 20.7 17.5C20.4 17.5 20.2 17.5 20 17.4C20.1 17.6 20.1 17.8 20.1 18C20.1 18.5 20 19 19.8 19.4C19.6 19.8 19.3 20 19 20C18.7 20 18.4 19.8 18.2 19.4C18 19 17.9 18.5 17.9 18C17.9 17.8 17.9 17.6 18 17.4C17.8 17.5 17.6 17.5 17.3 17.5C16.8 17.5 16.4 17.4 16 17.2C15.7 17 15.5 16.8 15.5 16.5C15.5 16.2 15.7 16 16 15.8C16.4 15.6 16.8 15.5 17.3 15.5C17.6 15.5 17.8 15.5 18 15.6C17.9 15.4 17.9 15.2 17.9 15C17.9 14.5 18 14 18.2 13.6C18.4 13.2 18.7 13 19 13Z"/>
              </svg>
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default CampaignPromptScreen;