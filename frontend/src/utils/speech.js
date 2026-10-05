/**
 * Speech Synthesis Utility
 * Provides a clear, natural female voice for child-friendly audio instructions.
 *
 * Strategy:
 *  1. Wait for voices to load (Chrome defers voice list loading).
 *  2. Prefer Samantha (macOS), Google UK English Female, Microsoft Zira (Windows),
 *     or any voice that is explicitly female.
 *  3. Fall back gracefully if none are found.
 */

let _resolvedVoice = null;
let _voicesLoaded = false;

/**
 * Finds and caches the best available female English voice.
 * Returns a Promise that resolves to a SpeechSynthesisVoice or null.
 */
function resolveFemaleVoice() {
  return new Promise((resolve) => {
    if (_resolvedVoice) {
      resolve(_resolvedVoice);
      return;
    }

    const tryResolve = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return false;

      // Priority-ordered list of preferred female voice names (partial match)
      const preferredNames = [
        'Samantha',          // macOS – natural, clear female
        'Karen',             // macOS Australian female
        'Moira',             // macOS Irish female
        'Tessa',             // macOS South African female
        'Victoria',          // macOS female
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Microsoft Aria',
        'Microsoft Jenny',
        'Microsoft Libby',
        'en-US-Neural2-F',
        'en-GB-Neural2-F',
      ];

      // 1. Try preferred names first (case-insensitive partial match)
      for (const pref of preferredNames) {
        const found = voices.find(v =>
          v.name.toLowerCase().includes(pref.toLowerCase()) &&
          v.lang.startsWith('en')
        );
        if (found) {
          _resolvedVoice = found;
          resolve(found);
          return true;
        }
      }

      // 2. Any voice whose name hints at female
      const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'jenny', 'aria', 'libby', 'ava', 'karen', 'sarah', 'emma'];
      const femaleGuess = voices.find(v =>
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)) &&
        v.lang.startsWith('en')
      );
      if (femaleGuess) {
        _resolvedVoice = femaleGuess;
        resolve(femaleGuess);
        return true;
      }

      // 3. Any English voice as fallback
      const anyEnglish = voices.find(v => v.lang.startsWith('en'));
      if (anyEnglish) {
        _resolvedVoice = anyEnglish;
        resolve(anyEnglish);
        return true;
      }

      resolve(null);
      return true;
    };

    // Voices may not be loaded immediately — listen for voiceschanged
    if (tryResolve()) return;

    window.speechSynthesis.onvoiceschanged = () => {
      if (!_voicesLoaded) {
        _voicesLoaded = true;
        tryResolve();
      }
    };

    // Timeout guard: resolve with null after 3 seconds if voices never load
    setTimeout(() => resolve(null), 3000);
  });
}

/**
 * Speaks the given text with a clear, natural female voice.
 * @param {string} text - Text to speak
 */
export const speakPrompt = async (text) => {
  if (!('speechSynthesis' in window) || !text) return;

  // Cancel any current speech
  window.speechSynthesis.cancel();

  // Small pause so cancellation fully settles (Safari / Chrome quirk)
  await new Promise(r => setTimeout(r, 80));

  const voice = await resolveFemaleVoice();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.88;   // Slightly slower for child comprehension clarity
  utterance.pitch = 1.1;   // Slightly elevated for a friendly, warm female tone
  utterance.volume = 1.0;

  if (voice) {
    utterance.voice = voice;
    // Override lang to match the chosen voice's locale
    utterance.lang = voice.lang;
  }

  // Chrome workaround: re-speak if synthesis gets stuck
  utterance.onend = null;
  utterance.onerror = (err) => {
    if (err.error !== 'canceled' && err.error !== 'interrupted') {
      console.warn('Speech synthesis error:', err.error);
    }
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Immediately stops any currently playing speech.
 */
export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Returns the name of the resolved voice (useful for debug / display).
 */
export const getSelectedVoiceName = async () => {
  const v = await resolveFemaleVoice();
  return v ? v.name : 'Default System Voice';
};
