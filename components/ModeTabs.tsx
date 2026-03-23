"use client";

import { Video, User, ImageIcon, MoreHorizontal } from "lucide-react";

export type ModeTab = "script" | "talking-avatar" | "image" | "more";

interface ModeTabsProps {
  activeTab: ModeTab;
  onTabChange: (tab: ModeTab) => void;
}

const tabs: { id: ModeTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "script",
    label: "Create Video",
    icon: <Video className="w-4 h-4" />,
  },
  {
    id: "talking-avatar",
    label: "Talking Avatar",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "image",
    label: "Image",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: "more",
    label: "+ More",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
];

export default function ModeTabs({ activeTab, onTabChange }: ModeTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all ${
            activeTab === tab.id
              ? "bg-white text-black"
              : "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:text-white hover:border-[#444]"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
