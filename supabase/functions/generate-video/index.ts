import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
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

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Generate video using Veo 3.0
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: videoPrompt
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const operationData = await response.json();
    console.log('Veo 3.0 operation started:', operationData);
    
    // Get the operation name for polling
    const operationName = operationData.name;
    
    if (!operationName) {
      throw new Error('No operation name returned from Veo 3.0');
    }
    
    // Poll for completion (with timeout)
    let videoUrl: string | null = null;
    let filteredReasons: string[] | null = null;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    
    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}`, {
        headers: {
          'x-goog-api-key': geminiApiKey,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check operation status');
      }
      
      const statusData = await statusResponse.json();
      console.log('Operation status:', statusData);
      
      if (statusData.done) {
        // Extract video URL from completed operation
        const videoUri = statusData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          // Download and upload to Supabase storage
          console.log('Downloading video from:', videoUri);
          const videoResponse = await fetch(videoUri, {
            headers: {
              'x-goog-api-key': geminiApiKey,
            },
          });
          
          if (videoResponse.ok) {
            const videoBlob = new Uint8Array(await videoResponse.arrayBuffer());
            const fileName = `generated-video-${campaignId}-${Date.now()}.mp4`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('campaign-assets')
              .upload(`videos/${fileName}`, videoBlob, {
                contentType: 'video/mp4'
              });

            if (uploadError) {
              console.error('Error uploading video to storage:', uploadError);
              throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('campaign-assets')
              .getPublicUrl(`videos/${fileName}`);
              
            videoUrl = publicUrl;
          } else {
            console.warn('Failed to download video, using direct URL');
            videoUrl = videoUri;
          }
        } else {
          // No video returned, capture potential safety filter reasons instead of hard-failing
          const reasons = statusData.response?.generateVideoResponse?.raiMediaFilteredReasons;
          console.warn('Veo completed without video URI. Possible safety filter reasons:', reasons);
          filteredReasons = Array.isArray(reasons) ? reasons : ['No video URI in completed operation'];
        }
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      attempts++;
    }
    
    if (!videoUrl) {
      if (filteredReasons) {
        console.warn('Video generation filtered; returning info to client', filteredReasons);
        return new Response(JSON.stringify({
          success: false,
          filtered: true,
          reasons: filteredReasons,
          message: 'Video request was filtered by the model (often due to audio content). Please modify your prompt and try again (e.g., remove music/audio or sensitive content).'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Video generation timed out or failed');
    }
    
    // Update the campaign results with the generated video URL
    const { error: updateError } = await supabase
      .from('campaign_results')
      .update({ 
        generated_video_url: videoUrl
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign with video:', updateError);
      throw updateError;
    }

    console.log('Video generation completed successfully:', videoUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      videoUrl: videoUrl,
      message: 'Video generated successfully using Veo 3.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-video function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});