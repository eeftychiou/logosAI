import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Mic,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertCircle,
  Headphones,
  Check,
  Radio,
  FileText,
  VolumeX,
} from "lucide-react";
import { GeminiVoiceName, VoiceStyleId, PresetPhrase, AudioClipHistory } from "./types";
import { PRESET_PHRASES, VOICE_PERSONAS, VOICE_STYLES } from "./data/greekPresets";
import { GreekKeyboardHelper } from "./components/GreekKeyboardHelper";
import { VoiceSelector } from "./components/VoiceSelector";
import { AudioPlayer } from "./components/AudioPlayer";
import { PresetLibrary } from "./components/PresetLibrary";
import { HistoryList } from "./components/HistoryList";
import { TranslateAssistant } from "./components/TranslateAssistant";

export default function App() {
  // Input State
  const [text, setText] = useState<string>(
    "Καλημέρα! Καλώς ήρθατε στην εφαρμογή φωνής. Μπορείτε να πληκτρολογήσετε οποιοδήποτε ελληνικό κείμενο και να επιλέξετε διαφορετικά στυλ εκφώνησης."
  );
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoiceName>("Kore");
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyleId>("natural");
  const [customStylePrompt, setCustomStylePrompt] = useState<string>("");
  const [isCustomStyle, setIsCustomStyle] = useState<boolean>(false);

  // Audio & Generation State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<AudioClipHistory[]>(() => {
    try {
      const saved = localStorage.getItem("greek_tts_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("greek_tts_history", JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn("Failed to persist history to localStorage:", e);
    }
  }, [history]);

  // Insert character at textarea cursor
  const handleInsertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev + char);
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newText = text.substring(0, start) + char + text.substring(end);
    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  // Generate Greek Speech via Gemini TTS API
  const handleGenerateSpeech = async (
    overrideText?: string,
    overrideVoice?: GeminiVoiceName,
    overrideStyle?: VoiceStyleId
  ) => {
    const targetText = overrideText !== undefined ? overrideText : text;
    const targetVoice = overrideVoice || selectedVoice;
    const targetStyle = overrideStyle || selectedStyle;

    if (!targetText || targetText.trim().length === 0) {
      setError("Please enter some Greek text to speak.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetText.trim(),
          voiceName: targetVoice,
          style: isCustomStyle ? "custom" : targetStyle,
          customPrompt: isCustomStyle ? customStylePrompt : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Speech generation failed");
      }

      const audioUrl = data.audioUrl;
      setCurrentAudioUrl(audioUrl);

      const styleLabel = isCustomStyle
        ? "Custom Style"
        : VOICE_STYLES.find((s) => s.id === targetStyle)?.label || targetStyle;

      const newClip: AudioClipHistory = {
        id: `clip-${Date.now()}`,
        text: targetText.trim(),
        voiceName: targetVoice,
        styleName: styleLabel,
        audioUrl,
        timestamp: Date.now(),
        engine: "gemini",
      };

      setHistory((prev) => [newClip, ...prev]);
      setCurrentPlayingId(newClip.id);
    } catch (err: any) {
      console.error("TTS generation error:", err);
      setError(
        err.message ||
          "An error occurred while generating speech. Please check your network or try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: PresetPhrase) => {
    setText(preset.greekText);
    setSelectedVoice(preset.suggestedVoice);
    setSelectedStyle(preset.suggestedStyle);
    setIsCustomStyle(false);
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSpeakPresetDirectly = (preset: PresetPhrase) => {
    setText(preset.greekText);
    setSelectedVoice(preset.suggestedVoice);
    setSelectedStyle(preset.suggestedStyle);
    setIsCustomStyle(false);
    handleGenerateSpeech(preset.greekText, preset.suggestedVoice, preset.suggestedStyle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlayHistoryClip = (clip: AudioClipHistory) => {
    setCurrentAudioUrl(clip.audioUrl);
    setText(clip.text);
    setCurrentPlayingId(clip.id);
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleDeleteClip = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const currentVoiceObj =
    VOICE_PERSONAS.find((v) => v.id === selectedVoice) || VOICE_PERSONAS[0];
  const currentStyleObj =
    VOICE_STYLES.find((s) => s.id === selectedStyle) || VOICE_STYLES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header matching Sleek Interface design */}
      <header className="h-20 border-b border-slate-800 flex items-center px-6 lg:px-10 justify-between bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Λόγος<span className="text-indigo-400 font-medium">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Greek TTS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Neural Greek Speech Synthesis with Voice Personas & Emotional Styles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Engine Status
            </span>
            <span className="text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
              Active Neural Link
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("phrasebook-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-medium transition-colors border border-slate-700 text-slate-200 cursor-pointer hidden md:flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preset Library</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Main Editor Card */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-sm overflow-hidden transition-all">
          {/* Editor Header Toolbar */}
          <div className="bg-slate-950/50 border-b border-slate-800/90 px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Εισαγωγή Κειμένου (Greek Text Input)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {wordCount} words • {charCount} chars
              </span>
              <button
                type="button"
                onClick={() => setText("")}
                disabled={!text}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                title="Clear text"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Πληκτρολογήστε το κείμενό σας εδώ... (Type or paste Greek text here)"
                rows={4}
                className="w-full text-base sm:text-lg bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Greek Accents & Diacritics Toolbar */}
            <GreekKeyboardHelper onInsertChar={handleInsertChar} />

            {/* Quick English-to-Greek Translator Helper */}
            <TranslateAssistant
              onApplyGreekText={(greekText) => {
                setText((prev) => (prev ? `${prev} ${greekText}` : greekText));
              }}
            />

            {/* Voice Persona & Style Selector */}
            <div className="pt-3 border-t border-slate-800/80">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
                customStylePrompt={customStylePrompt}
                onChangeCustomStylePrompt={setCustomStylePrompt}
                isCustomStyle={isCustomStyle}
                onToggleCustomStyle={setIsCustomStyle}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Generation Notice:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Speak Action Button & Config Status */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Active Config:</span>
                <span className="text-indigo-300 font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  {currentVoiceObj.name}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-medium">
                  {isCustomStyle ? "Custom Prompt" : currentStyleObj.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateSpeech()}
                disabled={isLoading || !text.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Synthesizing Greek Neural Speech...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-indigo-200" />
                    <span>Generate Speech (Εκφώνηση)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Audio Player Section */}
        {(currentAudioUrl || isLoading) && (
          <section className="transition-all animate-fadeIn">
            <AudioPlayer
              audioUrl={currentAudioUrl}
              spokenText={text}
              voiceName={currentVoiceObj.name}
              styleName={
                isCustomStyle ? "Custom Style" : currentStyleObj.label
              }
              isLoading={isLoading}
            />
          </section>
        )}

        {/* Preset Phrasebook */}
        <section id="phrasebook-section">
          <PresetLibrary
            onSelectPreset={handleSelectPreset}
            onSpeakDirectly={handleSpeakPresetDirectly}
          />
        </section>

        {/* Spoken History Section */}
        <section>
          <HistoryList
            history={history}
            onPlayClip={handlePlayHistoryClip}
            onToggleFavorite={handleToggleFavorite}
            onDeleteClip={handleDeleteClip}
            onClearHistory={handleClearHistory}
            currentPlayingId={currentPlayingId}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium text-slate-400">
            ΛόγοςAI • Greek Neural Voice Studio
          </span>
          <span className="text-slate-600">
            High-Fidelity Multimodal Speech Synthesis
          </span>
        </div>
      </footer>
    </div>
  );
}
