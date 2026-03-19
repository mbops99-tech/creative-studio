"use client";

import { useState } from "react";
import type { ImageVariation } from "@/lib/mock-data";
import {
  Image as ImageIcon,
  Check,
  RefreshCw,
  Pencil,
  ArrowRight,
} from "lucide-react";

interface ImageCardProps {
  shotName: string;
  variations: ImageVariation[];
}

export default function ImageCard({ shotName, variations }: ImageCardProps) {
  const [selected, setSelected] = useState<string | null>(
    variations.find((v) => v.selected)?.id || null
  );
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            First Frame — {shotName}
          </h3>
          <p className="text-[11px] text-muted">
            4 variations generated • Click to select
          </p>
        </div>
      </div>

      {/* Image grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-4 gap-2.5">
          {variations.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                selected === v.id
                  ? "border-purple shadow-lg shadow-purple/20"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.url}
                alt={`Variation ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Variation number */}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[10px] font-medium text-white">
                  {i + 1}
                </span>
              </div>
              {/* Selected check */}
              {selected === v.id && (
                <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {selected && (
        <div className="px-5 py-3 border-t border-card-border">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple text-white text-[12px] font-medium hover:bg-purple-hover transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              Use This
            </button>
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          {showEdit && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Describe changes..."
                className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-muted/60 focus:outline-none focus:border-purple/50 transition-colors"
              />
              <button className="px-3 py-2 rounded-lg bg-purple text-white text-[12px] font-medium hover:bg-purple-hover transition-colors">
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
