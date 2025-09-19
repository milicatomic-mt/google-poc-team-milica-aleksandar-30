import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationRequest, CatalogEnrichmentRequest, CatalogEnrichmentResponse } from "@/types/api";

export const saveCampaignRequest = async (data: CampaignCreationRequest) => {
  const { data: result, error } = await supabase
    .from('campaign_results')
    .insert({
      image_url: data.image,
      campaign_prompt: data.campaign_prompt,
      target_audience: data.target_audience,
      result: {} // Will be updated when AI generates the campaign
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const generateCampaign = async (campaignId: string, data: CampaignCreationRequest) => {

  const { data: result, error } = await supabase.functions.invoke('generate-campaign', {
    body: {
      campaignId,
      image: data.image,
      campaignPrompt: data.campaign_prompt,
      targetAudience: data.target_audience
    }
  });


  if (error) {
    throw error;
  }

  return result;
};

export const saveCatalogRequest = async (data: CatalogEnrichmentRequest) => {
  const { data: result, error } = await supabase
    .from('catalog_results')
    .insert({
      image_url: data.image,
      tone: data.tone,
      platform: data.platform,
      product_category: data.category,
      result: {} // Will be updated when AI generates the catalog content
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const generateCatalog = async (catalogId: string, data: CatalogEnrichmentRequest) => {

  const { data: result, error } = await supabase.functions.invoke('generate-catalog', {
    body: {
      catalogId,
      image: data.image,
      category: data.category,
      tone: data.tone,
      platform: data.platform,
      brand: data.brand
    }
  });

  

  if (error) {
    throw error;
  }

  return result as CatalogEnrichmentResponse;
};