"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModeTabs, { type ModeTab } from "@/components/ModeTabs";
import PromptBar, { type PromptSettings } from "@/components/PromptBar";
import ActorGallery from "@/components/ActorGallery";
import CreateActorModal from "@/components/CreateActorModal";
import ScriptCard from "@/components/ScriptCard";
import ImageCard from "@/components/ImageCard";
import VideoCard from "@/components/VideoCard";
import ResultCard from "@/components/ResultCard";
import {
  generateScript,
  generateImages,
  checkImageStatus,
  generateVideo,
  checkVideoStatus,
  getActors,
  generateBroll,
  checkBrollStatus,
  type Actor,
  type ImageJobStatus,
  type VideoJobStatus,
  type BrollJobStatus,
} from "@/lib/api";
import type { ScriptData, ImageVariation, VideoData } from "@/lib/mock-data";
import { MOCK_PROJECTS } from "@/lib/mock-data";

// Result types
type ResultType =
  | { kind: "script"; data: ScriptData }
  | {
      kind: "images";
      shotName: string;
      variations: ImageVariation[];
      status: "generating" | "complete" | "failed";
      progress: number;
      jobId?: string;
    }
  | {
      kind: "video";
      data: VideoData;
      jobId?: string;
    }
  | {
      kind: "broll";
      shotName: string;
      status: "generating" | "complete" | "failed";
      progress: number;
      videoUrl?: string;
      jobId?: string;
    };

interface Result {
  id: string;
  timestamp: string;
  prompt: string;
  result: ResultType;
}

