```javascript
/* =========================================
   CANDLEE ♡
   Interactive features
   ========================================= */

"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* -----------------------------------------
   LOCAL STORAGE
   ----------------------------------------- */

const STORAGE_KEY = "candlee-v1";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Could not load Candlee data:", error);
    return {};
  }
}

const savedData = loadData();

const state = {
  theme: savedData.theme || "pink",
  soundsEnabled: savedData.soundsEnabled !== false,
  playlist: savedData.playlist || "",
  studyTasks: Array.isArray(savedData.studyTasks) ? savedData.studyTasks : [],
  goals: Array.isArray(savedData.goals) ? savedData.goals : [],
  habits: Array.isArray(savedData.habits) ? savedData.habits : [],
  completedHabits: savedData.completedHabits || {},
  letters: Array.isArray(savedData.letters) ? savedData.letters : [],
  countdowns: Array.isArray(savedData.countdowns) ? savedData.countdowns : [],
  budgetGoal: Number(savedData.budgetGoal) || 100,
  budgetEntries: Array.isArray(savedData.budgetEntries) ? savedData.budgetEntries : [],
  visions: Array.isArray(savedData.visions) ? savedData.visions : [],
  affirmationIndex: Number(savedData.affirmationIndex) || 0
};

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast("Your browser couldn't save this change.");
    console.error("Could not save Candlee data:", error);
  }
}

/* -----------------------------------------
   TOAST NOTIFICATIONS
   ----------------------------------------- */

let toastTimeout;

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

/* -----------------------------------------
   OPTIONAL BUTTON SOUNDS
   ----------------------------------------- */

let audioContext;

function playClickSound() {
  if (!state.soundsEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      500,
      audioContext.currentTime + 0.035
    );

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.035,
      audioContext.currentTime + 0.005
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.05
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.055);
  } catch (error) {
    // The website remains usable if browser audio is unavailable.
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest("button")) {
    playClickSound();
  }
});

function updateSoundButton() {
  const button = $("#sound-toggle");

  if (!button) return;

  button.textContent = state.soundsEnabled ? "🔊" : "🔇";

  button.setAttribute(
    "aria-label",
    state.soundsEnabled ? "Mute button sounds" : "Enable button sounds"
  );

  button.title = state.soundsEnabled
    ? "Mute button sounds"
    : "Enable button sounds";
}

$("#sound-toggle").addEventListener("click", () => {
  state.soundsEnabled = !state.soundsEnabled;
  saveData();
  updateSoundButton();

  showToast(
    state.soundsEnabled
      ? "Button sounds are on ♡"
      : "Button sounds are off ♡"
  );
});

/* -----------------------------------------
   THEMES
   ----------------------------------------- */

const validThemes = [
  "pink",
  "cream",
  "burgundy",
  "navy",
  "yellow",
  "brown",
  "lavender",
  "dark"
];

function applyTheme(theme) {
  if (!validThemes.includes(theme)) {
    theme = "pink";
  }

  state.theme = theme;
  document.body.dataset.theme = theme;

  saveData();

  $$(".theme-choice").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeChoice === theme)
    );
  });
}

const themeModal = $("#theme-modal");

function openThemeModal() {
  themeModal.hidden = false;

  const firstChoice = $(".theme-choice");

  if (firstChoice) firstChoice.focus();
}

function closeThemeModal() {
  themeModal.hidden = true;
  $("#theme-open-button").focus();
}

$("#theme-open-button").addEventListener("click", openThemeModal);

$("#theme-close-button").addEventListener("click", closeThemeModal);

themeModal.addEventListener("click", (event) => {
  if (event.target === themeModal) {
    closeThemeModal();
  }
});

$$(".theme-choice").forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeChoice);

    const themeNames = {
      pink: "Cotton Candy",
      cream: "Cloud Nine",
      burgundy: "Cherry Cola",
      navy: "Midnight",
      yellow: "Lemon Drop",
      brown: "Teddy Bear",
      lavender: "Lavender Haze",
      dark: "Dark Mode"
    };

    showToast(`${themeNames[state.theme]} theme activated ♡`);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !themeModal.hidden) {
    closeThemeModal();
  }
});

/* -----------------------------------------
   NAVIGATION
   ----------------------------------------- */

const pageNames = {
  home: "home",
  study: "study studio",
  music: "my music",
  goals: "my goals",
  habits: "habit garden",
  letters: "future letters",
  countdowns: "countdowns",
  budget: "my budget",
  messages: "messages",
  vision: "vision board"
};

function navigateTo(pageName) {
  const targetPage = $(`#page-${pageName}`);

  if (!targetPage) return;

  $$(".page").forEach((page) => {
    page.classList.remove("active-page");
  });

  targetPage.classList.add("active-page");

  $$(".nav-item").forEach((button) => {
    const active = button.dataset.page === pageName;

    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  $("#current-section").textContent = pageNames[pageName] || pageName;

  if (pageName === "music") {
    renderMusicPage();
  }

  if (pageName === "study") {
    renderStudyTasks();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.page);
  });
});

