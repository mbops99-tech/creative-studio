"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ScriptCard from "@/components/ScriptCard";
import ImageCard from "@/components/ImageCard";
import VideoCard from "@/components/VideoCard";
import { generateScript, generateImages, checkImageStatus, editImage, getActors } from "@/lib/api";
import type { Actor } from "@/lib/api";
import type { Message } from "@/lib/mock-data";
import { Send, FileText, Image, Video, Mic, Paperclip, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeProject, setActiveProject] = useState("desaire-1");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Script form state
  const [scriptForm, setScriptForm] = useState({
    product: "",
    audience: "",
    outcome: "",
    differentiator: "",
    proof: "",
    speed: "fast",
  });

  // Image form state
  const [imagePrompt, setImagePrompt] = useState("");
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Load actors on mount
  useEffect(() => {
    getActors().then(setActors).catch(console.error);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for image generation status
  const pollImageStatus = useCallback(async (jobId: string, loadingMsgId: string, shotName: string) => {
    const poll = async () => {
      try {
        const status = await checkImageStatus(jobId);

        if (status.status === "processing") {
          // Update progress in loading message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingMsgId
                ? { ...m, content: "image-loading", data: { progress: status.progress, shotName } }
                : m
            )
          );
          setTimeout(poll, 2000);
        } else if (status.status === "complete") {
          // Replace loading with ImageCard
          const variations = status.images.map((img, i) => ({
            id: img.id,
            url: img.url,
            selected: false,
          }));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingMsgId
                ? {
                    ...m,
                    content: "image",
                    data: { shotName, variations },
                  }
                : m
            )
          );
          setIsGeneratingImage(false);
        } else if (status.status === "failed") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingMsgId
                ? {
                    ...m,
                    content: `Image generation failed: ${status.error || "Unknown error"}`,
                    data: undefined,
                  }
                : m
            )
          );
          setIsGeneratingImage(false);
        } else {
          // pending
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error("Poll error:", err);
        setTimeout(poll, 3000);
      }
    };

    setTimeout(poll, 2000);
  }, []);

  const handleGenerateImage = async (prompt: string, shotName: string = "Custom") => {
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: `Generate first frame image: "${prompt}"`,
    };

    const loadingMsgId = String(Date.now() + 1);
    const loadingMsg: Message = {
      id: loadingMsgId,
      role: "assistant",
      content: "image-loading",
      data: { progress: 0, shotName },
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setActiveQuickAction(null);
    setIsGeneratingImage(true);
    setImagePrompt("");

    try {
      const jobId = await generateImages(prompt, undefined, selectedActor || undefined, 4);
      pollImageStatus(jobId, loadingMsgId, shotName);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId
            ? {
                ...m,
                content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
                data: undefined,
              }
            : m
        )
      );
      setIsGeneratingImage(false);
    }
  };

  const handleImageEdit = async (imageUrl: string, prompt: string) => {
    const loadingMsgId = String(Date.now());
    const loadingMsg: Message = {
      id: loadingMsgId,
      role: "assistant",
      content: "image-loading",
      data: { progress: 0, shotName: "Magic Edit" },
    };

    setMessages((prev) => [...prev, loadingMsg]);
    setIsGeneratingImage(true);

    try {
      const jobId = await editImage(imageUrl, prompt);
      pollImageStatus(jobId, loadingMsgId, "Magic Edit");
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId
            ? {
                ...m,
                content: `Edit error: ${err instanceof Error ? err.message : "Unknown error"}`,
                data: undefined,
              }
            : m
        )
      );
      setIsGeneratingImage(false);
    }
  };

  // Called from ScriptCard shotlist "Image" button
  const handleShotImageGenerate = (shotName: string, action: string) => {
    setImagePrompt(action);
    setActiveQuickAction("image");
    // Auto-generate with the action as prompt
    handleGenerateImage(action, shotName);
  };

  const handleGenerateScript = async () => {
    if (!scriptForm.product.trim() || !scriptForm.audience.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: `Generate a UGC ad script for ${scriptForm.product} targeting ${scriptForm.audience}`,
    };

    const loadingMsg: Message = {
      id: String(Date.now() + 1),
      role: "assistant",
      content: "loading",
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setActiveQuickAction(null);
    setIsGenerating(true);

    try {
      const scriptData = await generateScript(scriptForm);

      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== loadingMsg.id);
        return [
          ...withoutLoading,
          {
            id: String(Date.now() + 2),
            role: "assistant" as const,
            content: "script",
            data: scriptData,
          },
        ];
      });

      setScriptForm({
        product: "",
        audience: "",
        outcome: "",
        differentiator: "",
        proof: "",
        speed: "fast",
      });
    } catch (err) {
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== loadingMsg.id);
        return [
          ...withoutLoading,
          {
            id: String(Date.now() + 2),
            role: "assistant" as const,
            content: `Error generating script: ${err instanceof Error ? err.message : "Unknown error"}`,
          },
        ];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userInput = input.trim();
    const newMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: userInput,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setActiveQuickAction(null);

    const scriptKeywords = ["script", "ad", "ugc", "create", "generate", "write"];
    const isScriptRequest = scriptKeywords.some((kw) =>
      userInput.toLowerCase().includes(kw)
    );

    if (isScriptRequest && messages.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content:
            "I can generate a script for you! Use the Script quick action below to fill in the details, or tell me more about your product and I'll help you get started.",
        },
      ]);
      setActiveQuickAction("script");
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content:
            "Got it! Use the quick action buttons below to generate scripts, images, videos, or voiceovers. For scripts, click the Script button and fill in your product details.",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeProject={activeProject} onSelectProject={setActiveProject} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-[#1e1e3a] flex items-center px-5 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
            <span className="text-sm font-semibold">Creative Studio</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-[#6C5CE7]" />
                </div>
                <h2 className="text-lg font-semibold text-white/90">Creative Studio</h2>
                <p className="text-[13px] text-[#888] leading-relaxed">
                  Generate ad scripts, images, videos and voiceovers — all powered by AI.
                  <br />
                  Click <span className="text-[#6C5CE7] font-medium">Script</span> below to get started.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-[13px] text-white/90">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-2">
                    {msg.content === "loading" && (
                      <div className="bg-[#141420] border border-[#1e1e3a] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#6C5CE7] animate-spin" />
                        <p className="text-[13px] text-white/60">Generating script...</p>
                      </div>
                    )}
                    {msg.content === "image-loading" && msg.data && (
                      <div className="bg-[#141420] border border-[#1e1e3a] rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                          <p className="text-[13px] text-white/60">
                            Generating images for {msg.data.shotName}...
                          </p>
                        </div>
                        {msg.data.progress > 0 && (
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${msg.data.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {msg.content === "script" && msg.data && (
                      <ScriptCard data={msg.data} onGenerateImage={handleShotImageGenerate} />
                    )}
                    {msg.content === "image" && msg.data && (
                      <ImageCard
                        shotName={msg.data.shotName}
                        variations={msg.data.variations}
                        onEdit={handleImageEdit}
                      />
                    )}
                    {msg.content === "video" && msg.data && (
                      <VideoCard data={msg.data} />
                    )}
                    {msg.content !== "script" &&
                      msg.content !== "image" &&
                      msg.content !== "video" &&
                      msg.content !== "loading" &&
                      msg.content !== "image-loading" && (
                        <div className="bg-[#141420] border border-[#1e1e3a] rounded-2xl rounded-bl-md px-4 py-3">
                          <p className="text-[13px] text-white/80">{msg.content}</p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Action Panel */}
        {activeQuickAction && (
          <div className="px-6 pb-2">
            <div className="bg-[#141420] border border-[#1e1e3a] rounded-xl p-4">
              {activeQuickAction === "script" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Script</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                      placeholder="Product name or description..."
                      value={scriptForm.product}
                      onChange={(e) => setScriptForm({ ...scriptForm, product: e.target.value })}
                    />
                    <input
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                      placeholder="Target audience..."
                      value={scriptForm.audience}
                      onChange={(e) => setScriptForm({ ...scriptForm, audience: e.target.value })}
                    />
                    <input
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                      placeholder="Desired outcome (e.g. app downloads)..."
                      value={scriptForm.outcome}
                      onChange={(e) => setScriptForm({ ...scriptForm, outcome: e.target.value })}
                    />
                    <input
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                      placeholder="Key differentiator..."
                      value={scriptForm.differentiator}
                      onChange={(e) => setScriptForm({ ...scriptForm, differentiator: e.target.value })}
                    />
                    <input
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none"
                      placeholder="Social proof (e.g. 100k+ users)..."
                      value={scriptForm.proof}
                      onChange={(e) => setScriptForm({ ...scriptForm, proof: e.target.value })}
                    />
                    <select
                      className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white focus:border-[#6C5CE7] focus:outline-none"
                      value={scriptForm.speed}
                      onChange={(e) => setScriptForm({ ...scriptForm, speed: e.target.value })}
                    >
                      <option value="fast">Fast (~10s)</option>
                      <option value="quality">Quality (~30s)</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateScript}
                    disabled={isGenerating || !scriptForm.product.trim() || !scriptForm.audience.trim()}
                    className="bg-[#6C5CE7] hover:bg-[#5A4BD1] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Script ~$0.02"
                    )}
                  </button>
                </div>
              )}
              {activeQuickAction === "image" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Image</p>
                  <div className="flex gap-2">
                    {actors.length > 0
                      ? actors.map((actor) => (
                          <div
                            key={actor.id}
                            onClick={() => setSelectedActor(selectedActor === actor.id ? null : actor.id)}
                            className="flex flex-col items-center gap-1 cursor-pointer group"
                          >
                            <div
                              className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-[#888] transition-all ${
                                selectedActor === actor.id
                                  ? "ring-2 ring-[#6C5CE7] bg-[#6C5CE7]/20"
                                  : "group-hover:ring-2 ring-[#6C5CE7]"
                              }`}
                            >
                              {actor.name[0]}
                            </div>
                            <span className={`text-[10px] ${selectedActor === actor.id ? "text-[#6C5CE7]" : "text-[#888]"}`}>
                              {actor.name}
                            </span>
                          </div>
                        ))
                      : ["Sarah", "Mike", "Aisha", "James", "Yuki", "Nina"].map((name) => (
                          <div key={name} className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-white/10 group-hover:ring-2 ring-[#6C5CE7] transition-all flex items-center justify-center text-[10px] text-[#888]">
                              {name[0]}
                            </div>
                            <span className="text-[10px] text-[#888]">{name}</span>
                          </div>
                        ))}
                  </div>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Describe the image..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                  />
                  <button
                    onClick={() => handleGenerateImage(imagePrompt)}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="bg-[#6C5CE7] hover:bg-[#5A4BD1] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate 4 Variations ~$0.20"
                    )}
                  </button>
                </div>
              )}
              {activeQuickAction === "video" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Video</p>
                  <div className="flex gap-3">
                    <button className="text-[12px] px-3 py-1.5 rounded-lg bg-[#6C5CE7]/20 text-[#6C5CE7] font-medium">Easy Mode</button>
                    <button className="text-[12px] px-3 py-1.5 rounded-lg bg-white/5 text-[#888] hover:text-white transition-colors">Custom Mode</button>
                  </div>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Action description..."
                  />
                  <div className="flex gap-2 items-center">
                    <select className="bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none">
                      <option>Kling 2.5 (Best)</option>
                      <option>Fast (Free)</option>
                    </select>
                    <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                      Generate Video ~$0.50
                    </button>
                  </div>
                </div>
              )}
              {activeQuickAction === "voice" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium">Generate Voice</p>
                  <textarea
                    className="w-full bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[#555] focus:border-[#6C5CE7] focus:outline-none resize-none h-16"
                    placeholder="Text to speak..."
                  />
                  <div className="flex gap-2 items-center">
                    <select className="bg-white/5 border border-[#1e1e3a] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none">
                      <option>Bella - Warm</option>
                      <option>Rachel - Casual</option>
                      <option>Josh - Confident</option>
                      <option>Vanessa - Energetic</option>
                    </select>
                    <input type="range" min="0.8" max="1.3" step="0.05" defaultValue="1.0" className="flex-1 accent-[#6C5CE7]" />
                    <span className="text-[11px] text-[#888]">1.0x</span>
                    <button className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-colors">
                      Generate ~$0.03
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Bar */}
        <div className="shrink-0 px-6 pb-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-2">
            {[
              { id: "script", icon: FileText, label: "Script" },
              { id: "image", icon: Image, label: "Image" },
              { id: "video", icon: Video, label: "Video" },
              { id: "voice", icon: Mic, label: "Voice" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveQuickAction(activeQuickAction === id ? null : id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  activeQuickAction === id
                    ? "bg-[#6C5CE7]/20 text-[#6C5CE7]"
                    : "bg-white/5 text-[#888] hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 bg-[#141420] border border-[#1e1e3a] rounded-xl p-2 focus-within:border-[#6C5CE7]/50 transition-colors">
            <button className="p-2 text-[#555] hover:text-white transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-[#555] resize-none focus:outline-none min-h-[36px] max-h-[120px] py-2"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isGenerating}
              className="p-2 bg-[#6C5CE7] hover:bg-[#5A4BD1] disabled:opacity-50 rounded-lg text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#555] mt-1 text-center">
            Est. cost per generation: Script ~$0.02 • Image ~$0.05 • Video ~$0.50 • Voice ~$0.03
          </p>
        </div>
      </div>
    </div>
  );
}
