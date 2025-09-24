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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Image data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this image and provide two types of responses:\n\n1. Generate 4-5 creative marketing campaign prompt suggestions. Each suggestion must be exactly 2 sentences or less and describe a specific marketing campaign based on what you see. Focus on the product, style, target audience, or key visual elements.\n\n2. Generate exactly 2 detailed image generation prompts based on what you see. Each prompt should describe a new image variation that could be created for marketing purposes - such as different angles, styling, backgrounds, or product variations while maintaining the core product identity. Make each prompt highly detailed with specific lighting, composition, style, and visual elements.\n\nReturn the response as a JSON object with two arrays: 'campaignSuggestions' and 'imagePrompts'."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return new Response(JSON.stringify({ error: 'Failed to analyze image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract both campaign suggestions and image generation prompts from the response
    let suggestions = [];
    let imagePrompts = [];
    
    try {
      // Look for JSON object in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        suggestions = parsedResponse.campaignSuggestions || [];
        imagePrompts = parsedResponse.imagePrompts || [];
      } else {
        // Fallback: try to extract arrays separately
        const arrayMatches = generatedText.match(/\[[\s\S]*?\]/g);
        if (arrayMatches && arrayMatches.length >= 2) {
          suggestions = JSON.parse(arrayMatches[0]);
          imagePrompts = JSON.parse(arrayMatches[1]);
        } else {
          // Manual parsing fallback
          const lines = generatedText
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
            .filter(line => line.length > 10);
          
          // Take first 5 as campaign suggestions, next 2 as image prompts
          suggestions = lines.slice(0, 5);
          imagePrompts = lines.slice(5, 7);
        }
      }
      
      // Ensure we have fallback suggestions
      if (suggestions.length === 0) {
        suggestions = [
          "Launch a premium product campaign highlighting quality and craftsmanship",
          "Create a lifestyle campaign showcasing how this product fits into daily life",
          "Design a seasonal marketing push emphasizing timely relevance",
          "Develop a social media campaign focusing on visual appeal and shareability"
        ];
      }
      
      // Ensure we have exactly 2 image prompts
      if (imagePrompts.length < 2) {
        imagePrompts = [
          "Professional product photography with clean white background, soft studio lighting, high detail, commercial photography style",
          "Lifestyle product shot in natural environment, warm ambient lighting, shallow depth of field, lifestyle photography style"
        ];
      } else if (imagePrompts.length > 2) {
        imagePrompts = imagePrompts.slice(0, 2);
      }
      
    } catch (e) {
      console.error('Error parsing response:', e);
      // Fallback values
      suggestions = [
        "Launch a premium product campaign highlighting quality and craftsmanship",
        "Create a lifestyle campaign showcasing how this product fits into daily life",
        "Design a seasonal marketing push emphasizing timely relevance",
        "Develop a social media campaign focusing on visual appeal and shareability"
      ];
      imagePrompts = [
        "Professional product photography with clean white background, soft studio lighting, high detail, commercial photography style",
        "Lifestyle product shot in natural environment, warm ambient lighting, shallow depth of field, lifestyle photography style"
      ];
    }

    return new Response(JSON.stringify({ 
      suggestions: suggestions,
      imagePrompts: imagePrompts 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});