/* -----------------------------------------
   DAILY AFFIRMATIONS
   ----------------------------------------- */

const affirmations = [
  "I am becoming the person I dream of being.",
  "I deserve kindness, including from myself.",
  "Small steps are still progress.",
  "I can learn things that once felt impossible.",
  "My future is built one little choice at a time.",
  "I am allowed to rest without feeling guilty.",
  "I do not need to have everything figured out today.",
  "I can be proud of myself while I am still growing.",
  "I bring something special to the world.",
  "I can start again whenever I need to.",
  "I deserve relationships that feel safe and kind.",
  "I am capable of creating a life that feels like mine."
];

function renderAffirmation() {
  $("#affirmation-text").textContent =
    affirmations[state.affirmationIndex % affirmations.length];
}

$("#new-affirmation").addEventListener("click", () => {
  if (affirmations.length > 1) {
    const previousIndex = state.affirmationIndex;

    while (state.affirmationIndex === previousIndex) {
      state.affirmationIndex =
        Math.floor(Math.random() * affirmations.length);
    }
  }

  saveData();
  renderAffirmation();
});

/* -----------------------------------------
   SHARED STUDY CHECKLIST
   The sidebar and Study Studio use the same
   state.studyTasks array.
   ----------------------------------------- */

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTask(text) {
  return {
    id: makeId(),
    text,
    completed: false
  };
}

function toggleStudyTask(id) {
  const task = state.studyTasks.find((item) => item.id === id);

  if (!task) return;

  task.completed = !task.completed;

  saveData();
  renderStudyTasks();
}

function deleteStudyTask(id) {
  state.studyTasks = state.studyTasks.filter((item) => item.id !== id);

  saveData();
  renderStudyTasks();
}

function createTaskCheckbox(task, className) {
  const label = document.createElement("label");
  label.className = className;

  if (task.completed) {
    label.classList.add("completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Complete ${task.text}`);

  checkbox.addEventListener("change", () => {
    toggleStudyTask(task.id);
  });

  const text = document.createElement("span");
  text.textContent = task.text;

  label.append(checkbox, text);

  return label;
}

function createDeleteButton(onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "delete-button";
  button.textContent = "×";
  button.setAttribute("aria-label", "Delete item");

  button.addEventListener("click", onClick);

  return button;
}

function renderStudyTasks() {
  const miniList = $("#mini-task-list");
  const fullList = $("#full-task-list");

  miniList.replaceChildren();
  fullList.replaceChildren();

  const completedCount = state.studyTasks.filter(
    (task) => task.completed
  ).length;

  const totalCount = state.studyTasks.length;

  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  $("#mini-progress-text").textContent = `${progress}%`;
  $("#mini-progress-fill").style.width = `${progress}%`;

  $("#home-progress-text").textContent = `${progress}%`;
  $("#home-progress-fill").style.width = `${progress}%`;

  $("#home-task-count").textContent =
    `${completedCount}/${totalCount}`;

  if (totalCount === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "A fresh page! Add a little task ♡";

    miniList.append(empty.cloneNode(true));
    fullList.append(empty);

    return;
  }

  state.studyTasks.forEach((task) => {
    miniList.append(createTaskCheckbox(task, "mini-task"));

    const row = document.createElement("div");
    row.className = "full-task";

    const label = createTaskCheckbox(task, "full-task-label");

    const deleteButton = createDeleteButton(() => {
      deleteStudyTask(task.id);
    });

    row.append(label, deleteButton);
    fullList.append(row);
  });
}

$("#new-task-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#new-task-input");
  const text = input.value.trim();

  if (!text) return;

  state.studyTasks.push(createTask(text));

  input.value = "";

  saveData();
  renderStudyTasks();

  showToast("A little task added ♡");
});

