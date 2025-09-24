import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowLeft, Upload, Image, CheckCircle, AlertCircle, Camera, X, QrCode, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { createQRSession, subscribeToSessionUpdates, QRSession } from '@/lib/qr-session';
import RibbedSphere from '@/components/RibbedSphere';
import { supabase } from '@/integrations/supabase/client';
import sampleHeadphones from '@/assets/sample-headphones.jpg';
import sampleBodyWash from '@/assets/sample-body-wash.png';
import sampleSneakers from '@/assets/black-adidas-sneakers.png';

interface UploadScreenProps {
  mode?: 'catalog' | 'campaign';
}

const UploadScreen: React.FC<UploadScreenProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const currentMode = mode || type as 'catalog' | 'campaign';
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Create QR session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await createQRSession();
        setQrSession(session);
        
      } catch (error) {
        toast.error('Failed to initialize QR session');
      } finally {
        setIsLoadingSession(false);
      }
    };

    initSession();
  }, []);

  // Subscribe to session updates
  useEffect(() => {
    if (!qrSession) return;

    const unsubscribe = subscribeToSessionUpdates(
      qrSession.session_token,
      async (updatedSession) => {
        
        
        if (updatedSession.status === 'uploaded' && updatedSession.uploaded_image_url) {
          // Convert the storage URL to base64 for consistency
          let imageForState = updatedSession.uploaded_image_url;
          
          if (updatedSession.uploaded_image_url.startsWith('http')) {
            try {
              const response = await fetch(updatedSession.uploaded_image_url);
              const blob = await response.blob();
              imageForState = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              
            } catch (error) {
              // Fall back to original URL if conversion fails
            }
          }
          
          setUploadedImage(imageForState);
          setValidationResult({
            isValid: true,
            message: 'Image uploaded from mobile device!',
            type: 'success'
          });
          toast.success('Image received from mobile!');
          
          // Analyze image with AI and then generate images (campaign only)
          if (currentMode === 'campaign' || currentMode === 'catalog') {
            setIsAnalyzingImage(true);
            try {
              const analysisData = await analyzeImageWithAI(imageForState);
              console.log('🔍[QR] Analysis data:', analysisData);

              if (currentMode === 'campaign' && analysisData?.imagePrompts && analysisData.imagePrompts.length > 0) {
                console.log('✅[QR] Calling generate-images with prompts:', analysisData.imagePrompts);
                try {
                  const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-images', {
                    body: { prompts: analysisData.imagePrompts }
                  });
                  if (imageError) {
                    console.error('❌[QR] Error generating images:', imageError);
                    toast.error('Failed to generate images: ' + imageError.message);
                  } else if (imageData?.generatedImages) {
                    analysisData.generatedImages = imageData.generatedImages;
                    console.log('✅[QR] Generated images:', imageData.totalGenerated, 'of', imageData.totalRequested);
                  } else {
                    console.log('⚠️[QR] No generated images in response:', imageData);
                  }
                } catch (generateErr: any) {
                  console.error('❌[QR] Exception calling generate-images:', generateErr);
                  toast.error('Exception generating images: ' + generateErr.message);
                }
              } else {
                console.log('ℹ️[QR] Not generating images. Mode:', currentMode, 'Prompts len:', analysisData?.imagePrompts?.length || 0);
              }

              // Store full analysis data (including any generated images)
              sessionStorage.setItem('aiAnalysisData', JSON.stringify(analysisData));
            } catch (error) {
              console.error('Failed to analyze image:', error);
              toast.error('Failed to analyze image');
            } finally {
              setIsAnalyzingImage(false);
            }
          }
        }

        // Only auto-continue if explicitly marked as displayed (this won't happen automatically now)

        if (updatedSession.status === 'displayed') {
          // Continue to next step automatically after a short delay to ensure state is updated
          setTimeout(() => {
            const imageToPass = uploadedImage || updatedSession.uploaded_image_url;
            
            if (currentMode === 'catalog') {
              navigate('/catalog-results', { 
                state: { 
                  uploadedImage: imageToPass
                } 
              });
            } else {
              // Get AI analysis data for campaign mode
              let aiGeneratedPrompt = '';
              let aiAnalysisData = null;
              try {
                const analysisData = sessionStorage.getItem('aiAnalysisData');
                if (analysisData) {
                  aiAnalysisData = JSON.parse(analysisData);
                  if (aiAnalysisData?.suggestions && Array.isArray(aiAnalysisData.suggestions) && aiAnalysisData.suggestions.length > 0) {
                    aiGeneratedPrompt = aiAnalysisData.suggestions[0]; // Use first suggestion as initial prompt
                  }
                }
              } catch (error) {
                console.error('Failed to parse AI analysis data:', error);
              }

              navigate('/campaign-prompt', { 
                state: { 
                  uploadedImage: imageToPass,
                  mode: currentMode,
                  aiGeneratedPrompt,
                  aiAnalysisData,
                  uploadedFile: null // QR flow doesn't have file object
                } 
              });
            }
          }, 100);
        }
      }
    );

    return unsubscribe;
  }, [qrSession, currentMode, navigate]);

  const validateImage = async (file: File): Promise<{ isValid: boolean; message: string; type: 'success' | 'error' | 'warning' }> => {
    // File size validation
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, message: 'Image too large. Please use images under 10MB.', type: 'error' };
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      return { isValid: false, message: 'Please upload a valid image file.', type: 'error' };
    }

    // Image dimensions validation
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 300 || img.height < 300) {
          resolve({ isValid: false, message: 'Image too small. Minimum 300x300 pixels required.', type: 'error' });
        } else if (img.width < 600 || img.height < 600) {
          resolve({ isValid: true, message: 'Image quality could be better. Consider using higher resolution.', type: 'warning' });
        } else {
          resolve({ isValid: true, message: 'Perfect! High-quality product image detected.', type: 'success' });
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ isValid: false, message: 'Invalid image file.', type: 'error' });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeImageWithAI = async (imageBase64: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageBase64 }
      });
      
      if (error) {
        console.error('Error analyzing image:', error);
        return { suggestions: [] };
      }
      
      return data || { suggestions: [] };
    } catch (error) {
      console.error('Error calling analyze-image function:', error);
      return { suggestions: [] };
    }
  };

  const handleFile = async (file: File) => {
    setIsValidating(true);
    
    try {
      const validation = await validateImage(file);
      setValidationResult(validation);
      
      if (validation.isValid || validation.type === 'warning') {
        // Convert file to base64 instead of blob URL
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        setUploadedImage(base64Image);
        setUploadedFile(file); // Store the file object
        toast.success('Image uploaded successfully!');
        
        // Analyze image with AI for both campaign and catalog modes
        if (currentMode === 'campaign' || currentMode === 'catalog') {
          setIsAnalyzingImage(true);
          try {
            const analysisData = await analyzeImageWithAI(base64Image);
            
            // Debug logging for campaign flow
            console.log('🔍 Analysis complete - Mode:', currentMode);
            console.log('🔍 Analysis data:', analysisData);
            console.log('🔍 Image prompts:', analysisData?.imagePrompts);
            console.log('🔍 Image prompts length:', analysisData?.imagePrompts?.length);
            
            // If we have image prompts and we're in campaign mode, generate images immediately
            if (currentMode === 'campaign' && analysisData?.imagePrompts && analysisData.imagePrompts.length > 0) {
              console.log('✅ Calling generate-images with prompts:', analysisData.imagePrompts);
              
              try {
                const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-images', {
                  body: { prompts: analysisData.imagePrompts }
                });
                
                if (imageError) {
                  console.error('❌ Error generating images:', imageError);
                  toast.error('Failed to generate images: ' + imageError.message);
                } else if (imageData?.generatedImages) {
                  // Add generated images to analysis data
                  analysisData.generatedImages = imageData.generatedImages;
                  console.log('✅ Generated images successfully:', imageData.totalGenerated, 'out of', imageData.totalRequested);
                } else {
                  console.log('⚠️ No generated images in response:', imageData);
                }
              } catch (generateError) {
                console.error('❌ Exception calling generate-images:', generateError);
                toast.error('Exception generating images: ' + generateError.message);
              }
            } else {
              console.log('❌ Not calling generate-images. Conditions:');
              console.log('  - currentMode === "campaign":', currentMode === 'campaign');
              console.log('  - analysisData?.imagePrompts exists:', !!analysisData?.imagePrompts);
              console.log('  - imagePrompts length > 0:', (analysisData?.imagePrompts?.length || 0) > 0);
            }
            
            // Store full analysis data including generated images
            sessionStorage.setItem('aiAnalysisData', JSON.stringify(analysisData));
          } catch (error) {
            console.error('Failed to analyze image or generate images:', error);
          } finally {
            setIsAnalyzingImage(false);
          }
        }
      } else {
        toast.error(validation.message);
      }
    } catch (error) {
      toast.error('Error validating image');
      setValidationResult({ isValid: false, message: 'Error validating image', type: 'error' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const uploadUrl = qrSession 
    ? `${window.location.origin}/mobile-upload?session=${qrSession.session_token}` 
    : '';

  const openQrScanner = () => {
    // For now, show a toast message. In a real implementation, this would open QR scanner
    toast.info('QR code scanner coming soon! Use camera or file upload for now.');
  };

  const handleSampleImageSelect = async (imageSrc: string, fileName: string) => {
    setIsValidating(true);
    
    try {
      // Fetch the image and convert to File object
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      
      // Use existing handleFile function
      await handleFile(file);
    } catch (error) {
      console.error('Error loading sample image:', error);
      toast.error('Failed to load sample image');
      setIsValidating(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setValidationResult(null);
    setIsAnalyzingImage(false);
    // Clear any stored AI analysis data
    sessionStorage.removeItem('aiAnalysisData');
    toast.success('Image removed');
  };

  const handleContinue = () => {
    if (uploadedImage && validationResult?.isValid) {
      // Get AI analysis data for both modes
      let aiGeneratedPrompt = '';
      let aiAnalysisData = null;
      try {
        const analysisData = sessionStorage.getItem('aiAnalysisData');
        if (analysisData) {
          aiAnalysisData = JSON.parse(analysisData);
          if (aiAnalysisData?.suggestions && Array.isArray(aiAnalysisData.suggestions) && aiAnalysisData.suggestions.length > 0) {
            aiGeneratedPrompt = aiAnalysisData.suggestions[0]; // Use first suggestion as initial prompt
          }
        }
      } catch (error) {
        console.error('Failed to parse AI analysis data:', error);
      }

      if (currentMode === 'catalog') {
        // Navigate to catalog prompt screen for catalog enrichment
        navigate('/catalog-prompt', { 
          state: { 
            uploadedImage,
            uploadedFile,
            aiGeneratedPrompt,
            aiAnalysisData,
            mode: currentMode
          } 
        });
      } else {
        // Navigate to campaign prompt screen for campaign creation
        navigate('/campaign-prompt', { 
          state: { 
            uploadedImage,
            mode: currentMode,
            aiGeneratedPrompt,
            aiAnalysisData,
            uploadedFile
          } 
        });
      }
    }
  };

  const getModeTitle = () => {
    switch (currentMode) {
      case 'catalog':
        return 'Catalog Enrichment';
      case 'campaign':
        return 'Image to Campaign';
      default:
        return 'Upload Product Image';
    }
  };

  const getModeDescription = () => {
    switch (currentMode) {
      case 'catalog':
        return 'Upload a clear product image to generate comprehensive catalog content';
      case 'campaign':
        return 'Upload your product or inspiration image to create marketing campaigns';
      default:
        return 'Upload your image to get started';
    }
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
              <h1 className="text-lg font-semibold text-foreground">{getModeTitle()}</h1>
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
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => navigate('/')} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>


        {/* Title and Description */}
        <div className="text-center py-4">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Scan QR Code to Upload from Mobile
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            {getModeDescription()}
          </p>
        </div>

        {/* Main Upload Area - Scrollable */}
        <main className="flex-1 flex items-center justify-center container-padding pt-4 pb-8 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-8">
            {/* Upload Zone */}
            <div
              className={`
                card-elegant relative overflow-hidden transition-all duration-smooth border-2 p-8 text-center backdrop-blur-md bg-white/20 border-white/30
                ${dragActive 
                  ? 'border-white/60 shadow-elegant-lg scale-[1.02] bg-white/30' 
                  : uploadedImage 
                    ? 'border-white/60 shadow-elegant-lg bg-white/30' 
                    : 'hover:border-white/50 hover:shadow-elegant-lg hover:bg-white/30'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
              />

              {uploadedImage ? (
                /* Uploaded Image Display */
                <div className="space-y-4">
                  <div className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={uploadedImage}
                      alt="Uploaded product"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white text-black rounded-full p-1.5 hover:bg-gray-100 transition-colors shadow-md z-10"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* AI Wave Scanning Animation Overlay - Material-UI Style */}
                    {isAnalyzingImage && (currentMode === 'campaign' || currentMode === 'catalog') && (
                      <div className="absolute inset-0 pointer-events-none bg-black/30 backdrop-blur-sm rounded-xl">
                        {/* Material-UI style wave scanning effect */}
                        <div className="mui-wave-scan absolute inset-0 rounded-xl"></div>
                        
                        {/* Analyzing text overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="text-white font-semibold text-sm analyzing-text">Analyzing</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Image Uploaded</h3>
                  </div>
                </div>
              ) : (
                /* Upload Prompt */
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* QR Code Display */}
                    <div className="flex justify-center">
                      <div className="bg-white rounded-2xl p-4 shadow-lg">
                        {qrSession && !isLoadingSession ? (
                          <div className="relative">
                            <svg width="0" height="0" className="absolute">
                              <defs>
                                <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#6366f1" />
                                  <stop offset="50%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="qr-code-container flex flex-col items-center">
                              <QRCodeSVG 
                                value={uploadUrl}
                                size={171}
                                level="L"
                                includeMargin={true}
                                fgColor="#000000"
                                bgColor="transparent"
                              />
                              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mt-2">
                                SCAN ME
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-[180px] h-[180px] flex items-center justify-center bg-muted rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WEBP • Max 10MB • Min 300x300px
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-muted"></div>
                    <span className="text-sm text-muted-foreground font-medium">OR</span>
                    <div className="flex-1 h-px bg-muted"></div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center font-medium">
                      Try these sample products:
                    </p>
                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                      <button
                        onClick={() => handleSampleImageSelect(sampleHeadphones, 'wireless-headphones.jpg')}
                        disabled={isValidating}
                        className="group relative overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors disabled:opacity-50"
                      >
                        <img 
                          src={sampleHeadphones} 
                          alt="Wireless Headphones"
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleSampleImageSelect(sampleBodyWash, 'body-wash.png')}
                        disabled={isValidating}
                        className="group relative overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors disabled:opacity-50"
                      >
                        <img 
                          src={sampleBodyWash} 
                          alt="Body Wash"
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleSampleImageSelect(sampleSneakers, 'leather-sneakers.webp')}
                        disabled={isValidating}
                        className="group relative overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors disabled:opacity-50"
                      >
                        <img 
                          src={sampleSneakers} 
                          alt="Leather Sneakers"
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Drag Overlay */}
              {dragActive && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="text-primary font-semibold text-lg">
                    Drop image here
                  </div>
                </div>
              )}
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div className={`
                flex items-center space-x-3 p-4 rounded-xl
                ${validationResult.type === 'success' ? 'bg-green-50 border border-green-200' :
                  validationResult.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }
              `}>
                {validationResult.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${
                    validationResult.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                )}
                <p className={`font-medium ${
                  validationResult.type === 'success' ? 'text-green-800' :
                  validationResult.type === 'warning' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {validationResult.message}
                </p>
              </div>
            )}

          </div>
        </main>

        {/* Footer with Continue Button */}
        <footer className="container-padding pb-8 pt-4 flex-shrink-0">
          {/* Centered Continue Button - Always reserve space */}
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              className={`tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-opacity duration-300 rounded-full ${
                uploadedImage && validationResult?.isValid && !isAnalyzingImage
                  ? 'opacity-100' 
                  : 'opacity-0 pointer-events-none'
              }`}
              aria-label="Continue to next step"
            >
              <span className="mr-2">Next</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </footer>
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        <h2>Upload Product Image</h2>
        <p>Drag and drop or click to upload a product image for AI processing</p>
      </div>
    </div>
  );
};

export default UploadScreen;