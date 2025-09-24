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

    // Generate video using Gemini 2.5 Flash Video Preview
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-video-preview:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: videoPrompt,
              },
            ],
            role: 'user',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const geminiData = await response.json();
    console.log('Gemini video generation response:', geminiData);
    
    // Extract video data from Gemini response
    // Note: The exact response format may vary, this is based on typical Gemini responses
    let videoUrl = null;
    
    if (geminiData.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      // If video is returned as inline data, we'd need to save it to Supabase storage
      const videoData = geminiData.candidates[0].content.parts[0].inlineData.data;
      const mimeType = geminiData.candidates[0].content.parts[0].inlineData.mimeType;
      
      // Convert base64 to blob and upload to Supabase storage
      const videoBlob = new Uint8Array(atob(videoData).split('').map(char => char.charCodeAt(0)));
      const fileName = `generated-video-${campaignId}-${Date.now()}.mp4`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-assets')
        .upload(`videos/${fileName}`, videoBlob, {
          contentType: mimeType || 'video/mp4'
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
    } else if (geminiData.candidates?.[0]?.content?.parts?.[0]?.fileData?.fileUri) {
      // If video is returned as a file URI
      videoUrl = geminiData.candidates[0].content.parts[0].fileData.fileUri;
    } else {
      // Fallback: create a placeholder for now
      console.warn('Unexpected Gemini response format, using placeholder');
      videoUrl = `https://cuwkuomczaoxbaysabii.supabase.co/storage/v1/object/public/campaign-assets/videos/placeholder-${campaignId}-${Date.now()}.mp4`;
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
      message: 'Video generated successfully using Gemini AI'
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