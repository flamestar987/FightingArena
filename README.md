<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS Fighting Arena</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            background-color: #1a1a1d;
            color: #e0e0e0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        #game-container {
            position: relative;
            width: 600px;
            height: 300px;
            background: #2c3e50;
            border: 4px solid #4ecca3;
            box-shadow: 0 0 20px rgba(0,0,0,0.8);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
        }
        .fighter {
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .stats {
            width: 100%;
            text-align: center;
            margin-bottom: 5px;
            font-weight: bold;
            font-size: 1.2rem;
        }
        .hp-bar-container {
            width: 100%;
            height: 10px;
            background: #555;
            border: 1px solid #000;
        }
        .hp-bar {
            height: 100%;
            background: var(--hp-color);
            width: 100%;
            transition: width 0.3s ease;
        }
        .fighter-name { margin-bottom: 5px; color: #fff; }
        .fighter-avatar {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            background: #333;
            border: 2px solid #888;
        }
        #action-area {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            color: #fff;
            text-shadow: 2px 2px 0 #000;
            pointer-events: none;
            width: 100%;
        }
        #controls {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        button {
            padding: 10px 20px;
            font-size: 1.2rem;
            font-family: inherit;
            cursor: pointer;
            background: var(--accent-color);
            border: none;
            border-radius: 5px;
            transition: background 0.2s;
        }
        button:hover { background: #3db592; }
        button:disabled { background: #555; cursor: not-allowed; }
        #result-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            padding: 40px;
            border: 2px solid #4ecca3;
            text-align: center;
            display: none;
        }
        h2 { margin-top: 0; font-size: 3rem; color: #e63946; }
        .win-text { color: #4ecca3; font-size: 3rem; }
    </style>
</head>
<body>

    <h1>JS Duel Arena</h1>
    
    <div id="game-container">
        <div class="fighter">
            <div class="stats">
                <div class="fighter-name">You</div>
                <div class="hp-bar-container">
                    <div id="player-hp" class="hp-bar" style="--hp-color: #e63946;"></div>
                </div>
                <div id="player-dmg" style="font-size: 1rem; margin-top: 5px;">0 dmg</div>
            </div>
            <div class="fighter-avatar">⚔️</div>
        </div>
        
        <div id="action-area">VS</div>

        <div class="fighter">
            <div class="stats">
                <div class="fighter-name" id="enemy-name">Goblin</div>
                <div class="hp-bar-container">
                    <div id="enemy-hp" class="hp-bar" style="--hp-color: #e63946;"></div>
                </div>
                <div id="enemy-dmg" style="font-size: 1rem; margin-top: 5px;">0 dmg</div>
            </div>
            <div class="fighter-avatar" id="enemy-avatar">👹</div>
        </div>
    </div>

    <div id="controls">
        <button id="btn-attack" onclick="game.playerAttack()">⚔️ Attack</button>
        <button id="btn-heal" onclick="game.playerHeal()">🧪 Heal</button>
        <button id="btn-restart" onclick="game.resetGame()" style="display: none; background: var(--accent-color);">🔄 New Fight</button>
    </div>

    <div id="result-message">
        <h2 id="result-text">Winner!</h2>
        <p>Refresh to play again.</p>
    </div>

    <script>
        class Fighter {
            constructor(name, avatar, hp, damage) {
                this.name = name;
                this.avatar = avatar;
                this.maxHp = hp;
                this.hp = hp;
                this.damage = damage;
            }

            attack() {
                return Math.floor(Math.random() * this.damage) + 5;
            }

            takeDamage(amount) {
                this.hp = Math.max(0, this.hp - amount);
            }
        }

        class Game {
            constructor() {
                this.player = new Fighter("You", "⚔️", 100, 20);
                this.enemy = null;
                this.isPlayerTurn = true;
                this.isGameOver = false;
                
                this.ui = {
                    playerHp: document.getElementById('player-hp'),
                    playerDmg: document.getElementById('player-dmg'),
                    enemyHp: document.getElementById('enemy-hp'),
                    enemyDmg: document.getElementById('enemy-dmg'),
                    enemyName: document.getElementById('enemy-name'),
                    enemyAvatar: document.getElementById('enemy-avatar'),
                    actionArea: document.getElementById('action-area'),
                    btnAttack: document.getElementById('btn-attack'),
                    btnHeal: document.getElementById('btn-heal'),
                    btnRestart: document.getElementById('btn-restart'),
                    resultMsg: document.getElementById('result-message'),
                    resultText: document.getElementById('result-text')
                };

                this.startFight();
            }

            startFight() {
                this.isGameOver = false;
                this.isPlayerTurn = true;
                this.player.hp = this.player.maxHp;
                
                const enemies = [
                    { name: "Goblin", avatar: "👹", hp: 80, dmg: 15 },
                    { name: "Orc", avatar: "👺", hp: 120, dmg: 10 },
                    { name: "Dark Knight", avatar: "💀", hp: 150, dmg: 18 },
                    { name: "Dragon", avatar: "🐲", hp: 200, dmg: 25 }
                ];
                const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                this.enemy = new Fighter(randomEnemy.name, randomEnemy.avatar, randomEnemy.hp, randomEnemy.dmg);

                this.updateUI();
                this.ui.actionArea.textContent = "FIGHT!";
                this.ui.actionArea.style.color = "#e63946";
                this.ui.resultMsg.style.display = "none";
                this.ui.btnRestart.style.display = "none";
                this.toggleButtons(true);
            }

            updateUI() {
                const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
                const enemyHpPercent = (this.enemy.hp / this.enemy.maxHp) * 100;
                
                this.ui.playerHp.style.width = `${playerHpPercent}%`;
                this.ui.playerDmg.textContent = `${this.player.damage} Dmg`;
                
                this.ui.enemyHp.style.width = `${enemyHpPercent}%`;
                this.ui.enemyName.textContent = this.enemy.name;
                this.ui.enemyAvatar.textContent = this.enemy.avatar;
                this.ui.enemyDmg.textContent = `${this.enemy.damage} Dmg`;
            }

            log(message) {
                this.ui.actionArea.textContent = message;
                setTimeout(() => {
                    if (!this.isGameOver && this.isPlayerTurn) this.ui.actionArea.textContent = "Your Turn";
                    else if (!this.isGameOver && !this.isPlayerTurn) this.ui.actionArea.textContent = "Enemy's Turn...";
                }, 1000);
            }

            playerAttack() {
                if (!this.isPlayerTurn || this.isGameOver) return;
                
                const dmg = this.player.attack();
                this.enemy.takeDamage(dmg);
                this.updateUI();
                this.log(`You hit ${this.enemy.name} for ${dmg} damage!`);
                this.isPlayerTurn = false;

                if (this.enemy.hp <= 0) {
                    this.endGame(true);
                } else {
                    setTimeout(() => this.enemyTurn(), 1000);
                }
            }

            playerHeal() {
                if (!this.isPlayerTurn || this.isGameOver) return;
                
                const healAmount = Math.floor(this.player.maxHp * 0.3);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                this.updateUI();
                this.log(`You healed yourself for ${healAmount} HP!`);
                this.isPlayerTurn = false;
                setTimeout(() => this.enemyTurn(), 1000);
            }

            enemyTurn() {
                if (this.isGameOver) return;
                
                const dmg = this.enemy.attack();
                this.player.takeDamage(dmg);
                this.updateUI();
                this.log(`${this.enemy.name} attacks you for ${dmg} damage!`);
                this.isPlayerTurn = true;

                if (this.player.hp <= 0) {
                    this.endGame(false);
                }
            }

            endGame(playerWon) {
                this.isGameOver = true;
                this.toggleButtons(false);
                this.ui.btnRestart.style.display = "block";
                
                this.ui.resultText.textContent = playerWon ? "VICTORY!" : "DEFEAT...";
                this.ui.resultText.style.color = playerWon ? "#4ecca3" : "#e63946";
                this.ui.resultMsg.style.display = "block";
                this.ui.actionArea.textContent = playerWon ? "Winner!" : "Game Over";
            }

            toggleButtons(enable) {
                this.ui.btnAttack.disabled = !enable;
                this.ui.btnHeal.disabled = !enable;
            }

            resetGame() {
                this.startFight();
            }
        }

        const game = new Game();
    </script>
</body>
</html>
