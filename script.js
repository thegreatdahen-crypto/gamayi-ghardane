// ===== Game State =====
let currentMode = null;
let currentLevel = 1;
let secretNumber = null;
let attempts = 0;
let maxAttempts = 10;
let hintsUsed = 0;
let totalScore = 0;

// Hard mode: if player reaches level 6, game resets to level 1
const HARD_MODE_RESET_LEVEL = 6;

// ===== Screen Manager =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
}

// ===== Mode Selection =====
function chooseMode(mode) {
    currentMode = mode;
    currentLevel = 1;
    totalScore = 0;
    startLevel();
    showScreen('game-screen');
}

// ===== Level Setup =====
function getLevelConfig(level) {
    // Each level: number range grows, attempts reduce slightly
    const ranges = [
        { min: 1, max: 10 },   // Level 1
        { min: 1, max: 20 },   // Level 2
        { min: 1, max: 30 },   // Level 3
        { min: 1, max: 50 },   // Level 4
        { min: 1, max: 75 },   // Level 5
        { min: 1, max: 100 },  // Level 6
        { min: 1, max: 150 },  // Level 7
        { min: 1, max: 200 },  // Level 8
        { min: 1, max: 300 },  // Level 9
        { min: 1, max: 500 },  // Level 10
    ];
    const idx = Math.min(level - 1, ranges.length - 1);
    return ranges[idx];
}

function startLevel() {
    const config = getLevelConfig(currentLevel);
    secretNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    attempts = 0;
    maxAttempts = Math.max(5, 12 - currentLevel);
    hintsUsed = 0;

    // Update UI
    document.getElementById('level-display').textContent = 'ئاست: ' + currentLevel;
    document.getElementById('range-display').textContent = 'ژمارەیەک لە ' + config.min + ' تا ' + config.max;
    document.getElementById('attempts-display').textContent = 'هەوڵی ماوە: ' + maxAttempts;
    document.getElementById('feedback').textContent = 'ژمارەکە حەزبکە!';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-input').max = config.max;
    document.getElementById('guess-input').min = config.min;
    document.getElementById('hint-text').textContent = '';
    renderAttemptDots();

    // Mode label
    const modeLabel = currentMode === 'hard' ? '🔥 قورس' : '⭐ نۆڕماڵ';
    document.getElementById('mode-label').textContent = modeLabel;
}

// ===== Attempt Dots =====
function renderAttemptDots() {
    const container = document.getElementById('attempt-dots');
    container.innerHTML = '';
    for (let i = 0; i < maxAttempts; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i < attempts) dot.classList.add('used');
        container.appendChild(dot);
    }
}

// ===== Guess Submission =====
function submitGuess() {
    const input = document.getElementById('guess-input');
    const config = getLevelConfig(currentLevel);
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < config.min || guess > config.max) {
        showFeedback('تکایە ژمارەیەکی دروست بنووسە (' + config.min + '-' + config.max + ')', 'wrong');
        shakeInput();
        return;
    }

    attempts++;
    renderAttemptDots();

    if (guess === secretNumber) {
        handleCorrectGuess();
    } else {
        if (attempts >= maxAttempts) {
            handleGameOver();
        } else {
            const direction = guess < secretNumber ? '⬆️ زیاترە' : '⬇️ کەمترە';
            showFeedback(direction, 'wrong');
            shakeInput();
            document.getElementById('attempts-display').textContent = 'هەوڵی ماوە: ' + (maxAttempts - attempts);
        }
    }
    input.value = '';
    input.focus();
}

function handleCorrectGuess() {
    const levelScore = Math.max(10, (maxAttempts - attempts + 1) * 10 * currentLevel);
    totalScore += levelScore;

    showFeedback('🎉 ئاڵۆز! +' + levelScore + ' خاڵ', 'correct');
    triggerConfetti();

    setTimeout(() => {
        if (currentMode === 'hard' && currentLevel >= HARD_MODE_RESET_LEVEL) {
            // Hard mode: reaching level 6 resets
            showEndScreen(true, 'hard-reset');
        } else {
            currentLevel++;
            if (currentLevel > 10) {
                showEndScreen(true, 'win');
            } else {
                startLevel();
            }
        }
    }, 1800);
}

