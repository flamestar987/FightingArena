class Game {
    constructor() {
        this.player = {
            hp: 100,
            maxHp: 100,
            level: 1,
            xp: 0,
            gold: 50,
            inventory: ['potion', 'potion']
        };
        this.currentRoom = 'town_square';
        this.inCombat = false;
        this.currentEnemy = null;
        
        this.rooms = {
            'town_square': {
                name: "Town Square",
                description: "You stand in the peaceful town of Aetheria. The sun is shining, and children are playing.",
                exits: { north: 'dark_forest' },
                enemies: [],
                loot: []
            },
            'dark_forest': {
                name: "The Dark Forest",
                description: "Tall trees block out the sun. You hear rustling in the underbrush. A path leads deeper into the woods.",
                exits: { south: 'town_square', north: 'cave_entrance' },
                enemies: [
                    { name: "Rabid Wolf", hp: 30, atk: 8, xp: 20, gold: 15 },
                    { name: "Goblin Scavenger", hp: 45, atk: 10, xp: 30, gold: 25 }
                ],
                loot: ['potion']
            },
            'cave_entrance': {
                name: "Cave Entrance",
                description: "A cold, damp wind blows out of the darkness ahead. The entrance is lined with strange, glowing mushrooms.",
                exits: { south: 'dark_forest', north: 'boss_chamber' },
                enemies: [
                    { name: "Giant Bat", hp: 60, atk: 12, xp: 40, gold: 30 },
                    { name: "Cave Troll", hp: 90, atk: 15, xp: 60, gold: 50 }
                ],
                loot: []
            },
            'boss_chamber': {
                name: "The Boss's Lair",
                description: "A massive cavern. In the center, a dragon lies coiled around a pile of gold.",
                exits: { south: 'cave_entrance' },
                enemies: [
                    { name: "Eldritch Dragon", hp: 200, atk: 25, xp: 500, gold: 500 }
                ],
                loot: ['sword_of_light']
            }
        };

        this.ui = {
            description: document.getElementById('room-description'),
            combatLog: document.getElementById('combat-log'),
            hpBar: document.getElementById('hp-bar'),
            goldDisplay: document.getElementById('gold-display'),
            levelDisplay: document.getElementById('level-display'),
            itemsFound: document.getElementById('items-found'),
            buttons: document.querySelectorAll('button')
        };

        this.updateUI();
    }

    log(message, type = 'info') {
        const line = document.createElement('p');
        line.textContent = `> ${message}`;
        line.style.color = type === 'combat' ? 'var(--danger-color)' : 'var(--text-color)';
        line.style.margin = '5px 0';
        this.ui.combatLog.appendChild(line);
        this.ui.combatLog.scrollTop = this.ui.combatLog.scrollHeight;
    }

    updateUI() {
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        this.ui.hpBar.style.width = `${Math.max(0, hpPercent)}%`;
        this.ui.goldDisplay.textContent = `Gold: ${this.player.gold}`;
        this.ui.levelDisplay.textContent = `Level: ${this.player.level}`;
        
        // Disable buttons during combat
        this.ui.buttons.forEach(btn => btn.disabled = this.inCombat);
    }

    renderRoom() {
        const room = this.rooms[this.currentRoom];
        this.ui.description.innerHTML = `<strong>${room.name}</strong><br>${room.description}`;
        this.ui.combatLog.innerHTML = ''; // Clear combat log on room change
        this.inCombat = false;
        
        // Check for loot
        if (room.loot.length > 0) {
            const foundItem = room.loot.shift();
            this.player.inventory.push(foundItem);
            this.ui.itemsFound.textContent = `You found: ${foundItem.toUpperCase()}!`;
            this.ui.itemsFound.classList.remove('hidden');
            this.log(`You found an item: ${foundItem.toUpperCase()}`, 'success');
        } else {
            this.ui.itemsFound.classList.add('hidden');
        }

        this.updateUI();
    }

    move(direction) {
        if (this.inCombat) {
            this.log("You cannot flee from combat!", 'combat');
            return;
        }

        const room = this.rooms[this.currentRoom];
        if (room.exits[direction]) {
            this.currentRoom = room.exits[direction];
            this.renderRoom();
        } else {
            this.log("You cannot go that way.", 'combat');
        }
    }

    usePotion() {
        const potionIndex = this.player.inventory.indexOf('potion');
        if (potionIndex > -1) {
            this.player.hp = Math.min(this.player.hp + 50, this.player.maxHp);
            this.player.inventory.splice(potionIndex, 1);
            this.log(`You used a potion and recovered health. (${this.player.hp}/${this.player.maxHp})`, 'success');
            this.updateUI();
        } else {
            this.log("You don't have any potions!", 'combat');
        }
    }

    attack() {
        const room = this.rooms[this.currentRoom];
        const enemies = room.enemies;

        if (enemies.length === 0) {
            this.log("There is nothing to attack here.", 'combat');
            return;
        }

        this.inCombat = true;
        this.currentEnemy = { ...enemies[0] }; // Clone the first enemy

        // Player Turn
        const playerDmg = Math.floor(Math.random() * 10) + 5 + (this.player.level * 3);
        this.currentEnemy.hp -= playerDmg;
        this.log(`You attacked the ${this.currentEnemy.name} for ${playerDmg} damage!`, 'combat');

        if (this.currentEnemy.hp <= 0) {
            this.log(`You defeated the ${this.currentEnemy.name}!`, 'success');
            this.player.gold += this.currentEnemy.gold;
            this.player.xp += this.currentEnemy.xp;
            
            // Remove enemy from the room
            const enemyIndex = enemies.findIndex(e => e.name === this.currentEnemy.name);
            enemies.splice(enemyIndex, 1);
            
            // Check for level up
            if (this.player.xp >= this.player.level * 100) {
                this.player.level++;
                this.player.maxHp += 20;
                this.player.hp = this.player.maxHp;
                this.log(`LEVEL UP! You are now level ${this.player.level}.`, 'success');
            }
            
            this.currentEnemy = null;
            this.updateUI();
            this.renderRoom(); // Re-render room to clear combat state
        } else {
            // Enemy Turn
            setTimeout(() => {
                if (this.currentEnemy) {
                    const enemyDmg = Math.floor(Math.random() * this.currentEnemy.atk);
                    this.player.hp -= enemyDmg;
                    this.log(`The ${this.currentEnemy.name} hit you for ${enemyDmg} damage!`, 'combat');
                    this.updateUI();
                    
                    if (this.player.hp <= 0) {
                        this.log("You have been defeated. Refresh to restart.", 'combat');
                        this.inCombat = false;
                        this.ui.buttons.forEach(btn => btn.disabled = false);
                    }
                }
            }, 1000); // Small delay for the enemy's turn
        }
    }
}

// Initialize the game when the page loads
const game = new Game();
game.renderRoom();