/* Expand and collapse the mini study plan. */

$("#study-widget-toggle").addEventListener("click", () => {
  const content = $("#mini-study-content");
  const currentlyExpanded = !content.hidden;

  content.hidden = currentlyExpanded;

  $("#study-widget-toggle").setAttribute(
    "aria-expanded",
    String(!currentlyExpanded)
  );

  $("#expand-icon").textContent = currentlyExpanded ? "⌄" : "⌃";
});

/* -----------------------------------------
   FOCUS TIMER
   ----------------------------------------- */

let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function renderTimer() {
  $("#timer-display").textContent = formatTime(timerRemaining);

  document.title =
    timerInterval
      ? `${formatTime(timerRemaining)} · Candlee ♡`
      : "Candlee ♡ A Little Light for Your Everyday";
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  $("#timer-start").textContent = "Start";
}

function startTimer() {
  if (timerInterval !== null) {
    stopTimer();
    $("#timer-caption").textContent = "take a little breath ♡";
    renderTimer();
    return;
  }

  if (timerRemaining <= 0) {
    timerRemaining = timerDuration;
  }

  timerInterval = setInterval(() => {
    timerRemaining -= 1;

    if (timerRemaining <= 0) {
      timerRemaining = 0;
      stopTimer();
      $("#timer-caption").textContent = "you did it! time for a little break ✨";
      showToast("Focus session complete! You did amazing ♡");
    }

    renderTimer();
  }, 1000);

  $("#timer-start").textContent = "Pause";
  $("#timer-caption").textContent = "you've got this ♡";

  renderTimer();
}

$("#timer-start").addEventListener("click", startTimer);

$("#timer-reset").addEventListener("click", () => {
  stopTimer();
  timerRemaining = timerDuration;
  $("#timer-caption").textContent = "one thing at a time.";
  renderTimer();
});

$$(".timer-presets button").forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();

    timerDuration = Number(button.dataset.minutes) * 60;
    timerRemaining = timerDuration;

    $$(".timer-presets button").forEach((preset) => {
      preset.classList.toggle("selected", preset === button);
    });

    $("#timer-caption").textContent = "one thing at a time.";

    renderTimer();
  });
});

/* -----------------------------------------
   SPOTIFY PLAYLIST EMBED
   ----------------------------------------- */

function getSpotifyEmbedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    const allowedHosts = [
      "open.spotify.com",
      "spotify.link"
    ];

    if (!allowedHosts.includes(url.hostname.toLowerCase())) {
      return null;
    }

    if (url.hostname.toLowerCase() === "spotify.link") {
      return null;
    }

    const match = url.pathname.match(
      /^\/(playlist|album|track|artist|show|episode)\/([a-zA-Z0-9]+)\/?$/
    );

    if (!match) return null;

    const type = match[1];
    const id = match[2];

    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  } catch (error) {
    return null;
  }
}

function renderMusicEmbeds() {
  const sidebarEmbed = $("#music-embed");
  const pageEmbed = $("#music-page-embed");

  sidebarEmbed.replaceChildren();
  pageEmbed.replaceChildren();

  if (!state.playlist) {
    $("#playlist-name").textContent = "Your happy place";
    $("#playlist-description").textContent = "add your favorite playlist";
    return;
  }

  const embedUrl = getSpotifyEmbedUrl(state.playlist);

  if (!embedUrl) {
    $("#playlist-name").textContent = "Playlist not added";
    $("#playlist-description").textContent = "check your Spotify link";
    return;
  }

  $("#playlist-name").textContent = "Your Spotify playlist ♡";
  $("#playlist-description").textContent = "a soundtrack for your day";

  function createSpotifyFrame() {
    const frame = document.createElement("iframe");

    frame.src = embedUrl;
    frame.title = "Spotify music player";
    frame.loading = "lazy";
    frame.allow =
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    frame.referrerPolicy = "strict-origin-when-cross-origin";

    return frame;
  }

  sidebarEmbed.append(createSpotifyFrame());
  pageEmbed.append(createSpotifyFrame());
}

