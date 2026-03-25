"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModeTabs, { type ModeTab } from "@/components/ModeTabs";
import PromptBar, { type PromptSettings } from "@/components/PromptBar";
import ActorGallery from "@/components/ActorGallery";
import CreateActorModal from "@/components/CreateActorModal";
import ScriptCard from "@/components/ScriptCard";
import ImageWorkspace from "@/components/ImageWorkspace";
import VideoWorkspace from "@/components/VideoWorkspace";
import {
  generateScript,
  generateImages,
  checkImageStatus,
  generateVideo,
  checkVideoStatus,
  getActors,
  type Actor,
  type ImageJobStatus,
  type VideoJobStatus,
} from "@/lib/api";
import type { ScriptData, ImageVariation, VideoData } from "@/lib/mock-data";
import { MOCK_PROJECTS } from "@/lib/mock-data";

export default function HomePage() {
  // Navigation
  const [activeNav, setActiveNav] = useState<"create" | "library" | "settings">("create");
  const [activeTab, setActiveTab] = useState<ModeTab>("script");
  const [activeProject, setActiveProject] = useState<string | null>("1");

  // Actor state (shared)
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [showActorGallery, setShowActorGallery] = useState(false);
  const [showCreateActor, setShowCreateActor] = useState(false);

  // Shared
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(50);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === PER-TAB STATE ===

  // Script tab
  const [scriptResult, setScriptResult] = useState<ScriptData | null>(null);

  // Image tab
  const [imageResults, setImageResults] = useState<ImageVariation[]>([]);
  const [imageJobId, setImageJobId] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [imageStatus, setImageStatus] = useState<"idle" | "generating" | "complete" | "failed">("idle");

  // Avatar tab
  const [videoResult, setVideoResult] = useState<VideoData | null>(null);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);

  // External prompt (from ScriptCard actions)
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>();

  // Fetch actors on mount
  useEffect(() => {
    getActors()
      .then(setActors)
      .catch(() => {
        setActors([
          { id: "a1", name: "Mabel", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face", description: "Young woman, casual" },
          { id: "a2", name: "Amelia", imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face", description: "Professional woman" },
          { id: "a3", name: "Isla", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face", description: "Fashion model" },
          { id: "a4", name: "Harper", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face", description: "Natural look" },
          { id: "a5", name: "Luna", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face", description: "Creative artist" },
          { id: "a6", name: "Bel", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face", description: "Male model" },
        ]);
      });
  }, []);

  // Poll image status
  const pollImageStatus = useCallback((jobId: string) => {
    const poll = async () => {
      try {
        const status: ImageJobStatus = await checkImageStatus(jobId);
        setImageProgress(status.progress || 0);
        if (status.status === "complete") {
          setImageResults(status.images.map((img) => ({ id: img.id, url: img.url, selected: false })));
          setImageStatus("complete");
          setIsGenerating(false);
          return;
        }
        if (status.status === "failed") {
          setImageStatus("failed");
          setIsGenerating(false);
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setImageStatus("failed");
        setIsGenerating(false);
      }
    };
    poll();
  }, []);

  // Poll video status
  const pollVideoStatus = useCallback((jobId: string) => {
    const poll = async () => {
      try {
        const status: VideoJobStatus = await checkVideoStatus(jobId);
        setVideoResult((prev) => prev ? {
          ...prev,
          status: status.status === "complete" ? "complete" : "generating",
          progress: status.progress || 0,
          videoUrl: status.videoUrl,
          step: status.step,
          duration: status.duration || prev.duration,
        } : null);
        if (status.status === "complete" || status.status === "failed") {
          setIsGenerating(false);
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setIsGenerating(false);
      }
    };
    poll();
  }, []);

  // Handle prompt submission
  const handleSubmit = async (
    prompt: string,
    model: string,
    quantity: number,
    settings: PromptSettings
  ) => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      if (activeTab === "script") {
        const sf = (settings.scriptFields || {}) as Record<string, string>;
        const scriptData = await generateScript({
          product: sf.product || prompt || "Product",
          audience: sf.audience || "Target audience",
          outcome: sf.outcome || "Drive conversions",
          differentiator: sf.differentiator || "Unique value",
          proof: sf.proof || "Social proof",
          speed: sf.speed || "normal",
          category: sf.category || "auto",
        });
        setScriptResult(scriptData);
        setIsGenerating(false);
      } else if (activeTab === "image") {
        setImageResults([]);
        setImageStatus("generating");
        setImageProgress(0);
        const jobId = await generateImages(prompt, undefined, selectedActors[0]?.id, quantity);
        setImageJobId(jobId);
        pollImageStatus(jobId);
      } else if (activeTab === "talking-avatar") {
        if (!selectedActors[0]) {
          setShowActorGallery(true);
          setIsGenerating(false);
          return;
        }
        const jobId = await generateVideo(
          selectedActors[0].imageUrl,
          prompt,
          undefined,
          undefined,
          "easy",
          model === "kling" ? "kling" : "sadtalker"
        );
        setVideoJobId(jobId);
        setVideoResult({
          shotName: "Talking Avatar",
          engine: model === "kling" ? "Kling 2.6" : "SadTalker",
          duration: settings.duration || "10s",
          resolution: settings.orientation === "portrait" ? "1080x1920" : "1920x1080",
          cost: model === "kling" ? "$0.50" : "Free",
          voice: "aria",
          status: "generating",
          progress: 0,
          thumbnailUrl: selectedActors[0].imageUrl,
        });
        pollVideoStatus(jobId);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setIsGenerating(false);
      setImageStatus("idle");
      setTimeout(() => setErrorMsg(null), 8000);
    }
  };

  // Script card actions — switch tab and pre-fill
  const handleScriptGenerateImage = (shotName: string, action: string) => {
    setActiveTab("image");
    setExternalPrompt(`${shotName}: ${action}`);
  };

  const handleScriptGenerateVideo = (shotName: string, script: string, _action: string) => {
    if (!selectedActors[0]) setShowActorGallery(true);
    setActiveTab("talking-avatar");
    setExternalPrompt(script);
  };

  const handleScriptGenerateBroll = (shotName: string, action: string) => {
    setActiveTab("image");
    setExternalPrompt(`B-Roll for ${shotName}: ${action}`);
  };

  // Determine if current tab has content
  const tabHasContent = () => {
    switch (activeTab) {
      case "script": return !!scriptResult;
      case "image": return imageStatus === "generating" || imageResults.length > 0;
      case "talking-avatar": return !!videoResult;
      default: return false;
    }
  };

  // Render workspace content per tab
  const renderWorkspace = () => {
    switch (activeTab) {
      case "script":
        if (isGenerating && !scriptResult) {
          return (
            <div className="max-w-[800px] mx-auto">
              <div className="flex items-center gap-3 p-5 bg-purple/10 border border-purple/30 rounded-xl text-purple animate-pulse">
                <div className="w-5 h-5 border-2 border-purple border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="font-medium text-[14px]">Generating your script...</p>
                  <p className="text-purple/60 text-[12px] mt-0.5">This may take 10-30 seconds</p>
                </div>
              </div>
              {/* Skeleton */}
              <div className="mt-4 bg-card border border-card-border rounded-xl overflow-hidden animate-pulse">
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-48" />
                    <div className="h-2 bg-white/5 rounded w-32" />
                  </div>
                </div>
                <div className="px-5 pb-4 space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-2 bg-white/5 rounded" style={{width: `${90-i*10}%`}} />)}
                </div>
              </div>
            </div>
          );
        }
        if (scriptResult) {
          return (
            <div className="max-w-[800px] mx-auto animate-fade-in">
              <ScriptCard
                data={scriptResult}
                onGenerateImage={handleScriptGenerateImage}
                onGenerateVideo={handleScriptGenerateVideo}
                onGenerateBroll={handleScriptGenerateBroll}
              />
            </div>
          );
        }
        return null;

      case "image":
        if (imageStatus === "generating") {
          return (
            <div className="max-w-[700px] mx-auto">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 mb-4 animate-pulse">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="font-medium text-[14px]">Generating images...</p>
                  <p className="text-emerald-400/60 text-[12px] mt-0.5">{imageProgress}% complete</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0,1,2,3].map(i => (
                  <div key={i} className="aspect-square rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse" />
                ))}
              </div>
            </div>
          );
        }
        if (imageResults.length > 0) {
          return (
            <div className="max-w-[700px] mx-auto animate-fade-in">
              <ImageWorkspace variations={imageResults} />
            </div>
          );
        }
        return null;

      case "talking-avatar":
        if (videoResult) {
          return (
            <div className="max-w-[600px] mx-auto animate-fade-in">
              <VideoWorkspace data={videoResult} />
            </div>
          );
        }
        return null;

      case "more":
        return (
          <div className="max-w-[600px] mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "B-Roll", desc: "Generate motion video from images", icon: "🎬" },
                { label: "Voice", desc: "Generate or clone voices", icon: "🎤" },
                { label: "Edit & Compile", desc: "Combine clips into final video", icon: "✂️" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center hover:border-[#444] transition-colors group"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-[14px] font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-[12px] text-[#888]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex bg-[#0f0f0f]">
      {/* Sidebar */}
      <Sidebar
        projects={MOCK_PROJECTS}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onNewProject={() => {}}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <TopBar credits={credits} />

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace area (scrollable) */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Welcome + Tabs (always visible at top of workspace) */}
            <div className="flex flex-col items-center mb-8">
              {!tabHasContent() && !isGenerating && (
                <p className="text-[16px] text-[#888] mb-6">
                  Hey, let&apos;s create amazing ads! ✨
                </p>
              )}
              <ModeTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="max-w-[680px] mx-auto mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Tab workspace content */}
            {renderWorkspace()}
          </div>

          {/* Prompt bar (fixed at bottom) */}
          <div className="shrink-0 px-8 pb-6 pt-4 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/98 to-transparent backdrop-blur-sm border-t border-white/[0.03]">
            <PromptBar
              activeTab={activeTab}
              selectedActors={selectedActors}
              onOpenActorGallery={() => setShowActorGallery(true)}
              onRemoveActor={(id) => setSelectedActors((prev) => prev.filter((a) => a.id !== id))}
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
              externalPrompt={externalPrompt}
              onExternalPromptConsumed={() => setExternalPrompt(undefined)}
            />
          </div>
        </div>
      </div>

      {/* Actor Gallery Overlay */}
      {showActorGallery && (
        <ActorGallery
          actors={actors}
          selectedActors={selectedActors}
          maxSelect={1}
          onSelect={setSelectedActors}
          onClose={() => setShowActorGallery(false)}
          onCreateActor={() => setShowCreateActor(true)}
        />
      )}

      {/* Create Actor Modal */}
      {showCreateActor && (
        <CreateActorModal
          onClose={() => setShowCreateActor(false)}
          onSave={(name, image) => {
            if (name && image) {
              const newActor: Actor = {
                id: `custom-${Date.now()}`,
                name,
                imageUrl: URL.createObjectURL(image),
                description: "Custom actor",
              };
              setActors((prev) => [...prev, newActor]);
            }
            setShowCreateActor(false);
          }}
          onGenerate={(prompt, aspectRatio, quality) => {
            console.log("Generate actor:", { prompt, aspectRatio, quality });
          }}
        />
      )}
    </div>
  );
}
