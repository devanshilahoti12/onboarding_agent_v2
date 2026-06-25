// igna-chat-widget.js — Universal chat widget (same for every customer)
// Loaded dynamically by the customer's igna-chat.js bootstrap script.
// Self-contained: no external dependencies.
(function (window, document) {
  'use strict';

  var config = null;
  var state = { isOpen: false, messages: [], isLoading: false };

  // ── Styles ────────────────────────────────────────────────────────────────
  function injectStyles() {
    var css = [
      '.igna-chat-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;',
      'background:var(--igna-accent);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);',
      'display:flex;align-items:center;justify-content:center;z-index:999999;transition:transform .2s;}',
      '.igna-chat-fab:hover{transform:scale(1.08);}',
      '.igna-chat-fab svg{width:28px;height:28px;fill:#fff;}',
      '.igna-chat-panel{position:fixed;bottom:92px;right:24px;width:360px;height:520px;',
      'background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.18);',
      'display:flex;flex-direction:column;z-index:999998;overflow:hidden;',
      'opacity:0;pointer-events:none;transform:translateY(12px);transition:opacity .25s,transform .25s;}',
      '.igna-chat-panel.igna-open{opacity:1;pointer-events:all;transform:translateY(0);}',
      '.igna-chat-header{background:var(--igna-primary);color:#fff;padding:14px 16px;',
      'display:flex;align-items:center;justify-content:space-between;}',
      '.igna-chat-header-title{font-weight:600;font-size:15px;font-family:sans-serif;}',
      '.igna-chat-close{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;padding:0;}',
      '.igna-chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;',
      'font-family:sans-serif;font-size:14px;}',
      '.igna-msg{max-width:82%;padding:10px 13px;border-radius:12px;line-height:1.5;word-wrap:break-word;}',
      '.igna-msg.igna-user{align-self:flex-end;background:var(--igna-accent);color:#fff;border-bottom-right-radius:4px;}',
      '.igna-msg.igna-bot{align-self:flex-start;background:#f0f0f5;color:#1a1a2e;border-bottom-left-radius:4px;}',
      '.igna-msg.igna-typing{color:#888;font-style:italic;}',
      '.igna-chat-input-row{display:flex;padding:10px;border-top:1px solid #eee;gap:8px;}',
      '.igna-chat-input{flex:1;padding:10px 12px;border:1px solid #ddd;border-radius:8px;',
      'font-size:14px;outline:none;font-family:sans-serif;}',
      '.igna-chat-input:focus{border-color:var(--igna-accent);}',
      '.igna-chat-send{background:var(--igna-accent);color:#fff;border:none;border-radius:8px;',
      'padding:10px 16px;cursor:pointer;font-size:14px;font-family:sans-serif;}',
      '.igna-chat-send:disabled{opacity:.5;cursor:not-allowed;}'
    ].join('');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── DOM ───────────────────────────────────────────────────────────────────
  var panel, messagesEl, inputEl, sendBtn;

  function buildDOM() {
    // Root vars
    var root = document.createElement('div');
    root.className = 'igna-chat-root';
    root.style.setProperty('--igna-primary', config.theme.primaryColor);
    root.style.setProperty('--igna-accent', config.theme.accentColor);

    // FAB
    var fab = document.createElement('button');
    fab.className = 'igna-chat-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
    fab.addEventListener('click', togglePanel);

    // Panel
    panel = document.createElement('div');
    panel.className = 'igna-chat-panel';

    // Header
    var header = document.createElement('div');
    header.className = 'igna-chat-header';
    var title = document.createElement('span');
    title.className = 'igna-chat-header-title';
    title.textContent = 'IGNA Chat';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'igna-chat-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.addEventListener('click', togglePanel);
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Messages
    messagesEl = document.createElement('div');
    messagesEl.className = 'igna-chat-messages';

    // Input row
    var inputRow = document.createElement('div');
    inputRow.className = 'igna-chat-input-row';
    inputEl = document.createElement('input');
    inputEl.className = 'igna-chat-input';
    inputEl.type = 'text';
    inputEl.placeholder = 'Ask me anything…';
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) sendMessage();
    });
    sendBtn = document.createElement('button');
    sendBtn.className = 'igna-chat-send';
    sendBtn.textContent = 'Send';
    sendBtn.addEventListener('click', sendMessage);
    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(inputRow);

    root.appendChild(fab);
    root.appendChild(panel);
    document.body.appendChild(root);

    // Welcome message
    appendMessage('bot', 'Hi! I\'m IGNA Chat. Ask me anything about this site.');
  }

  // ── Chat logic ────────────────────────────────────────────────────────────
  function togglePanel() {
    state.isOpen = !state.isOpen;
    panel.classList.toggle('igna-open', state.isOpen);
    if (state.isOpen) inputEl.focus();
  }

  function appendMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'igna-msg igna-' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || state.isLoading) return;
    inputEl.value = '';
    appendMessage('user', text);
    state.messages.push({ role: 'user', content: text });
    setLoading(true);

    var typing = appendMessage('bot', '…');
    typing.classList.add('igna-typing');

    var history = state.messages.slice(-6);

    fetch(config.backendUrl + '/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      },
      body: JSON.stringify({
        message: text,
        site_identifier: config.siteIdentifier,
        kb_identifier: config.kbIdentifier,
        conversation_history: history
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        messagesEl.removeChild(typing);
        var reply = data.reply || 'Sorry, I could not get a response.';
        appendMessage('bot', reply);
        state.messages.push({ role: 'assistant', content: reply });
        setLoading(false);
      })
      .catch(function () {
        messagesEl.removeChild(typing);
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
        setLoading(false);
      });
  }

  function setLoading(val) {
    state.isLoading = val;
    sendBtn.disabled = val;
    inputEl.disabled = val;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.IGNAChat = {
    init: function (cfg) {
      config = cfg;
      injectStyles();
      buildDOM();
    }
  };
})(window, document);