function renderMusicPage() {
  renderMusicEmbeds();
}

function openMusicSettings() {
  $("#music-settings").hidden = false;
  $("#spotify-link").value = state.playlist;
  $("#spotify-link").focus();
}

function closeMusicSettings() {
  $("#music-settings").hidden = true;
}

$("#add-music-button").addEventListener("click", openMusicSettings);
$("#music-page-add").addEventListener("click", openMusicSettings);

$("#cancel-music-button").addEventListener("click", closeMusicSettings);

$("#save-music-button").addEventListener("click", () => {
  const rawUrl = $("#spotify-link").value.trim();

  if (!rawUrl) {
    showToast("Paste a Spotify link first ♡");
    return;
  }

  const embedUrl = getSpotifyEmbedUrl(rawUrl);

  if (!embedUrl) {
    showToast("Please use a full Spotify playlist, album, track, or show link.");
    return;
  }

  state.playlist = rawUrl;

  saveData();
  renderMusicEmbeds();
  closeMusicSettings();

  showToast("Your music is ready ♡");
});

/* -----------------------------------------
   GOALS
   ----------------------------------------- */

function renderGoals() {
  const list = $("#goal-list");
  list.replaceChildren();

  if (state.goals.length === 0) {
    list.append(makeEmptyMessage("Your dreams start with one little goal ♡"));
    return;
  }

  state.goals.forEach((goal) => {
    const row = document.createElement("div");
    row.className = "goal-item";

    const text = document.createElement("span");
    text.textContent = goal.text;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = goal.completed;
    checkbox.setAttribute("aria-label", `Complete goal: ${goal.text}`);

    checkbox.addEventListener("change", () => {
      goal.completed = checkbox.checked;
      renderGoals();
      saveData();
    });

    if (goal.completed) {
      text.style.textDecoration = "line-through";
      text.style.opacity = "0.7";
    }

    row.append(checkbox, text, createDeleteButton(() => {
      state.goals = state.goals.filter((item) => item.id !== goal.id);
      saveData();
      renderGoals();
    }));

    list.append(row);
  });
}

$("#goal-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#goal-input");
  const text = input.value.trim();

  if (!text) return;

  state.goals.push({
    id: makeId(),
    text,
    completed: false
  });

  input.value = "";

  saveData();
  renderGoals();

  showToast("A new dream added to your list ♡");
});

/* -----------------------------------------
   HABITS
   ----------------------------------------- */

function todayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function renderHabits() {
  const list = $("#habit-list");
  list.replaceChildren();

  const today = todayKey();

  if (!state.completedHabits[today]) {
    state.completedHabits[today] = [];
  }

  if (state.habits.length === 0) {
    list.append(makeEmptyMessage("Plant your first little habit 🌱"));
    return;
  }

  state.habits.forEach((habit) => {
    const row = document.createElement("label");
    row.className = "habit-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.checked = state.completedHabits[today].includes(habit.id);
    checkbox.setAttribute("aria-label", `Complete habit: ${habit.text}`);

    if (checkbox.checked) {
      row.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      const completed = state.completedHabits[today];

      if (checkbox.checked) {
        if (!completed.includes(habit.id)) {
          completed.push(habit.id);
        }
      } else {
        state.completedHabits[today] = completed.filter(
          (id) => id !== habit.id
        );
      }

      saveData();
      renderHabits();
    });

    const text = document.createElement("span");
    text.textContent = habit.text;

    row.append(checkbox, text, createDeleteButton(() => {
      state.habits = state.habits.filter((item) => item.id !== habit.id);

      Object.keys(state.completedHabits).forEach((date) => {
        state.completedHabits[date] =
          state.completedHabits[date].filter((id) => id !== habit.id);
      });

      saveData();
      renderHabits();
    }));

    list.append(row);
  });
}

