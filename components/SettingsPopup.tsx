"use client";

import { CreditCard, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ModeTab } from "./ModeTabs";

interface SettingsPopupProps {
  activeTab?: ModeTab;
  orientation: "portrait" | "landscape";
  duration: "10s" | "15s";
  quality: "standard" | "high";
  fastMode?: boolean;
  aspectRatio?: string;
  resolution?: string;
  onOrientationChange: (v: "portrait" | "landscape") => void;
  onDurationChange: (v: "10s" | "15s") => void;
  onQualityChange: (v: "standard" | "high") => void;
  onFastModeChange?: (v: boolean) => void;
  onAspectRatioChange?: (v: string) => void;
  onResolutionChange?: (v: string) => void;
  onClose: () => void;
}

export default function SettingsPopup({
  activeTab = "talking-avatar",
  orientation,
  duration,
  quality,
  fastMode = false,
  aspectRatio = "9:16",
  resolution = "1K",
  onOrientationChange,
  onDurationChange,
  onQualityChange,
  onFastModeChange,
  onAspectRatioChange,
  onResolutionChange,
  onClose,
}: SettingsPopupProps) {
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);

  const isImageTab = activeTab === "image";
  const title = isImageTab ? "Create Image Settings" : "Actor Settings";

  // Compute cost
  const cost = isImageTab
    ? resolution === "4K" ? 16 : resolution === "2K" ? 8 : 4
    : quality === "high" ? 10 : 5;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div className="absolute bottom-full left-0 mb-2 z-50 w-[260px] bg-[#1e1e22] border border-[#2a2a2a] rounded-xl p-4 shadow-2xl animate-fade-in">
        <h4 className="text-[14px] font-semibold text-white mb-4">{title}</h4>

        {isImageTab ? (
          <>
            {/* Aspect Ratio */}
            <div className="mb-4">
              <label className="text-[12px] text-white font-medium mb-2 block">
                Aspect Ratio
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowAspectDropdown(!showAspectDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#141416] border border-[#2a2a2a] rounded-lg text-[13px] text-white hover:border-[#444] transition-colors"
                >
                  {aspectRatio}
                  <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
                </button>
                {showAspectDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAspectDropdown(false)} />
                    <div className="absolute top-full left-0 mt-1 z-20 w-full bg-[#1e1e22] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-xl">
                      {["9:16", "1:1", "4:5", "16:9"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => {
                            onAspectRatioChange?.(ratio);
                            setShowAspectDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-[13px] text-left hover:bg-[#2a2a2a] transition-colors ${
                            aspectRatio === ratio ? "text-white font-medium" : "text-[#ccc]"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resolution */}
            <div className="mb-4">
              <label className="text-[12px] text-white font-medium mb-2 block">
                Resolution
              </label>
              <div className="flex gap-2">
                {["1K", "2K", "4K"].map((res) => (
                  <button
                    key={res}
                    onClick={() => onResolutionChange?.(res)}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      resolution === res
                        ? "bg-[#333] text-white"
                        : "bg-[#1a1a1a] text-[#666] hover:text-[#888]"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Fast mode */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-white font-medium">
                  Fast mode
                </label>
                <button
                  onClick={() => onFastModeChange?.(!fastMode)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    fastMode ? "bg-purple" : "bg-[#444]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      fastMode ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-[#666] mt-1">Fast mode may affect quality</p>
            </div>

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
          </>
        )}

        {/* Cost */}
        <div className="pt-1 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mt-2">
            <span className="text-[12px] text-[#888]">Cost</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
                <CreditCard className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[13px] text-white font-medium">
                {cost}/{isImageTab ? "img" : "vid"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
