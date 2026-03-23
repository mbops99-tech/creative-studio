"use client";

import { Settings, Coins, LayoutGrid, Clock } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[12px] font-semibold text-white tracking-wide">TRIAL</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-[#888]">
          <Clock className="w-3 h-3" />
          22h left
        </div>
        <button className="px-3 py-1 rounded-full bg-[#D03030] text-white text-[11px] font-medium hover:bg-[#e03535] transition-colors">
          Subscribe now
        </button>
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
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
            <Coins className="w-2.5 h-2.5 text-amber-900" />
          </div>
          {credits} credits
        </div>
        <button
          onClick={onBuyCredits}
          className="px-3 py-1.5 rounded-full border border-[#333] text-[12px] text-white hover:bg-[#1a1a1a] transition-colors"
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
