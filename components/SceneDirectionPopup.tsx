"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface SceneDirectionPopupProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function SceneDirectionPopup({
  value,
  onChange,
  onClose,
}: SceneDirectionPopupProps) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-50 w-[380px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[15px] font-semibold text-white">Scene Direction</h4>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#666] hover:text-white transition-colors rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[12px] text-[#888] mb-4">
          Describe the scene for your talking avatar{" "}
          <span className="text-[#666] italic">(optional)</span>
        </p>

        <label className="text-[13px] text-white font-medium mb-2 block">
          Scene prompt <span className="text-[#666] font-normal italic">(optional)</span>
        </label>
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Describe the scene, environment, lighting, mood..."
          rows={4}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#4a90d9] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none resize-none transition-colors"
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              onChange(localValue);
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
