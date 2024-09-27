const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const pauseButton = document.getElementById('pauseButton');
const soundButton = document.getElementById('soundButton');
const instructionsButton = document.getElementById('instructionsButton');
const instructionsModal = document.getElementById('instructionsModal');
const closeButton = document.querySelector('.close');

const eatSound = document.getElementById('eatSound');
const crashSound = document.getElementById('crashSound');
const startSound = document.getElementById('startSound');

let tileCount = 20;
let tileSize;
let snake = [];
let food;
let dx = 0;
let dy = 0;
let score = 0;
let gameStarted = false;
let isPaused = false;
let gameLoop;
let isSoundOn = true;

function drawGame() {
    if (!gameStarted || isPaused) return;

    moveSnake();
    checkCollision();
    clearCanvas();
    drawSnake();
    drawFood();
    console.log('Current score:', score); // Para depuración

    gameLoop = setTimeout(() => requestAnimationFrame(drawGame), 1000 / getGameSpeed());
}

function clearCanvas() {
    const baseColor = '#000000'; // Color negro original
    const specialColor = '#330033'; // Color especial (púrpura oscuro)
    
    ctx.fillStyle = score >= 10 ? specialColor : baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        // La serpiente comió la comida
        playSound(eatSound);
        food = getRandomFood();
        updateScore(); // Llamamos a updateScore aquí
        console.log('Snake ate food. New score:', score); // Para depuración
    } else {
        // La serpiente no comió, así que removemos el último segmento
        snake.pop();
    }
}

function drawSnake() {
    const baseColor = '#00ff00'; // Color verde original
    const specialColor = '#ff00ff'; // Color especial (magenta)
    
    snake.forEach((segment, index) => {
        const color = score >= 10 ? specialColor : baseColor;
        ctx.fillStyle = color;
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize - 2, tileSize - 2);
        
        // Dibujar los ojos solo en la cabeza de la serpiente
        if (index === 0) {
            ctx.fillStyle = '#000000';
            ctx.fillRect((segment.x * tileSize) + (tileSize / 4), (segment.y * tileSize) + (tileSize / 4), tileSize / 8, tileSize / 8);
            ctx.fillRect((segment.x * tileSize) + (5 * tileSize / 8), (segment.y * tileSize) + (tileSize / 4), tileSize / 8, tileSize / 8);
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize - 2, tileSize - 2);
}

function getRandomFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    playSound(crashSound);
    gameStarted = false;
    clearTimeout(gameLoop);
    pauseButton.innerHTML = '🔄';
    
    saveScore(score);
    displayScoreHistory();
    
    setTimeout(() => {
        displayScoreHistory();
    }, 100);
}

function updateScore() {
    score++;
    scoreElement.textContent = `Score: ${score}`;
    console.log('Score updated:', score); // Para depuración
    
    // Verifica si el puntaje acaba de llegar a 10 para cambiar los colores
    if (score === 10) {
        clearCanvas();
        drawSnake();
        drawFood();
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? '▶️' : '⏸️';
    if (isPaused) {
        clearTimeout(gameLoop);
    } else {
        drawGame();
    }
}

function startGame() {
    if (!gameStarted) {
        snake = [{ x: 10, y: 10 }];
        food = getRandomFood();
        score = 0; // Reinicia el puntaje a 0
        dx = 1;
        dy = 0;
        gameStarted = true;
        isPaused = false;
        messageElement.textContent = '';
        scoreElement.textContent = 'Score: 0';
        pauseButton.textContent = '⏸️';
        playSound(startSound);
        drawGame();
        console.log('Game started. Initial score:', score); // Para depuración
    }
}

function getGameSpeed() {
    // Velocidad base (más lenta)
    const baseSpeed = 10;
    
    // Reducción de velocidad basada en la longitud de la serpiente
    const speedReduction = Math.floor(snake.length / 5);
    
    // Aseguramos que la velocidad no baje de un cierto límite
    return Math.max(3, baseSpeed - speedReduction);
}

function setupTouchControls() {
    const buttons = document.querySelectorAll('.direction-btn');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchend', handleTouchEnd, { passive: false });
        // Agregamos también eventos de mouse para pruebas en desktop
        button.addEventListener('mousedown', handleTouchStart);
        button.addEventListener('mouseup', handleTouchEnd);
    });
}

