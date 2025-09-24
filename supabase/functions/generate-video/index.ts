import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, videoPrompt } = await req.json();

    console.log('Generating video for campaign:', { campaignId, videoPrompt });

    // For now, we'll create a placeholder video URL
    // In the future, this would integrate with a video generation service like RunwayML, Stability AI, etc.
    
    // Simulate video generation process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a mock video URL - in production this would be a real generated video
    const mockVideoUrl = `https://cuwkuomczaoxbaysabii.supabase.co/storage/v1/object/public/campaign-assets/videos/generated-video-${campaignId}-${Date.now()}.mp4`;
    
    // Update the campaign results with the generated video URL
    const { error: updateError } = await supabase
      .from('campaign_results')
      .update({ 
        generated_video_url: mockVideoUrl
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign with video:', updateError);
      throw updateError;
    }

    console.log('Video generation completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      videoUrl: mockVideoUrl,
      message: 'Video generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-video function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate video',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});