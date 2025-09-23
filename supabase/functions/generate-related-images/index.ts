import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { basePrompt, category, count = 3 } = await req.json()

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    if (!basePrompt) {
      throw new Error('Base prompt is required')
    }

    // Generate category-specific prompts based on the original image
    const categoryPrompts: Record<string, string[]> = {
      'banner-ads': [
        `${basePrompt}, professional marketing banner style, clean layout, commercial advertising`,
        `${basePrompt}, promotional design, sale banner, marketing creative`,
        `${basePrompt}, brand advertisement, modern banner design, marketing visual`
      ],
      'web-creative': [
        `${basePrompt}, web design element, modern website graphic, digital creative`,
        `${basePrompt}, online marketing visual, web banner, digital design`,
        `${basePrompt}, website hero image, professional web graphic, online creative`
      ],
      'video-scripts': [
        `${basePrompt}, video thumbnail style, cinematic shot, video content visual`,
        `${basePrompt}, social media video frame, story format, video marketing`,
        `${basePrompt}, video production still, cinematic lighting, video content`
      ],
      'email-templates': [
        `${basePrompt}, email newsletter style, professional email design, marketing email`,
        `${basePrompt}, email marketing creative, newsletter graphic, email campaign visual`
      ]
    }

    const prompts = categoryPrompts[category] || [
      `${basePrompt}, variation 1, professional style`,
      `${basePrompt}, variation 2, modern design`,
      `${basePrompt}, variation 3, creative style`
    ]

    // Generate images for each prompt
    const images = []
    
    for (let i = 0; i < Math.min(count, prompts.length); i++) {
      try {
        console.log(`Generating image ${i + 1} with prompt:`, prompts[i])
        
        const image = await hf.textToImage({
          inputs: prompts[i],
          model: 'black-forest-labs/FLUX.1-schnell',
        })

        // Convert the blob to a base64 string
        const arrayBuffer = await image.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        
        images.push(`data:image/png;base64,${base64}`)
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error)
        // Continue with other images even if one fails
      }
    }

    return new Response(
      JSON.stringify({ 
        images,
        category,
        basePrompt,
        generatedCount: images.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})