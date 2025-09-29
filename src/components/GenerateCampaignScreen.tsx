import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RibbedSphere from '@/components/RibbedSphere';
import { saveCampaignRequest, generateCampaign, uploadBase64Image } from '@/lib/database';
import type { CampaignCreationRequest } from '@/types/api';
import { Progress } from '@/components/ui/progress';
import { supabase } from "@/integrations/supabase/client";

const GenerateCampaignScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentAction, setCurrentAction] = useState("Preparing your content...");
  const [progress, setProgress] = useState(0);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  useEffect(() => {
    // Dedupe guard across StrictMode mounts using sessionStorage
    const hashString = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return Math.abs(h).toString(36); };
    const state = location.state as any;
    const requestHash = state ? hashString(JSON.stringify({
      uploadedImage: (state.uploadedImage || '').slice(0, 256),
      campaignPrompt: state.campaignPrompt,
      target: state.selectedAudiences?.join(',') || ''
    })) : '';
    const inflightKey = requestHash ? `campaign:inflight:${requestHash}` : '';
    if (inflightKey && sessionStorage.getItem(inflightKey)) {
      console.log('GenerateCampaignScreen: deduped duplicate mount');
      return;
    }
    if (inflightKey) sessionStorage.setItem(inflightKey, '1');

    const generateContent = async () => {
      try {
        const state = location.state;
        if (!state) {
          navigate('/');
          return;
        }

        // Validate required data
        if (!state.uploadedImage || !state.campaignPrompt) {
          console.error('Missing required data:', { uploadedImage: !!state.uploadedImage, campaignPrompt: !!state.campaignPrompt });
          navigate('/');
          return;
        }

        // Simulate loading steps with progress updates
        const loadingSteps = [
          { text: "Preparing your content...", progress: 0 },
          { text: "Analyzing your image...", progress: 25 },
          { text: "Creating campaign strategy...", progress: 50 },
          { text: "Generating marketing content...", progress: 75 },
          { text: "Finalizing your campaign...", progress: 90 }
        ];

        // Update loading steps
        for (let i = 0; i < loadingSteps.length; i++) {
          setCurrentAction(loadingSteps[i].text);
          setProgress(loadingSteps[i].progress);
          await new Promise(resolve => setTimeout(resolve, 1200)); // Wait 1.2s between steps
        }

        // Handle image upload if it's a base64 data URL (cache to avoid duplicates in StrictMode)
        const hashString = (str: string) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
          return Math.abs(hash).toString(36);
        };

        let imageUrl = state.uploadedImage;
        if (state.uploadedImage && state.uploadedImage.startsWith('data:image/')) {
          setCurrentAction("Uploading your image...");
          // Don't jump back, continue from current progress
          try {
            const uploadKey = 'campaign:upload:' + hashString(state.uploadedImage.slice(0, 256));
            const cachedUrl = sessionStorage.getItem(uploadKey);
            if (cachedUrl) {
              imageUrl = cachedUrl;
            } else {
              imageUrl = await uploadBase64Image(state.uploadedImage, 'campaign-uploads');
              sessionStorage.setItem(uploadKey, imageUrl);
            }
            console.log('Image uploaded successfully:', imageUrl);
          } catch (error) {
            console.error('Failed to upload image:', error);
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
          // In edit mode, always regenerate content and clear existing video
          setCurrentAction("Regenerating campaign content...");
          
          // Clear existing results and video to force regeneration
          const { error: clearError } = await supabase
            .from('campaign_results')
            .update({
              campaign_prompt: campaignData.campaign_prompt,
              target_audience: campaignData.target_audience,
              image_url: imageUrl,
              result: {}, // Clear existing results
              generated_video_url: null // Clear existing video
            })
            .eq('id', state.campaignId);

          if (clearError) {
            console.error('Failed to update campaign:', clearError);
            throw new Error('Failed to update campaign');
          }
          
          campaignResult = { id: state.campaignId };
          
          // Generate the updated campaign using AI (will include video generation)
          await generateCampaign(state.campaignId, campaignData);
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
          await generateCampaign(campaignResult.id, campaignData);
        }
        
        // Start polling for results so we only navigate when content is ready
        setCurrentAction("Finalizing and assembling results...");

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
              console.warn('Polling error while fetching campaign results', error);
            }

            const hasResult = data?.result && Object.keys(data.result as any || {}).length > 0;
            if (hasResult) {
              const genImgs = Array.isArray((data as any).generated_images) ? (data as any).generated_images : [];
              finalResults = { ...(data!.result as any), generated_images: genImgs };
              break;
            }
          } catch (e) {
            console.warn('Polling exception', e);
          }

          // Keep progress at 90% while polling
          setProgress(90);
          await new Promise((r) => setTimeout(r, intervalMs));
        }
        
        // If results not ready, keep user on progress screen (do not navigate)
        if (!finalResults) {
          setCurrentAction("Still preparing your results...");
          setProgress(90);
          return;
        }

        // Smoothly progress from 90% to 100%
        setCurrentAction("Completing your campaign...");
        for (let i = 91; i <= 100; i++) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per percent
        }
        
        setCurrentAction("Complete!");
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause at 100%
        
        // Navigate only after smooth completion
        navigate('/preview-results', { 
          state: { 
            ...location.state, 
            campaignId: campaignResult.id,
            campaignResults: finalResults
          } 
        });
      } catch (error) {
        console.error('Error while generating campaign', error);
        setCurrentAction('There was an issue generating your campaign. Retrying...');
        setProgress(10);
        // Do NOT navigate; keep user on progress screen.
      }
    };

     generateContent().finally(() => {
       try {
         const state = location.state as any;
         const hashString = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return Math.abs(h).toString(36); };
         const requestHash = state ? hashString(JSON.stringify({
           uploadedImage: (state.uploadedImage || '').slice(0, 256),
           campaignPrompt: state.campaignPrompt,
           target: state.selectedAudiences?.join(',') || ''
         })) : '';
         const inflightKey = requestHash ? `campaign:inflight:${requestHash}` : '';
         if (inflightKey) sessionStorage.setItem(inflightKey, 'done');
       } catch {}
     });
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
        preload="metadata"
        onError={(e) => {
          console.warn('Background video failed to load');
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Animated Sphere - 200x200px */}
            <div className="w-[200px] h-[200px] animate-fade-in">
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