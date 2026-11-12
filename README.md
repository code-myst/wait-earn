# AI Wait Card (v0.4.0)

ChatGPT / Claude / Gemini reply generate korar somoy ar YouTube ad cholar somoy ekta card dekhay:
timer, note/to-do, shekhar card (tip/word/quiz), break reminder, ar ajker waiting stats.

## Chrome / Edge / Brave
1. Zip Extract koro
2. chrome://extensions -> Developer mode on -> "Load unpacked" -> manifest.json ache emon folder select koro
   (age load kora thakle sudhu refresh icon chapo)

## Firefox
about:debugging -> This Firefox -> "Load Temporary Add-on" -> manifest.json select koro

## Customize
- sites.js : kon site-e kon selector dekhe card dekhabe
- data.js  : tips, words, quizzes, break reminder-er lekha

## Card kono site-e na ashle
1. Oi site-e F12 chepe Console tab kholo, "[AI Wait Card]" likha message khojo.
   - "active on ..." dekhle extension oi site-e load hoyeche.
   - "waiting detected, matched: ..." dekhle stop button detect hoyeche.
2. Detect na hole: AI reply dewar somoy Stop button-e right click -> Inspect, tar aria-label / data-testid sites.js e joga koro.
