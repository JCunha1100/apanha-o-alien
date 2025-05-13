class LostScene extends Phaser.Scene {
    constructor() {
        super('LostScene');
    }

    init(data) {
        this.finalScore = data.score;
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'background').setScale(Math.max(gameWidth / this.textures.get('background').getSourceImage().width, gameHeight / this.textures.get('background').getSourceImage().height));

        this.add.text(gameWidth / 2, gameHeight / 3, 'Perdeste!', { fontSize: '48px', fill: '#f00', align: 'center' }).setOrigin(0.5);
        this.add.text(gameWidth / 2, gameHeight / 2, 'Pontuação Final: ' + this.finalScore, { fontSize: '32px', fill: '#eee', align: 'center' }).setOrigin(0.5);

        const playAgainButton = this.add.text(gameWidth / 2, gameHeight * 2 / 3, 'Jogar Novamente', { fontSize: '24px', fill: '#fff', backgroundColor: '#4CAF50', padding: { x: 20, y: 10 }, borderRadius: 5 })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                playAgainButton.setStyle({ backgroundColor: '#45a049' });
            })
            .on('pointerout', () => {
                playAgainButton.setStyle({ backgroundColor: '#4CAF50' });
            });
    }

    update() {
        // Não é necessário nada aqui por enquanto
    }
}

class YouWonScene extends Phaser.Scene {
    constructor() {
        super('YouWonScene');
    }

    init(data) {
        this.finalScore = data.score;
        this.remainingLives = data.lives;
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'background').setScale(Math.max(gameWidth / this.textures.get('background').getSourceImage().width, gameHeight / this.textures.get('background').getSourceImage().height));

