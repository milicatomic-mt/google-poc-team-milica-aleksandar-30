import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationResponse } from "@/types/api";

export interface DownloadSession {
  id: string;
  session_token: string;
  campaign_data: CampaignCreationResponse;
  created_at: string;
  expires_at: string;
}

/**
 * Creates a new download session with campaign data
 */
export const createDownloadSession = async (campaignData: CampaignCreationResponse): Promise<string> => {
  // Generate a unique session token
  const sessionToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

  const { error } = await supabase
    .from('download_sessions')
    .insert({
      session_token: sessionToken,
      campaign_data: campaignData
    });

  if (error) {
    console.error('Failed to create download session:', error);
    throw error;
  }

  return sessionToken;
};

/**
 * Retrieves campaign data by session token
 */
export const getDownloadSession = async (sessionToken: string): Promise<CampaignCreationResponse | null> => {
  const { data, error } = await supabase
    .from('download_sessions')
    .select('campaign_data')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error('Failed to get download session:', error);
    throw error;
  }

  return data?.campaign_data as CampaignCreationResponse || null;
};