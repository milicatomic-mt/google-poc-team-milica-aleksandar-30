import { supabase } from "@/integrations/supabase/client";

export interface QRSession {
  id: string;
  session_token: string;
  uploaded_image_url?: string;
  status: 'waiting' | 'uploaded' | 'displayed';
  created_at: string;
  expires_at: string;
}

export const createQRSession = async (): Promise<QRSession> => {
  const sessionToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

  const { data, error } = await supabase
    .from('qr_sessions')
    .insert({
      session_token: sessionToken,
      status: 'waiting'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as QRSession;
};

export const getQRSession = async (sessionToken: string): Promise<QRSession | null> => {
  const { data, error } = await supabase
    .from('qr_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as QRSession;
};

export const updateQRSession = async (
  sessionToken: string, 
  updates: Partial<Pick<QRSession, 'uploaded_image_url' | 'status'>>
): Promise<QRSession> => {
  const { data, error } = await supabase
    .from('qr_sessions')
    .update(updates)
    .eq('session_token', sessionToken)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as QRSession;
};

export const uploadImageToSession = async (file: File, sessionToken: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${sessionToken}-${Date.now()}.${fileExt}`;
  const filePath = `sessions/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('qr-uploads')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('qr-uploads')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const subscribeToSessionUpdates = (
  sessionToken: string,
  onUpdate: (session: QRSession) => void
) => {
  const channel = supabase
    .channel(`qr-session-${sessionToken}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'qr_sessions',
        filter: `session_token=eq.${sessionToken}`
      },
      (payload) => {
        
        onUpdate(payload.new as QRSession);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};