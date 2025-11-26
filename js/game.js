// Variables globales y configuracion del juego
const lienzoJuego = document.getElementById('lienzoJuego');
const ctx = lienzoJuego.getContext('2d');
const marcadorPuntaje = document.getElementById('marcador-puntaje');
const mensajeJuego = document.getElementById('mensaje-juego');
const botonReiniciar = document.getElementById('boton-reiniciar');

// REFERENCIAS PARA EL HISTORIAL
const historialModal = document.getElementById('historial-modal');
const historialLista = document.getElementById('historial-lista');
const botonAbrirHistorial = document.getElementById('boton-historial');
const HISTORIAL_STORAGE_KEY = 'snakeGameScores'; // Clave para el historial

//REFERENCIAS PARA PERFIL
const perfilModal = document.getElementById('perfil-modal');
const botonAbrirPerfil = document.getElementById('boton-perfil');

// Referencia a todos los botones de cerrar modal para historial y perfil
const botonCerrarModal = document.querySelectorAll('.cerrar-modal'); 


// Configuracion del tablero
const TILE_COUNT = 20; // Cuadrocula de 20x20
let TILE_SIZE;         // Se calcula dinámicamente segun el tamaño del canvas
const GAME_SPEED = 100; // Velocidad del juego en milisegundos
let gameInterval;       // Referencia al bucle del juego setInterval


// FUNCIONES DE HISTORIAL

/**
 * Obtiene el historial de puntuaciones desde localStorage
 * @returns {Array<Object>} Lista de puntuaciones
 */
function getScores() {
    const scoresJson = localStorage.getItem(HISTORIAL_STORAGE_KEY);
    return scoresJson ? JSON.parse(scoresJson) : [];
}


  //Guarda la puntuación actual en el historial
 
function saveScore(score) {
    const scores = getScores();
    // Accede a la variable global currentFullUserData definida en auth.js
    const username = (typeof currentFullUserData !== 'undefined' && currentFullUserData) 
                     ? currentFullUserData.username 
                     : 'Invitado';
    
    // Formato de fecha
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    const newScore = {
        score: score,
        username: username,
        date: formattedDate
    };
    
    scores.unshift(newScore); // Agrega la nueva puntuación al inicio
    // Mantiene solo las últimas 10 puntuaciones para no saturar
    localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
}

/**
 * Renderiza el historial de puntuaciones en el modal
 */
