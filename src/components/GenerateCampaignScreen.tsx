import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RibbedSphere from '@/components/RibbedSphere';
import { saveCampaignRequest, generateCampaign } from '@/lib/database';
import type { CampaignCreationRequest } from '@/types/api';

const GenerateCampaignScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const generateContent = async () => {
      try {
        const state = location.state;
        if (!state) return;

        // This component now only handles campaign generation
        const campaignData: CampaignCreationRequest = {
          image: state.uploadedImage,
          campaign_prompt: state.campaignPrompt,
          target_audience: state.selectedAudiences?.join(', ')
        };
        
        // Save the initial campaign request
        const campaignResult = await saveCampaignRequest(campaignData);
        
        // Generate the campaign using AI
        await generateCampaign(campaignResult.id, campaignData);
        
        // Navigate to results with the campaign ID
        navigate('/campaign-results', { 
          state: { 
            ...location.state, 
            campaignId: campaignResult.id 
          } 
        });
      } catch (error) {
        // Still continue to results even if saving fails
        setTimeout(() => {
          navigate('/campaign-results', { state: location.state });
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
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      <div className="relative z-10 min-h-screen flex flex-col">
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
        </header>
        
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="text-center max-w-2xl mx-auto backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-12 shadow-xl">
        
        {/* Main Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 leading-tight loading-text-fade-in">
          Transforming your idea into impactful marketing content…
        </h2>
        
        {/* Animated Sphere Logo */}
        <div className="flex justify-center items-center my-12 loading-dots-fade-in">
          <div className="h-16 w-16 drop-shadow-lg">
            <RibbedSphere className="w-full h-full" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl 2xl:text-2xl text-gray-600 leading-relaxed loading-subtitle-fade-in">
          Our AI is generating visuals, copy, and campaign assets tailored to your prompt.
        </p>

        {/* Progress Bar */}
        <div className="mt-8 w-full max-w-md mx-auto loading-progress-fade-in">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full loading-progress-bar"></div>
          </div>
        </div>
        </div>
        </div>
      </div>

    </div>
  );
};

export default GenerateCampaignScreen;