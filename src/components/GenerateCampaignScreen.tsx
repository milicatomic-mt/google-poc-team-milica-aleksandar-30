import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RibbedSphere from '@/components/RibbedSphere';
import { saveCampaignRequest, generateCampaign } from '@/lib/database';
import type { CampaignCreationRequest } from '@/types/api';
import { Progress } from '@/components/ui/progress';

const GenerateCampaignScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentAction, setCurrentAction] = useState("Preparing your content...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

        // This component now only handles campaign generation
        const campaignData: CampaignCreationRequest = {
          image: state.uploadedImage,
          campaign_prompt: state.campaignPrompt,
          target_audience: state.selectedAudiences?.join(', ') || ''
        };
        
        // Extract generated images from analysis data
        const generatedImages = state.aiAnalysisData?.generatedImages || [];
        
        // Save the initial campaign request with generated images
        const campaignResult = await saveCampaignRequest(campaignData, generatedImages);
        
        // Generate the campaign using AI
        await generateCampaign(campaignResult.id, campaignData);
        
        // Final progress update
        setCurrentAction("Complete!");
        setProgress(100);
        
        // Navigate to preview first, then results with the campaign ID
        navigate('/preview-results', { 
          state: { 
            ...location.state, 
            campaignId: campaignResult.id 
          } 
        });
      } catch (error) {
        // Still continue to preview even if saving fails
        setTimeout(() => {
          navigate('/preview-results', { state: location.state });
        }, 6000);
      }
    };

    generateContent();
  }, [navigate, location.state]);

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
                Creating your perfect marketing campaign
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