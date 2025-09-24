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
                text: "Analyze this image carefully and provide a comprehensive analysis based on what you actually see in the product/image:\n\n1. Generate 4-5 creative marketing campaign prompt suggestions. Each suggestion must be exactly 2 sentences or less and describe a specific marketing campaign based on what you see. Focus on the actual product, style, target audience, or key visual elements visible in the image.\n\n2. Generate exactly 2 detailed image generation prompts based on what you see. Each prompt should describe a new image variation that could be created for marketing purposes - such as different angles, styling, backgrounds, or product variations while maintaining the core product identity. Make each prompt highly detailed with specific lighting, composition, style, and visual elements.\n\n3. Identify the target audience for this product by analyzing the actual product and context shown in the image. Choose the most relevant audiences from ONLY these options: 'Urban professionals', 'Outdoor enthusiasts', 'Health & wellness focused', 'Tech enthusiasts', 'Eco-conscious consumers', 'Budget-conscious shoppers'. Select 2-4 that best match the product and its likely users based on what you see.\n\n4. Determine the product category from these options: Fashion & Apparel, Beauty & Personal Care, Electronics & Tech, Home & Garden, Food & Beverage, Sports & Fitness, Automotive, Books & Media, Toys & Games, Health & Wellness, Travel & Leisure, Business & Professional, Art & Crafts, Pet Supplies, Jewelry & Accessories, Other.\n\n5. Suggest an appropriate brand tone from: Professional, Casual, Luxury, Playful, Minimalist, Bold, Elegant, Trendy.\n\n6. Recommend suitable platforms from: Instagram, Facebook, TikTok, LinkedIn, Twitter, Pinterest, YouTube, Email.\n\nIMPORTANT: Base your analysis on what you actually see in the image. The target audience must be selected from the provided list and should reflect the actual product and its likely users.\n\nReturn the response as a JSON object with the following structure:\n{\n  \"campaignSuggestions\": [array of campaign suggestions],\n  \"imagePrompts\": [array of 2 image generation prompts],\n  \"targetAudience\": [array of relevant audience segments from the provided list],\n  \"category\": \"product category\",\n  \"tone\": \"suggested brand tone\",\n  \"platforms\": [array of recommended platforms]\n}"
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
    
    // Try to extract all analysis data from the response
    let suggestions = [];
    let imagePrompts = [];
    let targetAudience = [];
    let category = "Other";
    let tone = "Professional";
    let platforms = ["Instagram", "Facebook"];
    
    try {
      // Look for JSON object in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        suggestions = parsedResponse.campaignSuggestions || [];
        imagePrompts = parsedResponse.imagePrompts || [];
        targetAudience = parsedResponse.targetAudience || [];
        category = parsedResponse.category || "Other";
        tone = parsedResponse.tone || "Professional";
        platforms = parsedResponse.platforms || ["Instagram", "Facebook"];
      } else {
        // Fallback: try to extract arrays separately
        const arrayMatches = generatedText.match(/\[[\s\S]*?\]/g);
        if (arrayMatches && arrayMatches.length >= 2) {
          suggestions = JSON.parse(arrayMatches[0]);
          imagePrompts = JSON.parse(arrayMatches[1]);
          if (arrayMatches.length >= 3) {
            targetAudience = JSON.parse(arrayMatches[2]);
          }
          if (arrayMatches.length >= 4) {
            platforms = JSON.parse(arrayMatches[3]);
          }
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
        
        // Try to extract category, tone, and other fields from text
        const lowerText = generatedText.toLowerCase();
        
        // Extract category
        const categories = ["fashion & apparel", "beauty & personal care", "electronics & tech", "home & garden", "food & beverage", "sports & fitness", "automotive", "books & media", "toys & games", "health & wellness", "travel & leisure", "business & professional", "art & crafts", "pet supplies", "jewelry & accessories"];
        for (const cat of categories) {
          if (lowerText.includes(cat.toLowerCase())) {
            category = cat.charAt(0).toUpperCase() + cat.slice(1);
            break;
          }
        }
        
        // Extract tone
        const tones = ["professional", "casual", "luxury", "playful", "minimalist", "bold", "elegant", "trendy"];
        for (const t of tones) {
          if (lowerText.includes(t)) {
            tone = t.charAt(0).toUpperCase() + t.slice(1);
            break;
          }
        }
        
        // Extract target audience from predefined options
        const audienceOptions = ["urban professionals", "outdoor enthusiasts", "health & wellness focused", "tech enthusiasts", "eco-conscious consumers", "budget-conscious shoppers"];
        for (const audience of audienceOptions) {
          if (lowerText.includes(audience.toLowerCase())) {
            targetAudience.push(audience.charAt(0).toUpperCase() + audience.slice(1));
          }
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
      
      // Ensure we have at least one target audience from predefined options
      if (targetAudience.length === 0) {
        targetAudience = ["Urban professionals"];
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
      targetAudience = ["Urban professionals"];
      category = "Other";
      tone = "Professional";
      platforms = ["Instagram", "Facebook"];
    }

    return new Response(JSON.stringify({ 
      suggestions: suggestions,
      imagePrompts: imagePrompts,
      targetAudience: targetAudience,
      category: category,
      tone: tone,
      platforms: platforms
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