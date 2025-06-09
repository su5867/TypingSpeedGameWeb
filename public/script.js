// Game state
let gameRunning = false;
let gameStartTime;
let correctChars = 0;
let totalChars = 0;
let wpmHistory = [];
let darkMode = false;
let currentPrompt = '';

// Difficulty settings
const difficulties = {
  easy: { length: 15, name: "Easy", multiplier: 1.0 },
  medium: { length: 25, name: "Medium", multiplier: 1.2 },
  hard: { length: 40, name: "Hard", multiplier: 1.5 }
};

// Word bank
const WORDS = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
  "Java", "programming", "language", "developer", "computer",
  "algorithm", "data", "structure", "typing", "speed", "test",
  "keyboard", "efficient", "productive", "coding", "debugging"
];

// DOM elements
const promptEl = document.getElementById('prompt');
const inputEl = document.getElementById('input');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const feedbackEl = document.getElementById('feedback');
const highScoresEl = document.getElementById('highScores');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');
const themeBtn = document.getElementById('themeBtn');
const difficultySelect = document.getElementById('difficulty');
const wpmProgress = document.getElementById('wpmProgress');
const accuracyProgress = document.getElementById('accuracyProgress');

// High scores
const highScores = {
  easy: 0,
  medium: 0,
  hard: 0,
  update(difficulty, score) {
    if (score > this[difficulty]) {
      this[difficulty] = score;
      this.display();
    }
  },
  display() {
    highScoresEl.innerHTML = `
      <div>Easy: <span class="score">${this.easy} WPM</span></div>
      <div>Medium: <span class="score">${this.medium} WPM</span></div>
      <div>Hard: <span class="score">${this.hard} WPM</span></div>
    `;
  }
};

// Initialize
highScores.display();

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
exitBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to exit the game?')) {
    window.close();
  }
});
themeBtn.addEventListener('click', toggleTheme);
inputEl.addEventListener('input', checkTyping);

function startGame() {
  gameRunning = true;
  gameStartTime = new Date();
  correctChars = 0;
  totalChars = 0;
  wpmHistory = [];
  
  inputEl.value = '';
  inputEl.disabled = false;
  inputEl.focus();
  
  generatePrompt();
  updateFeedback("Type the text above! First character...");
  
  // Start timer
  const timerInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(timerInterval);
      return;
    }
    
    const secondsLeft = 60 - Math.floor((new Date() - gameStartTime) / 1000);
    timerEl.textContent = `${secondsLeft}s`;
    
    if (secondsLeft <= 0) {
      endGame();
      clearInterval(timerInterval);
    }
    
    updateStats();
  }, 100);
}

function generatePrompt() {
  const difficulty = difficulties[difficultySelect.value];
  const words = [];
  
  for (let i = 0; i < difficulty.length; i++) {
    words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  
  currentPrompt = words.join(' ');
  displayPrompt(currentPrompt);
}

function displayPrompt(text) {
  promptEl.innerHTML = text.split('').map(char => 
    `<span class="remaining">${char}</span>`
  ).join('');
}

function checkTyping() {
  if (!gameRunning) return;
  
  const typed = inputEl.value;
  let correct = 0;
  let feedbackHTML = '';
  
  for (let i = 0; i < typed.length; i++) {
    const expected = i < currentPrompt.length ? currentPrompt[i] : ' ';
    const actual = typed[i];
    
    if (actual === expected) {
      correct++;
      feedbackHTML += `<span class="correct">${actual}</span>`;
    } else {
      feedbackHTML += `<span class="incorrect">${actual}</span>`;
    }
  }
  
  // Show remaining characters
  if (typed.length < currentPrompt.length) {
    feedbackHTML += `<span class="remaining">${currentPrompt.substring(typed.length)}</span>`;
  }
  
  promptEl.innerHTML = feedbackHTML;
  correctChars = correct;
  totalChars = typed.length;
  updateStats();
}

function updateStats() {
  const timeElapsed = (new Date() - gameStartTime) / 60000; // in minutes
  const difficulty = difficulties[difficultySelect.value];
  
  // Calculate base WPM
  const baseWpm = Math.round((correctChars / 5) / (timeElapsed || 0.0167));
  
  // Apply difficulty multiplier
  const adjustedWpm = Math.round(baseWpm * difficulty.multiplier);
  
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  
  // Update UI
  wpmEl.textContent = adjustedWpm;
  accuracyEl.textContent = `${accuracy}%`;
  wpmProgress.value = Math.min(adjustedWpm, 150);
  accuracyProgress.value = accuracy;
  
  // Record WPM every 5 seconds
  if (wpmHistory.length === 0 || Math.floor(timeElapsed * 60) % 5 === 0) {
    wpmHistory.push(adjustedWpm);
  }
}

function updateFeedback(message) {
  feedbackEl.textContent = message;
}

function endGame() {
  gameRunning = false;
  inputEl.disabled = true;
  
  const timeElapsed = (new Date() - gameStartTime) / 60000; // in minutes
  const difficulty = difficulties[difficultySelect.value];
  const finalWpm = Math.round(((correctChars / 5) * difficulty.multiplier) / timeElapsed);
  const finalAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  
  // Save high score
  highScores.update(difficultySelect.value, finalWpm);
  
  // Show results
  let performanceComment;
  if (finalWpm >= 80) performanceComment = "Expert Typist! 🚀";
  else if (finalWpm >= 50) performanceComment = "Great Job! 👍";
  else if (finalWpm >= 30) performanceComment = "Good Start! 🙂";
  else performanceComment = "Keep Practicing! 💪";
  
  setTimeout(() => {
    alert(`Test Complete!\n\nFinal WPM: ${finalWpm}\nAccuracy: ${finalAccuracy}%\n\n${performanceComment}`);
  }, 100);
}

function restartGame() {
  if (gameRunning) {
    if (!confirm('Are you sure you want to restart? Your current progress will be lost.')) {
      return;
    }
  }
  gameRunning = false;
  setTimeout(startGame, 100);
}

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode');
  themeBtn.textContent = darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
}