// Built-in content for the card (works offline). Add or edit items freely.
const TIPS = [
  "Use loading='lazy' on below-the-fold images to speed up the first paint.",
  "The prefers-reduced-motion media query lets you respect users who dislike animations.",
  "Prefer rem over px for font sizes so the user's browser font settings are respected.",
  "Debounce input handlers: wait until the user pauses typing before firing a search request.",
  "Use <button> for actions and <a> for navigation - you get keyboard and screen-reader behavior for free.",
  "git stash saves uncommitted work so you can switch branches without committing.",
  "CSS gap works on both flexbox and grid - no more margin hacks.",
  "Never trust the client: validate and sanitize input on the server too.",
  "Promise.all runs independent async calls in parallel instead of one after another.",
  "Use aspect-ratio in CSS to reserve image space and avoid layout shift.",
  "Keep API keys out of frontend code - anything shipped to the browser is public.",
  ":focus-visible shows focus rings only for keyboard users - better than removing outlines.",
  "Use Intl.NumberFormat and Intl.DateTimeFormat instead of hand-rolled formatting.",
  "In NoSQL databases, shape your data around the queries you need to run.",
  "Lighthouse in Chrome DevTools audits performance, accessibility and SEO in one click.",
  "structuredClone() deep-copies objects natively - no JSON.parse(JSON.stringify()) trick needed.",
  "Use semantic HTML (nav, main, article) before reaching for ARIA attributes.",
  "Add .env to .gitignore before your first commit.",
  "position: sticky only works if you give it a top (or bottom/left/right) value."
];

const WORDS = [
  { word: "resilient", bn: "স্থিতিস্থাপক, সহজে ভেঙে পড়ে না এমন" },
  { word: "ambiguous", bn: "অস্পষ্ট, একাধিক অর্থ হতে পারে এমন" },
  { word: "mitigate", bn: "প্রশমিত করা, ক্ষতি কমানো" },
  { word: "concise", bn: "সংক্ষিপ্ত অথচ স্পষ্ট" },
  { word: "scalable", bn: "যা সহজে বড় করা যায়" },
  { word: "deprecate", bn: "পুরোনো ঘোষণা করা (আর ব্যবহার না করার পরামর্শ)" },
  { word: "iterate", bn: "বারবার করে উন্নত করা" },
  { word: "verbose", bn: "অতিরিক্ত কথায় ভরা" },
  { word: "trade-off", bn: "একটা পেতে আরেকটা ছেড়ে দেওয়া" },
  { word: "robust", bn: "শক্তপোক্ত, সহজে নষ্ট হয় না এমন" },
  { word: "redundant", bn: "অপ্রয়োজনীয়, বাড়তি" },
  { word: "seamless", bn: "নিরবচ্ছিন্ন, জোড়া ধরা যায় না এমন" },
  { word: "ephemeral", bn: "ক্ষণস্থায়ী" },
  { word: "meticulous", bn: "অতি সূক্ষ্ম ও যত্নশীল" },
  { word: "leverage", bn: "কোনো কিছুকে কাজে লাগানো" },
  { word: "bottleneck", bn: "যেখানে এসে গতি আটকে যায়" },
  { word: "nuance", bn: "সূক্ষ্ম পার্থক্য" },
  { word: "pragmatic", bn: "বাস্তবসম্মত" },
  { word: "facilitate", bn: "সহজ করে দেওয়া" },
  { word: "persistent", bn: "অবিচল, লেগে থাকে এমন" }
];

// a = index of the correct option
const QUIZZES = [
  { q: "Which CSS property lets flex items wrap onto the next line?", o: ["flex-wrap", "flex-grow", "align-items"], a: 0 },
  { q: "What does === check in JavaScript?", o: ["Value only", "Value and type", "Type only"], a: 1 },
  { q: "Which HTTP status code means 'Not Found'?", o: ["200", "404", "500"], a: 1 },
  { q: "Which Git command creates a new branch and switches to it?", o: ["git checkout -b", "git branch -d", "git stash"], a: 0 },
  { q: "Which HTML tag suits a navigation menu best?", o: ["<div>", "<section>", "<nav>"], a: 2 },
  { q: "What does CSS z-index control?", o: ["Stacking order", "Font size", "Animation speed"], a: 0 },
  { q: "Array.prototype.map() returns...", o: ["The same array, changed", "A new array", "A single value"], a: 1 },
  { q: "Which of these is NOT a JavaScript primitive?", o: ["string", "object", "boolean"], a: 1 },
  { q: "What does HTTPS add over HTTP?", o: ["Faster images", "Free hosting", "Encryption (TLS)"], a: 2 },
  { q: "Which CSS unit is relative to the root element's font size?", o: ["rem", "vh", "pt"], a: 0 },
  { q: "Which HTTP method is normally used to create a resource?", o: ["GET", "POST", "DELETE"], a: 1 },
  { q: "async/await mainly makes it easier to work with...", o: ["Styling", "File compression", "Promises"], a: 2 }
];

const BREAKS = [
  "চোখ ২০ সেকেন্ডের জন্য দূরের কিছুর দিকে রাখো।",
  "এক গ্লাস পানি খেয়ে নাও।",
  "কাঁধ আর ঘাড় একটু stretch করে নাও।",
  "সোজা হয়ে বসো, পিঠ সোজা রাখো।",
  "কয়েকবার গভীর শ্বাস নাও।"
];
