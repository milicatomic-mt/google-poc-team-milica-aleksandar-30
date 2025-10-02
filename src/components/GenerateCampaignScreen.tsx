import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RibbedSphere from '@/components/RibbedSphere';
import { saveCampaignRequest, generateCampaign, uploadBase64Image } from '@/lib/database';
import type { CampaignCreationRequest } from '@/types/api';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { supabase } from "@/integrations/supabase/client";

const GenerateCampaignScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentAction, setCurrentAction] = useState("Preparing your content...");
  const [progress, setProgress] = useState(0);

  // Utility function for hashing
  const hashString = (str: string) => { 
    let h = 0; 
    for (let i = 0; i < str.length; i++) { 
      h = ((h << 5) - h) + str.charCodeAt(i); 
      h |= 0; 
    } 
    return Math.abs(h).toString(36); 
  };

  // Check if generation is already in progress
  const isGenerationInProgress = () => {
    const stateAny = location.state as any;
    if (!stateAny) return false;
    
    const isEdit = !!stateAny?.editMode;
    const requestHash = hashString(JSON.stringify({
      uploadedImage: (stateAny.uploadedImage || '').slice(0, 256),
      campaignPrompt: stateAny.campaignPrompt,
      target: stateAny.selectedAudiences?.join(',') || '',
      mode: isEdit ? 'edit' : 'create',
      campaignId: stateAny.campaignId || '',
      navKey: location.key || ''
    }));
    
    const inflightKey = `campaign:inflight:${requestHash}`;
    const inflightData = sessionStorage.getItem(inflightKey);
    
    if (inflightData) {
      const timestamp = parseInt(inflightData);
      const fiveSecondsAgo = Date.now() - 5000;
      if (timestamp > fiveSecondsAgo) {
        return true;
      }
    }
    
    sessionStorage.setItem(inflightKey, Date.now().toString());
    return false;
  };

  useEffect(() => {
    if (isGenerationInProgress()) {
      return;
    }

    const generateContent = async () => {
      try {
        const state = location.state;
        
        if (!state) {
          navigate('/');
          return;
        }

        // Validate required data
        if (!state.uploadedImage || !state.campaignPrompt) {
          navigate('/');
          return;
        }

        // Set initial progress
        setCurrentAction("Preparing your content...");
        setProgress(10);

        // Handle image upload if it's a base64 data URL (cache to avoid duplicates in StrictMode)

        let imageUrl = state.uploadedImage;
        if (state.uploadedImage && state.uploadedImage.startsWith('data:image/')) {
          setCurrentAction("Uploading your image...");
          setProgress(30);
          try {
            const uploadKey = 'campaign:upload:' + hashString(state.uploadedImage.slice(0, 256));
            const cachedUrl = sessionStorage.getItem(uploadKey);
            if (cachedUrl) {
              imageUrl = cachedUrl;
            } else {
              imageUrl = await uploadBase64Image(state.uploadedImage, 'campaign-uploads');
              sessionStorage.setItem(uploadKey, imageUrl);
            }
          } catch (error) {
            throw new Error('Failed to upload image');
          }
        }

        // This component now handles both campaign generation and updates
        const campaignData: CampaignCreationRequest = {
          image: imageUrl,
          campaign_prompt: state.campaignPrompt,
          target_audience: state.selectedAudiences?.join(', ') || ''
        };
        
        // Extract generated images from analysis data
        const generatedImages = state.aiAnalysisData?.generatedImages || [];
        
        let campaignResult: any;
        
        if (state.editMode && state.campaignId) {
          // In edit mode, only update prompt/audience and regenerate video
          setCurrentAction("Updating campaign details...");
          setProgress(50);
          
          // Update only the prompt and audience, keep existing results
          const { data: existingCampaign, error: fetchError } = await supabase
            .from('campaign_results')
            .select('result')
            .eq('id', state.campaignId)
            .single();

          if (fetchError) {
            throw new Error('Failed to fetch existing campaign');
          }

          // Update campaign data but keep existing results, only clear video
          const { error: updateError } = await supabase
            .from('campaign_results')
            .update({
              campaign_prompt: campaignData.campaign_prompt,
              target_audience: campaignData.target_audience,
              image_url: imageUrl,
              generated_video_url: null // Clear existing video to force regeneration
            })
            .eq('id', state.campaignId);

          if (updateError) {
            throw new Error('Failed to update campaign');
          }
          
          campaignResult = { id: state.campaignId };
          
          // Only regenerate video, not the entire campaign content
          setCurrentAction("Creating your promotional video...");
          setProgress(70);
          
          try {
            await supabase.functions.invoke('generate-video', {
              body: {
                campaignId: state.campaignId,
                videoPrompt: campaignData.campaign_prompt
              }
            });
            setCurrentAction("Finalizing video production...");
            setProgress(80);
          } catch (videoError) {
            setCurrentAction("Completing campaign setup...");
            setProgress(80);
          }
        } else {
          // Create new campaign or reuse recent identical one (dedupe StrictMode)
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
          const { data: existing } = await supabase
            .from('campaign_results')
            .select('id, created_at')
            .eq('image_url', campaignData.image)
            .eq('campaign_prompt', campaignData.campaign_prompt)
            .eq('target_audience', campaignData.target_audience)
            .gte('created_at', twoMinutesAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          campaignResult = existing ? { id: existing.id } : await saveCampaignRequest(campaignData, generatedImages);
          
          // Generate the campaign using AI
          setCurrentAction("Generating campaign materials...");
          setProgress(50);
          
          await generateCampaign(campaignResult.id, campaignData);
          
          setCurrentAction("Generating video campaign...");
          setProgress(70);
        }
        
        // Start polling for results so we only navigate when content is ready
        setCurrentAction("Assembling campaign materials...");
        setProgress(80);

        const maxAttempts = 45; // ~90s
        const intervalMs = 2000;
        let attempt = 0;
        let finalResults: any = null;

        while (attempt < maxAttempts) {
          attempt++;
          try {
            const { data, error } = await supabase
              .from('campaign_results')
              .select('result, generated_images, generated_video_url')
              .eq('id', campaignResult.id)
              .single();

            if (error) {
              // Polling error while fetching campaign results
            }

            const hasResult = data?.result && Object.keys(data.result as any || {}).length > 0;
            if (hasResult) {
              setCurrentAction("Processing video content...");
              setProgress(90);
              const genImgs = Array.isArray((data as any).generated_images) ? (data as any).generated_images : [];
              finalResults = { ...(data!.result as any), generated_images: genImgs };
              break;
            }
          } catch (e) {
            // Polling exception
          }

          // Update progress with more specific status based on what we're waiting for
          if (attempt < 15) {
            setCurrentAction("Generating marketing materials...");
            setProgress(Math.min(85, 80 + (attempt * 0.3)));
          } else if (attempt < 30) {
            setCurrentAction("Creating promotional video...");
            setProgress(Math.min(90, 85 + ((attempt - 15) * 0.3)));
          } else {
            setCurrentAction("Finalizing video production...");
            setProgress(90);
          }
          await new Promise((r) => setTimeout(r, intervalMs));
        }
        
        // If results not ready, keep user on progress screen (do not navigate)
        if (!finalResults) {
          setCurrentAction("Video content is still being processed...");
          setProgress(95);
          return;
        }

        setCurrentAction("Complete!");
        setProgress(100);
        
        // Navigate only after smooth completion
        navigate('/preview-results', { 
          state: { 
            ...location.state, 
            campaignId: campaignResult.id,
            campaignResults: finalResults
          } 
        });
      } catch (error) {
        setCurrentAction('There was an issue generating your campaign. Retrying...');
        setProgress(10);
        // Do NOT navigate; keep user on progress screen.
      }
    };

     generateContent().finally(() => {
       // Clear the inflight key after completion
       try {
         const stateAny = location.state as any;
         if (stateAny) {
           const isEdit = !!stateAny?.editMode;
           const requestHash = hashString(JSON.stringify({
             uploadedImage: (stateAny.uploadedImage || '').slice(0, 256),
             campaignPrompt: stateAny.campaignPrompt,
             target: stateAny.selectedAudiences?.join(',') || '',
             mode: isEdit ? 'edit' : 'create',
             campaignId: stateAny.campaignId || '',
             navKey: location.key || ''
           }));
           const inflightKey = `campaign:inflight:${requestHash}`;
           sessionStorage.removeItem(inflightKey);
         }
       } catch {}
     });
   }, []);

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
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Close Button */}
        <div className="absolute top-12 right-8 z-20">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="tap-target bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3 shadow-sm">
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
        
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Animated Sphere - 220x220px */}
            <div className="w-[220px] h-[220px] animate-fade-in">
              <RibbedSphere className="w-full h-full" />
            </div>

            {/* Loading Text */}
            <div className="text-center animate-fade-in animation-delay-300 min-h-[80px] flex flex-col justify-center">
              <p className="text-2xl font-semibold text-foreground mb-2">
                {currentAction}
              </p>
              <p className="text-sm text-muted-foreground">
                Almost there! This process takes less than a minute
              </p>
            </div>

            {/* Progress Bar - Fixed position */}
            <div className="w-80 animate-fade-in animation-delay-500">
              <div className="relative overflow-hidden rounded-full">
                <Progress 
                  value={progress} 
                  className="h-0.5 bg-white/20"
                />
              </div>
              <div className="flex justify-center items-center mt-2 text-sm text-muted-foreground">
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GenerateCampaignScreen;