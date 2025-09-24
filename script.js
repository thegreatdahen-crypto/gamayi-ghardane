document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const normalModeBtn = document.getElementById('normal-mode-btn');
    const hardModeBtn = document.getElementById('hard-mode-btn');
    const restartButton = document.getElementById('restart-button');
    const nextLevelButton = document.getElementById('next-level-button');
    // ... (هەموو ناساندنەکانی تر)

    let player, obstacles, score, gameLoop, groundHeight, cameraX, door;
    let gameActive = false;
    let currentLevel = 1;
    let difficultyMode = 'normal'; // 'normal' or 'hard'
    let checkpointLevel = 1;

    // --- ڕێکخستنی ئاستەکان ---
    const normalLevelConfig = {
        1: { speed: 3.5, length: 2000 }, 2: { speed: 4.0, length: 2500 },
        // ... تا ١٠ ئاست ...
        10: { speed: 7.0, length: 7000 }
    };
    const hardLevelConfig = {
        1: { speed: 4.0, length: 2000 }, 2: { speed: 4.5, length: 2500 },
        3: { speed: 5.0, length: 3000 }, 4: { speed: 5.5, length: 3500 },
        5: { speed: 6.0, length: 4000 }, 6: { speed: 6.5, length: 4500 },
        7: { speed: 7.0, length: 5000 }, 8: { speed: 7.5, length: 5500 },
        9: { speed: 8.0, length: 6000 }, 10: { speed: 9.0, length: 7000 }
    };
    let currentConfig;

    function setCanvasSize() { /* ... هەمان کۆدی پێشوو ... */ }

    function startGame(mode) {
        difficultyMode = mode;
        score = 0;
        if (difficultyMode === 'hard') {
            checkpointLevel = parseInt(localStorage.getItem('checkpoint')) || 1;
            currentConfig = hardLevelConfig;
            startLevel(checkpointLevel);
        } else {
            checkpointLevel = 1;
            currentConfig = normalLevelConfig;
            startLevel(1);
        }
    }

    function startLevel(level) {
        currentLevel = level;
        currentConfig = (difficultyMode === 'hard') ? hardLevelConfig : normalLevelConfig;
        const config = currentConfig[level];
        if (!config) { gameOver(true); return; }
        
        // ... (هەموو کۆدی تری ناو startLevel وەک خۆی) ...
        
        // --- لۆژیکی نوێی دروستکردنی بەربەست ---
        obstacles = [];
        let currentPos = 800;
        while (currentPos < config.length - 400) {
            // دیوارێک دروست بکە
            obstacles.push({ type: 'wall', x: currentPos, y: groundHeight - 120, width: 30, height: 120 });
            // بۆشاییەک دروست بکە
            const gap = Math.random() * 300 + 400;
            // لەناو بۆشاییەکەدا بەربەست دروست بکە
            const obstacleInGapType = Math.random() > 0.5 ? 'goomba' : 'pipe';
            if (obstacleInGapType === 'goomba') {
                obstacles.push({ type: 'goomba', x: currentPos + gap / 2, y: groundHeight - 40, width: 40, height: 40 });
            } else {
                 obstacles.push({ type: 'pipe', x: currentPos + gap / 2, y: groundHeight - 80, width: 50, height: 80 });
            }
            currentPos += gap;
        }

        door = { x: config.length, y: groundHeight - 100, width: 80, height: 100 };
        // ... (کۆتایی startLevel) ...
    }

    function drawObstacle(obstacle) {
        // ... (هەمان کۆدی پێشوو) ...
        // --- زیادکردنی وێنەکێشانی دیوار ---
        if (obstacle.type === 'wall') {
            ctx.fillStyle = '#f39c12'; // Yellow wall
            ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
        }
    }

    function levelComplete() {
        gameActive = false;
        if (difficultyMode === 'hard' && currentLevel >= 6) {
            localStorage.setItem('checkpoint', currentLevel + 1);
        }
        // ... (کۆدی تری ناو levelComplete وەک خۆی) ...
    }
    
    // Event Listeners
    normalModeBtn.addEventListener('click', () => startGame('normal'));
    hardModeBtn.addEventListener('click', () => startGame('hard'));
    restartButton.addEventListener('click', () => {
        score = 0;
        if (difficultyMode === 'hard') {
            startLevel(checkpointLevel);
        } else {
            startLevel(1);
        }
    });
    // ... (هەموو event listenerـەکانی تر وەک خۆیان) ...
});
