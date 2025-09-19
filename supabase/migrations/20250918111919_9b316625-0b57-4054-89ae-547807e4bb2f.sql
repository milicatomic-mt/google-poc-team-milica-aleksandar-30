-- Fix search path security issues for functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.qr_sessions 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_cleanup()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This would typically be handled by a scheduled job
  -- For now, we'll clean up on insert
  PERFORM public.cleanup_expired_sessions();
  RETURN NEW;
END;
$$;