        this.add.text(gameWidth / 2, gameHeight / 3, 'Parabéns, Venceste!', { fontSize: '48px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.add.text(gameWidth / 2, gameHeight / 2, 'Pontuação Final: ' + this.finalScore, { fontSize: '32px', fill: '#eee', align: 'center' }).setOrigin(0.5);
        this.add.text(gameWidth / 2, gameHeight / 2 + 40, 'Vidas Restantes: ' + this.remainingLives, { fontSize: '24px', fill: '#eee', align: 'center' }).setOrigin(0.5);

        const playAgainButton = this.add.text(gameWidth / 2, gameHeight * 2 / 3, 'Jogar Novamente', { fontSize: '24px', fill: '#fff', backgroundColor: '#4CAF50', padding: { x: 20, y: 10 }, borderRadius: 5 })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                playAgainButton.setStyle({ backgroundColor: '#45a049' });
            })
            .on('pointerout', () => {
                playAgainButton.setStyle({ backgroundColor: '#4CAF50' });
            });
    }

    update() {
        // Não é necessário nada aqui por enquanto
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.lives = 5;
        this.difficultyLevel = 1;
        this.gameSpeed = 1;
        this.timeLeft = 15; // Tempo inicial do jogo
        this.target = null;
        this.scoreText = null;
        this.livesText = null;
        this.timerText = null;
        this.timerEvent = null;
        this.hitSound = null;
        this.missSound = null;
        this.backgroundMusic = null;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.initialDisappearDelay = 3000; // Tempo inicial de desaparecimento do alvo (5 segundos)
        this.disappearDelayDecrease = 200; // Quantidade a diminuir do tempo de desaparecimento a cada acerto
        this.minDisappearDelay = 100; // Tempo mínimo de desaparecimento
    }

    preload() {
        this.load.image('target', 'assets/alien.png');
        this.load.audio('hit', 'assets/hit.wav');
        this.load.audio('miss', 'assets/miss.wav');
        this.load.audio('backgroundMusic', 'assets/song.mp3');
    }

    create() {
        this.gameWidth = this.cameras.main.width;
        this.gameHeight = this.cameras.main.height;

        this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'background').setScale(Math.max(this.gameWidth / this.textures.get('background').getSourceImage().width, this.gameHeight / this.textures.get('background').getSourceImage().height));

        this.scoreText = this.add.text(10, 10, 'Pontuação: 0', { fontSize: '20px', fill: '#fff' });
        this.livesText = this.add.text(this.gameWidth - 10, 10, 'Vidas: ' + this.lives, { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);

        this.timerText = this.add.text(this.gameWidth / 2, 10, this.formatTime(this.timeLeft), { fontSize: '20px', fill: '#fff' }).setOrigin(0.5, 0);

        this.hitSound = this.sound.add('hit');
        this.missSound = this.sound.add('miss');

        this.backgroundMusic = this.sound.add('backgroundMusic');
        this.backgroundMusic.play({ loop: true });
        this.backgroundMusic.setVolume(0.5);

        this.input.on('pointerdown', this.handleMissClick, this); // listenner de cliques na tela

        this.resetGame(); // Chama resetGame no create para inicializar o jogo
    }

    update() {
        // Não é necessário nada aqui por enquanto
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onTimeEvent,
            callbackScope: this,
            loop: true
        });
    }

    onTimeEvent() {
        this.timeLeft--;
        this.timerText.setText(this.formatTime(this.timeLeft));

        if (this.timeLeft <= 0) {
            this.stopTimer();
            // Verifica se o jogador ganhou
            if (this.lives > 0) {
                this.youWon();
            } else {
                this.lost(); // Chama a nova função lost()
            }
        }
    }

    stopTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const partInSeconds = seconds % 60;
        const partInSecondsPadded = partInSeconds.toString().padStart(2, '0');
        return `${minutes}:${partInSecondsPadded}`;
    }

    spawnTarget() {
        if (this.target) {
            this.target.destroy();
            this.target = null; // Garante que a referência é limpa imediatamente
        }

        const x = Phaser.Math.Between(50, this.gameWidth - 50);
        const y = Phaser.Math.Between(100, this.gameHeight - 50);

        const scaleFactor = 1 - (this.difficultyLevel * 0.08);
        const targetScale = Math.max(0.1, scaleFactor);

        this.target = this.add.image(x, y, 'target').setScale(targetScale).setInteractive();
        this.target.on('pointerdown', this.hitTarget, this);

        // Calcula o tempo de desaparecimento para este alvo
        const disappearDelay = Math.max(this.minDisappearDelay, this.initialDisappearDelay - (this.difficultyLevel * this.disappearDelayDecrease));

        // Define uma propriedade no próprio target para guardar o timer
        this.target.disappearTimer = this.time.delayedCall(disappearDelay, this.missTargetDueToTime, [], this);
        this.target.disappearDelayValue = disappearDelay; // Opcional: guardar o valor do delay no target
    }

    hitTarget() {
        this.score += 10;
        this.scoreText.setText('Pontuação: ' + this.score);
        this.hitSound.play();

        // Cancela o timer de desaparecimento do alvo atual
        if (this.target && this.target.disappearTimer) {
            this.target.disappearTimer.remove(false);
        }

        this.difficultyLevel++;
        this.gameSpeed = 1 + (this.difficultyLevel * 0.05);

        this.spawnTarget();
    }

    missTarget() {
        if (this.target) {
            this.target.destroy();
            this.target = null; // Limpa a referência
            this.missSound.play();
            this.lives--;
            this.livesText.setText('Vidas: ' + this.lives);

            if (this.lives <= 0) {
                this.lost(); // Chama a tela de "Perdeste!"
                this.stopTimer();
            } else {
                this.spawnTarget();
            }
        }
    }

    // Função chamada quando o tempo do target expira
    missTargetDueToTime() {
        if (this.target) {
            this.missTarget(); // Reutiliza a lógica de missTarget
        }
    }

    handleMissClick(pointer) {
        if (this.target && !this.target.getBounds().contains(pointer.x, pointer.y)) {
            this.missSound.play();
        }
    }

    gameOver() {
        this.scene.start('GameOverScene', { score: this.score });
        this.backgroundMusic.stop();
        this.stopTimer();
    }

    lost() {
        this.scene.start('LostScene', { score: this.score });
        this.backgroundMusic.stop();
        this.stopTimer();
    }

    youWon() {
        this.scene.start('YouWonScene', { score: this.score, lives: this.lives });
        this.backgroundMusic.stop();
        this.stopTimer();
    }

    resetGame() {
        this.score = 0;
        this.lives = 5;
        this.difficultyLevel = 1;
        this.gameSpeed = 1;
        this.timeLeft = 15;
        this.scoreText.setText('Pontuação: 0');
        this.livesText.setText('Vidas: ' + this.lives);
        this.timerText.setText(this.formatTime(this.timeLeft));
        this.backgroundMusic.resume();
        this.spawnTarget();
        this.stopTimer();
        this.startTimer();
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'background').setScale(Math.max(gameWidth / this.textures.get('background').getSourceImage().width, gameHeight / this.textures.get('background').getSourceImage().height));

        this.add.text(gameWidth / 2, gameHeight / 4, 'Apanha o Alien!', { fontSize: '48px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.add.text(gameWidth / 2, gameHeight / 2, 'Clica nos alienígenas antes que desapareçam!\nEvita perder todas as vidas antes que o tempo acabe.', { fontSize: '24px', fill: '#eee', align: 'center' }).setOrigin(0.5);

        const playButton = this.add.text(gameWidth / 2, gameHeight * 3 / 4, 'Jogar', { fontSize: '32px', fill: '#fff', backgroundColor: '#4CAF50', padding: { x: 20, y: 10 }, borderRadius: 5 })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                playButton.setStyle({ backgroundColor: '#45a049' });
            })
            .on('pointerout', () => {
                playButton.setStyle({ backgroundColor: '#4CAF50' });
            });
    }

    update() {
        // Não é necessário nada aqui por enquanto
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalScore = data.score;
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.add.image(gameWidth / 2, gameHeight / 2, 'background').setScale(Math.max(gameWidth / this.textures.get('background').getSourceImage().width, gameHeight / this.textures.get('background').getSourceImage().height));

        this.add.text(gameWidth / 2, gameHeight / 3, 'Fim do Jogo!', { fontSize: '48px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.add.text(gameWidth / 2, gameHeight / 2, 'Pontuação Final: ' + this.finalScore, { fontSize: '32px', fill: '#eee', align: 'center' }).setOrigin(0.5);

        const playAgainButton = this.add.text(gameWidth / 2, gameHeight * 2 / 3, 'Jogar Novamente', { fontSize: '24px', fill: '#fff', backgroundColor: '#4CAF50', padding: { x: 20, y: 10 }, borderRadius: 5 })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                playAgainButton.setStyle({ backgroundColor: '#45a049' });
            })
            .on('pointerout', () => {
                playAgainButton.setStyle({ backgroundColor: '#4CAF50' });
            });
    }

    update() {
        // Não é necessário nada aqui por enquanto
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, GameScene, GameOverScene, YouWonScene, LostScene], // Registra a nova cena
    audio: {
        disableWebAudio: true
    }
};

const game = new Phaser.Game(config);