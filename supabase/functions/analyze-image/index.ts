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
                text: "Analyze this image and generate exactly 2 detailed image generation prompts based on what you see. Each prompt should describe a new image variation that could be created for marketing purposes - such as different angles, styling, backgrounds, or product variations while maintaining the core product identity. Make each prompt highly detailed with specific lighting, composition, style, and visual elements. Return the response as a JSON array with exactly 2 strings."
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
    
    // Try to extract image generation prompts from the response
    let imagePrompts = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = generatedText.match(/\[.*\]/s);
      if (jsonMatch) {
        imagePrompts = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by lines and clean up
        const lines = generatedText
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
          .filter(line => line.length > 20);
        
        // Take first 2 lines as prompts
        imagePrompts = lines.slice(0, 2);
      }
      
      // Ensure we have exactly 2 prompts
      if (imagePrompts.length < 2) {
        imagePrompts = [
          "Professional product photography with clean white background, soft studio lighting, high detail, commercial photography style",
          "Lifestyle product shot in natural environment, warm ambient lighting, shallow depth of field, lifestyle photography style"
        ];
      } else if (imagePrompts.length > 2) {
        imagePrompts = imagePrompts.slice(0, 2);
      }
    } catch (e) {
      console.error('Error parsing image prompts:', e);
      // Fallback image generation prompts
      imagePrompts = [
        "Professional product photography with clean white background, soft studio lighting, high detail, commercial photography style",
        "Lifestyle product shot in natural environment, warm ambient lighting, shallow depth of field, lifestyle photography style"
      ];
    }

    return new Response(JSON.stringify({ 
      suggestions: [], // Keep for backward compatibility
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