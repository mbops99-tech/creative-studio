"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AdditionalPromptsPopupProps {
  positivePrompt: string;
  negativePrompt: string;
  onPositiveChange: (value: string) => void;
  onNegativeChange: (value: string) => void;
  onClose: () => void;
}

export default function AdditionalPromptsPopup({
  positivePrompt,
  negativePrompt,
  onPositiveChange,
  onNegativeChange,
  onClose,
}: AdditionalPromptsPopupProps) {
  const [localPositive, setLocalPositive] = useState(positivePrompt);
  const [localNegative, setLocalNegative] = useState(negativePrompt);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-50 w-[400px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[15px] font-semibold text-white">Additional Prompts</h4>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#666] hover:text-white transition-colors rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[12px] text-[#888] mb-4">
          Add optional prompts to guide the generation.
        </p>

        {/* Positive prompt */}
        <label className="text-[13px] text-white font-medium mb-2 block">
          Positive prompt <span className="text-[#666] font-normal italic">(optional)</span>
        </label>
        <textarea
          value={localPositive}
          onChange={(e) => setLocalPositive(e.target.value)}
          placeholder="Describe additional style, lighting, mood..."
          rows={3}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#4a90d9] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none resize-none transition-colors mb-4"
        />

        {/* Negative prompt */}
        <label className="text-[13px] text-white font-medium mb-2 block">
          Negative prompt <span className="text-[#666] font-normal italic">(optional)</span>
        </label>
        <textarea
          value={localNegative}
          onChange={(e) => setLocalNegative(e.target.value)}
          placeholder="What to avoid in the generation..."
          rows={3}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#4a90d9] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none resize-none transition-colors"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              onPositiveChange(localPositive);
              onNegativeChange(localNegative);
              onClose();
            }}
            className="px-4 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
