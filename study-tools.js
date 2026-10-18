/* =====================================================
   CANDLEE ♡ STUDY STUDIO
   Flashcards + Quiz Maker + Study Planner
   "A little light for your everyday."
   ===================================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "candlee-study-tools-v1";

  const $ = (selector, root = document) => root.querySelector(selector);

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

      return {
        decks: Array.isArray(saved.decks) ? saved.decks : [],
        quizzes: Array.isArray(saved.quizzes) ? saved.quizzes : [],
        quizHistory: Array.isArray(saved.quizHistory) ? saved.quizHistory : [],
        tasks: Array.isArray(saved.tasks) ? saved.tasks : []
      };
    } catch (error) {
      return { decks: [], quizzes: [], quizHistory: [], tasks: [] };
    }
  }

  const data = loadData();

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      alert("Candlee couldn't save your changes. Check your browser storage.");
    }
  }

  function notify(message) {
    const toast = $("#ct-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  function formatDate(dateString) {
    if (!dateString) return "No due date";

    const date = new Date(dateString + "T12:00:00");
    if (Number.isNaN(date.getTime())) return "No due date";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function todayString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  /* -----------------------------------------------------
     FIND THE STUDY PAGE
     ----------------------------------------------------- */

  function findStudyPage() {
    return document.querySelector("#page-study") ||
      document.querySelector('[data-page="study"]') ||
      document.querySelector(".page-study");
  }

  /* -----------------------------------------------------
     STYLES
     ----------------------------------------------------- */

  function installStyles() {
    if ($("#ct-styles")) return;

    const style = document.createElement("style");
    style.id = "ct-styles";

    style.textContent = `
      #candlee-study-tools {
        --ct-pink: #e98cab;
        --ct-dark-pink: #bc5e82;
        --ct-ink: #51434d;
        --ct-muted: #8e7c87;
        --ct-line: #f0dce5;
        --ct-paper: #fffafd;
        color: var(--ct-ink);
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
        margin: 18px auto;
      }

      #candlee-study-tools *,
      #candlee-study-tools *::before,
      #candlee-study-tools *::after {
        box-sizing: border-box;
      }

      #candlee-study-tools [hidden] {
        display: none !important;
      }

      #candlee-study-tools .ct-heading {
        margin: 0 0 6px;
        font-size: clamp(1.55rem, 4vw, 2rem);
        color: #a94f76;
      }

      #candlee-study-tools .ct-subtitle {
        color: var(--ct-muted);
        margin: 0 0 18px;
        line-height: 1.6;
      }

      #candlee-study-tools .ct-tabs,
      #candlee-study-tools .ct-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin: 12px 0;
      }

      #candlee-study-tools .ct-button {
        border: 1px solid var(--ct-line);
        background: white;
        color: var(--ct-ink);
        padding: 10px 14px;
        border-radius: 12px;
        font: inherit;
        font-size: .92rem;
        cursor: pointer;
        transition: background .15s, transform .15s;
      }

      #candlee-study-tools .ct-button:hover {
        background: #fff0f6;
        transform: translateY(-1px);
      }

      #candlee-study-tools .ct-button.primary,
      #candlee-study-tools .ct-button.active {
        background: var(--ct-pink);
        border-color: var(--ct-pink);
        color: white;
      }

      #candlee-study-tools .ct-button.danger {
        color: #a63852;
        background: #fff1f3;
      }

      #candlee-study-tools .ct-button:disabled {
        opacity: .5;
        cursor: not-allowed;
        transform: none;
      }

      #candlee-study-tools .ct-panel {
        background: var(--ct-paper);
        border: 1px solid var(--ct-line);
        border-radius: 18px;
        padding: clamp(14px, 3vw, 22px);
        margin: 14px 0;
        min-width: 0;
      }

      #candlee-study-tools .ct-panel h3 {
        margin: 0 0 14px;
        color: #a94f76;
        font-size: 1.12rem;
      }

      #candlee-study-tools .ct-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      #candlee-study-tools .ct-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #735e6a;
        font-size: .9rem;
        min-width: 0;
      }

      #candlee-study-tools .ct-input,
      #candlee-study-tools .ct-select,
      #candlee-study-tools .ct-textarea {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        padding: 11px 12px;
        border: 1px solid #e9d3df;
        border-radius: 10px;
        background: white;
        color: var(--ct-ink);
        font: inherit;
        font-size: 1rem;
      }

      #candlee-study-tools .ct-textarea {
        min-height: 90px;
        resize: vertical;
      }

      #candlee-study-tools .ct-input:focus,
      #candlee-study-tools .ct-select:focus,
      #candlee-study-tools .ct-textarea:focus {
        outline: 2px solid #f5bad0;
        outline-offset: 1px;
      }

      #candlee-study-tools .ct-muted {
        color: var(--ct-muted);
        font-size: .9rem;
        line-height: 1.6;
      }

      #candlee-study-tools .ct-list {
        display: grid;
        gap: 10px;
      }

      #candlee-study-tools .ct-item {
        background: white;
        border: 1px solid var(--ct-line);
        border-radius: 13px;
        padding: 13px;
        min-width: 0;
      }

      #candlee-study-tools .ct-item-title {
        font-weight: 700;
        overflow-wrap: anywhere;
        margin-bottom: 5px;
      }

      #candlee-study-tools .ct-item p {
        margin: 5px 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        line-height: 1.55;
      }

      #candlee-study-tools .ct-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: #ffedf4;
        color: #a94f76;
        font-size: .78rem;
        margin: 3px 4px 3px 0;
      }

      #candlee-study-tools .ct-flashcard {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        min-height: 210px;
        padding: 24px;
        border: 2px dashed #e9b5cc;
        border-radius: 20px;
        background: linear-gradient(135deg, #fff4f8, #fffafd);
        cursor: pointer;
        overflow-wrap: anywhere;
      }

      #candlee-study-tools .ct-flashcard .ct-card-label {
        font-size: .8rem;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--ct-dark-pink);
        margin-bottom: 12px;
      }

      #candlee-study-tools .ct-flashcard .ct-card-content {
        font-size: clamp(1.15rem, 3vw, 1.5rem);
        line-height: 1.5;
        white-space: pre-wrap;
      }

      #candlee-study-tools .ct-option {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 11px;
        background: white;
        border: 1px solid var(--ct-line);
        border-radius: 10px;
        margin: 8px 0;
        cursor: pointer;
        line-height: 1.5;
      }

      #candlee-study-tools .ct-option input {
        margin-top: 5px;
        accent-color: var(--ct-pink);
      }

      #candlee-study-tools .ct-progress {
        width: 100%;
        height: 9px;
        background: #f3e5ec;
        border-radius: 999px;
        overflow: hidden;
        margin: 10px 0;
      }

      #candlee-study-tools .ct-progress span {
        display: block;
        height: 100%;
        width: 0;
        background: var(--ct-pink);
        transition: width .2s;
      }

      #candlee-study-tools .ct-toast {
        position: sticky;
        bottom: 10px;
        z-index: 10;
        padding: 12px 16px;
        margin: 12px 0;
        border-radius: 12px;
        background: #8c4968;
        color: white;
        box-shadow: 0 4px 16px #00000012;
      }

      #candlee-study-tools .ct-checkline {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }

      #candlee-study-tools .ct-checkline input {
        margin-top: 5px;
        accent-color: var(--ct-pink);
      }

      #candlee-study-tools .ct-complete {
        text-decoration: line-through;
        opacity: .6;
      }

      @media (max-width: 560px) {
        #candlee-study-tools .ct-grid {
          grid-template-columns: 1fr;
        }

        #candlee-study-tools .ct-button {
          padding: 9px 11px;
        }

        #candlee-study-tools .ct-panel {
          border-radius: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* -----------------------------------------------------
     INTERFACE
     ----------------------------------------------------- */

  function installInterface() {
    const page = findStudyPage();

    if (!page) {
      console.warn(
        "Candlee Study Studio: couldn't find the study page. " +
        "Check that index.html contains an element with id='page-study'."
      );
      return false;
    }

    let app = $("#candlee-study-tools");

    if (!app) {
      app = document.createElement("section");
      app.id = "candlee-study-tools";
      page.appendChild(app);
    }

    app.innerHTML = `
      <header>
        <h2 class="ct-heading">Study Studio ♡</h2>
        <p class="ct-subtitle">
          Your little corner for learning, practicing, and planning.
        </p>
      </header>

      <nav class="ct-tabs" aria-label="Study tools">
        <button class="ct-button active" data-action="tab" data-tab="flashcards">
          🗂️ Flashcards
        </button>
        <button class="ct-button" data-action="tab" data-tab="quizzes">
          ✨ Quiz Maker
        </button>
        <button class="ct-button" data-action="tab" data-tab="planner">
          🌷 Study Planner
        </button>
      </nav>

      <div id="ct-toast" class="ct-toast" role="status" hidden></div>

      <!-- FLASHCARDS -->
      <section data-tool="flashcards">
        <div class="ct-panel">
          <h3>🩷 Create a flashcard deck</h3>
          <label class="ct-field">
            Subject or deck name
            <input id="ct-deck-name" class="ct-input"
              placeholder="e.g. Biology, French, History" maxlength="80">
          </label>
          <div class="ct-actions">
            <button class="ct-button primary" data-action="create-deck">
              + Create deck
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>Your decks</h3>
          <label class="ct-field">
            Choose a deck
            <select id="ct-deck-select" class="ct-select">
              <option value="">Choose a deck...</option>
            </select>
          </label>

          <div id="ct-deck-summary" class="ct-muted"></div>

          <div id="ct-card-builder" hidden>
            <div class="ct-grid">
              <label class="ct-field">
                Front — question or term
                <textarea id="ct-card-front" class="ct-textarea"
                  placeholder="What do you want to remember?"></textarea>
              </label>
              <label class="ct-field">
                Back — answer or definition
                <textarea id="ct-card-back" class="ct-textarea"
                  placeholder="Write the answer here..."></textarea>
              </label>
            </div>
            <div class="ct-actions">
              <button class="ct-button primary" data-action="add-card">
                + Add card
              </button>
              <button class="ct-button danger" data-action="delete-deck">
                Delete deck
              </button>
            </div>
          </div>
        </div>

        <div class="ct-panel" id="ct-review-panel" hidden>
          <h3>Let's practice!</h3>
          <div id="ct-flashcard" class="ct-flashcard"
            role="button" tabindex="0" aria-label="Flip flashcard">
            <div class="ct-card-label">Question</div>
            <div class="ct-card-content">Your card will appear here.</div>
          </div>
          <p id="ct-card-position" class="ct-muted"></p>
          <div class="ct-actions">
            <button class="ct-button" data-action="previous-card">← Previous</button>
            <button class="ct-button primary" data-action="flip-card">Flip card</button>
            <button class="ct-button" data-action="next-card">Next →</button>
            <button class="ct-button" data-action="shuffle-cards">🔀 Shuffle</button>
          </div>
          <div class="ct-actions">
            <button class="ct-button" data-action="mark-review">↻ Review again</button>
            <button class="ct-button primary" data-action="mark-known">✓ I know this!</button>
          </div>
          <div id="ct-card-progress" class="ct-muted"></div>
          <div class="ct-progress"><span id="ct-card-progress-bar"></span></div>
          <div id="ct-card-list" class="ct-list"></div>
        </div>
      </section>

      <!-- QUIZ MAKER -->
      <section data-tool="quizzes" hidden>
        <div class="ct-panel">
          <h3>✨ Build your quiz</h3>

          <label class="ct-field">
            Quiz title
            <input id="ct-quiz-title" class="ct-input"
              placeholder="e.g. Biology Chapter 3" maxlength="100">
          </label>

          <div class="ct-grid" style="margin-top:12px">
            <label class="ct-field">
              Question type
              <select id="ct-question-type" class="ct-select">
                <option value="multiple">Multiple choice</option>
                <option value="truefalse">True or false</option>
              </select>
            </label>

            <label class="ct-field">
              Quiz timer
              <select id="ct-quiz-duration" class="ct-select">
                <option value="0">No timer</option>
                <option value="60">1 minute</option>
                <option value="180">3 minutes</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
                <option value="900">15 minutes</option>
              </select>
            </label>
          </div>

          <label class="ct-field" style="margin-top:12px">
            Question
            <textarea id="ct-question" class="ct-textarea"
              placeholder="Write your question..." maxlength="1000"></textarea>
          </label>

          <div id="ct-answer-fields">
            <div class="ct-grid" style="margin-top:12px">
              <label class="ct-field">Option A
                <input id="ct-option-a" class="ct-input" maxlength="300">
              </label>
              <label class="ct-field">Option B
                <input id="ct-option-b" class="ct-input" maxlength="300">
              </label>
              <label class="ct-field">Option C
                <input id="ct-option-c" class="ct-input" maxlength="300">
              </label>
              <label class="ct-field">Option D
                <input id="ct-option-d" class="ct-input" maxlength="300">
              </label>
            </div>
          </div>

          <label class="ct-field" style="margin-top:12px">
            Correct answer
            <select id="ct-correct-answer" class="ct-select">
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </label>

          <label class="ct-field" style="margin-top:12px">
            Explanation (optional)
            <textarea id="ct-explanation" class="ct-textarea"
              placeholder="Explain why the answer is correct..." maxlength="1000"></textarea>
          </label>

          <div class="ct-actions">
            <button class="ct-button primary" data-action="add-question">
              + Add question
            </button>
            <button class="ct-button" data-action="save-quiz">
              Save quiz
            </button>
            <button class="ct-button" data-action="clear-draft">
              Clear draft
            </button>
          </div>

          <p id="ct-builder-status" class="ct-muted">
            Add your first question to get started!
          </p>
          <div id="ct-draft-list" class="ct-list"></div>
        </div>

        <div class="ct-panel">
          <h3>📝 Your saved quizzes</h3>
          <div id="ct-quiz-list" class="ct-list"></div>
        </div>

        <div id="ct-quiz-player" class="ct-panel" hidden>
          <h3 id="ct-play-title">Quiz time!</h3>
          <p id="ct-quiz-timer" class="ct-muted"></p>
          <p id="ct-play-progress" class="ct-muted"></p>
          <div class="ct-progress"><span id="ct-quiz-progress-bar"></span></div>
          <div id="ct-play-question"></div>
          <div id="ct-play-feedback" aria-live="polite"></div>
          <div class="ct-actions">
            <button class="ct-button primary" data-action="submit-answer">
              Check answer
            </button>
            <button class="ct-button" data-action="next-question" hidden>
              Next question →
            </button>
            <button class="ct-button primary" data-action="finish-quiz" hidden>
              Finish quiz
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>🏆 Score history</h3>
          <div id="ct-quiz-history" class="ct-list"></div>
        </div>
      </section>

      <!-- STUDY PLANNER -->
      <section data-tool="planner" hidden>
        <div class="ct-panel">
          <h3>🌷 Plan a study session</h3>

          <label class="ct-field">
            Task
            <input id="ct-task-title" class="ct-input"
              placeholder="e.g. Review cell division" maxlength="160">
          </label>

          <div class="ct-grid" style="margin-top:12px">
            <label class="ct-field">
              Subject
              <input id="ct-task-subject" class="ct-input"
                placeholder="e.g. Biology" maxlength="80">
            </label>
            <label class="ct-field">
              Due date
              <input id="ct-task-date" class="ct-input" type="date">
            </label>
            <label class="ct-field">
              Priority
              <select id="ct-task-priority" class="ct-select">
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </label>
            <label class="ct-field">
              Estimated study time
              <select id="ct-task-minutes" class="ct-select">
                <option value="15">15 minutes</option>
                <option value="25" selected>25 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </label>
          </div>

          <label class="ct-field" style="margin-top:12px">
            Notes (optional)
            <textarea id="ct-task-notes" class="ct-textarea"
              placeholder="Chapters, pages, or anything to remember..."
              maxlength="1000"></textarea>
          </label>

          <div class="ct-actions">
            <button class="ct-button primary" data-action="add-task">
              + Add study task
            </button>
          </div>
        </div>

        <div class="ct-panel">
          <h3>Your study progress ♡</h3>
          <div id="ct-planner-summary" class="ct-muted"></div>
          <div class="ct-progress"><span id="ct-planner-progress-bar"></span></div>

          <label class="ct-field">
            Show tasks
            <select id="ct-task-filter" class="ct-select">
              <option value="all">All tasks</option>
              <option value="open">Not completed</option>
              <option value="done">Completed</option>
            </select>
          </label>

          <div id="ct-task-list" class="ct-list" style="margin-top:12px"></div>
        </div>
      </section>
    `;

    installStyles();

    $("#ct-deck-select").addEventListener("change", renderFlashcards);
    $("#ct-question-type").addEventListener("change", updateQuestionType);
    $("#ct-task-filter").addEventListener("change", renderPlanner);

    app.addEventListener("click", handleClick);

    app.addEventListener("keydown", (event) => {
      if (
        event.target.id === "ct-flashcard" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        flipCard();
      }
    });

    $("#ct-flashcard").addEventListener("click", flipCard);

    renderAll();
    return true;
  }

  /* -----------------------------------------------------
     TAB NAVIGATION
     ----------------------------------------------------- */

  function showTab(tabName) {
    const app = $("#candlee-study-tools");
    if (!app) return;

    app.querySelectorAll("[data-tool]").forEach((section) => {
      section.hidden = section.dataset.tool !== tabName;
    });

    app.querySelectorAll('[data-action="tab"]').forEach((button) => {
      const active = button.dataset.tab === tabName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  /* -----------------------------------------------------
     FLASHCARDS
     ----------------------------------------------------- */

  let currentCardIndex = 0;
  let cardIsFlipped = false;

  function selectedDeck() {
    const id = $("#ct-deck-select")?.value;
    return data.decks.find((deck) => deck.id === id) || null;
  }

  function deckName(deck) {
    return deck.name || deck.title || "Untitled deck";
  }

  function ensureDeckShape(deck) {
    if (!Array.isArray(deck.cards)) deck.cards = [];

    deck.cards.forEach((card) => {
      if (card.known === undefined) card.known = false;
    });
  }

  function renderDeckOptions() {
    const select = $("#ct-deck-select");
    if (!select) return;

    const previous = select.value;

    select.innerHTML =
      '<option value="">Choose a deck...</option>' +
      data.decks.map((deck) => {
        ensureDeckShape(deck);
        return `<option value="${escapeHTML(deck.id)}">${escapeHTML(deckName(deck))}</option>`;
      }).join("");

    if (data.decks.some((deck) => deck.id === previous)) {
      select.value = previous;
    } else if (data.decks.length) {
      select.value = data.decks[0].id;
    }
  }

  function renderFlashcards() {
    const deck = selectedDeck();
    const builder = $("#ct-card-builder");
    const review = $("#ct-review-panel");
    const summary = $("#ct-deck-summary");

    if (!deck) {
      builder.hidden = true;
      review.hidden = true;
      summary.textContent = data.decks.length
        ? "Choose a deck to add cards or start reviewing."
        : "You haven't made a deck yet. Create one to begin!";
      return;
    }

    ensureDeckShape(deck);
    builder.hidden = false;

    const known = deck.cards.filter((card) => card.known).length;
    summary.textContent =
      `${deck.cards.length} card${deck.cards.length === 1 ? "" : "s"} · ` +
      `${known} mastered · ${deck.cards.length - known} to review`;

    review.hidden = deck.cards.length === 0;

    if (deck.cards.length) {
      currentCardIndex = Math.min(currentCardIndex, deck.cards.length - 1);
      renderCurrentCard();
      renderCardList();
    } else {
      $("#ct-card-position").textContent = "Add your first card to start practicing.";
      $("#ct-card-progress").textContent = "";
      $("#ct-card-list").innerHTML = "";
    }
  }

  function renderCurrentCard() {
    const deck = selectedDeck();
    if (!deck || !deck.cards.length) return;

    const card = deck.cards[currentCardIndex];
    const flashcard = $("#ct-flashcard");

    flashcard.innerHTML = `
      <div class="ct-card-label">${cardIsFlipped ? "Answer" : "Question"}</div>
      <div class="ct-card-content">${
        escapeHTML(cardIsFlipped ? card.back : card.front)
      }</div>
    `;

    $("#ct-card-position").textContent =
      `Card ${currentCardIndex + 1} of ${deck.cards.length}`;

    const known = deck.cards.filter((item) => item.known).length;
    const percentage = deck.cards.length ? Math.round(known / deck.cards.length * 100) : 0;

    $("#ct-card-progress").textContent =
      `${known} of ${deck.cards.length} cards mastered (${percentage}%)`;

    $("#ct-card-progress-bar").style.width = percentage + "%";
  }

  function renderCardList() {
    const deck = selectedDeck();
    const list = $("#ct-card-list");
    if (!deck || !list) return;

    list.innerHTML = `
      <h3 style="margin-top:16px">Cards in this deck</h3>
      ${deck.cards.map((card, index) => `
        <article class="ct-item">
          <div class="ct-item-title">${index + 1}. ${escapeHTML(card.front)}</div>
          <p>${escapeHTML(card.back)}</p>
          <span class="ct-badge">${card.known ? "✓ Mastered" : "↻ Review"}</span>
          <button class="ct-button danger" data-action="delete-card"
            data-id="${escapeHTML(card.id)}">Delete card</button>
        </article>
      `).join("")}
    `;
  }

  function createDeck() {
    const input = $("#ct-deck-name");
    const name = input.value.trim();

    if (!name) {
      notify("Give your deck a name first ♡");
      input.focus();
      return;
    }

    data.decks.push({ id: makeId(), name, cards: [] });
    saveData();

    input.value = "";
    renderDeckOptions();
    $("#ct-deck-select").value = data.decks[data.decks.length - 1].id;
    currentCardIndex = 0;
    cardIsFlipped = false;
    renderFlashcards();
    notify("Your new deck is ready!");
  }

  function addCard() {
    const deck = selectedDeck();
    if (!deck) return notify("Choose a deck first.");

    const front = $("#ct-card-front").value.trim();
    const back = $("#ct-card-back").value.trim();

    if (!front || !back) {
      notify("Please fill in both sides of your card.");
      return;
    }

    ensureDeckShape(deck);
    deck.cards.push({ id: makeId(), front, back, known: false });

    $("#ct-card-front").value = "";
    $("#ct-card-back").value = "";

    currentCardIndex = deck.cards.length - 1;
    cardIsFlipped = false;

    saveData();
    renderFlashcards();
    notify("Flashcard added! ♡");
  }

  function flipCard() {
    const deck = selectedDeck();
    if (!deck || !deck.cards.length) return;

    cardIsFlipped = !cardIsFlipped;
    renderCurrentCard();
  }

  function moveCard(direction) {
    const deck = selectedDeck();
    if (!deck || !deck.cards.length) return;

    currentCardIndex =
      (currentCardIndex + direction + deck.cards.length) % deck.cards.length;

    cardIsFlipped = false;
    renderCurrentCard();
  }

  function shuffleCards() {
    const deck = selectedDeck();
    if (!deck || deck.cards.length < 2) {
      return notify("Add at least two cards to shuffle.");
    }

    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }

    currentCardIndex = 0;
    cardIsFlipped = false;
    saveData();
    renderFlashcards();
    notify("Cards shuffled!");
  }

  function markCard(known) {
    const deck = selectedDeck();
    if (!deck || !deck.cards.length) return;

    deck.cards[currentCardIndex].known = known;
    saveData();
    renderFlashcards();

    notify(known ? "Look at you go! Card mastered ♡" : "Added to your review practice.");
  }

  function deleteCard(id) {
    const deck = selectedDeck();
    if (!deck) return;

    deck.cards = deck.cards.filter((card) => card.id !== id);
    currentCardIndex = Math.max(0, Math.min(currentCardIndex, deck.cards.length - 1));
    cardIsFlipped = false;

    saveData();
    renderFlashcards();
    notify("Card deleted.");
  }

  function deleteDeck() {
    const deck = selectedDeck();
    if (!deck) return;

    if (!confirm(`Delete the "${deckName(deck)}" deck and all its cards?`)) return;

    data.decks = data.decks.filter((item) => item.id !== deck.id);
    saveData();

    currentCardIndex = 0;
    cardIsFlipped = false;
    renderDeckOptions();
    renderFlashcards();
    notify("Deck deleted.");
  }

  /* -----------------------------------------------------
     QUIZ BUILDER
     ----------------------------------------------------- */

  let draftQuestions = [];
  let activeQuiz = null;
  let activeQuestionIndex = 0;
  let quizCorrect = 0;
  let questionSubmitted = false;
  let quizSecondsLeft = 0;
  let quizTimerHandle = null;

  function updateQuestionType() {
    const type = $("#ct-question-type").value;
    const answerFields = $("#ct-answer-fields");
    const correct = $("#ct-correct-answer");

    if (type === "truefalse") {
      answerFields.hidden = true;
      correct.innerHTML = `
        <option value="true">True</option>
        <option value="false">False</option>
      `;
    } else {
      answerFields.hidden = false;
      correct.innerHTML = `
        <option value="A">Option A</option>
        <option value="B">Option B</option>
        <option value="C">Option C</option>
        <option value="D">Option D</option>
      `;
    }
  }

  function addQuestion() {
    const type = $("#ct-question-type").value;
    const question = $("#ct-question").value.trim();
    const explanation = $("#ct-explanation").value.trim();

    if (!question) return notify("Write your question first.");

    let options = [];
    let answer = $("#ct-correct-answer").value;

    if (type === "multiple") {
      options = ["A", "B", "C", "D"].map((letter) => ({
        value: letter,
        label: $(`#ct-option-${letter.toLowerCase()}`).value.trim()
      }));

      if (options.some((option) => !option.label)) {
        return notify("Please fill in all four answer options.");
      }

      if (new Set(options.map((option) => option.label.toLowerCase())).size !== 4) {
        return notify("Make sure all four answer options are different.");
      }
    } else {
      options = [
        { value: "true", label: "True" },
        { value: "false", label: "False" }
      ];
    }

    draftQuestions.push({
      id: makeId(),
      type,
      question,
      options,
      answer,
      explanation
    });

    $("#ct-question").value = "";
    $("#ct-explanation").value = "";

    ["a", "b", "c", "d"].forEach((letter) => {
      $(`#ct-option-${letter}`).value = "";
    });

    renderDraft();
    notify("Question added to your draft! ♡");
    $("#ct-question").focus();
  }

  function renderDraft() {
    $("#ct-builder-status").textContent =
      `${draftQuestions.length} question${draftQuestions.length === 1 ? "" : "s"} in your draft.`;

    $("#ct-draft-list").innerHTML = draftQuestions.length
      ? draftQuestions.map((question, index) => `
        <article class="ct-item">
          <div class="ct-item-title">${index + 1}. ${escapeHTML(question.question)}</div>
          <span class="ct-badge">${question.type === "multiple" ? "Multiple choice" : "True or false"}</span>
          <button class="ct-button danger" data-action="remove-draft-question"
            data-id="${escapeHTML(question.id)}">Remove</button>
        </article>
      `).join("")
      : '<p class="ct-muted">Your questions will appear here as you add them.</p>';
  }

  function clearDraft() {
    if (draftQuestions.length && !confirm("Clear all questions in this draft?")) return;

    draftQuestions = [];
    $("#ct-quiz-title").value = "";
    renderDraft();
    notify("Draft cleared.");
  }

  function saveQuiz() {
    const title = $("#ct-quiz-title").value.trim();

    if (!title) return notify("Give your quiz a title first.");
    if (!draftQuestions.length) return notify("Add at least one question first.");

    const quiz = {
      id: makeId(),
      title,
      duration: Number($("#ct-quiz-duration").value) || 0,
      questions: draftQuestions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({ ...option }))
      })),
      createdAt: new Date().toISOString()
    };

    data.quizzes.push(quiz);
    saveData();

    draftQuestions = [];
    $("#ct-quiz-title").value = "";
    renderDraft();
    renderQuizList();

    notify("Quiz saved! You're ready to practice ✨");
  }

  function renderQuizList() {
    const list = $("#ct-quiz-list");
    if (!list) return;

    if (!data.quizzes.length) {
      list.innerHTML = '<p class="ct-muted">Your saved quizzes will appear here.</p>';
      return;
    }

    list.innerHTML = data.quizzes.map((quiz) => `
      <article class="ct-item">
        <div class="ct-item-title">${escapeHTML(quiz.title)}</div>
        <p class="ct-muted">
          ${quiz.questions.length} question${quiz.questions.length === 1 ? "" : "s"}
          · ${quiz.duration ? Math.round(quiz.duration / 60) + " minute timer" : "No timer"}
        </p>
        <div class="ct-actions">
          <button class="ct-button primary" data-action="take-quiz"
            data-id="${escapeHTML(quiz.id)}">Take quiz</button>
          <button class="ct-button danger" data-action="delete-quiz"
            data-id="${escapeHTML(quiz.id)}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  function stopQuizTimer() {
    if (quizTimerHandle) {
      clearInterval(quizTimerHandle);
      quizTimerHandle = null;
    }
  }

  function startQuiz(id) {
    const quiz = data.quizzes.find((item) => item.id === id);
    if (!quiz || !quiz.questions.length) return;

    stopQuizTimer();

    activeQuiz = quiz;
    activeQuestionIndex = 0;
    quizCorrect = 0;
    questionSubmitted = false;
    quizSecondsLeft = Number(quiz.duration) || 0;

    $("#ct-quiz-player").hidden = false;
    $("#ct-play-title").textContent = quiz.title;
    $("#ct-play-feedback").innerHTML = "";
    $("#ct-quiz-player").scrollIntoView({ behavior: "smooth", block: "start" });

    if (quizSecondsLeft > 0) {
      updateTimerDisplay();

      quizTimerHandle = setInterval(() => {
        quizSecondsLeft -= 1;
        updateTimerDisplay();

        if (quizSecondsLeft <= 0) {
          stopQuizTimer();
          finishQuiz(true);
        }
      }, 1000);
    } else {
      $("#ct-quiz-timer").textContent = "No timer — take your time!";
    }

    renderQuizQuestion();
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(Math.max(0, quizSecondsLeft) / 60);
    const seconds = Math.max(0, quizSecondsLeft) % 60;

    $("#ct-quiz-timer").textContent =
      `Time remaining: ${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function renderQuizQuestion() {
    if (!activeQuiz) return;

    const question = activeQuiz.questions[activeQuestionIndex];
    const total = activeQuiz.questions.length;
    questionSubmitted = false;

    $("#ct-play-progress").textContent =
      `Question ${activeQuestionIndex + 1} of ${total}`;

    $("#ct-quiz-progress-bar").style.width =
      `${((activeQuestionIndex + 1) / total) * 100}%`;

    $("#ct-play-feedback").innerHTML = "";

    $("#ct-play-question").innerHTML = `
      <h3>${escapeHTML(question.question)}</h3>
      <div>
        ${question.options.map((option) => `
          <label class="ct-option">
            <input type="radio" name="ct-quiz-answer"
              value="${escapeHTML(option.value)}">
            <span>${escapeHTML(option.label)}</span>
          </label>
        `).join("")}
      </div>
    `;

    $("#ct-play-question").querySelectorAll("input").forEach((input) => {
      input.disabled = false;
    });

    $("#candlee-study-tools [data-action='submit-answer']").hidden = false;
    $("#candlee-study-tools [data-action='next-question']").hidden = true;
    $("#candlee-study-tools [data-action='finish-quiz']").hidden = true;
  }

  function submitAnswer() {
    if (!activeQuiz || questionSubmitted) return;

    const selected = $('input[name="ct-quiz-answer"]:checked', $("#ct-play-question"));

    if (!selected) return notify("Choose an answer first ♡");

    questionSubmitted = true;

    const question = activeQuiz.questions[activeQuestionIndex];
    const correct = selected.value === question.answer;

    if (correct) quizCorrect += 1;

    $("#ct-play-question").querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });

    const correctOption = question.options.find((option) => option.value === question.answer);

    $("#ct-play-feedback").innerHTML = `
      <div class="ct-item" style="margin-top:12px">
        <strong>${correct ? "✨ Correct! Well done!" : "🌷 Not quite — keep learning!"}</strong>
        <p>${correct
          ? "You chose the right answer."
          : "Correct answer: " + escapeHTML(correctOption?.label || question.answer)
        }</p>
        ${question.explanation
          ? `<p>${escapeHTML(question.explanation)}</p>`
          : ""
        }
      </div>
    `;

    $("#candlee-study-tools [data-action='submit-answer']").hidden = true;

    const isLast = activeQuestionIndex >= activeQuiz.questions.length - 1;

    $("#candlee-study-tools [data-action='next-question']").hidden = isLast;
    $("#candlee-study-tools [data-action='finish-quiz']").hidden = !isLast;
  }

  function nextQuestion() {
    if (!activeQuiz || !questionSubmitted) return;

    activeQuestionIndex += 1;
    renderQuizQuestion();
  }

  function finishQuiz(timeExpired = false) {
    if (!activeQuiz) return;

    stopQuizTimer();

    const completedQuiz = activeQuiz;
    const total = completedQuiz.questions.length;
    const percentage = Math.round((quizCorrect / total) * 100);

    data.quizHistory.unshift({
      id: makeId(),
      quizId: completedQuiz.id,
      title: completedQuiz.title,
      correct: quizCorrect,
      total,
      percentage,
      date: new Date().toISOString(),
      timeExpired
    });

    data.quizHistory = data.quizHistory.slice(0, 100);
    saveData();

    $("#ct-play-title").textContent = "Quiz complete! ♡";
    $("#ct-play-progress").textContent =
      `${quizCorrect} out of ${total} correct · ${percentage}%`;

    $("#ct-quiz-progress-bar").style.width = "100%";

    $("#ct-play-question").innerHTML = `
      <div class="ct-item" style="text-align:center;padding:24px">
        <div style="font-size:2.3rem">${percentage >= 80 ? "🏆" : percentage >= 50 ? "🌷" : "🌱"}</div>
        <h3>${percentage >= 80 ? "Amazing work!" : percentage >= 50 ? "You're making progress!" : "Keep practicing!"}</h3>
        <p>You scored <strong>${quizCorrect}/${total}</strong> (${percentage}%).</p>
        ${timeExpired ? "<p>The timer ran out, so your quiz has ended.</p>" : ""}
        <button class="ct-button primary" data-action="play-again"
          data-id="${escapeHTML(completedQuiz.id)}">Try again</button>
      </div>
    `;

    $("#ct-play-feedback").innerHTML = "";
    $("#ct-quiz-timer").textContent = timeExpired ? "Time's up!" : "Finished at your own pace.";

    $("#candlee-study-tools [data-action='submit-answer']").hidden = true;
    $("#candlee-study-tools [data-action='next-question']").hidden = true;
    $("#candlee-study-tools [data-action='finish-quiz']").hidden = true;

    activeQuiz = null;
    renderQuizHistory();
  }

  function deleteQuiz(id) {
    const quiz = data.quizzes.find((item) => item.id === id);
    if (!quiz) return;

    if (!confirm(`Delete "${quiz.title}"? Its score history will remain.`)) return;

    data.quizzes = data.quizzes.filter((item) => item.id !== id);
    saveData();
    renderQuizList();
    notify("Quiz deleted.");
  }

  function renderQuizHistory() {
    const list = $("#ct-quiz-history");
    if (!list) return;

    if (!data.quizHistory.length) {
      list.innerHTML = '<p class="ct-muted">Your quiz results will appear here after your first attempt.</p>';
      return;
    }

    list.innerHTML = data.quizHistory.map((result) => `
      <article class="ct-item">
        <div class="ct-item-title">${escapeHTML(result.title)}</div>
        <span class="ct-badge">${result.percentage}%</span>
        <span class="ct-badge">${result.correct}/${result.total} correct</span>
        <p class="ct-muted">${escapeHTML(new Date(result.date).toLocaleString())}</p>
        ${result.timeExpired ? '<p class="ct-muted">Timer ended this attempt.</p>' : ""}
      </article>
    `).join("");
  }

  /* -----------------------------------------------------
     STUDY PLANNER
     ----------------------------------------------------- */

  function addTask() {
    const title = $("#ct-task-title").value.trim();

    if (!title) {
      notify("Give your study task a name first.");
      $("#ct-task-title").focus();
      return;
    }

    data.tasks.push({
      id: makeId(),
      title,
      subject: $("#ct-task-subject").value.trim(),
      date: $("#ct-task-date").value,
      priority: $("#ct-task-priority").value,
      minutes: Number($("#ct-task-minutes").value) || 25,
      notes: $("#ct-task-notes").value.trim(),
      done: false,
      createdAt: new Date().toISOString()
    });

    $("#ct-task-title").value = "";
    $("#ct-task-subject").value = "";
    $("#ct-task-date").value = "";
    $("#ct-task-priority").value = "Normal";
    $("#ct-task-minutes").value = "25";
    $("#ct-task-notes").value = "";

    saveData();
    renderPlanner();
    notify("Study task added to your planner! 🌷");
  }

  function renderPlanner() {
    const list = $("#ct-task-list");
    if (!list) return;

    const filter = $("#ct-task-filter").value;
    const completed = data.tasks.filter((task) => task.done).length;
    const total = data.tasks.length;
    const remainingMinutes = data.tasks
      .filter((task) => !task.done)
      .reduce((sum, task) => sum + (Number(task.minutes) || 0), 0);

    const percentage = total ? Math.round(completed / total * 100) : 0;

    $("#ct-planner-summary").textContent =
      `${completed} of ${total} tasks completed · ` +
      `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m of study time remaining`;

    $("#ct-planner-progress-bar").style.width = percentage + "%";

    const tasks = data.tasks
      .filter((task) => {
        if (filter === "open") return !task.done;
        if (filter === "done") return task.done;
        return true;
      })
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });

    if (!tasks.length) {
      list.innerHTML = '<p class="ct-muted">No tasks here yet. Add a study task to get started! ♡</p>';
      return;
    }

    list.innerHTML = tasks.map((task) => `
      <article class="ct-item">
        <div class="ct-checkline">
          <input type="checkbox" aria-label="Mark ${escapeHTML(task.title)} complete"
            data-action="toggle-task" data-id="${escapeHTML(task.id)}"
            ${task.done ? "checked" : ""}>
          <div style="flex:1;min-width:0">
            <div class="ct-item-title ${task.done ? "ct-complete" : ""}">
              ${escapeHTML(task.title)}
            </div>
            <p class="ct-muted">
              ${escapeHTML(task.subject || "No subject")}
              · ${escapeHTML(formatDate(task.date))}
              · ${Number(task.minutes) || 0} min
            </p>
            <span class="ct-badge">${escapeHTML(task.priority || "Normal")} priority</span>
            ${task.done ? '<span class="ct-badge">✓ Completed</span>' : ""}
            ${task.notes ? `<p>${escapeHTML(task.notes)}</p>` : ""}
            <div class="ct-actions">
              <button class="ct-button danger" data-action="delete-task"
                data-id="${escapeHTML(task.id)}">Delete task</button>
            </div>
          </div>
        </div>
      </article>
    `).join("");
  }

  function toggleTask(id, checked) {
    const task = data.tasks.find((item) => item.id === id);
    if (!task) return;

    task.done = checked;
    saveData();
    renderPlanner();

    notify(checked ? "Task completed! Proud of you ♡" : "Task marked incomplete.");
  }

  function deleteTask(id) {
    data.tasks = data.tasks.filter((task) => task.id !== id);
    saveData();
    renderPlanner();
    notify("Study task deleted.");
  }

  /* -----------------------------------------------------
     BUTTON ACTIONS
     ----------------------------------------------------- */

  function handleClick(event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    const id = control.dataset.id;

    switch (action) {
      case "tab":
        showTab(control.dataset.tab);
        break;

      case "create-deck":
        createDeck();
        break;

      case "add-card":
        addCard();
        break;

      case "flip-card":
        flipCard();
        break;

      case "previous-card":
        moveCard(-1);
        break;

      case "next-card":
        moveCard(1);
        break;

      case "shuffle-cards":
        shuffleCards();
        break;

      case "mark-known":
        markCard(true);
        break;

      case "mark-review":
        markCard(false);
        break;

      case "delete-card":
        deleteCard(id);
        break;

      case "delete-deck":
        deleteDeck();
        break;

      case "add-question":
        addQuestion();
        break;

      case "remove-draft-question":
        draftQuestions = draftQuestions.filter((question) => question.id !== id);
        renderDraft();
        break;

      case "save-quiz":
        saveQuiz();
        break;

      case "clear-draft":
        clearDraft();
        break;

      case "take-quiz":
      case "play-again":
        startQuiz(id);
        break;

      case "delete-quiz":
        deleteQuiz(id);
        break;

      case "submit-answer":
        submitAnswer();
        break;

      case "next-question":
        nextQuestion();
        break;

      case "finish-quiz":
        if (activeQuiz) finishQuiz(false);
        break;

      case "add-task":
        addTask();
        break;

      case "delete-task":
        deleteTask(id);
        break;
    }
  }

  /* Checkbox changes are handled separately from button clicks. */
  function handlePlannerChange(event) {
    const control = event.target;

    if (
      control.matches('input[type="checkbox"][data-action="toggle-task"]')
    ) {
      toggleTask(control.dataset.id, control.checked);
    }
  }

  /* -----------------------------------------------------
     INITIALIZE
     ----------------------------------------------------- */

  function renderAll() {
    renderDeckOptions();
    renderFlashcards();
    renderDraft();
    renderQuizList();
    renderQuizHistory();
    renderPlanner();
    updateQuestionType();
  }

  function initialize() {
    if (!installInterface()) return;

    const app = $("#candlee-study-tools");
    app.addEventListener("change", handlePlannerChange);

    showTab("flashcards");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
