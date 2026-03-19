export interface Project {
  id: string;
  name: string;
  icon: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  name: string;
  type: "A-roll" | "B-roll";
  script: string;
  action: string;
  cost: string;
  imageGenerated?: boolean;
  videoGenerated?: boolean;
}

export interface ScriptData {
  title: string;
  product: string;
  target: string;
  hook: string;
  body: string;
  cta: string;
  shots: Shot[];
  totalCost: string;
}

export interface ImageVariation {
  id: string;
  url: string;
  selected?: boolean;
}

export interface VideoData {
  shotName: string;
  engine: string;
  duration: string;
  resolution: string;
  cost: string;
  voice: string;
  status: "generating" | "complete";
  progress?: number;
  thumbnailUrl: string;
}

export interface AudioData {
  text: string;
  voice: string;
  duration: string;
  status: "complete";
}

export type MessageRole = "user" | "ai";
export type CardType = "text" | "script" | "images" | "video" | "audio";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content?: string;
  cardType?: CardType;
  scriptData?: ScriptData;
  imageData?: { shotName: string; variations: ImageVariation[] };
  videoData?: VideoData;
  audioData?: AudioData;
  timestamp: string;
}

export const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Desaire Ad Campaign", icon: "💜", updatedAt: "2 min ago" },
  { id: "2", name: "Casino Promo", icon: "🎰", updatedAt: "1 hour ago" },
  { id: "3", name: "AIMATE Launch", icon: "🤖", updatedAt: "Yesterday" },
  { id: "4", name: "Fitness App UGC", icon: "💪", updatedAt: "3 days ago" },
];

export const MOCK_SCRIPT: ScriptData = {
  title: "Desaire AI Girlfriend - UGC Ad",
  product: "Desaire",
  target: "Single men 18-35",
  hook: "So I've been dating my phone for 3 weeks now...",
  body: "And honestly? She remembers everything. My favorite movies, my work schedule, even that I hate mushrooms on pizza. She texts me good morning before my alarm goes off. I know it sounds crazy but talking to her just... hits different.",
  cta: "Download Desaire free. Your perfect match is waiting.",
  shots: [
    {
      id: "s1",
      name: "Hook",
      type: "A-roll",
      script: "So I've been dating my phone for 3 weeks now...",
      action: "Girl sitting on bed, casual selfie-style, talking to camera with slight smile",
      cost: "$0.50",
    },
    {
      id: "s2",
      name: "Phone Screen",
      type: "B-roll",
      script: "",
      action: "Close-up of phone showing Desaire chat interface with cute messages",
      cost: "$0.30",
    },
    {
      id: "s3",
      name: "Morning Text",
      type: "B-roll",
      script: "",
      action: "Phone on nightstand, notification pops up 'Good morning babe ☀️'",
      cost: "$0.30",
    },
    {
      id: "s4",
      name: "Testimonial",
      type: "A-roll",
      script: "She remembers everything... my favorite movies, my work schedule...",
      action: "Same girl, different angle, walking in park, talking to camera",
      cost: "$0.50",
    },
    {
      id: "s5",
      name: "Emotional Beat",
      type: "A-roll",
      script: "Talking to her just... hits different.",
      action: "Close-up face, genuine smile, warm lighting",
      cost: "$0.50",
    },
    {
      id: "s6",
      name: "CTA",
      type: "B-roll",
      script: "Download Desaire free",
      action: "App store mockup with download animation, logo reveal",
      cost: "$0.20",
    },
  ],
  totalCost: "$2.30",
};

const IMAGE_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
];

const IMAGE_PLACEHOLDERS_V2 = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
];

export const MOCK_IMAGES: ImageVariation[] = IMAGE_PLACEHOLDERS.map(
  (url, i) => ({
    id: `img-${i + 1}`,
    url,
    selected: false,
  })
);

export const MOCK_IMAGES_V2: ImageVariation[] = IMAGE_PLACEHOLDERS_V2.map(
  (url, i) => ({
    id: `img-v2-${i + 1}`,
    url,
    selected: i === 1,
  })
);

export const MOCK_VIDEO: VideoData = {
  shotName: "Hook",
  engine: "Kling 2.5",
  duration: "8s",
  resolution: "1080x1920",
  cost: "$0.50",
  voice: "Bella - ElevenLabs",
  status: "generating",
  progress: 65,
  thumbnailUrl: IMAGE_PLACEHOLDERS_V2[1],
};

export const MOCK_CONVERSATION: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content:
      "Create a UGC ad script for Desaire - AI girlfriend app targeting single men 18-35 who want companionship",
    timestamp: "5:23 PM",
  },
  {
    id: "m2",
    role: "ai",
    cardType: "script",
    scriptData: MOCK_SCRIPT,
    timestamp: "5:23 PM",
  },
  {
    id: "m3",
    role: "user",
    content: "Generate first frame for the Hook shot",
    timestamp: "5:24 PM",
  },
  {
    id: "m4",
    role: "ai",
    cardType: "images",
    imageData: {
      shotName: "Hook",
      variations: MOCK_IMAGES,
    },
    timestamp: "5:25 PM",
  },
  {
    id: "m5",
    role: "user",
    content: "Make her look more natural, like a real selfie, messy hair",
    timestamp: "5:25 PM",
  },
  {
    id: "m6",
    role: "ai",
    cardType: "images",
    imageData: {
      shotName: "Hook (Revised)",
      variations: MOCK_IMAGES_V2,
    },
    timestamp: "5:26 PM",
  },
  {
    id: "m7",
    role: "user",
    content: "Perfect, use the second one. Now generate the video",
    timestamp: "5:26 PM",
  },
  {
    id: "m8",
    role: "ai",
    cardType: "video",
    videoData: MOCK_VIDEO,
    timestamp: "5:27 PM",
  },
];

export const MOCK_ACTORS = [
  { id: "a1", name: "Bella", url: IMAGE_PLACEHOLDERS[0] },
  { id: "a2", name: "Sophie", url: IMAGE_PLACEHOLDERS[1] },
  { id: "a3", name: "Emma", url: IMAGE_PLACEHOLDERS[2] },
  { id: "a4", name: "Mia", url: IMAGE_PLACEHOLDERS[3] },
];

export const VOICES = [
  "Bella - ElevenLabs",
  "Rachel - ElevenLabs",
  "Domi - ElevenLabs",
  "Antoni - ElevenLabs",
  "Josh - ElevenLabs",
  "Arnold - ElevenLabs",
];

// Aliases for page.tsx
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: any;
};
export const MOCK_IMAGE_VARIATIONS = MOCK_IMAGES;