function handleTouchStart(event) {
    event.preventDefault();
    const direction = event.target.id;
    console.log('Touch start:', direction); // Para depuración
    changeDirection(direction);
}

function handleTouchEnd(event) {
    event.preventDefault();
    console.log('Touch end'); // Para depuración
}

function changeDirection(newDirection) {
    console.log('Changing direction to:', newDirection); // Para depuración
    
    if (!gameStarted) {
        startGame();
        return;
    }
    
    if (isPaused) {
        togglePause();
    }

    switch (newDirection) {
        case 'up': if (dy !== 1) { dx = 0; dy = -1; } break;
        case 'down': if (dy !== -1) { dx = 0; dy = 1; } break;
        case 'left': if (dx !== 1) { dx = -1; dy = 0; } break;
        case 'right': if (dx !== -1) { dx = 1; dy = 0; } break;
    }
}

function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!gameStarted) {
            startGame();
        } else {
            togglePause();
        }
        return;
    }

    let direction;
    switch (event.key) {
        case 'ArrowUp': direction = 'up'; break;
        case 'ArrowDown': direction = 'down'; break;
        case 'ArrowLeft': direction = 'left'; break;
        case 'ArrowRight': direction = 'right'; break;
        default: return;
    }
    
    changeDirection(direction);
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    soundButton.innerHTML = isSoundOn ? '🔊' : '🔇';
    [eatSound, crashSound, startSound].forEach(sound => sound.muted = !isSoundOn);
}

function playSound(sound) {
    if (isSoundOn) {
        sound.currentTime = 0;
        sound.play().catch(e => console.error("Error playing sound:", e));
    }
}

function resizeGame() {
    const canvas = document.getElementById('gameCanvas');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    tileCount = 20; // O el número que prefieras
    tileSize = canvas.width / tileCount;
    
    if (gameStarted && !isPaused) {
        drawGame();
    }
}

function init() {
    resizeGame();
    window.addEventListener('resize', resizeGame);
    document.addEventListener('keydown', handleKeyDown);
    setupTouchControls();
    clearCanvas();
    // Eliminamos la línea que establece el texto inicial del messageElement
    // messageElement.textContent = 'Press Space, Tap Screen, or Use Arrow Keys to Start';
    pauseButton.addEventListener('click', togglePause);
    soundButton.addEventListener('click', toggleSound);
    instructionsButton.addEventListener('click', showInstructions);
    canvas.addEventListener('click', startGame);
    initSoundButton();
    displayScoreHistory();

    instructionsButton.addEventListener('click', () => {
        instructionsModal.style.display = 'block';
        if (gameStarted && !isPaused) {
            togglePause(); // Pausa el juego cuando se abren las instrucciones
        }
    });
    
    closeButton.addEventListener('click', () => {
        instructionsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === instructionsModal) {
            instructionsModal.style.display = 'none';
        }
    });
    
    // Opcionalmente, puedes añadir un listener para la tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && instructionsModal.style.display === 'block') {
            instructionsModal.style.display = 'none';
        }
    });

    score = 0;
    scoreElement.textContent = `Score: ${score}`;
}

function updateSoundButton() {
    soundButton.innerHTML = isSoundOn ? '🔊' : '🔇';
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('snakeScores')) || [];
    scores.push({score: score, date: new Date().toLocaleString()});
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    localStorage.setItem('snakeScores', JSON.stringify(scores));
}

function displayScoreHistory() {
    let scores = JSON.parse(localStorage.getItem('snakeScores')) || [];
    let historyHTML = '<h2>Top 10 Scores</h2><ul>';
    if (scores.length === 0) {
        historyHTML += '<li>No scores yet. Play a game!</li>';
    } else {
        scores.forEach((score, index) => {
            historyHTML += `<li>#${index + 1}: ${score.score} pts - ${score.date}</li>`;
        });
    }
    historyHTML += '</ul>';
    
    const historyElement = document.getElementById('scoreHistory');
    if (historyElement) {
        historyElement.innerHTML = historyHTML;
    } else {
        console.error('Score history element not found');
    }
}

function showInstructions() {
    instructionsModal.style.display = 'block';
    if (gameStarted && !isPaused) {
        togglePause();
    }
}

function initSoundButton() {
    soundButton.innerHTML = isSoundOn ? '🔊' : '🔇';
}

init();