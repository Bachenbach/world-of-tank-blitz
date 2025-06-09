// Game State
const gameState = {
    player: {
        name: "Commander",
        xp: 0,
        credits: 1000,
        unlockedTanks: [],
        currentTank: null
    },
    battle: {
        inProgress: false,
        result: null,
        aiDifficulty: "medium"
    }
};

// DOM Elements
const elements = {
    mainMenu: document.getElementById("main-menu"),
    gameScreen: document.getElementById("game-screen"),
    garageTab: document.getElementById("garage-tab"),
    battleTab: document.getElementById("battle-tab"),
    researchTab: document.getElementById("research-tab"),
    tankList: document.getElementById("tank-list"),
    selectedTank: document.querySelector("#selected-tank .tank-details"),
    battleCanvas: document.getElementById("battle-canvas"),
    aiDifficulty: document.getElementById("ai-difficulty")
};

// Initialize game
function initGame() {
    // Load initial tanks
    gameState.player.unlockedTanks = [
        Tanks.createTank("t1_cunningham"),
        Tanks.createTank("ms_1")
    ];
    gameState.player.currentTank = gameState.player.unlockedTanks[0];
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial state
    renderGarage();
    updatePlayerInfo();
}

// Setup event listeners
function setupEventListeners() {
    // Main menu buttons
    document.getElementById("btn-new-game").addEventListener("click", startNewGame);
    
    // Tab buttons
    document.querySelectorAll(".game-tabs button").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    
    // Tank selection
    document.getElementById("btn-select-tank").addEventListener("click", () => {
        alert(`${gameState.player.currentTank.name} selected for battle!`);
    });
    
    // Battle button
    document.getElementById("btn-start-battle").addEventListener("click", startBattle);
    
    // AI difficulty change
    elements.aiDifficulty.addEventListener("change", (e) => {
        gameState.battle.aiDifficulty = e.target.value;
    });
}

