/**
 * chAI — Personal AI Assistant Controller
 * Powered by Google Gemini API
 * Author: Antigravity AI & Chase
 */

document.addEventListener("DOMContentLoaded", () => {

  // ==================== CONSTANTS ====================
  const DEFAULT_SYSTEM_PROMPT = `You are chAI, a friendly and knowledgeable AI assistant built into the Choogle ecosystem. You specialize in IT infrastructure, networking (CCNA, Cisco), Linux administration (RHCSA, Red Hat), VMware virtualization, PowerShell scripting, data lifecycle management, and cybersecurity — but you can help with anything.

Guidelines:
- Be concise but thorough. Use bullet points and headers for long answers.
- Format code in fenced code blocks with language tags.
- When explaining technical concepts, use analogies when helpful.
- Be encouraging and supportive, especially for certification study topics.
- If you don't know something, say so honestly.`;

  const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

  // ==================== STATE ====================
  const state = {
    theme: localStorage.getItem("choogle-theme") || "light",
    apiKey: localStorage.getItem("chai-api-key") || "",
    systemPrompt: localStorage.getItem("chai-system-prompt") || DEFAULT_SYSTEM_PROMPT,
    model: localStorage.getItem("chai-model") || "gemini-2.0-flash",
    conversations: JSON.parse(localStorage.getItem("chai-conversations") || "{}"),
    activeConvId: localStorage.getItem("chai-active-conv") || null,
    isGenerating: false,
    sidebarOpen: true
  };

  // ==================== DOM ELEMENTS ====================
  const htmlEl = document.documentElement;
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const newChatBtn = document.getElementById("new-chat-btn");
  const conversationList = document.getElementById("conversation-list");
  const clearAllBtn = document.getElementById("clear-all-btn");

  const welcomeScreen = document.getElementById("welcome-screen");
  const messagesContainer = document.getElementById("messages-container");
  const typingIndicator = document.getElementById("typing-indicator");

  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const apiKeyInput = document.getElementById("api-key-input");
  const toggleKeyVisibility = document.getElementById("toggle-key-visibility");
  const systemPromptInput = document.getElementById("system-prompt-input");
  const modelSelect = document.getElementById("model-select");
  const saveSettingsBtn = document.getElementById("save-settings-btn");

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const choogleSearchInput = document.getElementById("choogle-search-input");
  const choogleSearchBtn = document.getElementById("choogle-search-btn");

  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  // ==================== INITIALIZATION ====================
  function init() {
    applyTheme();
    loadSettingsUI();
    renderConversationList();

    // If no API key, open settings on first visit
    if (!state.apiKey) {
      setTimeout(() => settingsModal.classList.remove("hidden"), 500);
    }

    // Load active conversation or show welcome
    if (state.activeConvId && state.conversations[state.activeConvId]) {
      renderMessages();
    } else {
      showWelcome();
    }

    setupEventListeners();
  }

  function applyTheme() {
    htmlEl.setAttribute("data-theme", state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", state.theme);
    localStorage.setItem("choogle-theme", state.theme);
  }

  // ==================== SETTINGS ====================
  function loadSettingsUI() {
    apiKeyInput.value = state.apiKey;
    systemPromptInput.value = state.systemPrompt;
    modelSelect.value = state.model;
  }

  function saveSettings() {
    state.apiKey = apiKeyInput.value.trim();
    state.systemPrompt = systemPromptInput.value.trim() || DEFAULT_SYSTEM_PROMPT;
    state.model = modelSelect.value;

    localStorage.setItem("chai-api-key", state.apiKey);
    localStorage.setItem("chai-system-prompt", state.systemPrompt);
    localStorage.setItem("chai-model", state.model);

    settingsModal.classList.add("hidden");
  }

  // ==================== CONVERSATIONS ====================
  function createNewChat() {
    const id = "conv_" + Date.now();
    state.conversations[id] = {
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    };
    state.activeConvId = id;
    saveConversations();
    renderConversationList();
    showWelcome();
    chatInput.focus();
  }

  function switchConversation(id) {
    if (!state.conversations[id]) return;
    state.activeConvId = id;
    localStorage.setItem("chai-active-conv", id);
    renderConversationList();
    renderMessages();
  }

  function deleteConversation(id) {
    delete state.conversations[id];
    if (state.activeConvId === id) {
      const ids = Object.keys(state.conversations);
      state.activeConvId = ids.length > 0 ? ids[ids.length - 1] : null;
    }
    saveConversations();
    renderConversationList();
    if (state.activeConvId) {
      renderMessages();
    } else {
      showWelcome();
    }
  }

  function clearAllChats() {
    if (!confirm("Delete all conversations? This cannot be undone.")) return;
    state.conversations = {};
    state.activeConvId = null;
    saveConversations();
    renderConversationList();
    showWelcome();
  }

  function saveConversations() {
    localStorage.setItem("chai-conversations", JSON.stringify(state.conversations));
    localStorage.setItem("chai-active-conv", state.activeConvId || "");
  }

  // ==================== RENDER SIDEBAR ====================
  function renderConversationList() {
    conversationList.innerHTML = "";
    const ids = Object.keys(state.conversations).sort((a, b) => {
      return (state.conversations[b].createdAt || 0) - (state.conversations[a].createdAt || 0);
    });

    ids.forEach(id => {
      const conv = state.conversations[id];
      const item = document.createElement("div");
      item.className = `conv-item${id === state.activeConvId ? " active" : ""}`;
      item.innerHTML = `
        <span class="conv-title">💬 ${escapeHtml(conv.title)}</span>
        <button class="conv-delete" title="Delete">🗑️</button>
      `;
      item.querySelector(".conv-title").addEventListener("click", () => switchConversation(id));
      item.querySelector(".conv-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteConversation(id);
      });
      conversationList.appendChild(item);
    });
  }

  // ==================== RENDER MESSAGES ====================
  function showWelcome() {
    welcomeScreen.classList.remove("hidden");
    messagesContainer.classList.add("hidden");
    messagesContainer.innerHTML = "";
  }

  function renderMessages() {
    if (!state.activeConvId || !state.conversations[state.activeConvId]) {
      showWelcome();
      return;
    }

    welcomeScreen.classList.add("hidden");
    messagesContainer.classList.remove("hidden");
    messagesContainer.innerHTML = "";

    const conv = state.conversations[state.activeConvId];
    conv.messages.forEach(msg => {
      appendMessageToDOM(msg.role, msg.content);
    });

    scrollToBottom();
  }

  function appendMessageToDOM(role, content) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;

    const avatarText = role === "user" ? "C" : "🤖";
    const renderedContent = role === "ai" ? renderMarkdown(content) : escapeHtml(content);

    msgDiv.innerHTML = `
      <div class="msg-avatar">${avatarText}</div>
      <div class="msg-content">${renderedContent}</div>
    `;

    messagesContainer.appendChild(msgDiv);

    // Bind copy buttons for code blocks
    if (role === "ai") {
      msgDiv.querySelectorAll(".code-copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const code = btn.closest(".code-block-wrapper").querySelector("code").textContent;
          navigator.clipboard.writeText(code).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => btn.textContent = "Copy", 1500);
          });
        });
      });
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  // ==================== MARKDOWN RENDERER ====================
  function renderMarkdown(text) {
    // Code blocks first (```lang\ncode\n```)
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang || "text";
      return `<div class="code-block-wrapper">
        <div class="code-block-header">
          <span>${langLabel}</span>
          <button class="code-copy-btn">Copy</button>
        </div>
        <div class="code-block-body"><code class="code-block-code">${escapeHtml(code.trim())}</code></div>
      </div>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Tables
    text = text.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_, header, sep, body) => {
      const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Unordered lists
    text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks into paragraphs
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!text.startsWith('<')) {
      text = `<p>${text}</p>`;
    }

    return text;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== GEMINI API ====================
  async function sendMessage(userText) {
    if (state.isGenerating || !userText.trim()) return;

    // Ensure a conversation exists
    if (!state.activeConvId || !state.conversations[state.activeConvId]) {
      createNewChat();
    }

    const conv = state.conversations[state.activeConvId];

    // Add user message
    conv.messages.push({ role: "user", content: userText });

    // Auto-title on first message
    if (conv.messages.length === 1) {
      conv.title = userText.substring(0, 40) + (userText.length > 40 ? "..." : "");
      renderConversationList();
    }

    // Show messages view
    welcomeScreen.classList.add("hidden");
    messagesContainer.classList.remove("hidden");

    appendMessageToDOM("user", userText);
    scrollToBottom();

    // Check API key
    if (!state.apiKey) {
      conv.messages.push({ role: "ai", content: "⚠️ **No API key configured.** Click the ⚙️ Settings button in the header and paste your free Google Gemini API key to get started.\n\nGet one here: [Google AI Studio](https://aistudio.google.com/apikey)" });
      appendMessageToDOM("ai", conv.messages[conv.messages.length - 1].content);
      saveConversations();
      scrollToBottom();
      return;
    }

    // Show typing indicator
    state.isGenerating = true;
    sendBtn.disabled = true;
    typingIndicator.classList.remove("hidden");
    scrollToBottom();

    try {
      // Build conversation history for Gemini
      const contents = [];

      // System instruction is separate in Gemini API
      conv.messages.forEach(msg => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });

      const apiUrl = `${GEMINI_BASE}/${state.model}:generateContent?key=${state.apiKey}`;

      const requestBody = {
        system_instruction: {
          parts: [{ text: state.systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192
        }
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errMsg);
      }

      const data = await response.json();

      let aiText = "";
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiText = data.candidates[0].content.parts.map(p => p.text).join("");
      } else {
        aiText = "I received an empty response. Please try again.";
      }

      // Add AI response
      conv.messages.push({ role: "ai", content: aiText });
      appendMessageToDOM("ai", aiText);

    } catch (err) {
      console.error("Gemini API error:", err);
      const errorMsg = `⚠️ **Error:** ${err.message}\n\nPlease check your API key in Settings (⚙️) and try again.`;
      conv.messages.push({ role: "ai", content: errorMsg });
      appendMessageToDOM("ai", errorMsg);
    } finally {
      state.isGenerating = false;
      sendBtn.disabled = chatInput.value.trim() === "";
      typingIndicator.classList.add("hidden");
      saveConversations();
      scrollToBottom();
    }
  }

  // ==================== AUTO-RESIZE TEXTAREA ====================
  function autoResize() {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + "px";
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener("click", toggleTheme);

    // Sidebar toggle
    sidebarToggle.addEventListener("click", () => {
      state.sidebarOpen = !state.sidebarOpen;
      sidebar.classList.toggle("collapsed", !state.sidebarOpen);
    });

    // New chat
    newChatBtn.addEventListener("click", createNewChat);

    // Clear all
    clearAllBtn.addEventListener("click", clearAllChats);

    // Settings
    settingsBtn.addEventListener("click", () => {
      loadSettingsUI();
      settingsModal.classList.remove("hidden");
    });
    closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));
    saveSettingsBtn.addEventListener("click", saveSettings);

    // Close modal on overlay click
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) settingsModal.classList.add("hidden");
    });

    // Toggle key visibility
    toggleKeyVisibility.addEventListener("click", () => {
      const isPassword = apiKeyInput.type === "password";
      apiKeyInput.type = isPassword ? "text" : "password";
      toggleKeyVisibility.textContent = isPassword ? "🙈" : "👁️";
    });

    // Send message
    sendBtn.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if (text && !state.isGenerating) {
        chatInput.value = "";
        chatInput.style.height = "auto";
        sendBtn.disabled = true;
        sendMessage(text);
      }
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    chatInput.addEventListener("input", () => {
      sendBtn.disabled = chatInput.value.trim() === "" || state.isGenerating;
      autoResize();
    });

    // Suggestion chips
    suggestionChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt");
        chatInput.value = prompt;
        sendBtn.disabled = false;
        sendBtn.click();
      });
    });

    // Choogle search bar
    choogleSearchBtn.addEventListener("click", () => {
      const q = choogleSearchInput.value.trim();
      if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
    });
    choogleSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = choogleSearchInput.value.trim();
        if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
      }
    });

    // Keyboard shortcut: Escape closes modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        settingsModal.classList.add("hidden");
      }
    });
  }

  // ==================== KICKSTART ====================
  init();
});
