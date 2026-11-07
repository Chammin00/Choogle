/**
 * Choogle Tasks - Kanban Board Controller
 * Author: Antigravity AI
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    theme: "light",
    isAudioOn: true,
    tasks: JSON.parse(localStorage.getItem("choogle-tasks") || "[]"),
    activeAddStatus: "todo" // "todo" | "progress" | "done"
  };

  // Mock tasks if none exist
  if (state.tasks.length === 0) {
    state.tasks = [
      {
        id: "task_1",
        title: "Study CCNA Subnetting",
        desc: "Complete Cisco subnet range tables and master /26, /27, /28 boundaries.",
        priority: "high",
        status: "todo",
        createdAt: Date.now()
      },
      {
        id: "task_2",
        title: "Practice RHCSA command sequences",
        desc: "Memorize target overrides and systemctl runlevels.",
        priority: "medium",
        status: "progress",
        createdAt: Date.now()
      },
      {
        id: "task_3",
        title: "Setup chAI assistant API keys",
        desc: "Acquire free key from Google AI Studio and configure settings panel.",
        priority: "low",
        status: "done",
        createdAt: Date.now()
      }
    ];
  }

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sfxToggleBtn = document.getElementById("sfx-toggle-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  const kanbanColumns = document.querySelectorAll(".kanban-column");
  const addButtons = document.querySelectorAll(".add-task-trigger-btn");

  // Modal elements
  const newTaskModal = document.getElementById("new-task-modal");
  const taskTitleInput = document.getElementById("task-title-input");
  const taskDescInput = document.getElementById("task-desc-input");
  const taskPrioritySelect = document.getElementById("task-priority-select");
  const cancelTaskBtn = document.getElementById("cancel-task-btn");
  const saveTaskBtn = document.getElementById("save-task-btn");

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
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
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
    renderBoard();
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

  // ==================== RENDERING KANBAN CARDS ====================
  function renderBoard() {
    const counts = { todo: 0, progress: 0, done: 0 };
    
    // Clear zones
    kanbanColumns.forEach(col => {
      col.querySelector(".tasks-dropzone").innerHTML = "";
    });

    state.tasks.forEach(task => {
      counts[task.status]++;
      const card = createTaskCard(task);
      const zone = document.querySelector(`#col-${task.status} .tasks-dropzone`);
      if (zone) zone.appendChild(card);
    });

    // Update count labels
    document.getElementById("count-todo").textContent = `[${counts.todo}]`;
    document.getElementById("count-progress").textContent = `[${counts.progress}]`;
    document.getElementById("count-done").textContent = `[${counts.done}]`;

    // Save to local storage
    localStorage.setItem("choogle-tasks", JSON.stringify(state.tasks));
  }

  function createTaskCard(task) {
    const el = document.createElement("div");
    el.className = "task-card";
    el.setAttribute("draggable", "true");
    el.setAttribute("data-id", task.id);

    let priorityColor = "var(--color-green)";
    if (task.priority === "medium") priorityColor = "var(--color-yellow)";
    else if (task.priority === "high") priorityColor = "var(--color-red)";

    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="display: flex; align-items: center;">
          <span class="task-priority-indicator" style="background-color: ${priorityColor};"></span>
          <strong style="font-size: 13px;">${escapeHtml(task.title)}</strong>
        </div>
        <button class="delete-task-btn" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:10px;">✕</button>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;">
        ${escapeHtml(task.desc || "No additional description details provided.")}
      </p>
      
      <!-- Accessible Shifting Action Controls -->
      <div style="display: flex; justify-content: flex-end; gap: 4px;">
        ${task.status !== "todo" ? `<button class="shift-task-btn" data-dir="left" style="font-size: 9px; padding: 2px 6px; cursor: pointer; border: 1px solid var(--border-color); background: none; border-radius: 3px; color: var(--text-primary);">◀</button>` : ""}
        ${task.status !== "done" ? `<button class="shift-task-btn" data-dir="right" style="font-size: 9px; padding: 2px 6px; cursor: pointer; border: 1px solid var(--border-color); background: none; border-radius: 3px; color: var(--text-primary);">▶</button>` : ""}
      </div>
    `;

    // Drag events
    el.addEventListener("dragstart", () => {
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
    });

    // Delete binding
    el.querySelector(".delete-task-btn").addEventListener("click", () => {
      playSynthSound("click");
      state.tasks = state.tasks.filter(t => t.id !== task.id);
      renderBoard();
    });

    // Shift bounds binding
    el.querySelectorAll(".shift-task-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        playSynthSound("click");
        const dir = btn.getAttribute("data-dir");
        if (dir === "left") {
          task.status = task.status === "done" ? "progress" : "todo";
        } else {
          task.status = task.status === "todo" ? "progress" : "done";
        }
        renderBoard();
      });
    });

    return el;
  }

  // ==================== TASK MODAL MANAGER ====================
  function openModal(status) {
    playSynthSound("click");
    state.activeAddStatus = status;
    newTaskModal.classList.remove("hidden");
    taskTitleInput.value = "";
    taskDescInput.value = "";
    taskTitleInput.focus();
  }

  function closeModal() {
    newTaskModal.classList.add("hidden");
  }

  function saveTask() {
    const title = taskTitleInput.value.trim();
    const desc = taskDescInput.value.trim();
    const priority = taskPrioritySelect.value;

    if (!title) {
      alert("Task title is required.");
      return;
    }

    playSynthSound("success");
    const newTask = {
      id: "task_" + Date.now(),
      title: title,
      desc: desc,
      priority: priority,
      status: state.activeAddStatus,
      createdAt: Date.now()
    };

    state.tasks.push(newTask);
    closeModal();
    renderBoard();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== DRAG & DROP BINDINGS ====================
  function setupDragEvents() {
    kanbanColumns.forEach(col => {
      const zone = col.querySelector(".tasks-dropzone");

      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("drag-over");
      });

      col.addEventListener("dragleave", () => {
        col.classList.remove("drag-over");
      });

      col.addEventListener("drop", () => {
        col.classList.remove("drag-over");
        const draggingCard = document.querySelector(".task-card.dragging");
        if (!draggingCard) return;

        const taskId = draggingCard.getAttribute("data-id");
        const destStatus = col.getAttribute("data-status");

        const task = state.tasks.find(t => t.id === taskId);
        if (task && task.status !== destStatus) {
          playSynthSound("click");
          task.status = destStatus;
          renderBoard();
        }
      });
    });
  }

  // ==================== EVENT BINDINGS ====================
  function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);

    sfxToggleBtn.addEventListener("click", () => {
      state.isAudioOn = !state.isAudioOn;
      sfxToggleBtn.textContent = state.isAudioOn ? "🔊" : "🔇";
      playSynthSound("click");
    });

    addButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const colStatus = btn.getAttribute("data-status");
        openModal(colStatus);
      });
    });

    cancelTaskBtn.addEventListener("click", closeModal);
    saveTaskBtn.addEventListener("click", saveTask);

    setupDragEvents();

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
