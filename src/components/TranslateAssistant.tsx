import React, { useState } from "react";
import { Sparkles, Languages, ArrowRight, Loader2, Check } from "lucide-react";

interface TranslateAssistantProps {
  onApplyGreekText: (greekText: string) => void;
}

export const TranslateAssistant: React.FC<TranslateAssistantProps> = ({
  onApplyGreekText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate-to-greek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Translation failed");
      }
      setTranslatedText(data.greekText);
    } catch (err: any) {
      setError(err.message || "Failed to translate text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!translatedText) return;
    onApplyGreekText(translatedText);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      setIsOpen(false);
    }, 600);
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">
            Need help translating from English to Greek?
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1"
        >
          {isOpen ? "Hide Assistant" : "English → Greek Translation"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Type English Sentence (to translate into natural Greek):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder="e.g., Welcome everyone to our Greek speech demonstration!"
                className="flex-1 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-600/20"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                )}
                <span>Translate</span>
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          {translatedText && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Greek Translation (Ελληνική Μετάφραση):
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                  {translatedText}
                </p>
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                {applied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>{applied ? "Applied!" : "Use in Editor"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
