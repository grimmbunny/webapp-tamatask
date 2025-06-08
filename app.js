// app.js - VERSÃO FINAL COM TODAS AS FUNCIONALIDADES

// ==========================================================
// 1. CONTROLES DE ÁUDIO
// ==========================================================
const audioPlayer = document.getElementById("lofi-audio");
const audioTracks = [
  "https://res.cloudinary.com/dzmomr6jc/video/upload/v1749404264/jazzy_ukoq0l.m4a",
  "https://res.cloudinary.com/dzmomr6jc/video/upload/v1749404524/cute_j80v1k.m4a",
  "https://res.cloudinary.com/dzmomr6jc/video/upload/v1749404288/brown_opjjkr.m4a",
];
let currentTrackIndex = 0;
let playPauseBtnIcon, muteBtnIcon, volumeSlider;

function loadTrack(index) {
  audioPlayer.src = audioTracks[index];
  audioPlayer.load();
}

function playTrack() {
  audioPlayer.play().catch((e) => console.error("Erro ao tocar áudio:", e));
  updatePlayPauseIcon(true);
}

function pauseTrack() {
  audioPlayer.pause();
  updatePlayPauseIcon(false);
}

function togglePlayPause() {
  if (audioPlayer.paused) {
    playTrack();
  } else {
    pauseTrack();
  }
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

function playPrevTrack() {
  currentTrackIndex =
    (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

function toggleMute() {
  audioPlayer.muted = !audioPlayer.muted;
  updateMuteIcon(audioPlayer.muted);
}

function setVolume(value) {
  audioPlayer.volume = value / 100;
}

function updatePlayPauseIcon(isPlaying) {
  if (playPauseBtnIcon) {
    playPauseBtnIcon.classList.toggle("fa-play", !isPlaying);
    playPauseBtnIcon.classList.toggle("fa-pause", isPlaying);
  }
}

function updateMuteIcon(isMuted) {
  if (muteBtnIcon) {
    muteBtnIcon.classList.toggle("fa-volume-high", !isMuted);
    muteBtnIcon.classList.toggle("fa-volume-xmark", isMuted);
  }
}

function initializeAudioControls() {
  const prevBtn = document.getElementById("prev-track-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const nextBtn = document.getElementById("next-track-btn");
  playPauseBtnIcon = playPauseBtn?.querySelector("i");
  muteBtnIcon = document.getElementById("mute-btn")?.querySelector("i");
  volumeSlider = document.getElementById("volume-slider");

  if (!audioTracks.length || audioTracks[0].includes("cloudinary.com/demo")) {
    console.warn(
      "AVISO: As faixas de áudio são exemplos. Por favor, adicione suas próprias URLs no arquivo app.js."
    );
  } else {
    loadTrack(currentTrackIndex);
  }

  if (volumeSlider) {
    audioPlayer.volume = volumeSlider.value / 100;
  }

  if (prevBtn) prevBtn.addEventListener("click", playPrevTrack);
  if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlayPause);
  if (nextBtn) nextBtn.addEventListener("click", playNextTrack);

  audioPlayer.addEventListener("ended", playNextTrack);
  audioPlayer.addEventListener("volumechange", () =>
    updateMuteIcon(audioPlayer.muted)
  );

  updatePlayPauseIcon(false);
  updateMuteIcon(audioPlayer.muted);
}

// ==========================================================
// 2. RESTANTE DO CÓDIGO DA APLICAÇÃO
// ==========================================================
// --- State Management ---
const stats = { fed: 0, rest: 0, tasks: 0, focus: 0, love: 0 };
let level = 1,
  xp = 0,
  xpForNextLevel = 100;
let pomodoroInterval,
  pomodoroDuration = 25 * 60,
  timeLeft = pomodoroDuration,
  timerRunning = false;

// --- UI Elements ---
const levelDisplay = document.getElementById("level-display"),
  xpBar = document.getElementById("stat-xp"),
  xpText = document.getElementById("xp-text"),
  pomodoroDisplay = document.getElementById("pomodoro-display"),
  startPauseButton = document
    .getElementById("pomodoro-start-pause")
    .querySelector("h2"),
  startSound = document.getElementById("start-sound"),
  endSound = document.getElementById("end-sound"),
  petImage = document.querySelector(".pet-svg");

const petImageSources = {
  default: "./assets/device/pet.svg",
  boop: "./assets/device/reactions/boop.svg",
  feed: "./assets/device/reactions/feed.svg",
  love: "./assets/device/reactions/love.svg",
  pomodoro: "./assets/device/reactions/pomodoro.svg",
  sleep: "./assets/device/reactions/sleep.svg",
};

// --- Core Functions ---
function updateStat(stat, amount) {
  stats[stat] = Math.min(stats[stat] + amount, 100);
  const statBar = document.getElementById(`stat-${stat}`);
  if (statBar) {
    statBar.style.width = stats[stat] + "%";
  }
  if (amount > 0) {
    updateXP(amount);
  }
}

function updateXP(amount) {
  xp += amount;
  if (xp >= xpForNextLevel) {
    level++;
    xp -= xpForNextLevel;
    xpForNextLevel = Math.round(xpForNextLevel * 1.5);
    levelDisplay.textContent = `Level ${level}`;
    showToast(`Level Up! You reached Level ${level}!`, "fa-star");

    // ANIMAÇÃO DE LEVEL UP
    if (petImage) {
      petImage.classList.add("level-up-animation");
      petImage.addEventListener(
        "animationend",
        () => {
          petImage.classList.remove("level-up-animation");
        },
        { once: true }
      );
    }
  }
  const xpPercentage = (xp / xpForNextLevel) * 100;
  xpBar.style.width = `${xpPercentage}%`;
  xpText.textContent = `${xp} / ${xpForNextLevel} xp`;
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  pomodoroDisplay.textContent = `${minutes}:${seconds}`;
}

function changePetImage(reaction, duration = 3000) {
  if (petImage && petImageSources[reaction]) {
    petImage.src = petImageSources[reaction];
    petImage.classList.add("is-floating");
    setTimeout(() => {
      petImage.src = petImageSources.default;
      petImage.classList.add("is-floating");
    }, duration);
  }
}

function setPetImage(reaction) {
  if (petImage && petImageSources[reaction]) {
    petImage.src = petImageSources[reaction];
    petImage.classList.add("is-floating");
  }
}

function updatePomodoroState(isRunning) {
  timerRunning = isRunning;
  if (isRunning) {
    startPauseButton.textContent = "PAUSE";
    setPetImage("pomodoro");
  } else {
    startPauseButton.textContent = "START";
    setPetImage("default");
  }
}

// --- Event Handlers (Funções de Ação) ---
function showToast(message, icon) {
  const container = document.getElementById("toast-container");
  const existingToast = container.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<h2><i class="fa-solid ${icon}"></i> ${message}</h2>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3500);
}

function handleAddTask() {
  const modal = document.getElementById("add-task-modal");
  modal.classList.remove("hidden");
  const taskInput = document.getElementById("task-input");
  taskInput.value = "";
  taskInput.placeholder = "What do you need to do?";
  taskInput.focus();
}

function handleSleep() {
  updateStat("rest", 10);
  showToast("Your pet rested a bit! +10xp", "fa-bed");
  changePetImage("sleep");
}

function handleLove() {
  updateStat("love", 10);
  showToast("Lots of love for your pet! +10xp", "fa-heart");
  changePetImage("love");
}

function handleFeed() {
  updateStat("fed", 10);
  showToast("Your pet has been fed! +10xp", "fa-utensils");
  changePetImage("feed");
}

function handleStartPauseTimer() {
  if (timerRunning) {
    clearInterval(pomodoroInterval);
    updatePomodoroState(false);
  } else {
    updatePomodoroState(true);
    if (timeLeft === pomodoroDuration)
      startSound.play().catch((e) => console.error(e));

    pomodoroInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(pomodoroInterval);
        updateStat("focus", 25);
        showToast("⏰ Focus session complete! +25xp", "fa-brain");
        endSound.play().catch((e) => console.error(e));
        timeLeft = pomodoroDuration;
        updateTimerDisplay();
        updatePomodoroState(false);
      }
    }, 1000);
  }
}

