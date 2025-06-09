const AI = {
    // Generate AI opponents based on player tier and difficulty
    generateOpponents: function(playerTier, difficulty, count) {
        const tierVariation = {
            easy: { min: Math.max(1, playerTier - 1), max: playerTier },
            medium: { min: playerTier, max: Math.min(5, playerTier + 1) },
            hard: { min: playerTier, max: Math.min(6, playerTier + 2) }
        }[difficulty];
        
        const availableTanks = Object.values(TankData).filter(t => 
            t.tier >= tierVariation.min && t.tier <= tierVariation.max
        );
        
        // Select random tanks (could be improved with balanced team composition)
        const opponents = [];
        for (let i = 0; i < count; i++) {
            const randomTank = availableTanks[Math.floor(Math.random() * availableTanks.length)];
            opponents.push(Tanks.createTank(randomTank.id));
        }
        
        return opponents;
    },
    
    // Tank AI class for battle behavior
    TankAI: class {
        constructor(tank, difficulty) {
            this.tank = tank;
            this.difficulty = difficulty;
            this.state = "patrol"; // patrol, attack, retreat
            this.lastDecisionTime = 0;
            this.targetAngle = 0;
        }
        
        update(aiTank, player, battleTime) {
            // Make decisions periodically
            if (battleTime - this.lastDecisionTime > 180) { // Every 3 seconds at 60fps
                this.makeDecision(aiTank, player);
                this.lastDecisionTime = battleTime;
            }
            
            // Execute current behavior
            switch (this.state) {
                case "patrol":
                    this.patrolBehavior(aiTank);
                    break;
                case "attack":
                    this.attackBehavior(aiTank, player);
                    break;
                case "retreat":
                    this.retreatBehavior(aiTank, player);
                    break;
            }
        }
        
        makeDecision(aiTank, player) {
            const distance = Math.sqrt(
                Math.pow(aiTank.x - player.x, 2) + 
                Math.pow(aiTank.y - player.y, 2)
            );
            
            const healthRatio = aiTank.health / aiTank.tank.stats.hp;
            
            // Difficulty affects decision making
            const aggression = {
                easy: 0.3,
                medium: 0.6,
                hard: 0.8
            }[this.difficulty];
            
            if (healthRatio < 0.3 && Math.random() > aggression) {
                this.state = "retreat";
            } else if (distance < 300 || Math.random() < aggression) {
                this.state = "attack";
            } else {
                this.state = "patrol";
            }
        }
        
        patrolBehavior(aiTank) {
            // Random movement in patrol area
            if (Math.random() < 0.02) {
                this.targetAngle = Math.random() * Math.PI * 2;
            }
            
            aiTank.x += Math.cos(this.targetAngle) * 1.5;
            aiTank.y += Math.sin(this.targetAngle) * 1.5;
            
            // Keep in bounds
            aiTank.x = Math.max(400, Math.min(770, aiTank.x));
            aiTank.y = Math.max(30, Math.min(470, aiTank.y));
        }
        
        attackBehavior(aiTank, player) {
            // Move toward player
            const angle = Math.atan2(player.y - aiTank.y, player.x - aiTank.x);
            aiTank.x += Math.cos(angle) * 2;
            aiTank.y += Math.sin(angle) * 2;
            
            // Don't get too close
            const distance = Math.sqrt(
                Math.pow(aiTank.x - player.x, 2) + 
                Math.pow(aiTank.y - player.y, 2)
            );
            
            if (distance < 150) {
                aiTank.x -= Math.cos(angle) * 1;
                aiTank.y -= Math.sin(angle) * 1;
            }
        }
        
        retreatBehavior(aiTank, player) {
            // Move away from player
            const angle = Math.atan2(player.y - aiTank.y, player.x - aiTank.x);
            aiTank.x -= Math.cos(angle) * 2.5;
            aiTank.y -= Math.sin(angle) * 2.5;
            
            // Stay in bounds
            aiTank.x = Math.max(400, Math.min(770, aiTank.x));
            aiTank.y = Math.max(30, Math.min(470, aiTank.y));
        }
    }
};