export default function HomePage() {
  // Navigation state
  const [activeNav, setActiveNav] = useState<"create" | "library" | "settings">(
    "create"
  );
  const [activeTab, setActiveTab] = useState<ModeTab>("script");
  const [activeProject, setActiveProject] = useState<string | null>("1");

  // Actor state
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [showActorGallery, setShowActorGallery] = useState(false);
  const [showCreateActor, setShowCreateActor] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [credits, setCredits] = useState(50);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch actors on mount
  useEffect(() => {
    getActors()
      .then(setActors)
      .catch(() => {
        // Use some fallback actors
        setActors([
          {
            id: "a1",
            name: "Mabel",
            imageUrl:
              "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
            description: "Young woman, casual",
          },
          {
            id: "a2",
            name: "Amelia",
            imageUrl:
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
            description: "Professional woman",
          },
          {
            id: "a3",
            name: "Isla",
            imageUrl:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
            description: "Fashion model",
          },
          {
            id: "a4",
            name: "Harper",
            imageUrl:
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
            description: "Natural look",
          },
          {
            id: "a5",
            name: "Luna",
            imageUrl:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
            description: "Creative artist",
          },
          {
            id: "a6",
            name: "Bel",
            imageUrl:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
            description: "Male model",
          },
        ]);
      });
  }, []);

  // Scroll to bottom when results change
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTo({
        top: resultsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [results]);

  // Poll for image status
  const pollImageStatus = useCallback(
    async (jobId: string, resultId: string) => {
      const poll = async () => {
        try {
          const status: ImageJobStatus = await checkImageStatus(jobId);
          setResults((prev) =>
            prev.map((r) => {
              if (r.id !== resultId || r.result.kind !== "images") return r;
              return {
                ...r,
                result: {
                  ...r.result,
                  status: status.status === "complete" ? "complete" : status.status === "failed" ? "failed" : "generating",
                  progress: status.progress || 0,
                  variations:
                    status.status === "complete"
                      ? status.images.map((img) => ({
                          id: img.id,
                          url: img.url,
                          selected: false,
                        }))
                      : r.result.variations,
                },
              };
            })
          );
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
    },
    []
  );

  // Poll for video status
  const pollVideoStatus = useCallback(
    async (jobId: string, resultId: string) => {
      const poll = async () => {
        try {
          const status: VideoJobStatus = await checkVideoStatus(jobId);
          setResults((prev) =>
            prev.map((r) => {
              if (r.id !== resultId || r.result.kind !== "video") return r;
              return {
                ...r,
                result: {
                  ...r.result,
                  data: {
                    ...r.result.data,
                    status:
                      status.status === "complete"
                        ? "complete"
                        : "generating",
                    progress: status.progress || 0,
                    videoUrl: status.videoUrl,
                    step: status.step,
                    duration: status.duration || r.result.data.duration,
                  },
                },
              };
            })
          );
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
    },
    []
  );

  // Poll for broll status
  const pollBrollStatus = useCallback(
    async (jobId: string, resultId: string) => {
      const poll = async () => {
        try {
          const status: BrollJobStatus = await checkBrollStatus(jobId);
          setResults((prev) =>
            prev.map((r) => {
              if (r.id !== resultId || r.result.kind !== "broll") return r;
              return {
                ...r,
                result: {
                  ...r.result,
                  status:
                    status.status === "complete"
                      ? "complete"
                      : status.status === "failed"
                      ? "failed"
                      : "generating",
                  progress: status.progress || 0,
                  videoUrl: status.videoUrl,
                },
              };
            })
          );
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
    },
    []
  );

  // Handle prompt submission
  const handleSubmit = async (
    prompt: string,
    model: string,
    quantity: number,
    settings: PromptSettings
  ) => {
    setIsGenerating(true);
    const resultId = `r-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      if (activeTab === "script") {
        // Parse prompt for script params
        const scriptData = await generateScript({
          product: prompt,
          audience: "Target audience",
          outcome: "Drive conversions",
          differentiator: "Unique value",
          proof: "Social proof",
          speed: "normal",
        });
        setResults((prev) => [
          ...prev,
          {
            id: resultId,
            timestamp: now,
            prompt,
            result: { kind: "script", data: scriptData },
          },
        ]);
        setIsGenerating(false);
      } else if (activeTab === "image") {
        const jobId = await generateImages(
          prompt,
          undefined,
          selectedActors[0]?.id,
          quantity
        );
        setResults((prev) => [
          ...prev,
          {
            id: resultId,
            timestamp: now,
            prompt,
            result: {
              kind: "images",
              shotName: "Custom",
              variations: [],
              status: "generating",
              progress: 0,
              jobId,
            },
          },
        ]);
        pollImageStatus(jobId, resultId);
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
        setResults((prev) => [
          ...prev,
          {
            id: resultId,
            timestamp: now,
            prompt,
            result: {
              kind: "video",
              data: {
                shotName: "Talking Avatar",
                engine: model === "kling" ? "Kling 2.6" : "SadTalker",
                duration: settings.duration,
                resolution:
                  settings.orientation === "portrait"
                    ? "1080x1920"
                    : "1920x1080",
                cost: "$5.00",
                voice: "aria",
                status: "generating",
                progress: 0,
                thumbnailUrl: selectedActors[0].imageUrl,
              },
              jobId,
            },
          },
        ]);
        pollVideoStatus(jobId, resultId);
      } else {
        // More tab — try broll
        const jobId = await generateImages(prompt, undefined, undefined, quantity);
        setResults((prev) => [
          ...prev,
          {
            id: resultId,
            timestamp: now,
            prompt,
            result: {
              kind: "images",
              shotName: "Custom",
              variations: [],
              status: "generating",
              progress: 0,
              jobId,
            },
          },
        ]);
        pollImageStatus(jobId, resultId);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setIsGenerating(false);
    }
  };

  // Script card actions
  const handleScriptGenerateImage = async (
    shotName: string,
    action: string
  ) => {
    setIsGenerating(true);
    const resultId = `r-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    try {
      const jobId = await generateImages(action, undefined, selectedActors[0]?.id, 4);
      setResults((prev) => [
        ...prev,
        {
          id: resultId,
          timestamp: now,
          prompt: `Image for ${shotName}: ${action}`,
          result: {
            kind: "images",
            shotName,
            variations: [],
            status: "generating",
            progress: 0,
            jobId,
          },
        },
      ]);
      pollImageStatus(jobId, resultId);
    } catch {
      setIsGenerating(false);
    }
  };

  const handleScriptGenerateVideo = async (
    shotName: string,
    script: string,
    action: string
  ) => {
    if (!selectedActors[0]) {
      setShowActorGallery(true);
      return;
    }
    setIsGenerating(true);
    const resultId = `r-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    try {
      const jobId = await generateVideo(
        selectedActors[0].imageUrl,
        script,
        action
      );
      setResults((prev) => [
        ...prev,
        {
          id: resultId,
          timestamp: now,
          prompt: `Video for ${shotName}`,
          result: {
            kind: "video",
            data: {
              shotName,
              engine: "SadTalker",
              duration: "10s",
              resolution: "1080x1920",
              cost: "$5.00",
              voice: "aria",
              status: "generating",
              progress: 0,
              thumbnailUrl: selectedActors[0].imageUrl,
            },
            jobId,
          },
        },
      ]);
      pollVideoStatus(jobId, resultId);
    } catch {
      setIsGenerating(false);
    }
  };

  const handleScriptGenerateBroll = async (
    shotName: string,
    action: string
  ) => {
    setIsGenerating(true);
    const resultId = `r-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    try {
      // First generate an image, then we can motion it
      const jobId = await generateImages(action, undefined, undefined, 4);
      setResults((prev) => [
        ...prev,
        {
          id: resultId,
          timestamp: now,
          prompt: `B-Roll for ${shotName}: ${action}`,
          result: {
            kind: "images",
            shotName: `${shotName} (B-Roll)`,
            variations: [],
            status: "generating",
            progress: 0,
            jobId,
          },
        },
      ]);
      pollImageStatus(jobId, resultId);
    } catch {
      setIsGenerating(false);
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
          {/* Results / scrollable area */}
          <div
            ref={resultsRef}
            className="flex-1 overflow-y-auto px-8 py-6"
          >
            {/* Welcome message (show when no results) */}
            {results.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full -mt-20">
                <p className="text-[16px] text-[#888] mb-8">
                  Hey, let&apos;s create amazing ads! ✨
                </p>

                {/* Mode tabs */}
                <ModeTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="max-w-[800px] mx-auto space-y-4">
                {/* Mode tabs (sticky-ish at top) */}
                <div className="mb-6">
                  <ModeTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {results.map((r) => {
                  switch (r.result.kind) {
                    case "script":
                      return (
                        <div key={r.id}>
                          {/* User prompt */}
                          <div className="flex justify-end mb-3">
                            <div className="bg-purple/10 border border-purple/20 rounded-xl px-4 py-2.5 max-w-[400px]">
                              <p className="text-[13px] text-white/90">
                                {r.prompt}
                              </p>
                              <p className="text-[10px] text-[#555] mt-1">
                                {r.timestamp}
                              </p>
                            </div>
                          </div>
                          <ScriptCard
                            data={r.result.data}
                            onGenerateImage={handleScriptGenerateImage}
                            onGenerateVideo={handleScriptGenerateVideo}
                            onGenerateBroll={handleScriptGenerateBroll}
                          />
                        </div>
                      );

                    case "images":
                      return (
                        <div key={r.id}>
                          <div className="flex justify-end mb-3">
                            <div className="bg-purple/10 border border-purple/20 rounded-xl px-4 py-2.5 max-w-[400px]">
                              <p className="text-[13px] text-white/90">
                                {r.prompt}
                              </p>
                              <p className="text-[10px] text-[#555] mt-1">
                                {r.timestamp}
                              </p>
                            </div>
                          </div>
                          {r.result.status === "generating" ? (
                            <ResultCard
                              type="image"
                              title={`Generating Images — ${r.result.shotName}`}
                              status="generating"
                              progress={r.result.progress}
                              step="Processing..."
                            >
                              <div className="px-5 pb-4">
                                <div className="grid grid-cols-4 gap-2.5">
                                  {[0, 1, 2, 3].map((i) => (
                                    <div
                                      key={i}
                                      className="aspect-[2/3] rounded-lg bg-[#222] animate-pulse"
                                    />
                                  ))}
                                </div>
                              </div>
                            </ResultCard>
                          ) : (
                            <ImageCard
                              shotName={r.result.shotName}
                              variations={r.result.variations}
                            />
                          )}
                        </div>
                      );

                    case "video":
                      return (
                        <div key={r.id}>
                          <div className="flex justify-end mb-3">
                            <div className="bg-purple/10 border border-purple/20 rounded-xl px-4 py-2.5 max-w-[400px]">
                              <p className="text-[13px] text-white/90">
                                {r.prompt}
                              </p>
                              <p className="text-[10px] text-[#555] mt-1">
                                {r.timestamp}
                              </p>
                            </div>
                          </div>
                          <VideoCard data={r.result.data} />
                        </div>
                      );

                    case "broll":
                      return (
                        <div key={r.id}>
                          <ResultCard
                            type="broll"
                            title={`B-Roll — ${r.result.shotName}`}
                            status={r.result.status}
                            progress={r.result.progress}
                          >
                            {r.result.videoUrl ? (
                              <div className="px-5 pb-4">
                                <video
                                  src={r.result.videoUrl}
                                  controls
                                  className="w-full rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="px-5 pb-4">
                                <div className="aspect-video rounded-lg bg-[#222] animate-pulse" />
                              </div>
                            )}
                          </ResultCard>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>

          {/* Prompt bar (fixed at bottom) */}
          <div className="shrink-0 px-8 pb-6 pt-2 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent">
            {/* Show tabs inline with prompt when results exist */}
            {results.length > 0 && (
              <div className="mb-3 flex justify-center">
                {/* Small tab indicator */}
              </div>
            )}
            <PromptBar
              activeTab={activeTab}
              selectedActors={selectedActors}
              onOpenActorGallery={() => setShowActorGallery(true)}
              onRemoveActor={(id) =>
                setSelectedActors((prev) => prev.filter((a) => a.id !== id))
              }
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
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
          onCreateActor={() => {
            setShowCreateActor(true);
          }}
        />
      )}

      {/* Create Actor Modal */}
      {showCreateActor && (
        <CreateActorModal
          onClose={() => setShowCreateActor(false)}
          onSave={(name, image) => {
            // Add to local actors
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
