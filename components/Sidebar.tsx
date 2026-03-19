"use client";

import { useState } from "react";
import { MOCK_PROJECTS, type Project } from "@/lib/mock-data";
import {
  Plus,
  Settings,
  Sparkles,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

interface SidebarProps {
  activeProject: string;
  onSelectProject: (id: string) => void;
}

export default function Sidebar({
  activeProject,
  onSelectProject,
}: SidebarProps) {
  const [projects] = useState<Project[]>(MOCK_PROJECTS);

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-sidebar border-r border-card-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-card-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">
              Creative Studio
            </h1>
            <p className="text-[10px] text-muted">v5.0</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider">
            Projects
          </p>
        </div>
        <div className="space-y-0.5 px-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group ${
                activeProject === project.id
                  ? "bg-purple/15 text-white"
                  : "text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{project.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">
                  {project.name}
                </p>
                <p className="text-[10px] text-muted">{project.updatedAt}</p>
              </div>
              {activeProject === project.id && (
                <ChevronRight className="w-3.5 h-3.5 text-purple shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="p-3 space-y-1 border-t border-card-border">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-purple hover:bg-purple/10 transition-all text-[13px] font-medium">
          <Plus className="w-4 h-4" />
          New Project
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted hover:bg-white/5 hover:text-white transition-all text-[13px]">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
