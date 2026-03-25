"use client";

import { useState, useRef } from "react";
import type { VideoData } from "@/lib/mock-data";
import {
  Download,
  RefreshCw,
  Play,
  Pause,
  Cpu,
  Clock,
  Monitor,
  Mic,
  Loader2,
} from "lucide-react";

interface VideoWorkspaceProps {
  data: VideoData & { videoUrl?: string; step?: string };
  onRegenerate?: () => void;
}

export default function VideoWorkspace({ data, onRegenerate }: VideoWorkspaceProps) {
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
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Video player area */}
      <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-black rounded-t-2xl overflow-hidden">
        {data.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={data.videoUrl}
              className="w-full h-full object-contain"
              loop
              playsInline
              onEnded={() => setIsPlaying(false)}
              poster={data.thumbnailUrl}
            />
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity"
              onClick={togglePlay}
              style={{ opacity: isPlaying ? 0 : 1 }}
              onMouseEnter={(e) => { if (isPlaying) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { if (isPlaying) (e.currentTarget as HTMLElement).style.opacity = "0"; }}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" />
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <Loader2 className="w-10 h-10 text-rose-400 animate-spin mb-3" />
                <p className="text-[14px] text-white font-medium">{data.step || "Generating..."}</p>
                <p className="text-[12px] text-white/60 mt-1">{data.progress}% complete</p>
              </div>
            )}
          </>
        )}
        {/* Duration badge */}
        {data.duration && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span className="text-[12px] font-medium text-white">{data.duration}</span>
          </div>
        )}
      </div>

      {/* Progress bar (if generating) */}
      {data.status === "generating" && (
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[#888]">{data.step || "Processing..."}</span>
            <span className="text-[12px] text-purple font-medium">{data.progress}%</span>
          </div>
          <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-purple rounded-full transition-all duration-700"
              style={{ width: `${data.progress || 5}%` }}
            />
          </div>
        </div>
      )}

      {/* Info panel */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-[12px]">
            <Cpu className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[#888]">Engine:</span>
            <span className="text-white font-medium">{data.engine}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Clock className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[#888]">Duration:</span>
            <span className="text-white font-medium">{data.duration || "..."}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Monitor className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[#888]">Resolution:</span>
            <span className="text-white font-medium">{data.resolution}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Mic className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[#888]">Voice:</span>
            <span className="text-white font-medium">{data.voice}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-[#2a2a2a] flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={!data.videoUrl}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#222] border border-[#333] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
