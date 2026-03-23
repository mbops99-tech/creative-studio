"use client";

import { useState } from "react";
import {
  Sparkles,
  Video,
  FolderOpen,
  Settings,
  Plus,
  Zap,
  ExternalLink,
  User,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  icon: string;
  updatedAt: string;
}

interface SidebarProps {
  projects: Project[];
  activeProject: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  activeNav: "create" | "library" | "settings";
  onNavChange: (nav: "create" | "library" | "settings") => void;
}

export default function Sidebar({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  activeNav,
  onNavChange,
}: SidebarProps) {
  return (
    <div className="w-[200px] h-screen bg-[#111] border-r border-[#2a2a2a] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Speel
        </span>
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-0.5">
        <button
          onClick={() => onNavChange("create")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            activeNav === "create"
              ? "bg-[#1a1a1e] text-white"
              : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Create
        </button>
        <button
          onClick={() => onNavChange("settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            activeNav === "settings"
              ? "bg-[#1a1a1e] text-white"
              : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Projects Section */}
      <div className="mt-6 flex-1 overflow-hidden flex flex-col">
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-[#555] uppercase tracking-wider">
            Projects
          </span>
          <button
            onClick={onNewProject}
            className="w-5 h-5 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors ${
                activeProject === project.id
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upgrade Card */}
      <div className="p-3">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[12px] font-semibold text-white">Upgrade</span>
          </div>
          <p className="text-[11px] text-[#666] leading-relaxed mb-3">
            Unlock faster generation, higher resolution, and priority queue access.
          </p>
          <button className="flex items-center gap-1 text-[11px] text-[#888] hover:text-white transition-colors">
            Learn more
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="px-3 py-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-purple/30 flex items-center justify-center text-[12px] font-bold text-purple">
            M
          </div>
          <span className="text-[12px] text-[#888]">My workspace</span>
        </div>
      </div>
    </div>
  );
}
