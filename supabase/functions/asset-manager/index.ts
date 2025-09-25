import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Asset deduplication and reuse system
interface AssetCache {
  [key: string]: {
    url: string;
    created_at: string;
    usage_count: number;
    campaigns: string[];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, campaignId, prompts, similarity_threshold = 0.8 } = await req.json();

    console.log('Asset manager action:', { action, campaignId });

    switch (action) {
      case 'find_similar':
        return await findSimilarAssets(prompts, similarity_threshold);
      
      case 'reuse_assets':
        return await reuseAssets(campaignId, prompts);
      
      case 'cleanup_unused':
        return await cleanupUnusedAssets();
      
      case 'get_stats':
        return await getAssetStats();
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in asset-manager function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Asset management failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Find similar existing assets to avoid regeneration
async function findSimilarAssets(prompts: string[], threshold: number): Promise<Response> {
  console.log('Finding similar assets for', prompts.length, 'prompts');
  
  // Query existing campaign results for similar prompts
  const { data: existingCampaigns, error } = await supabase
    .from('campaign_results')
    .select('id, generated_images, campaign_prompt, created_at')
    .not('generated_images', 'is', null);

  if (error) {
    throw error;
  }

  const similarAssets = [];
  const promptLower = prompts.map(p => p.toLowerCase());

  for (const campaign of existingCampaigns || []) {
    if (Array.isArray(campaign.generated_images)) {
      for (const image of campaign.generated_images) {
        if (image.prompt && image.url) {
          const imagePrromptLower = image.prompt.toLowerCase();
          
          // Simple similarity check based on common keywords
          for (let i = 0; i < promptLower.length; i++) {
            const similarity = calculateSimilarity(promptLower[i], imagePrromptLower);
            
            if (similarity >= threshold) {
              similarAssets.push({
                original_prompt: prompts[i],
                similar_prompt: image.prompt,
                similarity_score: similarity,
                asset_url: image.url,
                source_campaign: campaign.id,
                created_at: campaign.created_at
              });
            }
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    similar_assets: similarAssets,
    total_found: similarAssets.length,
    potential_savings: `${similarAssets.length} assets can be reused`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Reuse existing assets for a campaign
async function reuseAssets(campaignId: string, assetMappings: any[]): Promise<Response> {
  console.log('Reusing assets for campaign:', campaignId);
  
  const reusedAssets = [];
  
  for (const mapping of assetMappings) {
    reusedAssets.push({
      prompt: mapping.new_prompt,
      url: mapping.existing_url,
      reused: true,
      source_campaign: mapping.source_campaign,
      similarity_score: mapping.similarity_score
    });
  }
  
  // Update the campaign with reused assets
  const { error } = await supabase
    .from('campaign_results')
    .update({
      generated_images: reusedAssets
    })
    .eq('id', campaignId);

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({
    success: true,
    reused_count: reusedAssets.length,
    assets: reusedAssets,
    message: `Successfully reused ${reusedAssets.length} existing assets`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Cleanup unused assets to save storage space
async function cleanupUnusedAssets(): Promise<Response> {
  console.log('Starting asset cleanup');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // Assets older than 30 days
  
  // Get old campaigns
  const { data: oldCampaigns, error: queryError } = await supabase
    .from('campaign_results')
    .select('id, generated_images')
    .lt('created_at', cutoffDate.toISOString());

  if (queryError) {
    throw queryError;
  }

  let deletedCount = 0;
  const deletedAssets = [];

  for (const campaign of oldCampaigns || []) {
    if (Array.isArray(campaign.generated_images)) {
      for (const image of campaign.generated_images) {
        if (image.url && image.url.includes('campaign-assets')) {
          // Extract file path from URL
          const urlParts = image.url.split('/');
          const filePath = urlParts.slice(-2).join('/'); // get last two parts
          
          const { error: deleteError } = await supabase.storage
            .from('campaign-assets')
            .remove([filePath]);
          
          if (!deleteError) {
            deletedCount++;
            deletedAssets.push(filePath);
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    deleted_count: deletedCount,
    deleted_assets: deletedAssets,
    message: `Cleaned up ${deletedCount} unused assets`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Get asset usage statistics
async function getAssetStats(): Promise<Response> {
  console.log('Calculating asset statistics');
  
  const { data: campaigns, error } = await supabase
    .from('campaign_results')
    .select('id, generated_images, generated_video_url, created_at');

  if (error) {
    throw error;
  }

  let totalImages = 0;
  let totalVideos = 0;
  let totalCampaigns = campaigns?.length || 0;
  let storageUsage = 0;
  
  for (const campaign of campaigns || []) {
    if (Array.isArray(campaign.generated_images)) {
      totalImages += campaign.generated_images.length;
    }
    if (campaign.generated_video_url) {
      totalVideos++;
    }
  }

  return new Response(JSON.stringify({
    success: true,
    stats: {
      total_campaigns: totalCampaigns,
      total_images: totalImages,
      total_videos: totalVideos,
      avg_images_per_campaign: totalCampaigns > 0 ? (totalImages / totalCampaigns).toFixed(2) : 0,
      storage_usage_mb: '~' + Math.round(totalImages * 0.5 + totalVideos * 10) // Rough estimate
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Simple string similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/).filter(w => w.length > 3); // Only meaningful words
  const words2 = str2.split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);
  
  return Math.min(similarity, 1.0);
}