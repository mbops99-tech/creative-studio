"use client";

import { useState, useRef } from "react";
import { GripVertical, ChevronUp, ChevronDown, Play, Pause, Trash2, Clock, Film } from "lucide-react";
import type { CompileClip } from "@/lib/api";

interface TimelineClip extends CompileClip {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface TimelineEditorProps {
  clips: TimelineClip[];
  onClipsChange: (clips: TimelineClip[]) => void;
  onPreviewClip?: (clip: TimelineClip) => void;
}

export default function TimelineEditor({
  clips,
  onClipsChange,
  onPreviewClip,
}: TimelineEditorProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalDuration = clips.reduce((sum, c) => sum + (c.duration || 0), 0);

  const moveClip = (index: number, direction: "up" | "down") => {
    const newClips = [...clips];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newClips.length) return;
    [newClips[index], newClips[swapIdx]] = [newClips[swapIdx], newClips[index]];
    // Recalculate start times
    let t = 0;
    for (const c of newClips) {
      c.startTime = t;
      t += c.duration || 0;
    }
    onClipsChange(newClips);
  };

  const removeClip = (index: number) => {
    const newClips = clips.filter((_, i) => i !== index);
    let t = 0;
    for (const c of newClips) {
      c.startTime = t;
      t += c.duration || 0;
    }
    onClipsChange(newClips);
  };

  const handlePreview = (clip: TimelineClip) => {
    if (previewingId === clip.id) {
      setPreviewingId(null);
      if (videoRef.current) videoRef.current.pause();
    } else {
      setPreviewingId(clip.id);
      onPreviewClip?.(clip);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
  };

  return (
    <div className="bg-[#141420] border border-[#1e1e3a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e3a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/20 flex items-center justify-center">
            <Film className="w-4 h-4 text-[#6C5CE7]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Timeline</h3>
            <p className="text-[11px] text-[#888]">
              {clips.length} clips • {formatTime(totalDuration)} total
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="px-5 py-4">
        {/* Visual timeline bar */}
        <div className="flex h-12 rounded-lg overflow-hidden mb-4 bg-[#0a0a0a] border border-[#1e1e3a]">
          {clips.map((clip) => {
            const widthPct = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 100 / clips.length;
            const isAroll = clip.type === "a-roll";
            return (
              <div
                key={clip.id}
                className={`flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all hover:brightness-110 border-r border-[#0a0a0a] last:border-r-0 ${
                  isAroll
                    ? "bg-[#6C5CE7]/30 text-[#6C5CE7]"
                    : "bg-blue-500/30 text-blue-400"
                } ${previewingId === clip.id ? "ring-2 ring-white/50 ring-inset" : ""}`}
                style={{ width: `${widthPct}%`, minWidth: "40px" }}
                onClick={() => handlePreview(clip)}
                title={`${clip.name} (${formatTime(clip.duration)})`}
              >
                <span className="truncate px-1">{clip.name}</span>
              </div>
            );
          })}
        </div>

        {/* Clip list */}
        <div className="space-y-1.5">
          {clips.map((clip, idx) => {
            const isAroll = clip.type === "a-roll";
            return (
              <div
                key={clip.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  previewingId === clip.id
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/[0.03] border border-transparent hover:bg-white/[0.06]"
                }`}
              >
                {/* Grip */}
                <GripVertical className="w-3.5 h-3.5 text-[#555] shrink-0" />

                {/* Type badge */}
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                    isAroll
                      ? "bg-[#6C5CE7]/20 text-[#6C5CE7]"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {clip.type}
                </div>

                {/* Name */}
                <span className="text-[12px] text-white font-medium flex-1 truncate">
                  {clip.name}
                </span>

                {/* Duration */}
                <div className="flex items-center gap-1 text-[11px] text-[#888] shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatTime(clip.duration)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handlePreview(clip)}
                    className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors"
                    title="Preview"
                  >
                    {previewingId === clip.id ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => moveClip(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveClip(idx, "down")}
                    disabled={idx === clips.length - 1}
                    className="p-1.5 rounded hover:bg-white/10 text-[#888] hover:text-white transition-colors disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeClip(idx)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-[#888] hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {clips.length === 0 && (
          <div className="text-center py-8 text-[#555] text-[13px]">
            No clips added yet. Generate videos from your script first.
          </div>
        )}
      </div>

      {/* Preview area */}
      {previewingId && (
        <div className="px-5 pb-4">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={clips.find((c) => c.id === previewingId)?.videoUrl}
              className="w-full max-h-[200px] object-contain"
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </div>
  );
}
