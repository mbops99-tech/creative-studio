"use client";

import { useState } from "react";
import type { ImageVariation } from "@/lib/mock-data";
import {
  Image as ImageIcon,
  Check,
  RefreshCw,
  Pencil,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ImageCardProps {
  shotName: string;
  variations: ImageVariation[];
  onEdit?: (imageUrl: string, prompt: string) => void;
  onRegenerate?: () => void;
}

export default function ImageCard({ shotName, variations, onEdit, onRegenerate }: ImageCardProps) {
  const [selected, setSelected] = useState<string | null>(
    variations.find((v) => v.selected)?.id || null
  );
  const [showEdit, setShowEdit] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleApplyEdit = () => {
    if (!editPrompt.trim() || !selected) return;
    const selectedVar = variations.find((v) => v.id === selected);
    if (selectedVar && onEdit) {
      setIsEditing(true);
      onEdit(selectedVar.url, editPrompt);
      setEditPrompt("");
      setShowEdit(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#141420] border border-[#1e1e3a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            First Frame — {shotName}
          </h3>
          <p className="text-[11px] text-[#888]">
            {variations.length} variations generated • Click to select
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
                  ? "border-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/20"
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
                <div className="absolute inset-0 bg-[#6C5CE7]/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center">
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
        <div className="px-5 py-3 border-t border-[#1e1e3a]">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-medium hover:bg-[#5A4BD1] transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              Use This
            </button>
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Magic Edit
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#888] text-[12px] font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            )}
          </div>

          {showEdit && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyEdit()}
                placeholder="Describe changes (e.g. 'make her look more natural, messy hair')..."
                className="flex-1 bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#6C5CE7]/50 transition-colors"
              />
              <button
                onClick={handleApplyEdit}
                disabled={!editPrompt.trim() || isEditing}
                className="px-3 py-2 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-medium hover:bg-[#5A4BD1] disabled:opacity-50 transition-colors"
              >
                {isEditing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