$("#habit-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#habit-input");
  const text = input.value.trim();

  if (!text) return;

  state.habits.push({
    id: makeId(),
    text
  });

  input.value = "";

  saveData();
  renderHabits();

  showToast("A little habit planted 🌱");
});

/* -----------------------------------------
   FUTURE LETTERS
   IMPORTANT: Local browser hiding only.
   This is not secure date-based locking.
   ----------------------------------------- */

function renderLetters() {
  const list = $("#letter-list");
  list.replaceChildren();

  if (state.letters.length === 0) {
    list.append(makeEmptyMessage("Your future self is waiting for a little letter ♡"));
    return;
  }

  state.letters.forEach((letter) => {
    const row = document.createElement("article");
    row.className = "letter-item";

    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = letter.title;

    const date = document.createElement("p");
    date.textContent = `Opening date: ${letter.openDate}`;

    const status = document.createElement("span");
    status.className = "letter-status";

    const today = todayKey();

    if (letter.openDate <= today) {
      status.textContent = "Ready to open ♡";

      const openButton = document.createElement("button");
      openButton.className = "soft-button";
      openButton.type = "button";
      openButton.textContent = "Read letter";

      openButton.addEventListener("click", () => {
        const letterBody = document.createElement("div");
        letterBody.className = "letter-content";
        letterBody.textContent = letter.body;

        if (content.querySelector(".letter-content")) {
          content.querySelector(".letter-content").remove();
          openButton.textContent = "Read letter";
        } else {
          content.append(letterBody);
          openButton.textContent = "Close letter";
        }
      });

      content.append(title, date, status, openButton);
    } else {
      status.textContent = "Sealed until your chosen date 💌";
      content.append(title, date, status);
    }

    row.append(content, createDeleteButton(() => {
      state.letters = state.letters.filter((item) => item.id !== letter.id);
      saveData();
      renderLetters();
    }));

    list.append(row);
  });
}

$("#letter-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("#letter-title").value.trim();
  const openDate = $("#letter-date").value;
  const body = $("#letter-body").value.trim();

  if (!title || !openDate || !body) return;

  if (openDate < todayKey()) {
    showToast("Choose today or a future date ♡");
    return;
  }

  state.letters.push({
    id: makeId(),
    title,
    openDate,
    body
  });

  $("#letter-title").value = "";
  $("#letter-date").value = "";
  $("#letter-body").value = "";

  saveData();
  renderLetters();

  showToast("Your letter has been sealed 💌");
});

/* -----------------------------------------
   COUNTDOWNS
   ----------------------------------------- */

function renderCountdowns() {
  const list = $("#countdown-list");
  list.replaceChildren();

  if (state.countdowns.length === 0) {
    list.append(makeEmptyMessage("Add a little moment to look forward to ♡"));
    return;
  }

  state.countdowns.forEach((countdown) => {
    const row = document.createElement("article");
    row.className = "countdown-item";

    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = countdown.title;

    const date = document.createElement("p");
    date.textContent = new Date(countdown.date).toLocaleString();

    const number = document.createElement("p");
    number.className = "countdown-number";

    const difference = new Date(countdown.date).getTime() - Date.now();

    if (difference <= 0) {
      number.textContent = "It's time! ♡";
    } else {
      const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
      number.textContent = `${days} day${days === 1 ? "" : "s"} to go`;
    }

    info.append(title, date, number);

    row.append(info, createDeleteButton(() => {
      state.countdowns = state.countdowns.filter(
        (item) => item.id !== countdown.id
      );

      saveData();
      renderCountdowns();
    }));

    list.append(row);
  });
}

$("#countdown-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("#countdown-title").value.trim();
  const date = $("#countdown-date").value;

  if (!title || !date) return;

  if (new Date(date).getTime() <= Date.now()) {
    showToast("Choose a date and time in the future ♡");
    return;
  }

  state.countdowns.push({
    id: makeId(),
    title,
    date
  });

  $("#countdown-title").value = "";
  $("#countdown-date").value = "";

  saveData();
  renderCountdowns();

  showToast("Countdown added! Something to look forward to ♡");
});

/* -----------------------------------------
   BUDGET
   ----------------------------------------- */

function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

function getBudgetTotal() {
  return state.budgetEntries.reduce((total, entry) => {
    return total + (entry.type === "income" ? entry.amount : -entry.amount);
  }, 0);
}

