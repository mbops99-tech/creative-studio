"use client";

import { useState, useRef } from "react";
import {
  ChevronDown,
  Sparkles,
  Users,
  RectangleHorizontal,
  SlidersHorizontal,
  Upload,
  Minus,
  Plus,
  ArrowUp,
  CreditCard,
  Check,
  X,
  Info,
} from "lucide-react";
import type { Actor } from "@/lib/api";
import type { ModeTab } from "./ModeTabs";
import SettingsPopup from "./SettingsPopup";

interface Model {
  id: string;
  name: string;
  description: string;
  costPerUnit: number;
  unit: string;
}

const MODELS: Model[] = [
  {
    id: "comfyui",
    name: "ComfyUI",
    description: "Local image generation pipeline",
    costPerUnit: 2,
    unit: "image",
  },
  {
    id: "sadtalker",
    name: "SadTalker",
    description: "Talking head video generation",
    costPerUnit: 5,
    unit: "video",
  },
  {
    id: "kling",
    name: "Kling 2.6",
    description: "High quality video generation with audio",
    costPerUnit: 10,
    unit: "video",
  },
];

interface PromptBarProps {
  activeTab: ModeTab;
  selectedActors: Actor[];
  onOpenActorGallery: () => void;
  onRemoveActor: (actorId: string) => void;
  onSubmit: (prompt: string, model: string, quantity: number, settings: PromptSettings) => void;
  isGenerating: boolean;
}

export interface PromptSettings {
  orientation: "portrait" | "landscape";
  duration: "10s" | "15s";
  quality: "standard" | "high";
}

export default function PromptBar({
  activeTab,
  selectedActors,
  onOpenActorGallery,
  onRemoveActor,
  onSubmit,
  isGenerating,
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [settings, setSettings] = useState<PromptSettings>({
    orientation: "portrait",
    duration: "10s",
    quality: "standard",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders: Record<ModeTab, string> = {
    script:
      "Describe your UGC ad concept. Include product, target audience, and key message...",
    "talking-avatar":
      "Describe the video you want to create. You can also drop or paste images directly here.",
    image: "Describe the image you want to generate...",
    more: "Describe what you want to create...",
  };

  const cost = selectedModel.costPerUnit * quantity;

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    onSubmit(prompt, selectedModel.id, quantity, settings);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-[680px] mx-auto">
      <div
        className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-colors ${
          isGenerating
            ? "border-purple/50 pulse-glow"
            : "border-[#2a2a2a] focus-within:border-[#444]"
        }`}
      >
        {/* Text area */}
        <div className="px-4 pt-4 pb-2">
          {/* Selected actors */}
          {selectedActors.length > 0 && (
            <div className="flex gap-2 mb-3">
              {selectedActors.map((actor) => (
                <div
                  key={actor.id}
                  className="relative w-14 h-[72px] rounded-lg overflow-hidden border border-[#2a2a2a] group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={actor.imageUrl}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onRemoveActor(actor.id)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[activeTab]}
            rows={3}
            className="w-full bg-transparent text-[14px] text-white placeholder:text-[#555] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222] text-[12px] font-medium text-white hover:bg-[#2a2a2a] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple" />
                {selectedModel.name}
                <ChevronDown className="w-3 h-3 text-[#888]" />
              </button>

              {/* Model dropdown */}
              {showModelDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModelDropdown(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-[280px] bg-[#1e1e22] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#222] transition-colors text-left"
                      >
                        <div className="mt-0.5">
                          {selectedModel.id === model.id ? (
                            <Check className="w-4 h-4 text-purple" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium text-white">
                              {model.name}
                            </span>
                            <Info className="w-3 h-3 text-[#555]" />
                          </div>
                          <p className="text-[11px] text-[#666] mt-0.5">
                            {model.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
                            <CreditCard className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-[11px] text-[#888]">
                            {model.costPerUnit}/{model.unit}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actor button */}
            <div className="relative group">
              <button
                onClick={onOpenActorGallery}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  selectedActors.length > 0
                    ? "text-purple bg-purple/10"
                    : "text-[#555] hover:text-[#888] hover:bg-[#222]"
                }`}
              >
                <Users className="w-4 h-4" />
                {selectedActors.length > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Add actor
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
              </div>
            </div>

            {/* Aspect ratio */}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-[#888] hover:bg-[#222] transition-colors">
              <RectangleHorizontal className="w-4 h-4" />
            </button>

            {/* Settings */}
            <div className="relative">
              <div className="relative group">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-[#888] hover:bg-[#222] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Settings
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                </div>
              </div>

              {showSettings && (
                <SettingsPopup
                  orientation={settings.orientation}
                  duration={settings.duration}
                  quality={settings.quality}
                  onOrientationChange={(v) =>
                    setSettings((s) => ({ ...s, orientation: v }))
                  }
                  onDurationChange={(v) =>
                    setSettings((s) => ({ ...s, duration: v }))
                  }
                  onQualityChange={(v) =>
                    setSettings((s) => ({ ...s, quality: v }))
                  }
                  onClose={() => setShowSettings(false)}
                />
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Character count */}
            <span className="text-[11px] text-[#555]">
              {prompt.length} / 10,000
            </span>

            {/* Quantity selector */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#222] transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[13px] text-white font-medium w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#222] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Generate button */}
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple text-white text-[12px] font-medium hover:bg-purple-hover disabled:opacity-40 transition-all"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
                <CreditCard className="w-2.5 h-2.5 text-white" />
              </div>
              {cost}
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