function handleGameOver() {
    showFeedback('💀 ژمارەکە ' + secretNumber + ' بوو!', 'wrong');
    setTimeout(() => {
        if (currentMode === 'normal') {
            // Normal mode: restart from level 1
            currentLevel = 1;
            totalScore = 0;
            showEndScreen(false, 'restart');
        } else {
            // Hard mode: game over
            showEndScreen(false, 'gameover');
        }
    }, 1800);
}

// ===== End Screen =====
function showEndScreen(won, reason) {
    showScreen('end-screen');
    const title = document.getElementById('end-title');
    const msg = document.getElementById('end-message');
    const scoreEl = document.getElementById('end-score');

    scoreEl.textContent = 'کۆی خاڵەکانت: ' + totalScore;

    if (won && reason === 'win') {
        title.textContent = '🏆 بردیت!';
        msg.textContent = 'تۆ هەموو ئاستەکانت تێپەڕاند!';
    } else if (reason === 'hard-reset') {
        title.textContent = '🔥 گەیشتیتە ئاستی ' + HARD_MODE_RESET_LEVEL + '!';
        msg.textContent = 'لە مۆدی قورس، یارییەکە پاشەکەوت دەبێت. دیسان هەوڵبدەوە!';
    } else if (reason === 'restart') {
        title.textContent = '😞 دووبارە هەوڵبدەوە!';
        msg.textContent = 'لە نۆڕماڵ مۆد، لە سەرەتاوە دەست پێدەکەیتەوە.';
    } else {
        title.textContent = '💀 بازی تەواو بوو!';
        msg.textContent = 'لە مۆدی قورس دەرکەوتیت. دیسان هەوڵبدەوە!';
    }
}

function restartGame() {
    showScreen('menu-screen');
    currentMode = null;
    currentLevel = 1;
    totalScore = 0;
}

function continueGame() {
    // After hard-reset or normal restart, let them pick mode again
    showScreen('menu-screen');
}

// ===== Hint System =====
function giveHint() {
    if (hintsUsed >= 2) {
        document.getElementById('hint-text').textContent = 'هیچ ئامۆژگاریەکی دیکەت نەماوە!';
        return;
    }
    hintsUsed++;
    attempts++; // hint costs an attempt
    renderAttemptDots();
    document.getElementById('attempts-display').textContent = 'هەوڵی ماوە: ' + (maxAttempts - attempts);

    const config = getLevelConfig(currentLevel);
    let hint = '';
    if (hintsUsed === 1) {
        // Odd or even
        hint = secretNumber % 2 === 0 ? '🔵 ژمارەکە جووتە (even)' : '🔴 ژمارەکە تاکە (odd)';
    } else {
        // Narrower range
        const quarter = Math.floor((config.max - config.min) / 4);
        const low = Math.max(config.min, secretNumber - quarter);
        const high = Math.min(config.max, secretNumber + quarter);
        hint = '📍 ژمارەکە لەنێوان ' + low + ' و ' + high + ' دایە';
    }
    document.getElementById('hint-text').textContent = hint;

    if (attempts >= maxAttempts) {
        handleGameOver();
    }
}

// ===== UI Helpers =====
function showFeedback(msg, type) {
    const el = document.getElementById('feedback');
    el.textContent = msg;
    el.className = 'feedback ' + type;
}

function shakeInput() {
    const input = document.getElementById('guess-input');
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.8 + 's';
        piece.style.width = (Math.random() * 8 + 6) + 'px';
        piece.style.height = (Math.random() * 8 + 6) + 'px';
        container.appendChild(piece);
    }
    setTimeout(() => container.innerHTML = '', 2500);
}

// ===== Enter Key Support =====
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('guess-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitGuess();
        });
    }
    showScreen('menu-screen');
});
