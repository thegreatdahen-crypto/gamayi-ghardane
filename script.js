document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const nextLevelButton = document.getElementById('next-level-button');
    const finalScoreElement = document.getElementById('final-score');
    const levelCompleteTitle = document.getElementById('level-complete-title');
    const gameOverTitle = document.getElementById('game-over-title');

    let player, obstacles, score, gameLoop, groundHeight, cameraX, door, dog;
    let gameActive = false;
    let currentLevel = 1;

    const levelConfig = {
        1: { speed: 4.0, length: 2000, obstacleTypes: ['goomba'] }, 2: { speed: 4.5, length: 2500, obstacleTypes: ['goomba'] },
        3: { speed: 5.0, length: 3000, obstacleTypes: ['goomba', 'pipe'] }, 4: { speed: 5.5, length: 3500, obstacleTypes: ['goomba', 'pipe'] },
        5: { speed: 6.0, length: 4000, obstacleTypes: ['pipe', 'flying'] }, 6: { speed: 6.5, length: 4500, obstacleTypes: ['goomba', 'pipe', 'flying'] },
        7: { speed: 7.0, length: 5000, obstacleTypes: ['goomba', 'pipe', 'flying'] }, 8: { speed: 7.5, length: 5500, obstacleTypes: ['goomba', 'flying'] },
        9: { speed: 8.0, length: 12000, obstacleTypes: ['pipe', 'flying'], hasDog: true },
        10: { speed: 9.0, length: 14000, obstacleTypes: ['goomba', 'pipe', 'flying'], hasDog: true }
    };

    function setCanvasSize() { const container = document.getElementById('game-container'); canvas.width = Math.min(800, window.innerWidth * 0.98); canvas.height = Math.min(450, window.innerHeight * 0.98); container.style.width = `${canvas.width}px`; container.style.height = `${canvas.height}px`; groundHeight = canvas.height - 50; }
    function startLevel(level) {
        currentLevel = level; const config = levelConfig[level]; if (!config) { gameOver(true); return; } setCanvasSize();
        player = { x: 60, y: groundHeight - 60, width: 40, height: 60, velocityY: 0, isJumping: true };
        cameraX = 0; obstacles = []; score = score || 0; gameActive = true;
        if (config.hasDog) { dog = { x: -100, y: groundHeight - 50, width: 70, height: 50, speed: config.speed - 0.5 }; } else { dog = null; }
        for (let i = 800; i < config.length - 200; i += Math.random() * 400 + 300) { createObstacle(i); }
        door = { x: config.length, y: groundHeight - 100, width: 80, height: 100 };
        startScreen.style.display = 'none'; gameOverScreen.style.display = 'none'; levelCompleteScreen.style.display = 'none';
        if (gameLoop) cancelAnimationFrame(gameLoop);
        update();
    }
    function createObstacle(posX) { const config = levelConfig[currentLevel]; const type = config.obstacleTypes[Math.floor(Math.random() * config.obstacleTypes.length)]; if (type === 'pipe') obstacles.push({ type, x: posX, y: groundHeight - 80, width: 50, height: 80 }); else if (type === 'goomba') obstacles.push({ type, x: posX, y: groundHeight - 40, width: 40, height: 40 }); else if (type === 'flying') obstacles.push({ type, x: posX, y: groundHeight - 150, width: 50, height: 30 }); }
    function drawPlayer() { const headRadius = 10; const bodyLength = 25; const armLength = 15; const legLength = 20; const headX = player.x + player.width / 2; const headY = player.y + headRadius; const bodyYStart = player.y + 2 * headRadius; const bodyYEnd = bodyYStart + bodyLength; const feetY = player.y + player.height; ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(headX, headY, headRadius, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(headX, bodyYStart); ctx.lineTo(headX, bodyYEnd); ctx.stroke(); const animationAngle = player.isJumping ? 0.2 : Math.sin(Date.now() / 100) * 0.8; ctx.beginPath(); ctx.moveTo(headX, bodyYEnd); ctx.lineTo(headX + legLength * Math.sin(animationAngle), feetY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(headX, bodyYStart + 5); ctx.lineTo(headX - armLength * Math.sin(animationAngle), bodyYStart + 15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(headX, bodyYEnd); ctx.lineTo(headX - legLength * Math.sin(animationAngle), feetY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(headX, bodyYStart + 5); ctx.lineTo(headX + armLength * Math.sin(animationAngle), bodyYStart + 15); ctx.stroke(); }
    function drawObstacle(obstacle) { const screenX = obstacle.x - cameraX; if (screenX > canvas.width || screenX + obstacle.width < 0) return; if (obstacle.type === 'pipe') { ctx.fillStyle = '#2ecc71'; ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height); ctx.fillRect(screenX - 5, obstacle.y, obstacle.width + 10, 20); } else if (obstacle.type === 'goomba') { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(screenX + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2); ctx.fill(); } else if (obstacle.type === 'flying') { ctx.fillStyle = '#f1c40f'; ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height); } }
    function drawDoor() { const screenX = door.x - cameraX; if (screenX > canvas.width || screenX + door.width < 0) return; ctx.fillStyle = '#a9a9a9'; ctx.fillRect(screenX, door.y, door.width, door.height); ctx.fillStyle = '#5d4037'; ctx.fillRect(screenX + 15, door.y + 30, door.width - 30, door.height - 30); ctx.fillRect(screenX - 5, door.y - 15, 20, 15); ctx.fillRect(screenX + door.width - 15, door.y - 15, 20, 15); }
    function drawDog() { if (!dog) return; const screenX = dog.x - cameraX + player.x; ctx.fillStyle = '#6D4C41'; ctx.fillRect(screenX, dog.y, dog.width, dog.height); const legMovement = Math.sin(Date.now() / 80) * 5; ctx.fillRect(screenX + 5, dog.y + dog.height - 10 + legMovement, 10, 10); ctx.fillRect(screenX + dog.width - 15, dog.y + dog.height - 10 - legMovement, 10, 10); }
    function gameOver(isWin = false) { gameActive = false; if (isWin) { gameOverTitle.textContent = "پیرۆزە گەیشتییەوە مارێ بەس بەبێ نەعلەکەت"; finalScoreElement.innerHTML = `کۆی خاڵەکانت: ${Math.floor(score)}`; } else { if (currentLevel === 9) { gameOverTitle.textContent = "دەزانم ئەو نامەیە نابینی بەس خوات لێت خۆشبی"; } else if (currentLevel === 10) { gameOverTitle.textContent = "لە کۆتایی هەر دەمری ئەگەر بە هەموو ژیانت هەر غار بدەیی"; } else { gameOverTitle.textContent = "بەو حارەی بەتەمای غاردەی؟"; } finalScoreElement.textContent = `خاڵ: ${Math.floor(score)} | ئاست: ${currentLevel}`; } gameOverScreen.style.display = 'flex'; }
    function levelComplete() { gameActive = false; if (currentLevel === 9) { levelCompleteTitle.textContent = "ئەوە ئەو جارەش قوتارت بوو"; } else { levelCompleteTitle.textContent = `ئاستی ${currentLevel} تەواو بوو!`; } levelCompleteScreen.style.display = 'flex'; }
    function update() { if (!gameActive) return; const config = levelConfig[currentLevel]; cameraX += config.speed; score += config.speed * 0.01; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#e67e22'; ctx.fillRect(0, groundHeight, canvas.width, 50); obstacles.forEach(drawObstacle); drawDoor(); drawPlayer(); if (dog) { dog.x += dog.speed - config.speed; drawDog(); if (dog.x + dog.width > player.x) { gameOver(); } } player.y += player.velocityY; player.velocityY += 0.9; if (player.y >= groundHeight - player.height) { player.y = groundHeight - player.height; player.velocityY = 0; player.isJumping = false; } obstacles.forEach(obstacle => { const screenX = obstacle.x - cameraX; if (player.x < screenX + obstacle.width && player.x + player.width > screenX && player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) { gameOver(); } }); const doorScreenX = door.x - cameraX; if (player.x + player.width > doorScreenX) { levelComplete(); } ctx.fillStyle = 'white'; ctx.font = '30px Vazirmatn, Arial'; ctx.fillText(`خاڵ: ${Math.floor(score)}`, 20, 40); ctx.fillText(`ئاست: ${currentLevel}`, canvas.width - 150, 40); const progress = cameraX / config.length; ctx.fillStyle = '#bdc3c7'; ctx.fillRect(20, 60, 200, 15); ctx.fillStyle = '#2ecc71'; ctx.fillRect(20, 60, 200 * Math.min(progress, 1), 15); gameLoop = requestAnimationFrame(update); }
    function jump() { if (!gameActive) return; if (!player.isJumping) { player.isJumping = true; player.velocityY = -20; } }
    startButton.addEventListener('click', () => { score = 0; startLevel(1); });
    restartButton.addEventListener('click', () => { score = 0; startLevel(1); });
    nextLevelButton.addEventListener('click', () => startLevel(currentLevel + 1));
    document.addEventListener('keydown', (e) => { if (!gameActive) { if (e.code === 'Space' || e.code === 'Enter') startButton.click(); } else if (e.code === 'Space' || e.code === 'ArrowUp') { jump(); } });
    document.body.addEventListener('touchstart', jump);
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
});
