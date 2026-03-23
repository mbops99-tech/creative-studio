"use client";

import { useState, useRef } from "react";
import { X, Upload, Sparkles, User, Image as ImageIcon } from "lucide-react";

interface CreateActorModalProps {
  onClose: () => void;
  onSave: (name: string, image: File | null) => void;
  onGenerate?: (prompt: string, aspectRatio: string, quality: string) => void;
}

export default function CreateActorModal({
  onClose,
  onSave,
  onGenerate,
}: CreateActorModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("upload");
  const [name, setName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate tab state
  const [genPrompt, setGenPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [genQuality, setGenQuality] = useState("4K");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center animate-fade-in">
      <div className="w-[480px] bg-[#1e1e22] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-[16px] font-semibold text-white">
            Create Your Own Actor
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#888] hover:text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-1">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-[#2a2a2a] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === "generate"
                ? "bg-[#2a2a2a] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>

        {activeTab === "upload" ? (
          <div className="p-5 space-y-4">
            {/* Name field */}
            <div>
              <label className="text-[12px] text-white font-medium mb-1.5 block">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter actor name..."
                  className="w-full bg-[#141418] border border-[#2a2a2a] rounded-lg pl-10 pr-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-purple/50"
                />
              </div>
            </div>

            {/* Upload area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-[200px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                dragOver
                  ? "border-purple bg-purple/5"
                  : "border-[#333] hover:border-[#555]"
              }`}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-auto object-contain rounded-lg"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[#555]" />
                  </div>
                  <p className="text-[13px] text-white">
                    Click, drop, or paste image
                  </p>
                  <p className="text-[11px] text-[#666]">
                    PNG, JPG, WebP (max 50MB)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] text-[#888] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(name, uploadedFile)}
                disabled={!name.trim() || !uploadedFile}
                className="px-4 py-2 rounded-lg bg-[#333] text-white text-[13px] font-medium hover:bg-[#444] disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Preview area */}
            <div className="bg-[#141418] rounded-xl h-[200px] flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-10 h-10 text-[#333]" />
              <p className="text-[13px] text-[#888]">
                Generated images appear here
              </p>
              <p className="text-[11px] text-[#555]">
                3 variations per generation
              </p>
            </div>

            {/* Prompt */}
            <div className="relative">
              <textarea
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="Describe your actor... (e.g., A professional woman in business attire)"
                rows={3}
                className="w-full bg-[#141418] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-purple/50 resize-none"
              />
              {/* Settings inside textarea area */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-[#222] text-[#aaa] text-[11px] rounded px-2 py-0.5 border-none outline-none cursor-pointer"
                >
                  <option value="9:16">9:16</option>
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                </select>
                <select
                  value={genQuality}
                  onChange={(e) => setGenQuality(e.target.value)}
                  className="bg-[#222] text-[#aaa] text-[11px] rounded px-2 py-0.5 border-none outline-none cursor-pointer"
                >
                  <option value="4K">4K</option>
                  <option value="HD">HD</option>
                </select>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex items-center justify-between pt-1">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-[#888] cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <button
                onClick={() => onGenerate?.(genPrompt, aspectRatio, genQuality)}
                disabled={!genPrompt.trim()}
                className="px-5 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
