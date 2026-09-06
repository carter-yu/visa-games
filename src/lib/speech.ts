function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  const lower = lang.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === lower) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lower.split("-")[0] ?? lower))
  );
}

function utter(text: string, lang: string): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.92;
  const voice = pickVoice(lang);
  if (voice) u.voice = voice;
  return u;
}

export function speak(zh: string, en?: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const zhLang = pickVoice("zh-HK") ? "zh-HK" : "zh-TW";
  const chain: SpeechSynthesisUtterance[] = [utter(zh, zhLang)];
  if (en) chain.push(utter(en, "en-GB"));
  const play = (i: number) => {
    if (i >= chain.length) return;
    const current = chain[i];
    if (!current) return;
    current.onend = () => play(i + 1);
    speechSynthesis.speak(current);
  };
  play(0);
}
