export type GeminiVoiceName = "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";

export type VoiceStyleId =
  | "natural"
  | "cheerful"
  | "storyteller"
  | "calm"
  | "formal"
  | "dramatic"
  | "poetic"
  | "epic"
  | "whisper"
  | "energetic";

export interface VoicePersona {
  id: GeminiVoiceName;
  name: string;
  greekName: string;
  gender: "Female" | "Male" | "Neutral";
  tone: string;
  description: string;
  bestFor: string;
  accentColor: string;
  bgGradient: string;
}

export interface VoiceStyle {
  id: VoiceStyleId;
  label: string;
  greekLabel: string;
  description: string;
  instruction: string;
  iconName: string;
}

export interface PresetPhrase {
  id: string;
  category: "greetings" | "philosophy" | "literature" | "travel" | "twisters";
  categoryLabel: string;
  title: string;
  greekText: string;
  englishTranslation: string;
  suggestedVoice: GeminiVoiceName;
  suggestedStyle: VoiceStyleId;
}

export interface AudioClipHistory {
  id: string;
  text: string;
  voiceName: GeminiVoiceName | string;
  styleName: string;
  audioUrl: string;
  timestamp: number;
  duration?: number;
  isFavorite?: boolean;
  engine: "gemini" | "browser";
}

export type TTSEngine = "gemini" | "browser";