function handleResetTimer() {
  clearInterval(pomodoroInterval);
  timeLeft = pomodoroDuration;
  updateTimerDisplay();
  updatePomodoroState(false);
}

function petReact() {
  updateStat("love", 5);
  showToast("You petted your pet! +5xp", "fa-paw");
  changePetImage("boop", 1500);
}

function shuffleName() {
  const names = [
    "Bubbles",
    "Miki",
    "Neko",
    "Lulu",
    "Zuzu",
    "Koko",
    "Fafa",
    "Toto",
    "Peachy",
    "Momo",
    "Pipoca",
    "Kiki",
    "Bibi",
    "Tama",
    "Chibi",
    "Luna",
    "Coco",
    "Nina",
    "Bunbun",
    "Pixie",
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];
  document.getElementById("pet-name").textContent = randomName + "!";
}

// ==========================================================
// 3. SETUP PRINCIPAL
// ==========================================================
function initializeApp() {
  initializeAudioControls();

  pomodoroDisplay.addEventListener("focus", () => {
    if (timerRunning) handleStartPauseTimer();
  });
  pomodoroDisplay.addEventListener("blur", () => {
    let newMinutes = parseInt(pomodoroDisplay.textContent.trim(), 10);
    if (isNaN(newMinutes) || newMinutes <= 0 || newMinutes > 999) {
      newMinutes = 25;
    }
    pomodoroDuration = newMinutes * 60;
    timeLeft = pomodoroDuration;
    updateTimerDisplay();
  });
  pomodoroDisplay.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      pomodoroDisplay.blur();
    }
  });

  document
    .querySelectorAll(".todo-list .todo-item input[type=checkbox]")
    .forEach((el) => {
      el.addEventListener("change", function () {
        if (this.checked) {
          updateStat("tasks", 20);
          showToast("Task completed! +20xp", "fa-check");
        }
      });
    });

  const addTaskModal = document.getElementById("add-task-modal");
  const confirmBtn = document.getElementById("confirm-add-task");
  const cancelBtn = document.getElementById("cancel-add-task");
  const taskInput = document.getElementById("task-input");

  const hideAddTaskModal = () => addTaskModal.classList.add("hidden");

  const confirmAddTask = () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
      const list = document.querySelector(".todo-list");
      const li = document.createElement("li");
      li.innerHTML = `<label class="todo-item"><input type="checkbox" /><span class="checkmark"></span><span class="task-text text-deep-orange h3">${taskText}</span></label>`;

      li.querySelector("input[type=checkbox]").addEventListener(
        "change",
        function () {
          if (this.checked) {
            updateStat("tasks", 20);
            showToast("Task completed! +20xp", "fa-check");
          }
        }
      );
      list.appendChild(li);
      hideAddTaskModal();
    } else {
      taskInput.placeholder = "Please write a task first!";
    }
  };

  if (confirmBtn) confirmBtn.addEventListener("click", confirmAddTask);
  if (cancelBtn) cancelBtn.addEventListener("click", hideAddTaskModal);
  if (addTaskModal)
    addTaskModal.addEventListener("click", (e) => {
      if (e.target === addTaskModal) hideAddTaskModal();
    });
  if (taskInput)
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAddTask();
      }
    });

  levelDisplay.textContent = `Level ${level}`;
  updateXP(0);
}

document.addEventListener("DOMContentLoaded", initializeApp);