// Start new game
function startNewGame() {
    elements.mainMenu.classList.add("hidden");
    elements.gameScreen.classList.remove("hidden");
    initGame();
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(".game-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll(".game-tabs button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add("active");
    
    // Activate selected button
    document.querySelector(`.game-tabs button[data-tab="${tabName}"]`).classList.add("active");
}

// Render garage with player's tanks
function renderGarage() {
    elements.tankList.innerHTML = "";
    
    gameState.player.unlockedTanks.forEach(tank => {
        const tankCard = document.createElement("div");
        tankCard.className = "tank-card";
        tankCard.innerHTML = `
            <img src="assets/tanks/${tank.id}.png" alt="${tank.name}">
            <h3>${tank.name}</h3>
            <p>Tier ${tank.tier} ${tank.type}</p>
        `;
        
        tankCard.addEventListener("click", () => selectTank(tank));
        elements.tankList.appendChild(tankCard);
    });
    
    // Select first tank by default
    if (gameState.player.unlockedTanks.length > 0) {
        selectTank(gameState.player.unlockedTanks[0]);
    }
}

// Select a tank
function selectTank(tank) {
    gameState.player.currentTank = tank;
    
    elements.selectedTank.innerHTML = `
        <h3>${tank.name}</h3>
        <p>Nation: ${tank.nation}</p>
        <p>Tier: ${tank.tier}</p>
        <p>Type: ${tank.type.toUpperCase()}</p>
        
        <div class="tank-stats">
            <div>
                <label>Hit Points:</label>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(tank.stats.hp / 500) * 100}%"></div>
                </div>
            </div>
            <div>
                <label>Damage:</label>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(tank.stats.damage / 200) * 100}%"></div>
                </div>
            </div>
            <div>
                <label>Penetration:</label>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(tank.stats.penetration / 150) * 100}%"></div>
                </div>
            </div>
            <div>
                <label>Speed:</label>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(tank.stats.speed / 60) * 100}%"></div>
                </div>
            </div>
        </div>
    `;
}

// Update player info display
function updatePlayerInfo() {
    document.getElementById("player-name").textContent = gameState.player.name;
    document.getElementById("player-xp").textContent = `XP: ${gameState.player.xp}`;
    document.getElementById("player-credits").textContent = `Credits: ${gameState.player.credits}`;
}

// Start a battle
function startBattle() {
    if (!gameState.player.currentTank) {
        alert("Please select a tank first!");
        return;
    }
    
    // Hide UI and show canvas
    elements.garageTab.classList.add("hidden");
    elements.battleTab.classList.add("hidden");
    elements.researchTab.classList.add("hidden");
    elements.battleCanvas.classList.remove("hidden");
    
    // Generate AI opponents
    const aiTanks = AI.generateOpponents(
        gameState.player.currentTank.tier,
        gameState.battle.aiDifficulty,
        3
    );
    
    // Start battle simulation
    simulateBattle(gameState.player.currentTank, aiTanks);
}

// Simulate battle (simplified)
function simulateBattle(playerTank, aiTanks) {
    const ctx = elements.battleCanvas.getContext("2d");
    const canvas = elements.battleCanvas;
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 500;
    
    // Battle state
    const battleState = {
        player: {
            tank: playerTank,
            x: 100,
            y: 250,
            health: playerTank.stats.hp,
            reloading: 0
        },
        enemies: aiTanks.map((tank, i) => ({
            tank,
            x: 600,
            y: 100 + (i * 120),
            health: tank.stats.hp,
            reloading: 0,
            ai: new AI.TankAI(tank, gameState.battle.aiDifficulty)
        })),
        projectiles: [],
        battleTime: 0,
        result: null
    };
    
    // Game loop
    function gameLoop() {
        // Clear canvas
        ctx.fillStyle = "#2a3a2a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update battle state
        updateBattle(battleState);
        
        // Draw all elements
        drawBattle(ctx, battleState);
        
        // Check for battle end
        if (battleState.result) {
            endBattle(battleState.result);
            return;
        }
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    gameLoop();
}

// Update battle state
function updateBattle(state) {
    state.battleTime++;
    
    // Update player tank
    if (state.player.health > 0) {
        // Simple player controls (for demo)
        if (keys.ArrowUp) state.player.y -= 2;
        if (keys.ArrowDown) state.player.y += 2;
        if (keys.ArrowLeft) state.player.x -= 2;
        if (keys.ArrowRight) state.player.x += 2;
        
        // Keep tank in bounds
        state.player.x = Math.max(30, Math.min(770, state.player.x));
        state.player.y = Math.max(30, Math.min(470, state.player.y));
        
        // Handle shooting
        if (state.player.reloading > 0) {
            state.player.reloading--;
        } else if (keys.Space) {
            state.projectiles.push({
                x: state.player.x + 40,
                y: state.player.y,
                dx: 10,
                dy: 0,
                damage: state.player.tank.stats.damage,
                isPlayer: true
            });
            state.player.reloading = state.player.tank.stats.reloadTime;
        }
    }
    
    // Update enemies
    state.enemies.forEach(enemy => {
        if (enemy.health > 0) {
            // AI decision making
            enemy.ai.update(enemy, state.player, state.battleTime);
            
            // Handle shooting
            if (enemy.reloading > 0) {
                enemy.reloading--;
            } else if (Math.random() < 0.02) {
                state.projectiles.push({
                    x: enemy.x - 10,
                    y: enemy.y,
                    dx: -8,
                    dy: 0,
                    damage: enemy.tank.stats.damage,
                    isPlayer: false
                });
                enemy.reloading = enemy.tank.stats.reloadTime;
            }
        }
    });
    
    // Update projectiles
    state.projectiles.forEach(proj => {
        proj.x += proj.dx;
        proj.y += proj.dy;
    });
    
    // Check for hits
    checkCollisions(state);
    
    // Check for battle end
    checkBattleEnd(state);
}

// Draw battle elements
function drawBattle(ctx, state) {
    // Draw player tank
    if (state.player.health > 0) {
        ctx.fillStyle = "#3498db";
        ctx.fillRect(state.player.x - 20, state.player.y - 10, 40, 20);
        
        // Draw health bar
        const healthPercent = state.player.health / state.player.tank.stats.hp;
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(state.player.x - 20, state.player.y - 20, 40 * healthPercent, 5);
    }
    
    // Draw enemies
    state.enemies.forEach(enemy => {
        if (enemy.health > 0) {
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(enemy.x - 20, enemy.y - 10, 40, 20);
            
            // Draw health bar
            const healthPercent = enemy.health / enemy.tank.stats.hp;
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(enemy.x - 20, enemy.y - 20, 40 * healthPercent, 5);
        }
    });
    
    // Draw projectiles
    state.projectiles.forEach(proj => {
        ctx.fillStyle = proj.isPlayer ? "#f1c40f" : "#e74c3c";
        ctx.fillRect(proj.x - 3, proj.y - 3, 6, 6);
    });
    
    // Draw UI
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Health: ${state.player.health}/${state.player.tank.stats.hp}`, 20, 30);
    ctx.fillText(`Enemies: ${state.enemies.filter(e => e.health > 0).length} remaining`, 20, 50);
}

// Check for projectile collisions
function checkCollisions(state) {
    // Filter active projectiles
    state.projectiles = state.projectiles.filter(proj => {
        // Remove if out of bounds
        if (proj.x < 0 || proj.x > 800 || proj.y < 0 || proj.y > 500) {
            return false;
        }
        
        // Check player hit
        if (!proj.isPlayer && state.player.health > 0 &&
            Math.abs(proj.x - state.player.x) < 20 && 
            Math.abs(proj.y - state.player.y) < 10) {
            state.player.health = Math.max(0, state.player.health - proj.damage);
            return false;
        }
        
        // Check enemy hits
        if (proj.isPlayer) {
            for (const enemy of state.enemies) {
                if (enemy.health > 0 &&
                    Math.abs(proj.x - enemy.x) < 20 && 
                    Math.abs(proj.y - enemy.y) < 10) {
                    enemy.health = Math.max(0, enemy.health - proj.damage);
                    return false;
                }
            }
        }
        
        return true;
    });
}

// Check if battle has ended
function checkBattleEnd(state) {
    // Player dead
    if (state.player.health <= 0) {
        state.result = { victory: false, xp: 50, credits: 100 };
        return;
    }
    
    // All enemies dead
    if (state.enemies.every(enemy => enemy.health <= 0)) {
        state.result = { 
            victory: true, 
            xp: 200 * (state.battleTime < 600 ? 1.5 : 1), // Bonus for fast victory
            credits: 500 
        };
        return;
    }
    
    // Time limit (demo only)
    if (state.battleTime > 1800) { // 30 seconds at 60fps
        state.result = { victory: false, xp: 100, credits: 200 };
    }
}

// End battle and show results
function endBattle(result) {
    // Update game state
    gameState.player.xp += result.xp;
    gameState.player.credits += result.credits;
    updatePlayerInfo();
    
    // Show result
    elements.battleResult.innerHTML = `
        <h3>Battle ${result.victory ? "Victory!" : "Defeat"}</h3>
        <p>Earned ${result.xp} XP</p>
        <p>Earned ${result.credits} Credits</p>
        <button id="btn-continue">Continue</button>
    `;
    
    // Hide canvas and show results
    elements.battleCanvas.classList.add("hidden");
    elements.battleTab.classList.remove("hidden");
    
    // Continue button
    document.getElementById("btn-continue").addEventListener("click", () => {
        elements.battleResult.innerHTML = "";
    });
}

// Keyboard input
const keys = {};
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Start the game when loaded
window.addEventListener("load", initGame);
