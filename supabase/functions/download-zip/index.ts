import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const sessionToken = url.searchParams.get('session');

    if (!sessionToken) {
      return new Response('Missing session token', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get download session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('download_sessions')
      .select('campaign_data')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (sessionError || !sessionData) {
      return new Response('Invalid or expired session', { 
        status: 404,
        headers: corsHeaders
      });
    }

    const campaignData = sessionData.campaign_data;

    // Collect all image URLs
    const imageUrls: { url: string; filename: string }[] = [];

    // Add uploaded image if exists
    if (campaignData.uploadedImageUrl) {
      imageUrls.push({
        url: campaignData.uploadedImageUrl,
        filename: 'original-image.jpg'
      });
    }

    // Add generated images
    if (campaignData.generated_images && Array.isArray(campaignData.generated_images)) {
      campaignData.generated_images.forEach((img: any, index: number) => {
        if (img.url) {
          const extension = img.url.split('.').pop()?.split('?')[0] || 'jpg';
          imageUrls.push({
            url: img.url,
            filename: `generated-image-${index + 1}.${extension}`
          });
        }
      });
    }

    // Create ZIP using JSZip-like functionality
    const files: { name: string; content: Uint8Array }[] = [];

    // Download all images with timeout and parallel processing
    const imagePromises = imageUrls.map(async (imageInfo) => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const imageResponse = await fetch(imageInfo.url, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          return {
            name: imageInfo.filename,
            content: new Uint8Array(imageBuffer)
          };
        }
        return null;
      } catch (error) {
        console.warn(`Failed to download image: ${imageInfo.url}`, error);
        return null;
      }
    });

    // Wait for all image downloads to complete (with timeout)
    const downloadResults = await Promise.allSettled(imagePromises);
    
    downloadResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        files.push(result.value);
      }
    });

    // Add text content files
    const textFiles: { [key: string]: string } = {};

    if (campaignData.video_scripts && Array.isArray(campaignData.video_scripts)) {
      campaignData.video_scripts.forEach((script: any, index: number) => {
        textFiles[`video-script-${script.platform || (index + 1)}.txt`] = 
          `Platform: ${script.platform}\n\n${script.script}`;
      });
    }

    if (campaignData.email_copy) {
      textFiles['email-copy.txt'] = 
        `Subject: ${campaignData.email_copy.subject}\n\n${campaignData.email_copy.body}`;
    }

    if (campaignData.banner_ads && Array.isArray(campaignData.banner_ads)) {
      campaignData.banner_ads.forEach((ad: any, index: number) => {
        textFiles[`banner-ad-${index + 1}.txt`] = 
          `Headline: ${ad.headline}\nCTA: ${ad.cta}`;
      });
    }

    if (campaignData.landing_page_concept) {
      textFiles['landing-page-concept.txt'] = 
        `Hero Text: ${campaignData.landing_page_concept.hero_text}\n` +
        `Sub Text: ${campaignData.landing_page_concept.sub_text}\n` +
        `CTA: ${campaignData.landing_page_concept.cta}`;
    }

    // Add text files to the zip
    for (const [filename, content] of Object.entries(textFiles)) {
      files.push({
        name: filename,
        content: new TextEncoder().encode(content)
      });
    }

    // Create a simple ZIP structure
    // This is a basic implementation - in production, you'd use a proper ZIP library
    const zipData = await createSimpleZip(files);

    return new Response(zipData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="campaign-content.txt"'
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});

// Simple ZIP creation function (basic implementation)
async function createSimpleZip(files: { name: string; content: Uint8Array }[]): Promise<string> {
  // This is a very basic ZIP implementation for demo purposes
  // In production, you should use a proper ZIP library
  
  const textContent = files.map(file => 
    `--- ${file.name} ---\n${new TextDecoder().decode(file.content)}\n\n`
  ).join('');
  
  // For now, return as a text file instead of ZIP
  // You would need to implement proper ZIP format or use a library
  return textContent;
}