function renderBudget() {
  const total = getBudgetTotal();

  $("#budget-total").textContent = money(total);
  $("#budget-goal-display").textContent = money(state.budgetGoal);

  const progress = state.budgetGoal > 0
    ? Math.max(0, Math.min(100, (total / state.budgetGoal) * 100))
    : 0;

  $("#budget-progress-fill").style.width = `${progress}%`;

  const list = $("#budget-entry-list");
  list.replaceChildren();

  if (state.budgetEntries.length === 0) {
    list.append(makeEmptyMessage("Your savings story starts here ♡"));
    return;
  }

  [...state.budgetEntries].reverse().forEach((entry) => {
    const row = document.createElement("div");
    row.className = "budget-entry";

    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = entry.name;

    const description = document.createElement("p");
    description.textContent =
      entry.type === "income" ? "Saved / earned" : "Spent";

    const amount = document.createElement("strong");
    amount.className =
      entry.type === "income" ? "income-amount" : "expense-amount";

    amount.textContent =
      `${entry.type === "income" ? "+" : "−"}${money(entry.amount)}`;

    info.append(title, description);

    row.append(info, amount, createDeleteButton(() => {
      state.budgetEntries = state.budgetEntries.filter(
        (item) => item.id !== entry.id
      );

      saveData();
      renderBudget();
    }));

    list.append(row);
  });
}

$("#budget-goal-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const goal = Number($("#budget-goal-input").value);

  if (!Number.isFinite(goal) || goal <= 0) {
    showToast("Choose a savings goal above zero ♡");
    return;
  }

  state.budgetGoal = goal;

  $("#budget-goal-input").value = "";

  saveData();
  renderBudget();

  showToast("Savings goal updated ♡");
});

$("#budget-entry-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#budget-entry-name").value.trim();
  const amount = Number($("#budget-entry-amount").value);
  const type = $("#budget-entry-type").value;

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    showToast("Enter a description and a valid amount ♡");
    return;
  }

  state.budgetEntries.push({
    id: makeId(),
    name,
    amount,
    type
  });

  $("#budget-entry-name").value = "";
  $("#budget-entry-amount").value = "";

  saveData();
  renderBudget();

  showToast("Budget entry added ♡");
});

/* -----------------------------------------
   VISION BOARD
   ----------------------------------------- */

function renderVisions() {
  const list = $("#vision-list");
  list.replaceChildren();

  if (state.visions.length === 0) {
    list.append(makeEmptyMessage("Leave a little room for your dreams ✨"));
    return;
  }

  state.visions.forEach((vision) => {
    const row = document.createElement("article");
    row.className = "vision-item";

    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = `✨ ${vision.title}`;

    const note = document.createElement("p");
    note.textContent = vision.note || "A dream worth remembering ♡";

    info.append(title, note);

    row.append(info, createDeleteButton(() => {
      state.visions = state.visions.filter((item) => item.id !== vision.id);
      saveData();
      renderVisions();
    }));

    list.append(row);
  });
}

$("#vision-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("#vision-title").value.trim();
  const note = $("#vision-note").value.trim();

  if (!title) return;

  state.visions.push({
    id: makeId(),
    title,
    note
  });

  $("#vision-title").value = "";
  $("#vision-note").value = "";

  saveData();
  renderVisions();

  showToast("A little dream added to your board ✨");
});

/* -----------------------------------------
   HELPERS
   ----------------------------------------- */

function makeEmptyMessage(message) {
  const element = document.createElement("p");

  element.className = "empty-message";
  element.textContent = message;

  return element;
}

/* -----------------------------------------
   INITIALIZE CANDLEE
   ----------------------------------------- */

function initializeCandlee() {
  applyTheme(state.theme);
  updateSoundButton();
  renderAffirmation();
  renderStudyTasks();
  renderMusicEmbeds();
  renderGoals();
  renderHabits();
  renderLetters();
  renderCountdowns();
  renderBudget();
  renderVisions();
  renderTimer();

  $("#study-date-label").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

  // Refresh countdowns when the user returns to the page.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderCountdowns();
    }
  });
}

initializeCandlee();
```
