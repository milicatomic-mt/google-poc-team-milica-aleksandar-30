import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { catalogId, image, category, tone, platform, brand } = await req.json();
    
    if (!catalogId) {
      throw new Error('catalogId is required');
    }

    console.log('Generating catalog for:', { catalogId, category, tone, platform, brand });


    // Process image data - convert to base64 if it's a URL
    let imageBase64 = '';
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:image/')) {
      // Already base64 data URL
      const parts = image.split(',');
      imageBase64 = parts[1];
      mimeType = image.split(',')[0].split(':')[1].split(';')[0];
    } else if (image.startsWith('http')) {
      // Public URL - fetch and convert to base64
      
      try {
        const imageResponse = await fetch(image);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        mimeType = imageBlob.type || 'image/jpeg';
        
        // Convert blob to base64
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert Uint8Array to base64 without stack overflow
        let binaryString = '';
        const chunkSize = 8192; // Process in chunks to avoid stack overflow
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64String = btoa(binaryString);
        imageBase64 = base64String;
        
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown fetch error';
        throw new Error(`Failed to fetch image: ${errorMessage}`);
      }
    } else {
      throw new Error('Invalid image format. Expected base64 data URL or HTTP URL.');
    }

    // Prepare context for the AI
    let contextPrompt = "Generate comprehensive catalog content for this product image.";
    
    if (category) contextPrompt += ` Product category: ${category}.`;
    if (tone) contextPrompt += ` Brand tone: ${tone}.`;
    if (platform) contextPrompt += ` Target platform: ${platform}.`;
    if (brand) contextPrompt += ` Brand name: ${brand}.`;

    const systemPrompt = `You are an expert product catalog content creator. Analyze the product image and generate comprehensive, SEO-optimized catalog content.

${contextPrompt}

IMPORTANT: You must respond with a valid JSON object in exactly this format (no additional text, markdown, or formatting):

{
  "product_title": "A compelling, SEO-friendly product title (max 60 characters)",
  "description": "A detailed product description (150-300 words) that highlights benefits and features",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "alt_text": "Descriptive alt text for the product image for accessibility",
  "seo_metadata": {
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  },
  "short_marketing_copy": "A brief, punchy marketing statement (optional, max 100 characters)"
}

Focus on:
- SEO optimization with relevant keywords
- Compelling copy that drives conversions
- Accurate product feature identification
- Platform-specific optimization when platform is specified
- Brand tone consistency when specified`;

    // Prepare the request payload for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Parse the JSON response from Gemini
    let catalogContent;
    try {
      // Remove any potential markdown formatting
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      catalogContent = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error('Failed to parse catalog content from AI response');
    }

    // Validate the response structure
    if (!catalogContent.product_title || !catalogContent.description || !catalogContent.features) {
      throw new Error('Invalid catalog content structure from AI');
    }

    console.log('Generated catalog content successfully');

    // Save the result to the database
    const { data: updateData, error: updateError } = await supabase
      .from('catalog_results')
      .update({ result: catalogContent })
      .eq('id', catalogId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to save catalog result:', updateError);
      throw new Error('Failed to save catalog result to database');
    }

    console.log('Catalog result saved to database successfully');

    return new Response(JSON.stringify(catalogContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-catalog function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating catalog content';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});