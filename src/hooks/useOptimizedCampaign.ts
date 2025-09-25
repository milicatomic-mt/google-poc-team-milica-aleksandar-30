import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimizedCampaignOptions {
  campaignId: string;
  campaignPrompt: string;
  targetAudience?: string;
  imagePrompts?: string[];
  reuseAssets?: boolean;
}

interface CampaignResult {
  success: boolean;
  campaign?: any;
  generatedImages?: number;
  cachedImages?: number;
  totalRequested?: number;
  videoGenerating?: boolean;
  message?: string;
  error?: string;
}

export const useOptimizedCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const { toast } = useToast();

  const generateOptimizedCampaign = useCallback(async (options: OptimizedCampaignOptions): Promise<CampaignResult> => {
    setIsLoading(true);
    setProgress('Initializing campaign generation...');
    
    try {
      // Step 1: Check for reusable assets if requested
      let assetReuse = null;
      if (options.reuseAssets && options.imagePrompts?.length) {
        setProgress('Checking for reusable assets...');
        
        const { data: assetData, error: assetError } = await supabase.functions.invoke('asset-manager', {
          body: {
            action: 'find_similar',
            prompts: options.imagePrompts,
            similarity_threshold: 0.7
          }
        });

        if (!assetError && assetData?.similar_assets?.length > 0) {
          assetReuse = assetData;
          toast({
            title: "Assets Found",
            description: `Found ${assetData.similar_assets.length} reusable assets!`,
          });
        }
      }

      // Step 2: Generate campaign with optimization
      setProgress('Generating campaign content and images...');
      
      const { data, error } = await supabase.functions.invoke('generate-campaign-optimized', {
        body: {
          campaignId: options.campaignId,
          campaignPrompt: options.campaignPrompt,
          targetAudience: options.targetAudience,
          imagePrompts: options.imagePrompts || [],
          assetReuse: assetReuse
        }
      });

      if (error) {
        throw new Error(error.message || 'Campaign generation failed');
      }

      setProgress('Campaign generation completed!');
      
      // Show success notification with optimization stats
      if (data.success) {
        let message = `Campaign generated successfully!`;
        if (data.generatedImages > 0) {
          message += ` Images: ${data.generatedImages}/${data.totalRequested}`;
        }
        if (data.cachedImages > 0) {
          message += ` (${data.cachedImages} reused)`;
        }
        if (data.videoGenerating) {
          message += ` Video: generating in background`;
        }

        toast({
          title: "Campaign Generated",
          description: message,
        });
      }

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Campaign generation failed';
      setProgress(`Error: ${errorMessage}`);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(''), 3000); // Clear progress after 3 seconds
    }
  }, [toast]);

  const getAssetStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('asset-manager', {
        body: { action: 'get_stats' }
      });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Failed to get asset stats:', error);
      return null;
    }
  }, []);

  const cleanupAssets = useCallback(async () => {
    try {
      setProgress('Cleaning up unused assets...');
      
      const { data, error } = await supabase.functions.invoke('asset-manager', {
        body: { action: 'cleanup_unused' }
      });

      if (error) throw error;

      toast({
        title: "Cleanup Complete",
        description: `Removed ${data.deleted_count} unused assets`,
      });

      return data;

    } catch (error) {
      console.error('Asset cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to clean up assets",
        variant: "destructive",
      });
      return null;
    } finally {
      setProgress('');
    }
  }, [toast]);

  return {
    generateOptimizedCampaign,
    getAssetStats,
    cleanupAssets,
    isLoading,
    progress
  };
};