"use client";

import { Loader2, RefreshCw } from "lucide-react";

interface ResultCardProps {
  type: "script" | "image" | "video" | "broll" | "voice";
  title: string;
  subtitle?: string;
  status: "generating" | "complete" | "failed";
  progress?: number;
  step?: string;
  onRegenerate?: () => void;
  children: React.ReactNode;
}

export default function ResultCard({
  type,
  title,
  subtitle,
  status,
  progress,
  step,
  onRegenerate,
  children,
}: ResultCardProps) {
  const typeColors: Record<string, string> = {
    script: "bg-purple/20 text-purple",
    image: "bg-emerald-500/20 text-emerald-400",
    video: "bg-rose-500/20 text-rose-400",
    broll: "bg-blue-500/20 text-blue-400",
    voice: "bg-amber-500/20 text-amber-400",
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[type]}`}
          >
            {status === "generating" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-4 h-4 text-current">✓</div>
            )}
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-[#888]">{subtitle}</p>
            )}
          </div>
        </div>
        {onRegenerate && status === "complete" && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-[11px] hover:bg-white/10 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>

      {/* Progress bar */}
      {status === "generating" && progress !== undefined && (
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#888]">
              {step || "Processing..."}
            </span>
            <span className="text-[11px] text-purple font-medium">
              {progress}%
            </span>
          </div>
          <div className="h-1 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple to-rose-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
