class PenguinSurfDash {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
        
        // Game settings
        this.gravity = 0.5;
        this.gameSpeed = 5;
        this.speedIncrease = 0.001;
        
        // Player
        this.player = {
            x: 150,
            y: 450,
            width: 50,
            height: 40,
            lane: 1 // 0=left, 1=center, 2=right
        };
        
        // Lanes - equally spaced across the canvas width
        this.lanes = [200, 400, 600]; // X positions for left, center, right (equal 200px spacing)
        
        // Game objects
        this.obstacles = [];
        this.collectibles = [];
        this.backgroundElements = [];
        this.waves = [];
        this.lastObstacleSpawn = 0;
        this.minObstacleGap = 60; // Minimum frames between obstacles
        
        // Scoring
        this.score = 0;
        this.distance = 0;
        this.fishCollected = 0;
        
        // Input
        this.keys = {};
        
        // Initialize
        this.setupEventListeners();
        this.generateBackground();
        this.generateWaves();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (this.gameState === 'menu' && e.code === 'Space') {
                this.startGame();
            } else if (this.gameState === 'playing') {
                this.handleInput(e.code);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    handleInput(keyCode) {
        switch(keyCode) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
        }
    }
    
    moveLeft() {
        if (this.player.lane > 0) {
            this.player.lane--;
            this.player.x = this.lanes[this.player.lane];
        }
    }
    
