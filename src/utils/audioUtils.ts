/**
 * Audio and Greek text helper utilities
 */

// Simple phonetic transliterator for Greek text to help learners read pronunciation
export function greekToPhonetic(text: string): string {
  const map: Record<string, string> = {
    "α": "a", "ά": "á", "Α": "A", "Ά": "Á",
    "β": "v", "Β": "V",
    "γ": "gh", "Γ": "Gh",
    "δ": "dh", "Δ": "Dh",
    "ε": "e", "έ": "é", "Ε": "E", "Έ": "É",
    "ζ": "z", "Ζ": "Z",
    "η": "ee", "ή": "ée", "Η": "Ee", "Ή": "Ée",
    "θ": "th", "Θ": "Th",
    "ι": "ee", "ί": "ée", "ϊ": "ee", "ΐ": "ée", "Ι": "Ee", "Ί": "Ée",
    "κ": "k", "Κ": "K",
    "λ": "l", "Λ": "L",
    "μ": "m", "Μ": "M",
    "ν": "n", "Ν": "N",
    "ξ": "x", "Ξ": "X",
    "ο": "o", "ό": "ó", "Ο": "O", "Ό": "Ó",
    "π": "p", "Π": "P",
    "ρ": "r", "Ρ": "R",
    "σ": "s", "ς": "s", "Σ": "S",
    "τ": "t", "Τ": "T",
    "υ": "ee", "ύ": "ée", "ϋ": "ee", "ΰ": "ée", "Υ": "Ee", "Ύ": "Ée",
    "φ": "f", "Φ": "F",
    "χ": "kh", "Χ": "Kh",
    "ψ": "ps", "Ψ": "Ps",
    "ω": "o", "ώ": "ó", "Ω": "O", "Ώ": "Ó",
    "ου": "oo", "ού": "óo", "Ου": "Oo", "Ού": "Óo",
    "αι": "e", "αί": "é", "Αι": "E", "Αί": "É",
    "ει": "ee", "εί": "ée", "Ει": "Ee", "Εί": "Ée",
    "οι": "ee", "οί": "ée", "Οι": "Ee", "Οί": "Ée",
    "μπ": "b", "Μπ": "B",
    "ντ": "d", "Ντ": "D",
    "γκ": "g", "Γκ": "G",
    "τσ": "ts", "Τσ": "Ts",
    "τζ": "tz", "Τζ": "Tz",
    ";": "?", "·": ";",
  };

  let result = text;
  // Replace digraphs first
  const digraphs = ["ου", "ού", "Ου", "Ού", "αι", "αί", "Αι", "Αί", "ει", "εί", "Ει", "Εί", "οι", "οί", "Οι", "Οί", "μπ", "Μπ", "ντ", "Ντ", "γκ", "Γκ", "τσ", "Τσ", "τζ", "Τζ"];
  for (const dg of digraphs) {
    if (map[dg]) {
      result = result.split(dg).join(map[dg]);
    }
  }

  // Replace single characters
  let output = "";
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    output += map[char] !== undefined ? map[char] : char;
  }
  return output;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function downloadAudioUrl(url: string, filename = "greek-speech.wav") {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate realistic pseudo-waveform data points for visualizer
export function generateWaveformPoints(count = 48, seed = "greek"): number[] {
  const points: number[] = [];
  let num = 0;
  for (let i = 0; i < seed.length; i++) {
    num += seed.charCodeAt(i);
  }

  for (let i = 0; i < count; i++) {
    // Combination of sine waves and pseudo-random
    const sin1 = Math.sin((i / count) * Math.PI * 3 + num);
    const sin2 = Math.cos((i / count) * Math.PI * 7);
    const val = Math.abs(sin1 * 0.6 + sin2 * 0.4);
    const height = Math.max(0.15, Math.min(1.0, val * 0.85 + 0.15));
    points.push(height);
  }
  return points;
}
