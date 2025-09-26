import React from 'react';
import { Play } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

interface VideoScriptsPreviewSharedProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  generatedVideoUrl?: string | null;
  variant: 'full' | 'modal' | 'gallery';
}

export const VideoScriptsPreviewShared: React.FC<VideoScriptsPreviewSharedProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  generatedVideoUrl,
  variant
}) => {
  const activeCampaignResults = campaignResults;
  const firstScript = activeCampaignResults?.video_scripts?.[0];

  if (variant === 'gallery') {
    return (
      <div className="h-80 bg-gray-50 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
        {/* Mobile Video Interface */}
        <div className="h-full bg-white relative">
          {/* Mobile Header */}
          <div className="bg-black px-3 py-2 flex items-center justify-between">
            <div className="text-white text-[8px] font-medium">9:41</div>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 bg-white rounded-full"></div>
              <div className="w-1 h-1.5 bg-white/60 rounded-full"></div>
              <div className="w-1 h-1.5 bg-white/60 rounded-full"></div>
            </div>
          </div>

          {/* Video Content */}
          <div className="relative flex-1 bg-black" style={{ height: 'calc(100% - 120px)' }}>
            {generatedVideoUrl ? (
              <VideoPlayer
                videoUrl={generatedVideoUrl}
                posterUrl={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage}
                title="Generated Campaign Video"
                className="w-full h-full"
              />
            ) : (
              <>
                {/* Video Thumbnail */}
                <div className="w-full h-full relative">
                  {(activeCampaignResults?.generated_images?.[0]?.url || uploadedImage) ? (
                    <img 
                      src={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="text-white text-[8px]">Video Preview</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[6px] px-1 py-0.5 rounded">
                    0:15
                  </div>
                </div>
              </>
            )}

            {/* Video Overlay Text */}
            <div className="absolute bottom-4 left-3 right-3 text-white">
              <div className="text-[8px] font-bold mb-1 drop-shadow-lg">
                {firstScript?.hook || 'Premium Sound Experience'}
              </div>
              <div className="text-[6px] text-white/90 drop-shadow">
                {firstScript?.scene_1?.action || 'Transform your audio experience'}
              </div>
            </div>
          </div>

          {/* Mobile UI */}
          <div className="bg-black px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="text-white text-[6px] font-medium">@premiumsound</div>
                <div className="text-gray-400 text-[5px]">{firstScript?.platform || 'TikTok'} • 2h</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="text-white text-[5px]">1.2K</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal and Full variants use the same layout (detailed video scripts)
  return (
    <div className="max-w-6xl mx-auto">
      {/* Clean, minimal layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side - Video Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-100 overflow-hidden bg-white">
            {/* Video Preview */}
            <div className="bg-gray-50 relative">
              <div className="relative aspect-[9/16]">
                {generatedVideoUrl ? (
                  <VideoPlayer
                    videoUrl={generatedVideoUrl}
                    posterUrl={activeCampaignResults?.generated_images?.[0]?.url || uploadedImage}
                    title="Generated Campaign Video"
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <>
                    {/* Video Thumbnail */}
                    {activeCampaignResults?.generated_images?.[0]?.url ? (
                      <img src={activeCampaignResults.generated_images[0].url} alt="Video thumbnail" className="w-full h-full object-cover" />
                    ) : uploadedImage ? (
                      <img src={uploadedImage} alt="Video thumbnail" className="w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center border border-black/10">
                        <Play className="w-5 h-5 text-black/60 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      0:15
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Platform Info - Simplified */}
          <div className="bg-white border border-gray-100 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Optimized For</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                <div className="w-6 h-6 bg-gray-900 rounded text-white text-xs flex items-center justify-center font-medium">
                  T
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">TikTok</p>
                  <p className="text-xs text-gray-500">9:16 • 15-60s</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                <div className="w-6 h-6 bg-gray-700 rounded text-white text-xs flex items-center justify-center font-medium">
                  IG
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Instagram Reels</p>
                  <p className="text-xs text-gray-500">9:16 • 15-90s</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Script Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeCampaignResults?.video_scripts?.map((script: any, index: number) => (
            <div key={index} className="bg-white border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {script.platform || 'Social Media'} Video Script
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {script.duration || '15-30s'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Hook */}
                {script.hook && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Hook (0-3s)</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">{script.hook}</p>
                    </div>
                  </div>
                )}

                {/* Scenes */}
                {[script.scene_1, script.scene_2, script.scene_3].filter(Boolean).map((scene: any, sceneIndex: number) => (
                  <div key={sceneIndex}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Scene {sceneIndex + 1} ({scene?.timing || `${3 + sceneIndex * 4}-${7 + sceneIndex * 4}s`})
                    </h4>
                    <div className="space-y-3">
                      {scene?.visual && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Visual</span>
                          <p className="text-sm text-gray-600 mt-1">{scene.visual}</p>
                        </div>
                      )}
                      {scene?.action && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Action</span>
                          <p className="text-sm text-gray-600 mt-1">{scene.action}</p>
                        </div>
                      )}
                      {scene?.voiceover && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Voiceover</span>
                          <div className="bg-blue-50 p-3 rounded-lg mt-1 border-l-4 border-blue-200">
                            <p className="text-sm text-blue-900 italic">"{scene.voiceover}"</p>
                          </div>
                        </div>
                      )}
                      {scene?.text_overlay && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Text Overlay</span>
                          <div className="bg-purple-50 p-3 rounded-lg mt-1 border-l-4 border-purple-200">
                            <p className="text-sm text-purple-900 font-medium">{scene.text_overlay}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Call to Action */}
                {script.cta && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Call to Action</h4>
                    <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                      <p className="text-sm text-green-900 font-medium">{script.cta}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};