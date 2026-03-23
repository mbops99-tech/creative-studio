"use client";

import { useState } from "react";
import type { ScriptData } from "@/lib/mock-data";
import {
  FileText,
  Image,
  Video,
  Download,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";

interface ScriptCardProps {
  data: ScriptData;
  onGenerateImage?: (shotName: string, action: string) => void;
  onGenerateVideo?: (shotName: string, script: string, action: string) => void;
  onGenerateBroll?: (shotName: string, action: string) => void;
}

export default function ScriptCard({ data, onGenerateImage, onGenerateVideo, onGenerateBroll }: ScriptCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-purple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Script + Shotlist
            </h3>
            <p className="text-[11px] text-muted">{data.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted bg-white/5 px-2 py-0.5 rounded-md">
            {data.shots.length} shots • Est. {data.totalCost}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </div>

      {expanded && (
        <>
          {/* Script text */}
          <div className="px-5 pb-4 border-t border-card-border pt-4">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-purple uppercase tracking-wider mb-1">
                  Hook
                </p>
                <p className="text-[13px] text-white/90 leading-relaxed">
                  &ldquo;{data.hook}&rdquo;
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-purple uppercase tracking-wider mb-1">
                  Body
                </p>
                <p className="text-[13px] text-white/70 leading-relaxed">
                  &ldquo;{data.body}&rdquo;
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-purple uppercase tracking-wider mb-1">
                  CTA
                </p>
                <p className="text-[13px] text-white/90 leading-relaxed font-medium">
                  &ldquo;{data.cta}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Shotlist table */}
          <div className="border-t border-card-border">
            <div className="px-5 py-2.5 flex items-center gap-2">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Shotlist
              </p>
            </div>
            <div className="px-3 pb-3">
              <div className="rounded-lg overflow-hidden border border-card-border">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="text-left px-3 py-2 text-muted font-medium">
                        Name
                      </th>
                      <th className="text-left px-3 py-2 text-muted font-medium">
                        Type
                      </th>
                      <th className="text-left px-3 py-2 text-muted font-medium">
                        Script / Action
                      </th>
                      <th className="text-left px-3 py-2 text-muted font-medium">
                        Cost
                      </th>
                      <th className="text-right px-3 py-2 text-muted font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.shots.map((shot, i) => (
                      <tr
                        key={shot.id}
                        className={`border-t border-card-border hover:bg-white/[0.02] transition-colors ${
                          i === 0 ? "bg-purple/[0.04]" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-white">
                            {shot.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              shot.type === "A-roll"
                                ? "bg-purple/20 text-purple"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {shot.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted max-w-[260px]">
                          <p className="truncate">
                            {shot.script || shot.action}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-muted">{shot.cost}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onGenerateImage?.(shot.name, shot.action)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-purple/20 text-muted hover:text-purple transition-all text-[11px]"
                            >
                              <Image className="w-3 h-3" />
                              Image
                            </button>
                            {shot.type === "A-roll" ? (
                              <button
                                onClick={() => onGenerateVideo?.(shot.name, shot.script, shot.action)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-purple/20 text-muted hover:text-purple transition-all text-[11px]"
                              >
                                <Video className="w-3 h-3" />
                                Video
                              </button>
                            ) : (
                              <button
                                onClick={() => onGenerateBroll?.(shot.name, shot.action)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-blue-500/20 text-muted hover:text-blue-400 transition-all text-[11px]"
                              >
                                <Play className="w-3 h-3" />
                                Motion
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-3 border-t border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple text-white text-[12px] font-medium hover:bg-purple-hover transition-colors">
                <Zap className="w-3.5 h-3.5" />
                Generate All
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download Script
              </button>
            </div>
            <p className="text-[11px] text-muted">
              Total est. {data.totalCost}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
