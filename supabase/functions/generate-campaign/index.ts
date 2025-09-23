import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
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
Target Audience: ${targetAudience || 'General audience'}

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

    console.log('Generated text content successfully, now generating related images...');

    // Generate related images based on the campaign content
    const generatedImages = [];
    
    if (hfToken) {
      try {
        const cleanToken = (hfToken || '').trim();
        if (!cleanToken.startsWith('hf_')) {
          throw new Error('Invalid Hugging Face token format. Token must start with "hf_"');
        }
        const hf = new HfInference(cleanToken);
        
        const imagePrompts = [
          `Professional marketing image for: ${campaignPrompt}. High quality, commercial style, modern design, clean background`,
          `${generatedContent.banner_ads?.[0]?.headline || campaignPrompt}. Professional product photography style, minimalist design`,
          `Creative marketing visual for: ${generatedContent.landing_page_concept?.hero_text || campaignPrompt}. Professional, commercial style`
        ];

        console.log('Generating images with prompts:', imagePrompts);

        // Generate images sequentially to avoid rate limits
        for (let i = 0; i < imagePrompts.length; i++) {
          try {
            console.log(`Generating image ${i + 1}/${imagePrompts.length}`);
            
            const imageBlob = await hf.textToImage({
              inputs: imagePrompts[i],
              model: 'black-forest-labs/FLUX.1-schnell',
            });

            // Convert blob to array buffer for upload
            const arrayBuffer = await imageBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Upload to Supabase storage
            const fileName = `campaign-${campaignId}-generated-${i + 1}-${Date.now()}.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('ai-marketing')
              .upload(fileName, uint8Array, {
                contentType: 'image/png',
                cacheControl: '3600'
              });

            if (uploadError) {
              console.error('Failed to upload generated image:', uploadError);
              continue; // Skip this image but continue with others
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('ai-marketing')
              .getPublicUrl(fileName);

            generatedImages.push({
              url: publicUrl,
              prompt: imagePrompts[i],
              filename: fileName,
              generated_at: new Date().toISOString()
            });

            console.log(`Successfully generated and uploaded image ${i + 1}`);
            
            // Add small delay between generations to avoid rate limits
            if (i < imagePrompts.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
          } catch (error) {
            console.error(`Failed to generate image ${i + 1}:`, error);
            // Continue with other images even if one fails
          }
        }

        console.log(`Successfully generated ${generatedImages.length} out of ${imagePrompts.length} images`);
      } catch (error) {
        console.error('Error in image generation process:', error);
      }
    } else {
      console.warn('Hugging Face token not found, skipping image generation');
    }
  // Update the campaign_results table with the generated content and images
    // Update the campaign_results table with the generated content and images
    const { error: updateError } = await supabase
      .from('campaign_results')
      .update({ 
        result: generatedContent,
        generated_images: generatedImages
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign results:', updateError);
      throw updateError;
    }

    console.log('Campaign generation completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      campaign: generatedContent,
      generatedImages: generatedImages.length,
      message: `Generated campaign content with ${generatedImages.length} related images`
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