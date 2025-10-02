import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer = ({ videoUrl, posterUrl, title = "AI Generated Video", className = "" }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Video failed to load:', videoUrl);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  if (hasError) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-xl mb-2">⚠️</div>
          <p className="text-sm">Failed to load video</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(videoUrl, '_blank')}>
            Open in new tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`aspect-video bg-black rounded-lg overflow-hidden relative group ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterUrl}
        onLoadedData={handleVideoLoad}
        onLoadedMetadata={handleVideoLoad}
        onError={handleVideoError}
        onPlay={handlePlay}
        onPause={handlePause}
        preload="metadata"
        controls
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        aria-label={title}
        src={videoUrl}
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Overlay (visual only, doesn't block controls) */}
      {!isLoading && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20">
          {title && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-start">
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {title}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
};