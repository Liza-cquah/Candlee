
(() => {
  "use strict";

  // ==========================================
  // CANDLEE ♡ STUDY TOOLS
  // Flashcards — Version 1
  // ==========================================

  const STORAGE_KEY = "candlee-study-tools-v1";

  const loadFlashcardData = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.decks)) {
        return saved;
      }
    } catch (error) {
      console.warn("Candlee could not load study tools.", error);
    }

    return { decks: [] };
  };

  let data = loadFlashcardData();
  let currentDeckId = null;
  let currentCardIndex = 0;
  let isFlipped = false;

  const makeId = () =>
    globalThis.crypto?.randomUUID?.() ||
    "card-" + Date.now() + "-" + Math.random().toString(36).slice(2);

  const saveData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      alert("Candlee couldn't save your changes. Your browser storage may be full.");
      return false;
    }
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const getCurrentDeck = () =>
    data.decks.find((deck) => deck.id === currentDeckId) || null;

  const getStudyPage = () =>
    document.querySelector("#page-study") ||
    document.querySelector('[data-page="study"]') ||
    document.querySelector(".page");

  function installStyles() {
    if (document.querySelector("#candlee-tools-styles")) return;

    const style = document.createElement("style");
    style.id = "candlee-tools-styles";
    style.textContent = `
      .ct-tools {
        margin-top: 28px;
        color: inherit;
      }

      .ct-tools * {
        box-sizing: border-box;
      }

      .ct-tools h2,
      .ct-tools h3 {
        margin-top: 0;
      }

      .ct-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 18px 0;
      }

      .ct-button,
      .ct-input,
      .ct-textarea,
      .ct-select {
        font: inherit;
        border-radius: 12px;
        padding: 10px 13px;
      }

      .ct-button {
        cursor: pointer;
        border: 1px solid #e6b8cd;
        background: #fff0f6;
        color: #713c56;
        transition: transform .15s ease, opacity .15s ease;
      }

      .ct-button:hover {
        transform: translateY(-1px);
      }

      .ct-button:focus-visible,
      .ct-input:focus-visible,
      .ct-textarea:focus-visible,
      .ct-select:focus-visible {
        outline: 2px solid #c75b8b;
        outline-offset: 2px;
      }

      .ct-button.primary {
        background: #d979a2;
        color: white;
        border-color: #d979a2;
      }

      .ct-button.active {
        background: #713c56;
        color: white;
      }

      .ct-panel {
        border: 1px solid #e8cbd8;
        border-radius: 18px;
        padding: 18px;
        margin: 14px 0;
        background: rgba(255, 240, 246, .42);
      }

      .ct-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
        gap: 12px;
      }

      .ct-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }

      .ct-input,
      .ct-textarea,
      .ct-select {
        width: 100%;
        border: 1px solid #dfc4d0;
        background: white;
        color: #493541;
      }

      .ct-textarea {
        min-height: 90px;
        resize: vertical;
      }

      .ct-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .ct-muted {
        opacity: .75;
        font-size: .92em;
      }

      .ct-flashcard {
        min-height: 220px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 26px;
        border: 2px solid #e7b9ce;
        border-radius: 22px;
        background: linear-gradient(135deg, #fff0f6, #fffafc);
        color: #61374e;
        cursor: pointer;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 1.2rem;
      }

      .ct-flashcard:focus-visible {
        outline: 3px solid #c75b8b;
        outline-offset: 3px;
      }

      .ct-status {
        display: inline-block;
        padding: 4px 9px;
        border-radius: 999px;
        background: #f4e3eb;
        margin-top: 10px;
        font-size: .85em;
      }

      .ct-deck-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 12px;
        border: 1px solid #ead4de;
        border-radius: 12px;
        margin-top: 8px;
      }

      .ct-tools [hidden] {
        display: none !important;
      }

      @media (prefers-color-scheme: dark) {
        .ct-flashcard {
          background: #3d2b38;
          color: #fff0f6;
        }

        .ct-input,
        .ct-textarea,
        .ct-select {
          background: #2e252c;
          color: #fff0f6;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function installInterface() {
    const page = getStudyPage();

    if (!page) {
      console.error("Candlee Study Studio was not found.");
      return;
    }

    if (document.querySelector("#candlee-study-tools")) return;

    installStyles();

    const app = document.createElement("section");
    app.id = "candlee-study-tools";
    app.className = "ct-tools";

    app.innerHTML = `
      <div class="ct-panel">
        <p class="ct-muted">CANDLEE ♡ STUDY STUDIO</p>
        <h2>Study Tools ✨</h2>
        <p>Little steps today, brighter results tomorrow.</p>

        <div class="ct-tabs">
          <button class="ct-button primary" data-action="show-flashcards">
            Flashcards
          </button>
          <button class="ct-button" data-action="show-planner" disabled
            title="Coming in the next update">Study Planner · Soon</button>
          <button class="ct-button" data-action="show-quizzes" disabled
            title="Coming in the next update">Quiz Maker · Soon</button>
        </div>
      </div>

      <div id="ct-flashcards">
        <div class="ct-panel">
          <h3>📚 Your subject decks</h3>
          <label class="ct-field">
            Choose a deck
            <select id="ct-deck-select" class="ct-select">
              <option value="">Create your first deck!</option>
            </select>
          </label>

          <div class="ct-grid" style="margin-top:12px">
            <label class="ct-field">
              New subject / deck name
              <input id="ct-deck-name" class="ct-input"
                placeholder="e.g. Biology, Spanish, History">
            </label>
          </div>

          <div class="ct-actions">
            <button class="ct-button primary" data-action="add-deck">
              + Create deck
            </button>
            <button class="ct-button" data-action="delete-deck">
              Delete selected deck
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>📝 Add a flashcard</h3>
          <div class="ct-grid">
            <label class="ct-field">
              Front · Question or term
              <textarea id="ct-front" class="ct-textarea"
                placeholder="What do you want to remember?"></textarea>
            </label>
            <label class="ct-field">
              Back · Answer or definition
              <textarea id="ct-back" class="ct-textarea"
                placeholder="Write the answer here..."></textarea>
            </label>
          </div>
          <div class="ct-actions">
            <button class="ct-button primary" data-action="add-card">
              + Add flashcard
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>💗 Practice your cards</h3>
          <p id="ct-progress" class="ct-muted">Create a deck to begin!</p>

          <button id="ct-card" class="ct-flashcard"
            data-action="flip-card" type="button">
            Your first flashcard will appear here!
          </button>

          <p id="ct-card-side" class="ct-muted" style="text-align:center">
            Tap the card to flip it.
          </p>

          <div class="ct-actions">
            <button class="ct-button" data-action="previous-card">← Previous</button>
            <button class="ct-button" data-action="next-card">Next →</button>
            <button class="ct-button" data-action="shuffle-cards">🔀 Shuffle</button>
          </div>

          <div class="ct-actions">
            <button class="ct-button primary" data-action="mark-known">
              ✓ I know this!
            </button>
            <button class="ct-button" data-action="mark-review">
              ↻ Review again
            </button>
          </div>

          <p id="ct-status" class="ct-status">Not reviewed yet</p>
        </div>

        <div class="ct-panel">
          <h3>📦 Import & export</h3>
          <p class="ct-muted">
            Export a deck as JSON to copy and save it. Paste JSON below to import
            a deck, including on another device.
          </p>
          <div class="ct-actions">
            <button class="ct-button" data-action="export-deck">
              Prepare deck export
            </button>
          </div>
          <label class="ct-field" style="margin-top:12px">
            Exported or imported JSON
            <textarea id="ct-json" class="ct-textarea"
              placeholder="Exported cards will appear here, or paste a deck to import..."></textarea>
          </label>
          <div class="ct-actions">
            <button class="ct-button" data-action="copy-json">Copy JSON</button>
            <button class="ct-button primary" data-action="import-deck">
              Import as new deck
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>📖 All your decks</h3>
          <div id="ct-deck-list"></div>
        </div>
      </div>
    `;

    const placeholder = page.querySelector(".study-coming-soon");
    const placeholderGrid = page.querySelector(".coming-soon-grid");

    if (placeholder) {
      placeholder.hidden = true;
    } else if (placeholderGrid) {
      placeholderGrid.hidden = true;
    }

    page.appendChild(app);

    app.addEventListener("click", handleAction);
    app.addEventListener("change", (event) => {
      if (event.target.id === "ct-deck-select") {
        currentDeckId = event.target.value || null;
        currentCardIndex = 0;
        isFlipped = false;
        render();
      }
    });

    render();
  }

  function render() {
    const app = document.querySelector("#candlee-study-tools");
    if (!app) return;

    const select = app.querySelector("#ct-deck-select");
    const oldValue = currentDeckId;

    select.innerHTML = data.decks.map((deck) =>
      `<option value="${escapeHTML(deck.id)}">${escapeHTML(deck.name)}</option>`
    ).join("");

    if (!data.decks.some((deck) => deck.id === currentDeckId)) {
      currentDeckId = data.decks[0]?.id || null;
    }

    select.value = currentDeckId || "";

    const deck = getCurrentDeck();
    const card = deck?.cards[currentCardIndex];

    if (!deck || !deck.cards.length) {
      app.querySelector("#ct-card").textContent =
        deck ? "Add a card to start studying!" : "Create a deck to begin!";
      app.querySelector("#ct-card-side").textContent = "Tap the card to flip it.";
      app.querySelector("#ct-progress").textContent = deck
        ? "This deck has no cards yet."
        : "Create your first subject deck above!";
      app.querySelector("#ct-status").textContent = "Not reviewed yet";
    } else {
      if (currentCardIndex >= deck.cards.length) currentCardIndex = 0;

      const activeCard = deck.cards[currentCardIndex];
      app.querySelector("#ct-card").textContent =
        isFlipped ? activeCard.back : activeCard.front;

      app.querySelector("#ct-card-side").textContent =
        isFlipped ? "ANSWER · Tap to see the question" :
        "QUESTION · Tap to reveal the answer";

      const known = deck.cards.filter((item) => item.status === "known").length;
      const review = deck.cards.filter((item) => item.status === "review").length;

      app.querySelector("#ct-progress").textContent =
        `Card ${currentCardIndex + 1} of ${deck.cards.length} · ` +
        `Known: ${known} · Review: ${review}`;

      app.querySelector("#ct-status").textContent =
        activeCard.status === "known" ? "✓ You know this card!" :
        activeCard.status === "review" ? "↻ Needs more practice" :
        "Not reviewed yet";
    }

    const list = app.querySelector("#ct-deck-list");

    if (!data.decks.length) {
      list.innerHTML = "<p class='ct-muted'>Your decks will appear here.</p>";
    } else {
      list.innerHTML = data.decks.map((item) => {
        const known = item.cards.filter((card) => card.status === "known").length;
        const review = item.cards.filter((card) => card.status === "review").length;

        return `
          <div class="ct-deck-item">
            <div>
              <strong>${escapeHTML(item.name)}</strong><br>
              <span class="ct-muted">
                ${item.cards.length} cards · ${known} known · ${review} to review
              </span>
            </div>
            <button class="ct-button"
              data-action="select-deck"
              data-deck-id="${escapeHTML(item.id)}">
              Study deck
            </button>
          </div>`;
      }).join("");
    }

    app.querySelector('[data-action="delete-deck"]').disabled = !deck;
    app.querySelector('[data-action="add-card"]').disabled = !deck;
    app.querySelector('[data-action="export-deck"]').disabled = !deck;
    app.querySelector('[data-action="previous-card"]').disabled =
      !deck || deck.cards.length < 2;
    app.querySelector('[data-action="next-card"]').disabled =
      !deck || deck.cards.length < 2;
    app.querySelector('[data-action="shuffle-cards"]').disabled =
      !deck || deck.cards.length < 2;
    app.querySelector('[data-action="mark-known"]').disabled = !card;
    app.querySelector('[data-action="mark-review"]').disabled = !card;
  }

  function handleAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;

    const action = button.dataset.action;
    const deck = getCurrentDeck();

    if (action === "add-deck") {
      const input = document.querySelector("#ct-deck-name");
      const name = input.value.trim();

      if (!name) {
        alert("Give your deck a subject name first!");
        return;
      }

      const newDeck = { id: makeId(), name, cards: [] };
      data.decks.push(newDeck);
      currentDeckId = newDeck.id;
      currentCardIndex = 0;
      input.value = "";
      saveData();
      render();
    }

    if (action === "delete-deck" && deck) {
      if (!confirm(`Delete the "${deck.name}" deck and all its cards?`)) return;

      data.decks = data.decks.filter((item) => item.id !== deck.id);
      currentDeckId = data.decks[0]?.id || null;
      currentCardIndex = 0;
      isFlipped = false;
      saveData();
      render();
    }

    if (action === "add-card" && deck) {
      const frontInput = document.querySelector("#ct-front");
      const backInput = document.querySelector("#ct-back");
      const front = frontInput.value.trim();
      const back = backInput.value.trim();

      if (!front || !back) {
        alert("Please fill in both the question and answer!");
        return;
      }

      deck.cards.push({ id: makeId(), front, back, status: "new" });
      currentCardIndex = deck.cards.length - 1;
      isFlipped = false;
      frontInput.value = "";
      backInput.value = "";
      saveData();
      render();
    }

    if (action === "flip-card" && deck?.cards.length) {
      isFlipped = !isFlipped;
      render();
    }

    if (action === "next-card" && deck?.cards.length) {
      currentCardIndex = (currentCardIndex + 1) % deck.cards.length;
      isFlipped = false;
      render();
    }

    if (action === "previous-card" && deck?.cards.length) {
      currentCardIndex =
        (currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
      isFlipped = false;
      render();
    }

    if (action === "shuffle-cards" && deck) {
      for (let i = deck.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
      }

      currentCardIndex = 0;
      isFlipped = false;
      saveData();
      render();
    }

    if ((action === "mark-known" || action === "mark-review") &&
        deck?.cards[currentCardIndex]) {
      deck.cards[currentCardIndex].status =
        action === "mark-known" ? "known" : "review";

      saveData();
      render();
    }

    if (action === "select-deck") {
      currentDeckId = button.dataset.deckId;
      currentCardIndex = 0;
      isFlipped = false;
      render();
    }

    if (action === "export-deck" && deck) {
      document.querySelector("#ct-json").value =
        JSON.stringify({ name: deck.name, cards: deck.cards }, null, 2);
    }

    if (action === "copy-json") {
      const area = document.querySelector("#ct-json");
      area.focus();
      area.select();

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(area.value).catch(() => {
          alert("Your JSON is selected. Press Ctrl+C to copy it.");
        });
      } else {
        alert("Your JSON is selected. Press Ctrl+C to copy it.");
      }
    }

    if (action === "import-deck") {
      const area = document.querySelector("#ct-json");

      try {
        const imported = JSON.parse(area.value);

        if (!imported || !Array.isArray(imported.cards) ||
            imported.cards.some((card) =>
              !card || typeof card.front !== "string" ||
              typeof card.back !== "string"
            )) {
          throw new Error("Invalid deck format");
        }

        const newDeck = {
          id: makeId(),
          name: String(imported.name || "Imported deck").slice(0, 100),
          cards: imported.cards.map((card) => ({
            id: makeId(),
            front: card.front.slice(0, 10000),
            back: card.back.slice(0, 10000),
            status: ["known", "review"].includes(card.status)
              ? card.status : "new"
          }))
        };

        data.decks.push(newDeck);
        currentDeckId = newDeck.id;
        currentCardIndex = 0;
        isFlipped = false;
        saveData();
        render();
        alert("Your deck was imported! ♡");
      } catch (error) {
        alert("That JSON couldn't be imported. Please check the format.");
      }
    }
  }

  function start() {
    installInterface();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
