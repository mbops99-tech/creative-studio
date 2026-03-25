"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Sparkles,
  Users,
  SlidersHorizontal,
  Upload,
  Minus,
  Plus,
  ArrowUp,
  Check,
  X,
  Info,
  Clapperboard,
  Music,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Coins,
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
  free?: boolean;
}

const AVATAR_MODELS: Model[] = [
  {
    id: "sadtalker",
    name: "SadTalker",
    description: "Open source lip sync, running on our GPU. Free to use.",
    costPerUnit: 0,
    unit: "video",
    free: true,
  },
  {
    id: "kling",
    name: "Kling 2.5",
    description: "Best quality lip sync by Kuaishou. $0.50 per video.",
    costPerUnit: 50,
    unit: "video",
  },
];

const IMAGE_MODELS: Model[] = [
  {
    id: "comfyui",
    name: "ComfyUI",
    description: "Local image generation on our GPU server. Free to use.",
    costPerUnit: 0,
    unit: "img",
    free: true,
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Cloud-based image generation. $0.05 per image.",
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
  externalPrompt?: string;
  onExternalPromptConsumed?: () => void;
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
  scriptFields?: {
    product: string;
    audience: string;
    outcome: string;
    differentiator: string;
    proof: string;
    speed: string;
    category: string;
  };
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
  externalPrompt,
  onExternalPromptConsumed,
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");

  // Accept external prompt (e.g., from ScriptCard flow)
  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
      onExternalPromptConsumed?.();
      // Focus the textarea
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [externalPrompt, onExternalPromptConsumed]);

  // Avatar models
  const [avatarModel, setAvatarModel] = useState<Model>(AVATAR_MODELS[0]);
  const [imageModel, setImageModel] = useState<Model>(IMAGE_MODELS[0]);

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSceneDirection, setShowSceneDirection] = useState(false);
  const [showAdditionalPrompts, setShowAdditionalPrompts] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [quantity, setQuantity] = useState(activeTab === "image" ? 4 : 1);

  // Update default quantity when tab changes
  useEffect(() => {
    setQuantity(activeTab === "image" ? 4 : 1);
  }, [activeTab]);

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

  // Script tab fields
  const [scriptFields, setScriptFields] = useState({
    product: "",
    audience: "",
    outcome: "",
    differentiator: "",
    proof: "",
    speed: "",
    category: "auto",
  });
  const [showScriptFields, setShowScriptFields] = useState(false);

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
    script: "Describe your product and target audience for a UGC ad script...",
    "talking-avatar": "Describe how you want your avatar to act...",
    image: "Describe the image you want to create...",
    more: "Describe what you want to create...",
  };

  // Cost calculation
  const cost = selectedModel.costPerUnit * quantity;

  const handleSubmit = () => {
    if (activeTab === "script") {
      const effectivePrompt = prompt.trim() || scriptFields.product;
      if (!effectivePrompt || isGenerating) return;
      onSubmit(effectivePrompt, "claude", 1, { ...settings, scriptFields });
      setPrompt("");
    } else {
      if (!prompt.trim() || isGenerating) return;
      onSubmit(prompt, selectedModel.id, quantity, { ...settings, audioSource: audioSource || undefined });
      setPrompt("");
    }
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

  // Category labels for display
  const categoryLabels: Record<string, string> = {
    auto: "🎯 Auto",
    "ai-companion": "🤖 AI",
    ecommerce: "🛍️ Ecom",
    saas: "💻 SaaS",
    fitness: "💪 Fitness",
    beauty: "✨ Beauty",
    finance: "💰 Finance",
    food: "🍕 Food",
    course: "📚 Course",
    gaming: "🎮 Gaming",
    home: "🏠 Home",
  };

  // --- SCRIPT TAB: minimal toolbar ---
  const renderScriptToolbar = () => (
    <div className="px-3 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222] text-[12px] text-[#888]">
          <Sparkles className="w-3.5 h-3.5 text-purple" />
          Claude
        </div>
        <div className="w-px h-5 bg-[#2a2a2a] mx-0.5" />
        <select
          value={scriptFields.category}
          onChange={(e) =>
            setScriptFields((prev) => ({ ...prev, category: e.target.value }))
          }
          className="px-2.5 py-1.5 rounded-lg bg-[#222] text-[12px] text-[#888] hover:text-white border-none focus:outline-none cursor-pointer appearance-none transition-colors"
          style={{ backgroundImage: 'none' }}
        >
          {Object.entries(categoryLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <GenerateButton
          cost={0}
          unit="script"
          free
          onClick={handleSubmit}
          disabled={(!prompt.trim() && !scriptFields.product) || isGenerating}
          isGenerating={isGenerating}
        />
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
            {selectedModel.free && <span className="text-[10px] text-[#888]">(Free)</span>}
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
          {selectedActors.length > 0 ? (
            <UserCheck className="w-4 h-4" />
          ) : (
            <Users className="w-4 h-4" />
          )}
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
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={4} />
        <GenerateButton
          cost={cost}
          unit={selectedModel.unit}
          free={selectedModel.free}
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          isGenerating={isGenerating}
        />
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
            {selectedModel.free && <span className="text-[10px] text-[#888]">(Free)</span>}
            <ChevronDown className="w-3 h-3 text-[#888]" />
          </button>
          {showModelDropdown && renderModelDropdown()}
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        {/* Show character ref & image ref when image is uploaded */}
        {uploadedImage && (
          <>
            <ToolbarButton tooltip="Character reference" onClick={() => {}}>
              <Users className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton tooltip="Image reference" onClick={() => {}}>
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        {/* Upload image (only show when no image uploaded) */}
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
        {!uploadedImage && (
          <ToolbarButton
            tooltip="Upload image"
            onClick={() => imageUploadRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
          </ToolbarButton>
        )}

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
        <GenerateButton
          cost={cost}
          unit={selectedModel.unit}
          free={selectedModel.free}
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          isGenerating={isGenerating}
        />
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
        <GenerateButton
          cost={0}
          unit=""
          free
          onClick={handleSubmit}
          disabled={!prompt.trim() || isGenerating}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );

  // --- Model dropdown (shared) ---
  const renderModelDropdown = () => (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
      <div className="absolute bottom-full left-0 mb-3 z-50 w-[320px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.5)' }}>
        {currentModels.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              setSelectedModel(model);
              setShowModelDropdown(false);
            }}
            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#222] transition-colors text-left ${
              selectedModel.id === model.id ? "bg-[#222]" : ""
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
                {model.free && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Free</span>
                )}
                <Info className="w-3 h-3 text-[#555]" />
              </div>
              <p className="text-[11px] text-[#666] mt-0.5 leading-snug">{model.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center">
                <Coins className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[11px] text-[#888]">
                {model.free ? "Free" : `${model.costPerUnit}/${model.unit}`}
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
          className={`bg-[#1a1a1a] border rounded-2xl overflow-visible transition-colors ${
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

            {/* Script tab expandable fields */}
            {activeTab === "script" && (
              <div className="mt-1 mb-2">
                <button
                  onClick={() => setShowScriptFields(!showScriptFields)}
                  className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${showScriptFields ? "rotate-180" : ""}`} />
                  {showScriptFields ? "Hide" : "Show"} detailed fields
                </button>
                {showScriptFields && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    {/* Category selector */}
                    <div>
                      <label className="text-[11px] text-[#888] font-medium mb-1 block">
                        Category
                      </label>
                      <select
                        value={scriptFields.category}
                        onChange={(e) =>
                          setScriptFields((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-purple rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="auto">🎯 Auto-detect</option>
                        <option value="ai-companion">🤖 AI / Companion</option>
                        <option value="ecommerce">🛍️ Ecommerce</option>
                        <option value="saas">💻 SaaS / App</option>
                        <option value="fitness">💪 Fitness</option>
                        <option value="beauty">✨ Beauty</option>
                        <option value="finance">💰 Finance</option>
                        <option value="food">🍕 Food</option>
                        <option value="course">📚 Course / Education</option>
                        <option value="gaming">🎮 Gaming</option>
                        <option value="home">🏠 Home</option>
                      </select>
                    </div>
                    {[
                      { key: "product", label: "Product / Service", placeholder: "e.g. Desaire - AI girlfriend app" },
                      { key: "audience", label: "Target Audience", placeholder: "e.g. Single men 18-35" },
                      { key: "outcome", label: "Dream Outcome", placeholder: "e.g. Find meaningful companionship" },
                      { key: "differentiator", label: "Differentiator", placeholder: "e.g. Remembers everything, always available" },
                      { key: "proof", label: "Proof / Testimonials", placeholder: "e.g. 100k+ downloads, 4.8 stars" },
                      { key: "speed", label: "Speed of Results", placeholder: "e.g. Start chatting in 30 seconds" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-[11px] text-[#888] font-medium mb-1 block">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={scriptFields[field.key as keyof typeof scriptFields]}
                          onChange={(e) =>
                            setScriptFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#4a90d9] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-[#444] focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
  free = false,
  onClick,
  disabled,
  isGenerating = false,
}: {
  cost: number;
  unit: string;
  free?: boolean;
  onClick: () => void;
  disabled: boolean;
  isGenerating?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-[12px] font-medium transition-all shadow-lg ${
        isGenerating
          ? "bg-purple/60 cursor-wait"
          : "bg-[#7B2D26] hover:bg-[#8f3830] disabled:opacity-40"
      }`}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
          <span className="font-semibold">Generating...</span>
        </>
      ) : (
        <>
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <Coins className="w-2.5 h-2.5 text-amber-900" />
          </div>
          <span className="font-semibold">
            {free ? "Free" : cost}
          </span>
          <ArrowUp className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
}
