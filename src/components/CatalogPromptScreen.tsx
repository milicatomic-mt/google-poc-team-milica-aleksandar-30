import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, X } from 'lucide-react';
import RibbedSphere from '@/components/RibbedSphere';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CatalogPromptScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Additional details state
  const [productCategory, setProductCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [brandTone, setBrandTone] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  
  const uploadedImage = location.state?.uploadedImage;
  const uploadedFile = location.state?.uploadedFile;

  // Predefined options
  const predefinedCategories = [
    "Clothing & Apparel",
    "Electronics & Tech",
    "Home & Garden",
    "Beauty & Personal Care",
    "Sports & Outdoor",
    "Automotive",
    "Books & Media",
    "Food & Beverages",
    "Toys & Games",
    "Health & Wellness"
  ];

  const brandTones = [
    "Professional",
    "Minimalist", 
    "Luxury",
    "Playful",
    "Bold & Edgy",
    "Warm & Friendly",
    "Technical",
    "Eco-Conscious",
    "Premium",
    "Casual"
  ];

  const platforms = [
    "Shopify",
    "Amazon",
    "Google Shopping",
    "eBay",
    "Etsy",
    "WooCommerce",
    "BigCommerce",
    "Facebook Marketplace",
    "Instagram Shopping",
    "TikTok Shop"
  ];

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
        setPrompt(data.suggestions[0]);
        typePrompt(data.suggestions[0]);
        
        // Auto-fill fields from AI analysis
        if (data.category) {
          const categoryMapping: { [key: string]: string } = {
            "Fashion & Apparel": "Clothing & Apparel",
            "Beauty & Personal Care": "Beauty & Personal Care",
            "Electronics & Tech": "Electronics & Tech",
            "Home & Garden": "Home & Garden",
            "Food & Beverage": "Food & Beverages",
            "Sports & Fitness": "Sports & Outdoor",
            "Health & Wellness": "Health & Wellness"
          };
          
          const mappedCategory = categoryMapping[data.category] || data.category;
          if (predefinedCategories.includes(mappedCategory)) {
            setProductCategory(mappedCategory);
          } else {
            setProductCategory("custom");
            setCustomCategory(data.category);
          }
        }
        
        if (data.tone && brandTones.includes(data.tone)) {
          setBrandTone(data.tone);
        }
        
        if (data.platforms && data.platforms.length > 0) {
          const matchingPlatform = data.platforms.find((p: string) => 
            platforms.some(predefined => predefined.toLowerCase().includes(p.toLowerCase()))
          );
          if (matchingPlatform) {
            const foundPlatform = platforms.find(p => 
              p.toLowerCase().includes(matchingPlatform.toLowerCase())
            );
            if (foundPlatform) {
              setPlatform(foundPlatform);
            }
          }
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

  const handleCreateCatalog = () => {
    if (prompt.trim()) {
      const catalogData = {
        ...location.state,
        prompt: prompt.trim(),
        category: productCategory === 'custom' ? customCategory : productCategory,
        tone: brandTone,
        platform,
        brand: brandName,
        // Pass edit mode data if we're editing
        editMode: location.state?.editMode,
        catalogId: location.state?.catalogId,
        existingResults: location.state?.existingResults
      };
      
      navigate('/catalog-results', { state: catalogData });
    }
  };

  const handleBack = () => {
    const mode = location.state?.mode || 'catalog';
    navigate(`/upload/${mode}`);
  };

  // Load initial AI-generated prompt and auto-fill fields
  useEffect(() => {
    const aiGeneratedPrompt = location.state?.aiGeneratedPrompt;
    const aiAnalysisData = location.state?.aiAnalysisData;
    const isEditMode = location.state?.editMode;
    
    if (aiGeneratedPrompt && !prompt) {
      setPrompt(aiGeneratedPrompt);
      if (isEditMode) {
        // In edit mode, show the prompt immediately without typing animation
        setDisplayedPrompt(aiGeneratedPrompt);
      } else {
        typePrompt(aiGeneratedPrompt);
      }
    }
    
    // Load existing values when in edit mode
    if (isEditMode) {
      if (location.state?.category && !productCategory) {
        if (predefinedCategories.includes(location.state.category)) {
          setProductCategory(location.state.category);
        } else {
          setProductCategory("custom");
          setCustomCategory(location.state.category);
        }
      }
      if (location.state?.tone && !brandTone) {
        setBrandTone(location.state.tone);
      }
      if (location.state?.platform && !platform) {
        setPlatform(location.state.platform);
      }
      if (location.state?.brand && !brandName) {
        setBrandName(location.state.brand);
      }
    }
    
    // Auto-fill fields from AI analysis
    if (aiAnalysisData) {
      if (aiAnalysisData.category && !productCategory) {
        // Map AI category to our predefined categories
        const categoryMapping: { [key: string]: string } = {
          "Fashion & Apparel": "Clothing & Apparel",
          "Beauty & Personal Care": "Beauty & Personal Care",
          "Electronics & Tech": "Electronics & Tech",
          "Home & Garden": "Home & Garden",
          "Food & Beverage": "Food & Beverages",
          "Sports & Fitness": "Sports & Outdoor",
          "Health & Wellness": "Health & Wellness"
        };
        
        const mappedCategory = categoryMapping[aiAnalysisData.category] || aiAnalysisData.category;
        if (predefinedCategories.includes(mappedCategory)) {
          setProductCategory(mappedCategory);
        } else {
          setProductCategory("custom");
          setCustomCategory(aiAnalysisData.category);
        }
      }
      
      if (aiAnalysisData.tone && !brandTone && brandTones.includes(aiAnalysisData.tone)) {
        setBrandTone(aiAnalysisData.tone);
      }
      
      if (aiAnalysisData.platforms && aiAnalysisData.platforms.length > 0 && !platform) {
        // Use first platform that matches our predefined list
        const matchingPlatform = aiAnalysisData.platforms.find((p: string) => 
          platforms.some(predefined => predefined.toLowerCase().includes(p.toLowerCase()))
        );
        if (matchingPlatform) {
          const foundPlatform = platforms.find(p => 
            p.toLowerCase().includes(matchingPlatform.toLowerCase())
          );
          if (foundPlatform) {
            setPlatform(foundPlatform);
          }
        }
      }
    }
  }, [location.state, prompt, productCategory, brandTone, platform]);

  // Auto-adjust height when prompt changes
  useEffect(() => {
    if (textareaRef.current && prompt) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';
    }
  }, [prompt]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
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
            <h1 className="text-sm font-semibold text-foreground">
              {location.state?.editMode ? 'Edit Catalog' : 'Catalog Enrichment'}
            </h1>
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

        {/* Main Container - Fixed Height */}
        <div className="flex-1 flex flex-col container-padding py-8 overflow-hidden">
          
          {/* Header Section */}
          <div className="w-full max-w-6xl mx-auto text-center mb-8 animate-fade-in flex-shrink-0">
            <h1 className="text-4xl font-semibold text-foreground mb-4">
              {location.state?.editMode ? 'Edit Your Catalog' : 'Catalog Enrichment'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {location.state?.editMode 
                ? 'Update your catalog details and regenerate the content with your changes.'
                : 'We\'ve created a product description from your image. You can use it, edit it, or add more details.'
              }
            </p>
          </div>

          {/* Image and Prompt Section */}
          <div className="w-full max-w-4xl mx-auto mb-12 animate-scale-in flex-shrink-0">
            <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/30 p-6">
              <div className="flex gap-6 items-start">
                {/* Image Preview */}
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
                  <div className="backdrop-blur-md rounded-xl border border-white shadow-sm h-40 p-4 relative overflow-hidden" style={{backgroundColor: '#FFFFFF'}}>
                    <Textarea
                      ref={textareaRef}
                      value={isTyping ? displayedPrompt + '|' : displayedPrompt}
                      onChange={(e) => {
                        const newValue = e.target.value.replace('|', '');
                        setPrompt(newValue);
                        setDisplayedPrompt(newValue);
                      }}
                      placeholder="Enter your product description..."
                      className="absolute inset-0 w-full h-full text-base resize-none bg-transparent border-0 p-4 pr-16 focus-visible:ring-0 leading-relaxed text-gray-800 placeholder:text-gray-500 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    />
                    
                    {/* Wave loading animation overlay */}
                    {isRegenerating && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-200/50 to-transparent animate-wave"></div>
                      </div>
                    )}
                    
                    {/* Regenerate button */}
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

          {/* Additional Details Section */}
          <div className="w-full max-w-6xl mx-auto flex-1 animate-fade-in">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
              Additional Details <span className="text-lg text-muted-foreground font-normal">(Optional)</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Category */}
              <div>
                <Select value={productCategory} onValueChange={setProductCategory}>
                  <SelectTrigger className="h-16 text-lg bg-white/30 border-2 border-gray-200 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select or enter category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white backdrop-blur-md border-gray-200 z-50">
                    {predefinedCategories.map((category) => (
                      <SelectItem key={category} value={category} className="text-base py-4 hover:bg-gray-100">
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-base py-4 font-medium hover:bg-gray-100">
                      Custom Category...
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {productCategory === 'custom' && (
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="h-16 text-lg bg-white/30 border-2 border-gray-200 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-200 placeholder:text-gray-500 mt-4"
                  />
                )}
              </div>

              {/* Brand Tone */}
              <div>
                <Select value={brandTone} onValueChange={setBrandTone}>
                  <SelectTrigger className="h-16 text-lg bg-white/30 border-2 border-gray-200 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select brand tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white backdrop-blur-md border-gray-200 z-50">
                    {brandTones.map((tone) => (
                      <SelectItem key={tone} value={tone} className="text-base py-4 hover:bg-gray-100">
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="h-16 text-lg bg-white/30 border-2 border-gray-200 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-white backdrop-blur-md border-gray-200 z-50">
                    {platforms.map((plat) => (
                      <SelectItem key={plat} value={plat} className="text-base py-4 hover:bg-gray-100">
                        {plat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Name */}
              <div>
                <Input
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="h-16 !text-lg bg-white/30 border-2 border-gray-200 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-200 placeholder:text-gray-400 placeholder:text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Create Catalog Enrichment Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleCreateCatalog}
              className={`tap-target focus-ring w-96 px-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-opacity duration-300 rounded-full ${prompt.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label="Create catalog enrichment"
            >
              Create Catalog Enrichment
              <svg className="w-5 h-5 ml-3 fill-white" viewBox="0 0 512 512">
                <path d="M247.355,106.9C222.705,82.241,205.833,39.18,197.46,0c-8.386,39.188-25.24,82.258-49.899,106.917c-24.65,24.642-67.724,41.514-106.896,49.904c39.188,8.373,82.254,25.235,106.904,49.895c24.65,24.65,41.522,67.72,49.908,106.9c8.373-39.188,25.24-82.258,49.886-106.917c24.65-24.65,67.724-41.514,106.896-49.904C315.08,148.422,272.014,131.551,247.355,106.9z"/>
                <path d="M407.471,304.339c-14.714-14.721-24.81-40.46-29.812-63.864c-5.011,23.404-15.073,49.142-29.803,63.872c-14.73,14.714-40.464,24.801-63.864,29.812c23.408,5.01,49.134,15.081,63.864,29.811c14.73,14.722,24.81,40.46,29.82,63.864c5.001-23.413,15.081-49.142,29.802-63.872c14.722-14.722,40.46-24.802,63.856-29.82C447.939,329.14,422.201,319.061,407.471,304.339z"/>
                <path d="M146.352,354.702c-4.207,19.648-12.655,41.263-25.019,53.626c-12.362,12.354-33.968,20.82-53.613,25.027c19.645,4.216,41.251,12.656,53.613,25.027c12.364,12.362,20.829,33.96,25.036,53.618c4.203-19.658,12.655-41.255,25.023-53.626c12.354-12.362,33.964-20.82,53.605-25.035c-19.64-4.2-41.251-12.656-53.613-25.019C159.024,395.966,150.555,374.351,146.352,354.702z"/>
              </svg>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CatalogPromptScreen;