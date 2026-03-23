"use client";

import { Settings, CreditCard, LayoutGrid } from "lucide-react";

interface TopBarProps {
  credits: number;
  onBuyCredits?: () => void;
  onLibrary?: () => void;
  onSettings?: () => void;
}

export default function TopBar({ credits, onBuyCredits, onLibrary, onSettings }: TopBarProps) {
  return (
    <div className="h-12 border-b border-[#2a2a2a] flex items-center justify-between px-5 shrink-0">
      {/* Left: trial indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[12px] font-medium text-white">TRIAL</span>
        <span className="text-[12px] text-[#555]">•</span>
        <span className="text-[12px] text-[#888]">22h left</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLibrary}
          className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Library
        </button>
        <div className="flex items-center gap-1.5 text-[12px] text-white">
          <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
            <CreditCard className="w-2.5 h-2.5 text-white" />
          </div>
          {credits} credits
        </div>
        <button
          onClick={onBuyCredits}
          className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[12px] text-white hover:bg-[#1a1a1a] transition-colors"
        >
          Buy credits
        </button>
        <button
          onClick={onSettings}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