function renderHistorial() {
    const scores = getScores();
    historialLista.innerHTML = ''; // Limpiar la lista

    if (scores.length === 0) {
        historialLista.innerHTML = '<p class="sin-historial">No hay partidas registradas aún.</p>';
        return;
    }

    scores.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="posicion">${index + 1}.</span> 
            <span class="puntaje">${item.score} puntos</span> 
            <span class="usuario">${item.username}</span> 
            <span class="fecha">${item.date}</span>
        `;
        historialLista.appendChild(li);
    });
}


// CLASES Y CONTROLADOR DEL JUEGO


class Snake {
    
    constructor() {
        this.body = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.grow = false; 
    }
    
    changeDirection(newDir) {
        if (this.direction.x + newDir.x !== 0 || this.direction.y + newDir.y !== 0) {
            this.nextDirection = newDir;
        }
    }
    
    update() {
        this.direction = this.nextDirection;
        let newHead = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.y,
        };
        this.body.unshift(newHead);
        if (this.grow) {
            this.grow = false;
        } else {
            this.body.pop();
        }
    }

    draw() {
        ctx.fillStyle = '#80e0ff'; 
        this.body.forEach((segment) => {
            ctx.beginPath();
            ctx.fillRect(
                segment.x * TILE_SIZE,
                segment.y * TILE_SIZE,
                TILE_SIZE - 1,
                TILE_SIZE - 1
            );
            ctx.closePath();
        });
    }

    checkWallCollision() {
        const head = this.body[0];
        return (
            head.x < 0 || head.x >= TILE_COUNT ||
            head.y < 0 || head.y >= TILE_COUNT
        );
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    elongate() {
        this.grow = true;
    }
}

class Food {
    
    constructor() {
        this.position = { x: 0, y: 0 };
        this.color = '#ff5050';
    }

    spawn(snakeBody) {
        let newPos;
        let occupied;
        do {
            newPos = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT),
            };
            occupied = snakeBody.some(segment => segment.x === newPos.x && segment.y === newPos.y);
        } while (occupied);
        this.position = newPos;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x * TILE_SIZE + TILE_SIZE / 2,
            this.position.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2 * 0.8, // 80% del tamaño del tile
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
    }
}

class GameController {
    constructor() {
        this.snake = new Snake();
        this.food = new Food();
        this.score = 0;
        this.running = false;
        this.gameOver = false;

        this.food.spawn(this.snake.body);
        this.setupListeners();
        this.resizeCanvas();
    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 400);
        lienzoJuego.width = size - (size % TILE_COUNT);
        lienzoJuego.height = lienzoJuego.width;
        TILE_SIZE = lienzoJuego.width / TILE_COUNT;
        this.draw();
    }

    setupListeners() {
        document.addEventListener('keydown', this.handleInput.bind(this));
        botonReiniciar.addEventListener('click', this.startGame.bind(this));
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Listeners para el modal de HISTORIAL
        botonAbrirHistorial.addEventListener('click', () => {
            renderHistorial(); // Renderiza antes de abrir
            historialModal.classList.add('visible');
        });
        
        // Listener para el modal de PERFIL
        botonAbrirPerfil.addEventListener('click', () => {
            // Rellena los datos ANTES de mostrar el modal (usa datos cargados por auth.js)
            // Llama a la función definida en auth.js
            if (typeof populateProfileModal === 'function' && typeof currentFullUserData !== 'undefined') {
                populateProfileModal(currentFullUserData); 
            }
            perfilModal.classList.add('visible');
        });

        // Listener para cerrar CUALQUIER modal (al hacer clic en la X)
        botonCerrarModal.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Busca el contenedor padre que tiene la clase modal-oculto
                e.target.closest('.modal-oculto').classList.remove('visible');
            });
        });

        // Cerrar modales haciendo clic fuera
        [historialModal, perfilModal].forEach(modal => {
             if(modal) {
                modal.addEventListener('click', (e) => {
                    // Verifica si el clic fue directamente en el fondo del modal
                    if (e.target === modal) {
                        modal.classList.remove('visible');
                    }
                });
            }
        });
    }

    handleInput(event) {
        if (this.gameOver && event.key !== ' ') return;

        let newDir = { x: 0, y: 0 };
        switch (event.key) {
            case 'ArrowUp': case 'w': newDir = { x: 0, y: -1 }; break;
            case 'ArrowDown': case 's': newDir = { x: 0, y: 1 }; break;
            case 'ArrowLeft': case 'a': newDir = { x: -1, y: 0 }; break;
            case 'ArrowRight': case 'd': newDir = { x: 1, y: 0 }; break;
            case ' ': if (!this.running || this.gameOver) { this.startGame(); } return;
            default: return;
        }

        if (!this.running && !this.gameOver) {
            this.startGame();
        }

        this.snake.changeDirection(newDir);
        event.preventDefault();
    }
    
    startGame() {
        if (this.running) {
            clearInterval(gameInterval);
        }

        this.snake = new Snake();
        this.food.spawn(this.snake.body);
        this.score = 0;
        this.gameOver = false;
        this.running = true;

        this.updateScoreDisplay();
        this.updateMessage('¡COOOOOOME!');
        botonReiniciar.classList.add('oculto');

        gameInterval = setInterval(() => this.update(), GAME_SPEED);
        this.draw();
    }
     
    update() {
        if (!this.running) return;

        this.snake.update();

        if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
            this.endGame('¡Colision!');
            return;
        }

        const head = this.snake.body[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.snake.elongate();
            this.score += 10;
            this.updateScoreDisplay();
            this.food.spawn(this.snake.body);
        }

        this.draw();
    }
     
    draw() {
        ctx.fillStyle = '#2d1d42';
        ctx.fillRect(0, 0, lienzoJuego.width, lienzoJuego.height);

        this.food.draw();
        this.snake.draw();

        if (this.gameOver) {
            this.drawGameOverScreen();
        }
    }

    /**
     * Maneja el fin del juego.
     * @param {string} reason - Razon del Game Over
     */
    endGame(reason) {
        // Guarda la puntuación antes de terminar
        saveScore(this.score);

        this.running = false;
        this.gameOver = true;
        clearInterval(gameInterval);
        this.updateMessage(`¡Juego Terminado! (${reason})`, 'text-red-500'); 
        botonReiniciar.classList.remove('oculto');
        this.draw();
    }

    drawGameOverScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, lienzoJuego.width, lienzoJuego.height);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.fillText('GAME OVER', lienzoJuego.width / 2, lienzoJuego.height / 2 - 20);

        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('Presiona ESPACIO o haz clic en Reiniciar', lienzoJuego.width / 2, lienzoJuego.height / 2 + 10);
    }

    updateScoreDisplay() {
        marcadorPuntaje.textContent = this.score;
    }

    updateMessage(msg, colorClass = 'normal') {
        mensajeJuego.textContent = msg;

        if (colorClass === 'text-red-500') {
            mensajeJuego.classList.add('mensaje-rojo');
        } else {
            mensajeJuego.classList.remove('mensaje-rojo');
        }
    }
}

// Inicializa el juego al cargar la ventana
let game;
window.onload = () => {
    game = new GameController();
    game.updateMessage('Presiona una tecla (flecha/WASD) o haz clic en Reiniciar para empezar.');
};