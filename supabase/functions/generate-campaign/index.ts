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
    const requestBody = await req.json();
    
    const { campaignId, image, campaignPrompt, targetAudience } = requestBody;

    console.log('Generating campaign for:', { campaignId, campaignPrompt, targetAudience });

    // First, fetch the existing campaign record to get generated images
    const { data: campaignData, error: fetchError } = await supabase
      .from('campaign_results')
      .select('generated_images')
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      console.error('Error fetching campaign data:', fetchError);
      throw fetchError;
    }

    const generatedImages = campaignData?.generated_images || [];
    console.log('Found generated images:', generatedImages.length);

    // Include generated images context in the prompt if available
    let imageContext = '';
    if (generatedImages.length > 0) {
      imageContext = `\n\nAvailable Generated Images: You have ${generatedImages.length} AI-generated product images available that can be referenced in banner ads and landing page designs. These images should be integrated into your marketing materials.`;
    }

    const systemPrompt = `You are an expert marketing AI that creates comprehensive campaigns. Generate a complete campaign based on the user's prompt and target audience. Return ONLY a valid JSON object with this exact structure:

{
  "video_scripts": [
    {
      "platform": "TikTok",
      "script": "Hook-based script for TikTok format"
    },
    {
      "platform": "Instagram",
      "script": "Story-driven script for Instagram Reels"
    },
    {
      "platform": "YouTube",
      "script": "Educational script for YouTube Shorts"
    }
  ],
  "video_prompt": "A single, comprehensive prompt for AI video generation that captures the essence of the product and campaign. This should be a detailed visual description perfect for video generation AI, including camera angles, lighting, movement, and key visual elements.",
  "email_copy": {
    "subject": "Compelling email subject line",
    "body": "Persuasive email body content with clear value proposition"
  },
  "banner_ads": [
    {
      "headline": "Primary ad headline",
      "cta": "Primary call-to-action"
    },
    {
      "headline": "Alternative ad headline",
      "cta": "Alternative call-to-action"
    }
  ],
  "landing_page_concept": {
    "hero_text": "Main landing page headline",
    "sub_text": "Supporting subheading that explains value",
    "cta": "Landing page call-to-action button"
  }
}

Make the content compelling, actionable, and tailored to the target audience.`;

    const fullPrompt = `${systemPrompt}

Campaign Brief: ${campaignPrompt}
Target Audience: ${targetAudience || 'General audience'}${imageContext}

Create a comprehensive marketing campaign with video scripts for TikTok, Instagram, and YouTube, email marketing copy, banner ads, and a landing page concept. Make all content engaging and specific to the target audience.`;

    // Generate text content with Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      }),
    });

    const geminiData = await response.json();
    
    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Clean the response text by removing markdown formatting
    let responseText = geminiData.candidates[0].content.parts[0].text;
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    
    const generatedContent = JSON.parse(responseText);

    console.log('Generated text content successfully with Gemini');

    // Update the campaign_results table with the generated content (keep existing generated_images)
    const { error: updateError } = await supabase
      .from('campaign_results')
      .update({ 
        result: generatedContent
        // Don't update generated_images - keep existing ones
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign results:', updateError);
      throw updateError;
    }

    console.log('Campaign generation completed successfully');

    // Now automatically call generate-video with the generated video prompt
    if (generatedContent.video_prompt) {
      console.log('Calling generate-video with prompt:', generatedContent.video_prompt);
      
      try {
        const videoResponse = await supabase.functions.invoke('generate-video', {
          body: {
            campaignId: campaignId,
            videoPrompt: generatedContent.video_prompt
          }
        });

        if (videoResponse.error) {
          console.error('Error calling generate-video:', videoResponse.error);
          // Don't fail the entire request, just log the error
        } else {
          console.log('Video generation initiated successfully');
        }
      } catch (videoError) {
        console.error('Exception calling generate-video:', videoError);
        // Don't fail the entire request, just log the error
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      campaign: generatedContent,
      videoPrompt: generatedContent.video_prompt,
      generatedImages: generatedImages.length,
      message: `Generated campaign content successfully using Gemini AI. Video generation initiated.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-campaign function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate campaign',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});