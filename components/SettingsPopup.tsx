"use client";

import { CreditCard } from "lucide-react";

interface SettingsPopupProps {
  orientation: "portrait" | "landscape";
  duration: "10s" | "15s";
  quality: "standard" | "high";
  onOrientationChange: (v: "portrait" | "landscape") => void;
  onDurationChange: (v: "10s" | "15s") => void;
  onQualityChange: (v: "standard" | "high") => void;
  onClose: () => void;
}

export default function SettingsPopup({
  orientation,
  duration,
  quality,
  onOrientationChange,
  onDurationChange,
  onQualityChange,
  onClose,
}: SettingsPopupProps) {
  const cost = quality === "high" ? 10 : 5;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div className="absolute bottom-full left-0 mb-2 z-50 w-[240px] bg-[#1e1e22] border border-[#2a2a2a] rounded-xl p-4 shadow-2xl animate-fade-in">
        <h4 className="text-[14px] font-semibold text-white mb-4">Settings</h4>

        {/* Orientation */}
        <div className="mb-4">
          <label className="text-[12px] text-white font-medium mb-2 block">
            Orientation
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onOrientationChange("portrait")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                orientation === "portrait"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => onOrientationChange("landscape")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                orientation === "landscape"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="text-[12px] text-white font-medium mb-2 block">
            Duration
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onDurationChange("10s")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                duration === "10s"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              10s
            </button>
            <button
              onClick={() => onDurationChange("15s")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                duration === "15s"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              15s
            </button>
          </div>
        </div>

        {/* Quality */}
        <div className="mb-4">
          <label className="text-[12px] text-white font-medium mb-2 block">
            Quality
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onQualityChange("standard")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                quality === "standard"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => onQualityChange("high")}
              className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                quality === "high"
                  ? "bg-[#333] text-white"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
              }`}
            >
              High
            </button>
          </div>
        </div>

        {/* Cost */}
        <div>
          <label className="text-[12px] text-white font-medium mb-1.5 block">
            Cost
          </label>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
              <CreditCard className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[13px] text-white font-medium">{cost} credits</span>
          </div>
        </div>
      </div>
    </>
  );
}
