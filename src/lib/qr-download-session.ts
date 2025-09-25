import { supabase } from "@/integrations/supabase/client";

export interface QRDownloadSession {
  id: string;
  session_token: string;
  campaign_data: any;
  created_at: string;
  expires_at: string;
}

// Cache for QR codes to avoid regenerating for same content
const qrCodeCache = new Map<string, { qrUrl: string, sessionToken: string }>();

// Create a hash of the campaign data to use as cache key
const createContentHash = (campaignData: any): string => {
  // Create a stable hash based on campaign content
  const contentString = JSON.stringify({
    generated_images: campaignData.generated_images?.map((img: any) => img.url).sort(),
    uploadedImageUrl: campaignData.uploadedImageUrl,
    video_scripts: campaignData.video_scripts,
    email_copy: campaignData.email_copy,
    banner_ads: campaignData.banner_ads,
    landing_page_concept: campaignData.landing_page_concept
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const createQRDownloadSession = async (campaignData: any): Promise<{ qrUrl: string, sessionToken: string }> => {
  // Check cache first
  const contentHash = createContentHash(campaignData);
  const cached = qrCodeCache.get(contentHash);
  
  if (cached) {
    // Check if session is still valid by trying to fetch it
    try {
      const { data, error } = await supabase
        .from('download_sessions')
        .select('expires_at')
        .eq('session_token', cached.sessionToken)
        .single();
      
      if (!error && data && new Date(data.expires_at) > new Date()) {
        return cached; // Return cached QR code
      } else {
        // Session expired, remove from cache
        qrCodeCache.delete(contentHash);
      }
    } catch (e) {
      // Session not found, remove from cache
      qrCodeCache.delete(contentHash);
    }
  }
  
  // Create new session
  const sessionToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

  const { data, error } = await supabase
    .from('download_sessions')
    .insert({
      session_token: sessionToken,
      campaign_data: campaignData
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const qrUrl = `https://cuwkuomczaoxbaysabii.supabase.co/functions/v1/download-zip?session=${sessionToken}`;
  
  // Cache the result
  qrCodeCache.set(contentHash, { qrUrl, sessionToken });
  
  return { qrUrl, sessionToken };
};

export const getDownloadSession = async (sessionToken: string): Promise<QRDownloadSession | null> => {
  const { data, error } = await supabase
    .from('download_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as QRDownloadSession;
};