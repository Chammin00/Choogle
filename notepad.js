/**
 * Choogle Notepad - Practice Workspace Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    activeNoteId: null,
    previewMode: false,
    notes: JSON.parse(localStorage.getItem("choogle-notes") || "[]")
  };

  // Mock starting note if none exist
  if (state.notes.length === 0) {
    state.notes.push({
      id: "note_1",
      title: "Welcome to Notepad",
      body: "# Welcome to Choogle Notepad!\n\nThis is your persistent workspace notes app.\n\n* **Auto-saves** directly to your browser's localStorage.\n* Supports **Markdown** syntax (headers, bold, bullet points).\n* Backup and download your notes as files.\n\n### Markdown Cheat Sheet\n* Use `#` for H1, `##` for H2, `###` for H3\n* Use `**text**` for bold\n* Use `*` or `-` for lists\n* Use `\`code\`` for code tags",
      modifiedAt: new Date().toISOString()
    });
  }

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const notesListContainer = document.getElementById("notes-list-container");
  const newNoteBtn = document.getElementById("new-note-btn");
  const downloadAllBtn = document.getElementById("download-all-btn");

  const noteTitleInput = document.getElementById("note-title-input");
  const noteBodyTextarea = document.getElementById("note-body-textarea");
  const notePreviewDiv = document.getElementById("note-preview-div");
  const togglePreviewBtn = document.getElementById("toggle-preview-btn");
  const deleteNoteBtn = document.getElementById("delete-note-btn");

  const noteCharCount = document.getElementById("note-char-count");
  const saveStatusLog = document.getElementById("save-status-log");

  const choogleSearchInput = document.getElementById("choogle-search-input");
  const choogleSearchBtn = document.getElementById("choogle-search-btn");

  // ==================== AUDIO SYNTH ====================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(type) {
    if (!state.isAudioOn) return;
    initAudio();
    if (!audioCtx || audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("Audio failure", e);
    }
  }

  // ==================== INITIALIZATION ====================
  function init() {
    initTheme();
    state.activeNoteId = state.notes[0]?.id || null;
    renderCatalog();
    loadActiveNote();
    setupEventListeners();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("choogle-theme") || "light";
    htmlEl.setAttribute("data-theme", savedTheme);
    state.theme = savedTheme;
  }

  function toggleTheme() {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", newTheme);
    state.theme = newTheme;
    localStorage.setItem("choogle-theme", newTheme);
    playSynthSound("click");
  }

  // ==================== RENDER CATALOG SIDEBAR ====================
  function renderCatalog() {
    notesListContainer.innerHTML = "";
    
    // Sort notes: most recently modified first
    const sorted = [...state.notes].sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    
    sorted.forEach(note => {
      const el = document.createElement("div");
      el.className = `note-item${note.id === state.activeNoteId ? " active" : ""}`;
      el.setAttribute("data-id", note.id);
      
      const modDate = new Date(note.modifiedAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      el.innerHTML = `
        <span class="note-item-title">${escapeHtml(note.title || "Untitled Note")}</span>
        <span class="note-item-date">${modDate}</span>
      `;

      el.addEventListener("click", () => {
        if (state.activeNoteId === note.id) return;
        playSynthSound("click");
        state.activeNoteId = note.id;
        renderCatalog();
        loadActiveNote();
      });

      notesListContainer.appendChild(el);
    });
  }

  // ==================== LOAD NOTE INTO EDITOR ====================
  function loadActiveNote() {
    const note = state.notes.find(n => n.id === state.activeNoteId);
    if (!note) {
      noteTitleInput.value = "";
      noteBodyTextarea.value = "";
      noteBodyTextarea.disabled = true;
      noteTitleInput.disabled = true;
      noteCharCount.textContent = "0 characters | 0 words";
      updatePreviewBox();
      return;
    }

    noteBodyTextarea.disabled = false;
    noteTitleInput.disabled = false;
    noteTitleInput.value = note.title;
    noteBodyTextarea.value = note.body;
    
    updateCharacterCount(note.body);
    updatePreviewBox();
  }

  // ==================== MARKDOWN PARSER HELPER ====================
  function parseMarkdown(text) {
    let html = escapeHtml(text);

    // Headers: ### H3, ## H2, # H1
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code: `code`
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Lists: - item or * item
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');

    // Group adjacent lists into ul block
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    // Clean nested ul wrappers
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Paragraph line breaks
    html = html.replace(/\n$/gim, '<br>');
    html = html.replace(/\n\n/g, '</p><p>');

    return html;
  }

  function updatePreviewBox() {
    if (state.previewMode) {
      notePreviewDiv.innerHTML = parseMarkdown(noteBodyTextarea.value);
    }
  }

  function updateCharacterCount(val) {
    const chars = val.length;
    const words = val.trim() === "" ? 0 : val.trim().split(/\s+/).length;
    noteCharCount.textContent = `${chars} characters | ${words} words`;
  }

  // ==================== NOTE STATE MANAGEMENTS ====================
  function autoSave() {
    const note = state.notes.find(n => n.id === state.activeNoteId);
    if (!note) return;

    note.title = noteTitleInput.value;
    note.body = noteBodyTextarea.value;
    note.modifiedAt = new Date().toISOString();

    localStorage.setItem("choogle-notes", JSON.stringify(state.notes));
    
    // Smoothly update visual catalogs
    const activeEl = notesListContainer.querySelector(`.note-item[data-id="${note.id}"]`);
    if (activeEl) {
      activeEl.querySelector(".note-item-title").textContent = note.title || "Untitled Note";
      activeEl.querySelector(".note-item-date").textContent = new Date(note.modifiedAt).toLocaleDateString([], {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    }

    saveStatusLog.textContent = `Saved: ${new Date().toLocaleTimeString()}`;
  }

  function createNewNote() {
    playSynthSound("success");
    const newId = "note_" + Date.now();
    const newNote = {
      id: newId,
      title: "New Note",
      body: "",
      modifiedAt: new Date().toISOString()
    };
    
    state.notes.push(newNote);
    state.activeNoteId = newId;
    
    localStorage.setItem("choogle-notes", JSON.stringify(state.notes));
    renderCatalog();
    loadActiveNote();
    noteTitleInput.focus();
  }

  function deleteActiveNote() {
    if (!state.activeNoteId) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    playSynthSound("click");
    state.notes = state.notes.filter(n => n.id !== state.activeNoteId);
    localStorage.setItem("choogle-notes", JSON.stringify(state.notes));

    state.activeNoteId = state.notes[0]?.id || null;
    renderCatalog();
    loadActiveNote();
  }

  function downloadBackup() {
    playSynthSound("success");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.notes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `choogle_notes_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    newNoteBtn.addEventListener("click", createNewNote);
    deleteNoteBtn.addEventListener("click", deleteActiveNote);
    downloadAllBtn.addEventListener("click", downloadBackup);

    // Text inputs listener for auto save
    noteTitleInput.addEventListener("input", () => {
      autoSave();
    });

    noteBodyTextarea.addEventListener("input", (e) => {
      updateCharacterCount(e.target.value);
      autoSave();
      updatePreviewBox();
    });

    // Preview Toggle
    togglePreviewBtn.addEventListener("click", () => {
      playSynthSound("click");
      state.previewMode = !state.previewMode;
      if (state.previewMode) {
        togglePreviewBtn.textContent = "PREVIEW (ON)";
        noteBodyTextarea.classList.add("hidden");
        notePreviewDiv.classList.remove("hidden");
        updatePreviewBox();
      } else {
        togglePreviewBtn.textContent = "PREVIEW (OFF)";
        noteBodyTextarea.classList.remove("hidden");
        notePreviewDiv.classList.add("hidden");
      }
    });

    choogleSearchBtn.addEventListener("click", () => {
      const q = choogleSearchInput.value.trim();
      if (q) {
        window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
    choogleSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = choogleSearchInput.value.trim();
        if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // Kickstart system
  init();
});
