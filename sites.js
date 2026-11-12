// Selectors that exist ONLY while the card should be visible.
//  - AI sites: the "Stop" button (exists only while the AI is generating)
//  - YouTube: the player gets the "ad-showing" class while an ad plays
// Site keys are hostnames without the leading "www.".
// If a site changes its UI and the card stops showing, fix the selector here.

// Fallback for sites whose exact markup we don't know: any button labelled "stop".
const GENERIC_STOP = [
  'button[aria-label*="stop" i]:not([aria-label*="record" i]):not([aria-label*="dictat" i]):not([aria-label*="voice" i]):not([aria-label*="listen" i]):not([aria-label*="shar" i])',
  'button[data-testid*="stop" i]',
  'button[title*="stop" i]:not([title*="record" i]):not([title*="voice" i]):not([title*="shar" i])',
  '[role="button"][aria-label*="stop" i]:not([aria-label*="record" i]):not([aria-label*="voice" i])'
];

const SITES = {
  "chatgpt.com": {
    kind: "ai",
    selectors: ['button[data-testid="stop-button"]', 'button[aria-label="Stop streaming"]', ...GENERIC_STOP]
  },
  "chat.openai.com": {
    kind: "ai",
    selectors: ['button[data-testid="stop-button"]', 'button[aria-label="Stop streaming"]', ...GENERIC_STOP]
  },
  "claude.ai": {
    kind: "ai",
    selectors: ['button[aria-label="Stop response"]', 'button[aria-label="Stop Response"]', ...GENERIC_STOP]
  },
  "gemini.google.com": {
    kind: "ai",
    selectors: ['button[aria-label="Stop response"]', 'button.stop', ...GENERIC_STOP]
  },
  "meta.ai": { kind: "ai", selectors: GENERIC_STOP },
  "chat.z.ai": { kind: "ai", selectors: GENERIC_STOP },
  "z.ai": { kind: "ai", selectors: GENERIC_STOP },
  "chat.deepseek.com": { kind: "ai", selectors: GENERIC_STOP },
  "grok.com": { kind: "ai", selectors: GENERIC_STOP },
  "perplexity.ai": { kind: "ai", selectors: GENERIC_STOP },
  "copilot.microsoft.com": { kind: "ai", selectors: GENERIC_STOP },
  "chat.qwen.ai": { kind: "ai", selectors: GENERIC_STOP },
  "chat.mistral.ai": { kind: "ai", selectors: GENERIC_STOP },
  "youtube.com": {
    kind: "ad",
    selectors: ['.html5-video-player.ad-showing']
  },
  "m.youtube.com": {
    kind: "ad",
    selectors: ['.html5-video-player.ad-showing']
  }
};

const KINDS = {
  ai: { title: "AI is thinking…", messageKey: "message", position: "bottom" },
  ad: { title: "Ad চলছে…", messageKey: "adMessage", position: "top" }
};
