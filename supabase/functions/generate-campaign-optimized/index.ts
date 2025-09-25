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

// Asset cache for reusing similar prompts
const promptCache = new Map();
const MAX_CACHE_SIZE = 100;

// Helper function to generate hash for prompt caching
function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

// Optimized parallel image generation
async function generateImagesOptimized(prompts: string[], campaignId: string): Promise<any[]> {
  console.log(`Starting parallel generation of ${prompts.length} images`);
  
  const imagePromises = prompts.map(async (prompt, index) => {
    const promptHash = hashPrompt(prompt);
    
    // Check cache first
    if (promptCache.has(promptHash)) {
      console.log(`Using cached result for prompt ${index + 1}`);
      return {
        prompt,
        url: promptCache.get(promptHash),
        cached: true,
        error: null
      };
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64Image = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/jpeg';
            
            // Upload to storage with optimized batch processing
            const fileName = `generated-${campaignId}-${Date.now()}-${index}.${mimeType.split('/')[1]}`;
            const filePath = `generated-images/${fileName}`;
            
            const binaryString = atob(base64Image);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('campaign-assets')
              .upload(filePath, bytes, {
                contentType: mimeType,
                upsert: true
              });
            
            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('campaign-assets')
                .getPublicUrl(filePath);
              
              const imageUrl = urlData.publicUrl;
              
              // Cache the result
              if (promptCache.size >= MAX_CACHE_SIZE) {
                const firstKey = promptCache.keys().next().value;
                promptCache.delete(firstKey);
              }
              promptCache.set(promptHash, imageUrl);
              
              console.log(`Successfully generated and cached image ${index + 1}`);
              return {
                prompt,
                url: imageUrl,
                cached: false,
                error: null
              };
            }
          }
        }
      }
      
      throw new Error('No image data in response');
      
    } catch (error) {
      console.error(`Error generating image ${index + 1}:`, error);
      return {
        prompt,
        url: null,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  // Execute all image generations in parallel
  const results = await Promise.all(imagePromises);
  return results;
}

// Background video generation with optimized polling
async function initiateVideoGeneration(campaignId: string, videoPrompt: string): Promise<void> {
  console.log('Starting background video generation');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt: videoPrompt }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Video API error: ${response.status}`);
    }

    const operationData = await response.json();
    const operationName = operationData.name;
    
    if (!operationName) {
      throw new Error('No operation name returned');
    }
    
    // Start background polling (non-blocking)
    pollVideoCompletion(campaignId, operationName).catch(error => {
      console.error('Background video generation failed:', error);
    });
    
  } catch (error) {
    console.error('Error initiating video generation:', error);
  }
}

// Optimized polling with exponential backoff
async function pollVideoCompletion(campaignId: string, operationName: string): Promise<void> {
  let attempts = 0;
  let delay = 5000; // Start with 5 seconds
  const maxDelay = 60000; // Max 60 seconds
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    try {
      const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}`, {
        headers: { 'x-goog-api-key': geminiApiKey! },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.done) {
          const videoUri = statusData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
          
          if (videoUri) {
            // Download and store video
            const videoResponse = await fetch(videoUri, {
              headers: { 'x-goog-api-key': geminiApiKey! },
            });
            
            if (videoResponse.ok) {
              const videoBlob = new Uint8Array(await videoResponse.arrayBuffer());
              const fileName = `generated-video-${campaignId}-${Date.now()}.mp4`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('campaign-assets')
                .upload(`videos/${fileName}`, videoBlob, {
                  contentType: 'video/mp4'
                });

              if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                  .from('campaign-assets')
                  .getPublicUrl(`videos/${fileName}`);
                
                // Update campaign with video URL
                await supabase
                  .from('campaign_results')
                  .update({ generated_video_url: publicUrl })
                  .eq('id', campaignId);
                
                console.log('Video generation completed successfully');
                return;
              }
            }
          }
          break;
        }
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff with jitter
      delay = Math.min(delay * 1.5 + Math.random() * 1000, maxDelay);
      
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.warn('Video generation polling completed without result');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { campaignId, campaignPrompt, targetAudience, imagePrompts = [] } = requestBody;

    console.log('Starting optimized campaign generation:', { campaignId, campaignPrompt });

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Parallel execution setup
    const tasks = [];
    
    // Task 1: Generate campaign content
    const campaignTask = async () => {
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
  "video_prompt": "A single, comprehensive prompt for AI video generation that captures the essence of the product and campaign.",
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
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiApiKey!,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nCampaign Brief: ${campaignPrompt}\nTarget Audience: ${targetAudience || 'General audience'}`
            }]
          }]
        }),
      });

      const geminiData = await response.json();
      let responseText = geminiData.candidates[0].content.parts[0].text;
      responseText = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      
      return JSON.parse(responseText);
    };

    // Task 2: Generate images in parallel (if prompts provided)
    const imageTask = imagePrompts.length > 0 
      ? () => generateImagesOptimized(imagePrompts, campaignId)
      : () => Promise.resolve([]);

    // Execute campaign generation and image generation in parallel
    tasks.push(campaignTask(), imageTask());
    
    const [campaignContent, generatedImages] = await Promise.all(tasks);

    console.log(`Generated campaign content and ${generatedImages.length} images`);
    
    // Batch database update with all results
    const updateData: any = { result: campaignContent };
    if (generatedImages.length > 0) {
      updateData.generated_images = generatedImages;
    }

    const { error: updateError } = await supabase
      .from('campaign_results')
      .update(updateData)
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign results:', updateError);
      throw updateError;
    }

    // Initiate background video generation (non-blocking)
    if (campaignContent.video_prompt) {
      initiateVideoGeneration(campaignId, campaignContent.video_prompt).catch(error => {
        console.error('Background video generation failed:', error);
      });
    }

    console.log('Optimized campaign generation completed successfully');

    const successfulImages = generatedImages.filter((img: any) => img.url !== null);
    const cachedImages = generatedImages.filter((img: any) => img.cached).length;

    return new Response(JSON.stringify({
      success: true,
      campaign: campaignContent,
      generatedImages: successfulImages.length,
      cachedImages: cachedImages,
      totalRequested: imagePrompts.length,
      videoGenerating: !!campaignContent.video_prompt,
      message: `Campaign generated successfully! Images: ${successfulImages.length}/${imagePrompts.length}, Cached: ${cachedImages}, Video: ${campaignContent.video_prompt ? 'generating in background' : 'not requested'}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimized campaign generation:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Campaign generation failed',
      details: error instanceof Error ? error.toString() : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});