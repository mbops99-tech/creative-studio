"use client";

import { useState, useRef } from "react";
import {
  ChevronDown,
  Sparkles,
  Users,
  SlidersHorizontal,
  Upload,
  Minus,
  Plus,
  ArrowUp,
  CreditCard,
  Check,
  X,
  Info,
  Clapperboard,
  Music,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { Actor } from "@/lib/api";
import type { ModeTab } from "./ModeTabs";
import SettingsPopup from "./SettingsPopup";
import SceneDirectionPopup from "./SceneDirectionPopup";
import AdditionalPromptsPopup from "./AdditionalPromptsPopup";
import AudioSourceModal from "./AudioSourceModal";

// --- Model definitions per tab ---
interface Model {
  id: string;
  name: string;
  description: string;
  costPerUnit: number;
  unit: string;
}

const AVATAR_MODELS: Model[] = [
  {
    id: "speel-video",
    name: "Speel Video",
    description: "Standard lip sync model by Speel. Takes longer to create. Up to 1 min video length",
    costPerUnit: 100,
    unit: "video",
  },
  {
    id: "omnihuman",
    name: "OmniHuman 1.5",
    description: "Fast film-grade lip sync model by ByteDance. 35s video length",
    costPerUnit: 7,
    unit: "second",
  },
  {
    id: "wan",
    name: "Wan 2.6",
    description: "Fast lip sync with scene control. 15s max, 720p/1080p",
    costPerUnit: 4,
    unit: "second",
  },
];

const IMAGE_MODELS: Model[] = [
  {
    id: "comfyui",
    name: "ComfyUI",
    description: "Local image generation pipeline. Free to use.",
    costPerUnit: 0,
    unit: "img",
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Cloud-based image generation ($0.05/img)",
    costPerUnit: 5,
    unit: "img",
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
  fastMode?: boolean;
  aspectRatio?: string;
  resolution?: string;
  sceneDirection?: string;
  positivePrompt?: string;
  negativePrompt?: string;
  audioSource?: {
    type: string;
    script?: string;
    voiceId?: string;
    voiceName?: string;
  };
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
  
  // Avatar models
  const [avatarModel, setAvatarModel] = useState<Model>(AVATAR_MODELS[1]);
  const [imageModel, setImageModel] = useState<Model>(IMAGE_MODELS[0]);
  
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSceneDirection, setShowSceneDirection] = useState(false);
  const [showAdditionalPrompts, setShowAdditionalPrompts] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const [settings, setSettings] = useState<PromptSettings>({
    orientation: "portrait",
    duration: "10s",
    quality: "standard",
    fastMode: false,
    aspectRatio: "9:16",
    resolution: "1K",
    sceneDirection: "",
    positivePrompt: "",
    negativePrompt: "",
  });

  const [audioSource, setAudioSource] = useState<{
    type: string;
    script?: string;
    voiceId?: string;
    voiceName?: string;
  } | null>(null);

  // Upload ref for image tab
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current models/model based on tab
  const currentModels = activeTab === "talking-avatar" ? AVATAR_MODELS : IMAGE_MODELS;
  const selectedModel = activeTab === "talking-avatar" ? avatarModel : imageModel;
  const setSelectedModel = activeTab === "talking-avatar"
    ? (m: Model) => setAvatarModel(m)
    : (m: Model) => setImageModel(m);

  const placeholders: Record<ModeTab, string> = {
    script: "Describe your product and target audience...",
    "talking-avatar": "Describe the video you want to create. You can also drop or paste images directly here.",
    image: "Describe the image you want to create...",
    more: "Describe what you want to create...",
  };

  // Cost calculation
  const cost = selectedModel.costPerUnit * quantity;

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    onSubmit(prompt, selectedModel.id, quantity, { ...settings, audioSource: audioSource || undefined });
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setUploadedImageUrl(URL.createObjectURL(file));
  };

  // --- Render toolbar based on active tab ---
  const renderToolbar = () => {
    switch (activeTab) {
      case "script":
        return renderScriptToolbar();
      case "talking-avatar":
        return renderAvatarToolbar();
      case "image":
        return renderImageToolbar();
      case "more":
        return renderMoreToolbar();
      default:
        return null;
    }
  };

  // --- SCRIPT TAB: minimal toolbar ---
  const renderScriptToolbar = () => (
    <div className="px-3 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222] text-[12px] text-[#888]">
          <Sparkles className="w-3.5 h-3.5 text-purple" />
          Claude
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple text-white text-[12px] font-medium hover:bg-purple-hover disabled:opacity-40 transition-all"
        >
          Generate
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // --- TALKING AVATAR TAB: full toolbar ---
  const renderAvatarToolbar = () => (
    <div className="px-3 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
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
          {showModelDropdown && renderModelDropdown()}
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        {/* Actor button */}
        <ToolbarButton
          active={selectedActors.length > 0}
          tooltip="Add actor"
          onClick={onOpenActorGallery}
          badge={selectedActors.length > 0}
        >
          <Users className="w-4 h-4" />
        </ToolbarButton>

        {/* Scene Direction */}
        <div className="relative">
          <ToolbarButton
            active={!!settings.sceneDirection}
            tooltip="Scene direction"
            onClick={() => setShowSceneDirection(!showSceneDirection)}
          >
            <Clapperboard className="w-4 h-4" />
          </ToolbarButton>
          {showSceneDirection && (
            <SceneDirectionPopup
              value={settings.sceneDirection || ""}
              onChange={(v) => setSettings((s) => ({ ...s, sceneDirection: v }))}
              onClose={() => setShowSceneDirection(false)}
            />
          )}
        </div>

        {/* Audio Source */}
        <ToolbarButton
          active={!!audioSource}
          tooltip="Audio source"
          onClick={() => setShowAudioModal(true)}
        >
          <Music className="w-4 h-4" />
        </ToolbarButton>

        {/* Additional Prompts */}
        <div className="relative">
          <ToolbarButton
            active={!!(settings.positivePrompt || settings.negativePrompt)}
            tooltip="Additional prompts"
            onClick={() => setShowAdditionalPrompts(!showAdditionalPrompts)}
          >
            <FileText className="w-4 h-4" />
          </ToolbarButton>
          {showAdditionalPrompts && (
            <AdditionalPromptsPopup
              positivePrompt={settings.positivePrompt || ""}
              negativePrompt={settings.negativePrompt || ""}
              onPositiveChange={(v) => setSettings((s) => ({ ...s, positivePrompt: v }))}
              onNegativeChange={(v) => setSettings((s) => ({ ...s, negativePrompt: v }))}
              onClose={() => setShowAdditionalPrompts(false)}
            />
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <ToolbarButton tooltip="Settings" onClick={() => setShowSettings(!showSettings)}>
            <SlidersHorizontal className="w-4 h-4" />
          </ToolbarButton>
          {showSettings && (
            <SettingsPopup
              activeTab="talking-avatar"
              orientation={settings.orientation}
              duration={settings.duration}
              quality={settings.quality}
              fastMode={settings.fastMode}
              onOrientationChange={(v) => setSettings((s) => ({ ...s, orientation: v }))}
              onDurationChange={(v) => setSettings((s) => ({ ...s, duration: v }))}
              onQualityChange={(v) => setSettings((s) => ({ ...s, quality: v }))}
              onFastModeChange={(v) => setSettings((s) => ({ ...s, fastMode: v }))}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-[#555]">{prompt.length} / 10,000</span>
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={4} />
        <GenerateButton cost={cost} unit={selectedModel.unit} onClick={handleSubmit} disabled={!prompt.trim() || isGenerating} />
      </div>
    </div>
  );

  // --- IMAGE TAB: medium toolbar ---
  const renderImageToolbar = () => (
    <div className="px-3 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222] text-[12px] font-medium text-white hover:bg-[#2a2a2a] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {selectedModel.name}
            <ChevronDown className="w-3 h-3 text-[#888]" />
          </button>
          {showModelDropdown && renderModelDropdown()}
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        {/* Upload image */}
        <input
          ref={imageUploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <ToolbarButton
          active={!!uploadedImage}
          tooltip="Upload image"
          onClick={() => imageUploadRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
        </ToolbarButton>

        {/* Settings */}
        <div className="relative">
          <ToolbarButton tooltip="Settings" onClick={() => setShowSettings(!showSettings)}>
            <SlidersHorizontal className="w-4 h-4" />
          </ToolbarButton>
          {showSettings && (
            <SettingsPopup
              activeTab="image"
              orientation={settings.orientation}
              duration={settings.duration}
              quality={settings.quality}
              aspectRatio={settings.aspectRatio}
              resolution={settings.resolution}
              onOrientationChange={(v) => setSettings((s) => ({ ...s, orientation: v }))}
              onDurationChange={(v) => setSettings((s) => ({ ...s, duration: v }))}
              onQualityChange={(v) => setSettings((s) => ({ ...s, quality: v }))}
              onAspectRatioChange={(v) => setSettings((s) => ({ ...s, aspectRatio: v }))}
              onResolutionChange={(v) => setSettings((s) => ({ ...s, resolution: v }))}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-[#555]">{prompt.length} / 10,000</span>
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={8} />
        <GenerateButton cost={cost} unit={selectedModel.unit} onClick={handleSubmit} disabled={!prompt.trim() || isGenerating} />
      </div>
    </div>
  );

  // --- MORE TAB: simple toolbar ---
  const renderMoreToolbar = () => (
    <div className="px-3 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222] text-[12px] text-[#888]">
          <Sparkles className="w-3.5 h-3.5 text-purple" />
          Auto
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple text-white text-[12px] font-medium hover:bg-purple-hover disabled:opacity-40 transition-all"
        >
          Generate
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // --- Model dropdown (shared) ---
  const renderModelDropdown = () => (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
      <div className="absolute bottom-full left-0 mb-2 z-50 w-[300px] bg-[#1e1e22] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {currentModels.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              setSelectedModel(model);
              setShowModelDropdown(false);
            }}
            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#252528] transition-colors text-left ${
              selectedModel.id === model.id ? "bg-[#252528]" : ""
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {selectedModel.id === model.id ? (
                <Check className="w-4 h-4 text-purple" />
              ) : (
                <div className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-white">{model.name}</span>
                <Info className="w-3 h-3 text-[#555]" />
              </div>
              <p className="text-[11px] text-[#666] mt-0.5 leading-snug">{model.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
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
  );

  return (
    <>
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
            {/* Selected actors (avatar tab) */}
            {activeTab === "talking-avatar" && selectedActors.length > 0 && (
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

            {/* Uploaded image (image tab) */}
            {activeTab === "image" && uploadedImageUrl && (
              <div className="flex gap-2 mb-3">
                <div className="relative w-14 h-[72px] rounded-lg overflow-hidden border border-[#2a2a2a] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedImageUrl(null);
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Audio source indicator */}
            {activeTab === "talking-avatar" && audioSource && (
              <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 bg-purple/10 border border-purple/20 rounded-lg w-fit">
                <Music className="w-3.5 h-3.5 text-purple" />
                <span className="text-[11px] text-purple">
                  {audioSource.type === "tts"
                    ? `TTS: ${audioSource.voiceName || "No voice"}`
                    : audioSource.type === "upload"
                    ? "Uploaded audio"
                    : audioSource.type === "record"
                    ? "Recorded audio"
                    : "Voice conversion"}
                </span>
                <button
                  onClick={() => setAudioSource(null)}
                  className="w-3.5 h-3.5 flex items-center justify-center text-purple/60 hover:text-purple"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
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

          {/* Tab-specific toolbar */}
          {renderToolbar()}
        </div>
      </div>

      {/* Audio Source Modal (renders outside the prompt bar) */}
      {showAudioModal && (
        <AudioSourceModal
          onClose={() => setShowAudioModal(false)}
          onConfirm={(source) => {
            setAudioSource(source);
            setShowAudioModal(false);
          }}
        />
      )}
    </>
  );
}

// --- Shared sub-components ---

function ToolbarButton({
  children,
  active = false,
  tooltip,
  onClick,
  badge = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  tooltip: string;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          active
            ? "text-purple bg-purple/10"
            : "text-[#555] hover:text-[#888] hover:bg-[#222]"
        }`}
      >
        {children}
        {badge && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
        )}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
      </div>
    </div>
  );
}

function QuantitySelector({
  quantity,
  onChange,
  max = 10,
}: {
  quantity: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#222] transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-[13px] text-white font-medium w-4 text-center">{quantity}</span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#222] transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function GenerateButton({
  cost,
  unit,
  onClick,
  disabled,
}: {
  cost: number;
  unit: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B2020] text-white text-[12px] font-medium hover:bg-[#a03030] disabled:opacity-40 transition-all"
    >
      <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
        <CreditCard className="w-2.5 h-2.5 text-white" />
      </div>
      {cost}
      <ArrowUp className="w-3.5 h-3.5" />
    </button>
  );
}
