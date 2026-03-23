"use client";

import { useState, useRef } from "react";
import type { VideoData } from "@/lib/mock-data";
import {
  Video,
  Download,
  RefreshCw,
  Pencil,
  Play,
  Pause,
  Cpu,
  Clock,
  Monitor,
  Mic,
  Loader2,
} from "lucide-react";

interface VideoCardProps {
  data: VideoData & { videoUrl?: string; step?: string };
  onRegenerate?: () => void;
}

export default function VideoCard({ data, onRegenerate }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!data.videoUrl) return;
    const a = document.createElement("a");
    a.href = data.videoUrl;
    a.download = `video-${data.shotName}.mp4`;
    a.click();
  };

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Video className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Video — {data.shotName}
          </h3>
          <p className="text-[11px] text-muted">
            {data.status === "generating"
              ? data.step || "Generating... Estimated 2-3 minutes"
              : "Generation complete"}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex gap-5">
          {/* Video / Phone mockup */}
          <div className="relative w-[180px] shrink-0">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border-2 border-white/10 bg-black">
              {data.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={data.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onEnded={() => setIsPlaying(false)}
                    poster={data.thumbnailUrl}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/20"
                    onClick={togglePlay}
                    style={{ opacity: isPlaying ? 0 : 1 }}
                    onMouseEnter={(e) => {
                      if (isPlaying) (e.currentTarget as HTMLElement).style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      if (isPlaying) (e.currentTarget as HTMLElement).style.opacity = "0";
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {data.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {data.status === "generating" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                    </div>
                  )}
                  {data.status !== "generating" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Duration badge */}
              {data.duration && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
                  <span className="text-[11px] font-medium text-white">
                    {data.duration}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex-1 space-y-4 py-1">
            {/* Progress bar (if generating) */}
            {data.status === "generating" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted">
                    {data.step || "Progress"}
                  </span>
                  <span className="text-[12px] text-purple font-medium">
                    {data.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-purple rounded-full transition-all duration-700"
                    style={{ width: `${data.progress || 5}%` }}
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[12px]">
                <Cpu className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted">Engine:</span>
                <span className="text-white font-medium">{data.engine}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted">Duration:</span>
                <span className="text-white font-medium">{data.duration || "..."}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Monitor className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted">Resolution:</span>
                <span className="text-white font-medium">
                  {data.resolution}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Mic className="w-3.5 h-3.5 text-muted" />
                <span className="text-muted">Voice:</span>
                <span className="text-white font-medium">{data.voice}</span>
              </div>
            </div>

            {/* Cost */}
            <div className="bg-white/[0.03] rounded-lg px-3 py-2 inline-flex items-center gap-2">
              <span className="text-[11px] text-muted">Cost:</span>
              <span className="text-[13px] text-purple font-semibold">
                {data.cost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-card-border flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={!data.videoUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple text-white text-[12px] font-medium hover:bg-purple-hover transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors">
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
}
