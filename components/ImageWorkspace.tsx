"use client";

import { useState } from "react";
import type { ImageVariation } from "@/lib/mock-data";
import { Download, RefreshCw, Pencil, Check, ZoomIn, X } from "lucide-react";

interface ImageWorkspaceProps {
  variations: ImageVariation[];
  onEdit?: (imageUrl: string, prompt: string) => void;
  onRegenerate?: () => void;
}

export default function ImageWorkspace({ variations, onEdit, onRegenerate }: ImageWorkspaceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleDownload = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-${index + 1}.png`;
    a.click();
  };

  return (
    <>
      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {variations.map((v, i) => {
          const isSelected = selected === v.id;
          const isHovered = hoveredId === v.id;
          return (
            <div
              key={v.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(v.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => setSelected(isSelected ? null : v.id)}
                className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 shadow-lg shadow-blue-500/20"
                    : "border-transparent hover:border-[#444]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.url}
                  alt={`Generated image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Variation number */}
                <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[12px] font-semibold text-white">{i + 1}</span>
                </div>
                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Hover overlay actions */}
              {isHovered && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 animate-fade-in">
                  <button
                    onClick={() => setLightboxUrl(v.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[12px] hover:bg-black/80 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(v.url, i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[12px] hover:bg-black/80 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[12px] hover:bg-black/80 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection actions bar */}
      {selected && (
        <div className="mt-4 flex items-center justify-center gap-3 animate-fade-in">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors">
            <Check className="w-4 h-4" />
            Use Selected
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[13px] font-medium hover:bg-[#222] transition-colors">
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => {
              const v = variations.find(v => v.id === selected);
              if (v) handleDownload(v.url, variations.indexOf(v));
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[13px] font-medium hover:bg-[#222] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-[85vw] max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