    moveRight() {
        if (this.player.lane < 2) {
            this.player.lane++;
            this.player.x = this.lanes[this.player.lane];
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
    }
    
    resetGame() {
        this.player.x = this.lanes[1];
        this.player.y = 450;
        this.player.lane = 1;
        
        this.obstacles = [];
        this.collectibles = [];
        this.score = 0;
        this.distance = 0;
        this.fishCollected = 0;
        this.gameSpeed = 5;
        
        this.generateBackground();
        this.generateWaves();
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.resetGame();
    }
    
    generateBackground() {
        this.backgroundElements = [];
        for (let i = 0; i < 10; i++) {
            this.backgroundElements.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 30 + 10,
                type: Math.random() > 0.5 ? 'iceberg' : 'snowflake'
            });
        }
    }
    
    generateWaves() {
        this.waves = [];
        for (let i = 0; i < 8; i++) {
            this.waves.push({
                x: i * 100,
                y: Math.random() * this.canvas.height,
                amplitude: Math.random() * 20 + 10,
                frequency: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 2 + 1
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Increase game speed gradually
        this.gameSpeed += this.speedIncrease;
        
        // Update distance and score
        this.distance += this.gameSpeed * 0.1;
        this.score = Math.floor(this.distance) + (this.fishCollected * 10);
        
        // No player physics needed - just lane switching
        
        // Update game objects
        this.updateObstacles();
        this.updateCollectibles();
        this.updateBackground();
        this.updateWaves();
        
        // Generate new objects
        this.generateObstacles();
        this.generateCollectibles();
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateUI();
    }
    
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.gameSpeed; // Move obstacles DOWN the screen
            
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateCollectibles() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.y += this.gameSpeed; // Move collectibles DOWN the screen
            
            if (collectible.y > this.canvas.height) {
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    updateBackground() {
        for (const element of this.backgroundElements) {
            element.y += this.gameSpeed * 0.3; // Move background elements DOWN
            if (element.y > this.canvas.height + element.size) {
                element.y = -element.size;
                element.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    updateWaves() {
        for (const wave of this.waves) {
            wave.phase += wave.frequency * this.gameSpeed;
            wave.y += this.gameSpeed * 0.2; // Move waves down slowly
            
            if (wave.y > this.canvas.height + 50) {
                wave.y = -50;
                wave.phase = Math.random() * Math.PI * 2;
            }
        }
    }
    
    generateObstacles() {
        this.lastObstacleSpawn++;
        
        if (this.lastObstacleSpawn >= this.minObstacleGap && Math.random() < 0.03) {
            // Choose a random lane but ensure it's not too crowded
            let availableLanes = [0, 1, 2];
            
            // Remove lanes that have obstacles too close to the spawn point
            for (let i = availableLanes.length - 1; i >= 0; i--) {
                const laneX = this.lanes[availableLanes[i]];
                for (const obstacle of this.obstacles) {
                    if (Math.abs(obstacle.x - laneX) < 50 && obstacle.y < 100) {
                        availableLanes.splice(i, 1);
                        break;
                    }
                }
            }
            
            if (availableLanes.length > 0) {
                const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                const obstacleTypes = ['ice_block', 'iceberg'];
                const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                
                this.obstacles.push({
                    x: this.lanes[lane],
                    y: -80,
                    width: type === 'iceberg' ? 80 : 60,
                    height: type === 'iceberg' ? 60 : 50,
                    type: type,
                    lane: lane
                });
                
                this.lastObstacleSpawn = 0;
            }
        }
    }
    
    generateCollectibles() {
        if (Math.random() < 0.015) { // 1.5% chance per frame
            const lane = Math.floor(Math.random() * 3);
            
            this.collectibles.push({
                x: this.lanes[lane],
                y: -30, // Start from above the screen
                width: 25,
                height: 25,
                type: 'fish'
            });
        }
    }
    
    checkCollisions() {
        // Check obstacle collisions (simple collision with no jump/slide avoidance)
        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.isColliding(this.player, collectible)) {
                this.fishCollected++;
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        document.getElementById('finalFish').textContent = this.fishCollected;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('distanceValue').textContent = Math.floor(this.distance);
        document.getElementById('fishValue').textContent = this.fishCollected;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.renderBackground();
        this.renderWaves();
        
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            // Render game objects
            this.renderObstacles();
            this.renderCollectibles();
            this.renderPlayer();
        }
    }
    
    renderBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E6F3FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background elements
        for (const element of this.backgroundElements) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            
            if (element.type === 'iceberg') {
                this.ctx.fillStyle = '#B0E0E6';
                this.ctx.beginPath();
                this.ctx.moveTo(element.x, element.y + element.size);
                this.ctx.lineTo(element.x + element.size/2, element.y);
                this.ctx.lineTo(element.x + element.size, element.y + element.size);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(element.x, element.y, element.size/4, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        // Ice track
        this.ctx.fillStyle = '#E6F7FF';
        this.ctx.fillRect(0, 300, this.canvas.width, 300);
        
        // Lane dividers (vertical lines separating lanes)
        this.ctx.strokeStyle = '#CCE7FF';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        // Lines at 300px and 500px to separate the 3 lanes evenly
        this.ctx.moveTo(300, 0);
        this.ctx.lineTo(300, this.canvas.height);
        this.ctx.moveTo(500, 0);
        this.ctx.lineTo(500, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    renderWaves() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        
        for (const wave of this.waves) {
            this.ctx.beginPath();
            
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const y = wave.y + Math.sin((x * wave.frequency) + wave.phase) * wave.amplitude;
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
        
        // Add some lighter wave highlights
        this.ctx.globalAlpha = 0.15;
        this.ctx.strokeStyle = '#E6F3FF';
        this.ctx.lineWidth = 2;
        
        for (const wave of this.waves) {
            this.ctx.beginPath();
            
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const y = wave.y + Math.sin((x * wave.frequency) + wave.phase + 0.5) * wave.amplitude * 0.7;
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    renderPlayer() {
        const px = this.player.x;
        const py = this.player.y;
        
        // Skis (render first, behind penguin) - blocky rectangles
        this.ctx.fillStyle = '#8B4513';
        // Left ski
        this.ctx.fillRect(px - 20, py + 35, 8, 60);
        // Right ski
        this.ctx.fillRect(px + 12, py + 35, 8, 60);
        // Ski tips - simple triangles
        this.ctx.fillRect(px - 18, py + 25, 4, 10);
        this.ctx.fillRect(px + 14, py + 25, 4, 10);
        
        // Penguin body - simple rectangle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px - 25, py - 5, 50, 50);
        
        // Penguin belly - simple white rectangle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(px - 18, py + 5, 36, 35);
        
        // Penguin head - simple rectangle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px - 20, py - 30, 40, 30);
        
        // Ski goggles - simple rectangles
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(px - 22, py - 20, 44, 15);
        
        // Goggle lenses - simple squares
        this.ctx.fillStyle = '#0066FF';
        this.ctx.fillRect(px - 18, py - 18, 12, 12);
        this.ctx.fillRect(px + 6, py - 18, 12, 12);
        
        // Simple goggle reflections - small white squares
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(px - 15, py - 16, 4, 4);
        this.ctx.fillRect(px + 9, py - 16, 4, 4);
        
        // Beak - simple orange triangle
        this.ctx.fillStyle = '#FF6600';
        this.ctx.fillRect(px - 3, py - 8, 6, 4);
        
        // Left flipper - simple rectangle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px - 35, py + 5, 15, 20);
        
        // Right flipper - simple rectangle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px + 20, py + 5, 15, 20);
        
        // Left ski pole - simple line
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillRect(px - 30, py - 15, 3, 65);
        // Pole handle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px - 31, py - 18, 5, 8);
        // Pole basket - simple circle
        this.ctx.fillStyle = '#FFCC00';
        this.ctx.fillRect(px - 33, py + 43, 7, 7);
        
        // Right ski pole - simple line
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillRect(px + 27, py - 15, 3, 65);
        // Pole handle
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(px + 26, py - 18, 5, 8);
        // Pole basket - simple square
        this.ctx.fillStyle = '#FFCC00';
        this.ctx.fillRect(px + 24, py + 43, 7, 7);
        
        // Ski boots - simple red rectangles
        this.ctx.fillStyle = '#CC0000';
        this.ctx.fillRect(px - 24, py + 30, 16, 12);
        this.ctx.fillRect(px + 8, py + 30, 16, 12);
    }
    
    renderObstacles() {
        for (const obstacle of this.obstacles) {
            switch (obstacle.type) {
                case 'ice_block':
                    // Large dark ice block
                    this.ctx.fillStyle = '#4A5568';
                    this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y, obstacle.width, obstacle.height);
                    // Add some detail with slightly lighter color
                    this.ctx.fillStyle = '#2D3748';
                    this.ctx.fillRect(obstacle.x - obstacle.width/2 + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
                    // Add highlight edge
                    this.ctx.fillStyle = '#718096';
                    this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y, obstacle.width, 4);
                    this.ctx.fillRect(obstacle.x - obstacle.width/2, obstacle.y, 4, obstacle.height);
                    break;
                case 'iceberg':
                    // Large dark triangular iceberg
                    this.ctx.fillStyle = '#4A5568';
                    this.ctx.beginPath();
                    this.ctx.moveTo(obstacle.x, obstacle.y);
                    this.ctx.lineTo(obstacle.x - obstacle.width/2, obstacle.y + obstacle.height);
                    this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                    // Add darker shadow/detail
                    this.ctx.fillStyle = '#2D3748';
                    this.ctx.beginPath();
                    this.ctx.moveTo(obstacle.x, obstacle.y + 10);
                    this.ctx.lineTo(obstacle.x + obstacle.width/2 - 10, obstacle.y + obstacle.height);
                    this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                    // Add highlight edge
                    this.ctx.strokeStyle = '#718096';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(obstacle.x, obstacle.y);
                    this.ctx.lineTo(obstacle.x - obstacle.width/2, obstacle.y + obstacle.height);
                    this.ctx.stroke();
                    break;
            }
        }
    }
    
    renderCollectibles() {
        for (const collectible of this.collectibles) {
            // Fish
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.ellipse(collectible.x, collectible.y + 12, 10, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Tail
            this.ctx.beginPath();
            this.ctx.moveTo(collectible.x - 10, collectible.y + 12);
            this.ctx.lineTo(collectible.x - 15, collectible.y + 7);
            this.ctx.lineTo(collectible.x - 15, collectible.y + 17);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new PenguinSurfDash();
});