import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompts } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return new Response(JSON.stringify({ error: 'Image prompts array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating images for prompts:', prompts);

    // Generate images for each prompt
    const generatedImages = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`Generating image ${i + 1} for prompt: ${prompt}`);

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error for prompt ${i + 1}:`, response.status, errorText);
          
          // Continue with next prompt instead of failing completely
          generatedImages.push({
            prompt: prompt,
            image: null,
            error: `API error: ${response.status}`
          });
          continue;
        }

        const data = await response.json();
        console.log(`Response for prompt ${i + 1}:`, JSON.stringify(data, null, 2));

        // Check if the response contains generated image data
        const imageData = data.candidates?.[0]?.content?.parts?.[0];
        
        if (imageData && imageData.inlineData) {
          // Image was generated successfully
          const base64Image = imageData.inlineData.data;
          const mimeType = imageData.inlineData.mimeType || 'image/jpeg';
          
          generatedImages.push({
            prompt: prompt,
            image: `data:${mimeType};base64,${base64Image}`,
            error: null
          });
          
          console.log(`Successfully generated image ${i + 1}`);
        } else {
          console.log(`No image data in response for prompt ${i + 1}:`, data);
          generatedImages.push({
            prompt: prompt,
            image: null,
            error: 'No image data in response'
          });
        }

      } catch (error) {
        console.error(`Error generating image for prompt ${i + 1}:`, error);
        generatedImages.push({
          prompt: prompt,
          image: null,
          error: error.message
        });
      }

      // Add small delay between requests to avoid rate limiting
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successfulImages = generatedImages.filter(img => img.image !== null);
    
    return new Response(JSON.stringify({ 
      success: true,
      generatedImages: generatedImages,
      totalGenerated: successfulImages.length,
      totalRequested: prompts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-images function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});