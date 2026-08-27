import React, { useState } from "react";
import { Keyboard, HelpCircle, X, Check } from "lucide-react";

interface GreekKeyboardHelperProps {
  onInsertChar: (char: string) => void;
}

export const GreekKeyboardHelper: React.FC<GreekKeyboardHelperProps> = ({
  onInsertChar,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const accentedLetters = [
    { char: "ά", label: "alpha with accent" },
    { char: "έ", label: "epsilon with accent" },
    { char: "ή", label: "eta with accent" },
    { char: "ί", label: "iota with accent" },
    { char: "ό", label: "omicron with accent" },
    { char: "ύ", label: "upsilon with accent" },
    { char: "ώ", label: "omega with accent" },
    { char: "ΐ", label: "iota with diaeresis & accent" },
    { char: "ΰ", label: "upsilon with diaeresis & accent" },
    { char: "ϊ", label: "iota with diaeresis" },
    { char: "ϋ", label: "upsilon with diaeresis" },
    { char: "ς", label: "final sigma" },
    { char: ";", label: "Greek question mark (;)" },
    { char: "·", label: "Greek ano teleia (semicolon)" },
  ];

  const handleKeyClick = (char: string) => {
    onInsertChar(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 800);
  };

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
          <span>Greek Accents & Diacritics (Τόνοι & Σύμβολα)</span>
          <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
            • Click to insert
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-medium cursor-pointer"
          title="Greek accentuation tips"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Accents Guide</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {accentedLetters.map((item) => (
          <button
            key={item.char}
            type="button"
            onClick={() => handleKeyClick(item.char)}
            title={`Insert '${item.char}' (${item.label})`}
            className="group relative flex items-center justify-center min-w-[36px] h-[36px] px-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-600/20 active:scale-95 text-slate-200 hover:text-indigo-300 font-semibold text-sm transition-all shadow-xs cursor-pointer"
          >
            {item.char}
            {copiedChar === item.char && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] py-0.5 px-2 rounded-md shadow-md flex items-center gap-0.5 whitespace-nowrap z-20">
                <Check className="w-2.5 h-2.5 text-emerald-300" /> Inserted
              </span>
            )}
          </button>
        ))}
      </div>

      {showGuide && (
        <div className="mt-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 relative">
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <h4 className="font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
            <span>Greek Stress Accent (Τόνος) Guide:</span>
          </h4>
          <ul className="space-y-1 text-slate-400 list-disc list-inside">
            <li>
              Every multi-syllable Greek word receives one primary accent (e.g.{" "}
              <span className="font-medium text-slate-200">καλημέρα</span>,{" "}
              <span className="font-medium text-slate-200">ευχαριστώ</span>).
            </li>
            <li>
              The Greek question mark is represented with a semicolon (
              <span className="font-bold text-indigo-400">;</span>).
            </li>
            <li>
              Final sigma at the end of a word is written as{" "}
              <span className="font-bold text-indigo-400">ς</span> (rather than
              σ).
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
