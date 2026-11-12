const api = typeof browser !== "undefined" ? browser : chrome;
const DEFAULTS = {
  enabled: true,
  message: "একটু অপেক্ষা করো, উত্তর আসছে",
  adMessage: "Ad শেষ হলেই video চলবে",
  notes: true,
  learning: true,
  stats: true,
  breaks: true,
  breakMinutes: 20
};
const $ = (id) => document.getElementById(id);
const boolKeys = ["enabled", "notes", "learning", "stats", "breaks"];

api.storage.sync.get(DEFAULTS).then((s) => {
  for (const k of boolKeys) $(k).checked = s[k];
  $("breakMinutes").value = s.breakMinutes;
  $("message").value = s.message;
  $("adMessage").value = s.adMessage;
});
for (const k of boolKeys) {
  $(k).addEventListener("change", () => api.storage.sync.set({ [k]: $(k).checked }));
}
$("breakMinutes").addEventListener("input", () => {
  const v = Math.max(1, Math.min(180, parseInt($("breakMinutes").value, 10) || 20));
  api.storage.sync.set({ breakMinutes: v });
});
$("message").addEventListener("input", () => api.storage.sync.set({ message: $("message").value }));
$("adMessage").addEventListener("input", () => api.storage.sync.set({ adMessage: $("adMessage").value }));

// ---- stats ----
const today = () => new Date().toLocaleDateString("en-CA");
const fmt = (sec) => (sec < 60 ? `${sec} সেকেন্ড` : `${Math.round(sec / 60)} মিনিট`);
function renderStats() {
  api.storage.local.get({ stats: null }).then(({ stats }) => {
    const s = stats && stats.date === today() ? stats : { count: 0, seconds: 0 };
    $("todayStats").textContent = `${s.count} বার · মোট ${fmt(s.seconds)}`;
  });
}

// ---- notes ----
function saveNotes(notes) {
  return api.storage.local.set({ notes });
}
function renderNotes() {
  api.storage.local.get({ notes: [] }).then(({ notes }) => {
    const ul = $("noteList");
    ul.textContent = "";
    if (!notes.length) {
      const li = document.createElement("li");
      li.textContent = "কোনো note নেই।";
      ul.append(li);
      return;
    }
    for (const n of notes) {
      const li = document.createElement("li");
      if (n.done) li.className = "done";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = n.done;
      cb.addEventListener("change", () => {
        saveNotes(notes.map((x) => (x.id === n.id ? { ...x, done: cb.checked } : x)));
      });
      const span = document.createElement("span");
      span.textContent = n.text;
      const del = document.createElement("button");
      del.textContent = "✕";
      del.title = "Delete";
      del.addEventListener("click", () => saveNotes(notes.filter((x) => x.id !== n.id)));
      li.append(cb, span, del);
      ul.append(li);
    }
  });
}
function addNote() {
  const text = $("newNote").value.trim();
  if (!text) return;
  $("newNote").value = "";
  api.storage.local.get({ notes: [] }).then(({ notes }) => {
    notes.push({ id: Date.now(), text, done: false });
    return saveNotes(notes);
  });
}
$("addNote").addEventListener("click", addNote);
$("newNote").addEventListener("keydown", (e) => { if (e.key === "Enter") addNote(); });

api.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.notes) renderNotes();
  if (changes.stats) renderStats();
});
renderStats();
renderNotes();
