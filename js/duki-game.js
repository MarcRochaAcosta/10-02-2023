// Joc RPG de Duki el gat - Estil Pokémon Game Boy Advance
// Aquest joc permet al jugador controlar a Duki en un món obert per recollir objectes i construir una casa

class DukiGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        
        // Constants del joc
        this.TILE_SIZE = 32; // Mida de cada rajola del mapa
        this.MAP_COLS = 40;
        this.MAP_ROWS = 30;
        
        // Propietats del jugador (Duki)
        this.duki = {
            x: this.gameWidth / 2,
            y: this.gameHeight / 2,
            width: 32,
            height: 40,
            speed: 3,
            direction: 'down', // down, up, left, right
            animFrame: 0,
            animCounter: 0,
            isMoving: false,
            items: [],
            buildingProgress: 0
        };
        
        // Mapa del món
        this.createWorldMap();
        
        // Objectes per recollir amb profunditat
        this.items = [
            { id: 'fusta', x: 100, y: 100, width: 24, height: 24, shadowHeight: 6, color: '#8B4513', collected: false, description: 'Fusta per construir' },
            { id: 'pedra', x: 200, y: 150, width: 24, height: 24, shadowHeight: 8, color: '#808080', collected: false, description: 'Pedra per als fonaments' },
            { id: 'finestra', x: 300, y: 200, width: 24, height: 24, shadowHeight: 4, color: '#ADD8E6', collected: false, description: 'Finestra de vidre' },
            { id: 'porta', x: 400, y: 250, width: 24, height: 32, shadowHeight: 5, color: '#A52A2A', collected: false, description: 'Porta de fusta' },
            { id: 'teulada', x: 500, y: 300, width: 32, height: 24, shadowHeight: 7, color: '#FF0000', collected: false, description: 'Teulada vermella' },
            { id: 'menjar', x: 150, y: 350, width: 20, height: 20, shadowHeight: 3, color: '#FFFF00', collected: false, description: 'Menjar per a Duki' },
            { id: 'joguina', x: 250, y: 400, width: 20, height: 20, shadowHeight: 4, color: '#00FF00', collected: false, description: 'Joguina per a Duki' },
            { id: 'llit', x: 350, y: 450, width: 28, height: 32, shadowHeight: 6, color: '#0000FF', collected: false, description: 'Llit per a Duki' }
        ];
        
        // NPCs o personatges del món
        this.npcs = [
            { id: 'gat1', x: 150, y: 200, width: 32, height: 40, color: '#FFD700', direction: 'down', animFrame: 0, messages: [
                'Miau! Benvingut al món de Duki!',
                'Sóc en Whiskers, el gat més vell del poble.',
                'Si necessites consells, sempre em pots preguntar!'
            ], currentMessage: 0 },
            { id: 'gat2', x: 450, y: 350, width: 32, height: 40, color: '#C0C0C0', direction: 'left', animFrame: 0, messages: [
                'Necessites materials per construir una bona casa.',
                'Pots trobar fusta als boscos i pedres a la muntanya.',
                'Recorda que una casa necessita finestres per veure el món!'
            ], currentMessage: 0 },
            { id: 'gat3', x: 600, y: 250, width: 32, height: 40, color: '#FFA500', direction: 'right', animFrame: 0, messages: [
                'Hola! Sóc la Mimi, m\'agrada pescar al llac.',
                'L\'aigua està plena de tresors amagats!',
                'Però compte, no et mullis les potes!'
            ], currentMessage: 0 },
            { id: 'gat4', x: 300, y: 500, width: 32, height: 40, color: '#8B4513', direction: 'up', animFrame: 0, messages: [
                'Benvingut a la zona de jocs!',
                'M\'encanta jugar amb les joguines que trobo.',
                'Si en trobes alguna, porta-la aquí i jugarem junts!'
            ], currentMessage: 0 },
            { id: 'gat5', x: 800, y: 400, width: 32, height: 40, color: '#4B0082', direction: 'down', animFrame: 0, messages: [
                'Psst... Vols saber un secret?',
                'Diuen que hi ha tresors amagats sota la sorra...',
                'Però vigila amb les petjades que deixes!'
            ], currentMessage: 0 }
        ];
        
        // Casa que s'està construint
        this.house = {
            x: this.gameWidth - 150,
            y: this.gameHeight - 150,
            width: 100,
            height: 100,
            color: '#D3D3D3',
            built: false,
            parts: [
                { id: 'fusta', required: true, added: false },
                { id: 'pedra', required: true, added: false },
                { id: 'finestra', required: true, added: false },
                { id: 'porta', required: true, added: false },
                { id: 'teulada', required: true, added: false }
            ]
        };
        
        // Càmera per seguir al jugador
        this.camera = {
            x: 0,
            y: 0,
            width: this.gameWidth,
            height: this.gameHeight
        };
        
        // Interfície d'usuari
        this.ui = {
            showMessage: false,
            message: '',
            messageTimer: 0,
            showTooltip: false,
            tooltipText: '',
            tooltipX: 0,
            tooltipY: 0
        };
        
        // Controls del teclat
        this.keys = {};
        
        // Inicialitzar el joc
        this.init();
    }
    
    createWorldMap() {
        // Crear un mapa de rajoles amb diferents tipus de terreny
        this.mapData = [];
        this.obstacles = [];
        
        // Tipus de rajoles: 0 = herba, 1 = camí, 2 = aigua, 3 = sorra, 4 = obstacle (arbre), 5 = muntanya
        for (let row = 0; row < this.MAP_ROWS; row++) {
            this.mapData[row] = [];
            for (let col = 0; col < this.MAP_COLS; col++) {
                // Crear un món més divers
                
                // Zona central amb camins principals
                if (col === 10 || col === 25 || row === 8 || row === 20) {
                    this.mapData[row][col] = 1; // Camins principals
                }
                
                // Llac gran amb forma irregular
                else if ((col > 28 && col < 35) && (row > 12 && row < 18) ||
                    (col > 30 && col < 33) && (row > 10 && row < 20)) {
                    this.mapData[row][col] = 2; // Aigua
                }
                
                // Platja amb sorra
                else if ((col > 25 && col < 38) && (row > 22 && row < 28)) {
                    this.mapData[row][col] = 3; // Sorra
                }
                
                // Bosc amb arbres
                else if ((col < 8 && row < 10) || 
                    (col > 15 && col < 22 && row > 5 && row < 12)) {
                    if (Math.random() < 0.4) {
                        this.mapData[row][col] = 4; // Arbres
                        this.obstacles.push({x: col * this.TILE_SIZE, y: row * this.TILE_SIZE, width: this.TILE_SIZE, height: this.TILE_SIZE});
                    } else {
                        this.mapData[row][col] = 0; // Herba entre els arbres
                    }
                }
                
                // Zona de muntanya
                else if ((col > 32 && col < 38) && (row < 8)) {
                    this.mapData[row][col] = 5; // Muntanya
                    this.obstacles.push({x: col * this.TILE_SIZE, y: row * this.TILE_SIZE, width: this.TILE_SIZE, height: this.TILE_SIZE});
                }
                
                // Zona de jocs
                else if ((col > 8 && col < 15) && (row > 15 && row < 18)) {
                    if (Math.random() < 0.2) {
                        this.obstacles.push({x: col * this.TILE_SIZE, y: row * this.TILE_SIZE, width: this.TILE_SIZE, height: this.TILE_SIZE});
                    }
                    this.mapData[row][col] = 0; // Herba
                }
                
                // Resta del mapa amb herba
                else {
                    this.mapData[row][col] = 0; // Herba per defecte
                }
            }
        }
    }
    
    init() {
        // Configurar els controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Si es mostra un missatge i es prem una tecla, amagar el missatge
            if (this.ui.showMessage && (e.key === 'Enter' || e.key === ' ')) {
                this.ui.showMessage = false;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Iniciar el bucle del joc
        this.gameLoop();
    }
    
    update() {
        // Actualitzar l'animació del jugador
        this.duki.animCounter++;
        if (this.duki.animCounter > 10) {
            this.duki.animCounter = 0;
            this.duki.animFrame = (this.duki.animFrame + 1) % 4;
        }
        
        // Guardar la posició anterior
        const prevX = this.duki.x;
        const prevY = this.duki.y;
        
        // Reiniciar l'estat de moviment
        this.duki.isMoving = false;
        
        // Moure a Duki segons les tecles premudes
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.duki.y = Math.max(0, this.duki.y - this.duki.speed);
            this.duki.direction = 'up';
            this.duki.isMoving = true;
        } else if (this.keys['ArrowDown'] || this.keys['s']) {
            this.duki.y = Math.min(this.MAP_ROWS * this.TILE_SIZE - this.duki.height, this.duki.y + this.duki.speed);
            this.duki.direction = 'down';
            this.duki.isMoving = true;
        }
        
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.duki.x = Math.max(0, this.duki.x - this.duki.speed);
            this.duki.direction = 'left';
            this.duki.isMoving = true;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.duki.x = Math.min(this.MAP_COLS * this.TILE_SIZE - this.duki.width, this.duki.x + this.duki.speed);
            this.duki.direction = 'right';
            this.duki.isMoving = true;
        }
        
        // Comprovar col·lisions amb obstacles
        if (this.checkObstacleCollisions()) {
            this.duki.x = prevX;
            this.duki.y = prevY;
        }
        
        // Actualitzar la càmera per seguir al jugador
        this.updateCamera();
        
        // Comprovar col·lisions amb objectes
        this.items.forEach(item => {
            if (!item.collected && this.checkCollision(this.duki, item)) {
                item.collected = true;
                this.duki.items.push(item.id);
                this.updateBuildingProgress();
                this.showMessage(`Has recollit: ${item.id} - ${item.description}`);
            }
        });
        
        // Comprovar interaccions amb NPCs
        if (this.keys['e']) {
            this.npcs.forEach(npc => {
                if (this.checkProximity(this.duki, npc, 50)) {
                    // Mostrar el següent missatge en la seqüència
                    const message = npc.messages[npc.currentMessage];
                    this.showMessage(message);
                    
                    // Avançar al següent missatge
                    npc.currentMessage = (npc.currentMessage + 1) % npc.messages.length;
                    
                    // Fer que el NPC miri cap a Duki
                    if (npc.x < this.duki.x) npc.direction = 'right';
                    else if (npc.x > this.duki.x) npc.direction = 'left';
                    else if (npc.y < this.duki.y) npc.direction = 'down';
                    else npc.direction = 'up';
                }
            });
        }
        
        // Comprovar si Duki està a prop de la casa per construir
        if (this.checkProximity(this.duki, this.house, 50) && !this.house.built) {
            this.tryToBuild();
        }
        
        // Actualitzar els missatges de la UI
        if (this.ui.showMessage && this.ui.messageTimer > 0) {
            this.ui.messageTimer--;
            if (this.ui.messageTimer === 0) {
                this.ui.showMessage = false;
            }
        }
        
        // Actualitzar tooltips
        this.updateTooltips();
    }
    
    updateCamera() {
        // Centrar la càmera al jugador
        this.camera.x = this.duki.x + this.duki.width / 2 - this.camera.width / 2;
        this.camera.y = this.duki.y + this.duki.height / 2 - this.camera.height / 2;
        
        // Limitar la càmera als límits del mapa
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.MAP_COLS * this.TILE_SIZE - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.MAP_ROWS * this.TILE_SIZE - this.camera.height));
    }
    
    checkObstacleCollisions() {
        // Comprovar col·lisions amb obstacles del mapa
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.checkCollision(this.duki, this.obstacles[i])) {
                return true;
            }
        }
        
        // Comprovar col·lisions amb rajoles d'aigua (tipus 2)
        const dukiTileRow = Math.floor(this.duki.y / this.TILE_SIZE);
        const dukiTileCol = Math.floor(this.duki.x / this.TILE_SIZE);
        
        for (let row = dukiTileRow; row <= Math.floor((this.duki.y + this.duki.height) / this.TILE_SIZE); row++) {
            for (let col = dukiTileCol; col <= Math.floor((this.duki.x + this.duki.width) / this.TILE_SIZE); col++) {
                if (row >= 0 && row < this.MAP_ROWS && col >= 0 && col < this.MAP_COLS) {
                    if (this.mapData[row][col] === 2) { // Aigua
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    updateTooltips() {
        // Mostrar tooltip quan el jugador està a prop d'un objecte
        this.ui.showTooltip = false;
        
        this.items.forEach(item => {
            if (!item.collected && this.checkProximity(this.duki, item, 60)) {
                this.ui.showTooltip = true;
                this.ui.tooltipText = `${item.id} - Prem 'E' per recollir`;
                this.ui.tooltipX = item.x;
                this.ui.tooltipY = item.y - 20;
            }
        });
    }
    
    showMessage(text) {
        this.ui.showMessage = true;
        this.ui.message = text;
        this.ui.messageTimer = 120; // Durada del missatge (en frames)
    }
    
    updateBuildingProgress() {
        // Actualitzar el progrés de construcció
        let completedParts = 0;
        
        this.house.parts.forEach(part => {
            if (this.duki.items.includes(part.id) && !part.added) {
                part.added = true;
                completedParts++;
            }
        });
        
        this.duki.buildingProgress = (completedParts / this.house.parts.length) * 100;
        
        // Comprovar si la casa està completa
        if (completedParts === this.house.parts.length) {
            this.house.built = true;
            setTimeout(() => {
                this.showMessage('Felicitats! Has construït una casa per a en Duki! 🏠🐱');
            }, 500);
        }
    }
    
    tryToBuild() {
        // Intentar afegir parts a la casa
        this.house.parts.forEach(part => {
            if (this.duki.items.includes(part.id) && !part.added) {
                part.added = true;
                this.updateBuildingProgress();
                this.showMessage(`Has afegit ${part.id} a la casa!`);
            }
        });
    }
    
    draw() {
        // Netejar el canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Dibuixar el mapa
        this.drawMap();
        
        // Dibuixar els objectes no recollits (amb ombres per donar profunditat)
        this.items.forEach(item => {
            if (!item.collected) {
                // Dibuixar l'ombra
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.ellipse(
                    item.x + item.width/2 - this.camera.x, 
                    item.y + item.height - this.camera.y, 
                    item.width/2, 
                    item.shadowHeight, 
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
                
                // Dibuixar l'objecte
                this.ctx.fillStyle = item.color;
                this.ctx.fillRect(
                    item.x - this.camera.x, 
                    item.y - this.camera.y, 
                    item.width, 
                    item.height
                );
            }
        });
        
        // Dibuixar NPCs
        this.drawNPCs();
        
        // Dibuixar la casa
        this.drawHouse();
        
        // Dibuixar a Duki amb animació
        this.drawDuki();
        
        // Dibuixar la interfície d'usuari
        this.drawUI();
    }
    
    drawMap() {
        // Dibuixar el mapa base amb més detall, profunditat i una paleta càlida
        const startCol = Math.floor(this.camera.x / this.TILE_SIZE);
        const endCol = Math.min(this.MAP_COLS - 1, startCol + Math.ceil(this.camera.width / this.TILE_SIZE));
        const startRow = Math.floor(this.camera.y / this.TILE_SIZE);
        const endRow = Math.min(this.MAP_ROWS - 1, startRow + Math.ceil(this.camera.height / this.TILE_SIZE));
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tileType = this.mapData[row][col];
                const x = col * this.TILE_SIZE - this.camera.x;
                const y = row * this.TILE_SIZE - this.camera.y;
                // Nova paleta de colors càlids i profunditat
                switch(tileType) {
                    case 0: // Herba amb patró pixelat i profunditat
                        // Gradient de verds càlids
                        const grassGradient = this.ctx.createLinearGradient(x, y, x, y + this.TILE_SIZE);
                        grassGradient.addColorStop(0, '#b6e388');
                        grassGradient.addColorStop(1, '#6ab04c');
                        this.ctx.fillStyle = grassGradient;
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        // Ombres suaus per donar profunditat
                        this.ctx.fillStyle = 'rgba(80,120,60,0.12)';
                        this.ctx.fillRect(x, y + this.TILE_SIZE/2, this.TILE_SIZE, this.TILE_SIZE/2);
                        // Detalls d'herba pixelats
                        this.ctx.fillStyle = '#eaf7c1';
                        for(let i = 0; i < 4; i++) {
                            for(let j = 0; j < 4; j++) {
                                if((i + j + row + col) % 2 === 0) {
                                    this.ctx.fillRect(x + i * 8, y + j * 8, 5, 5);
                                }
                            }
                        }
                        break;
                        
                    case 1: // Camí amb textura i profunditat
                        // Gradient càlid de marrons
                        const pathGradient = this.ctx.createLinearGradient(x, y, x + this.TILE_SIZE, y + this.TILE_SIZE);
                        pathGradient.addColorStop(0, '#e0c097');
                        pathGradient.addColorStop(1, '#b68973');
                        this.ctx.fillStyle = pathGradient;
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        // Ombra lateral
                        this.ctx.fillStyle = 'rgba(120,80,40,0.10)';
                        this.ctx.fillRect(x, y + this.TILE_SIZE/2, this.TILE_SIZE, this.TILE_SIZE/2);
                        // Patró de pedres
                        this.ctx.fillStyle = '#fff2d8';
                        for(let i = 0; i < 3; i++) {
                            for(let j = 0; j < 3; j++) {
                                if((i * 3 + j + row + col) % 2 === 0) {
                                    this.ctx.fillRect(x + i * 10 + 2, y + j * 10 + 2, 7, 7);
                                }
                            }
                        }
                        break;
                        
                    case 2: // Aigua amb animació i tons blaus suaus
                        const waterOffset = Math.sin(Date.now() / 500 + (row + col) * 0.5) * 4;
                        const waterGradient = this.ctx.createLinearGradient(x, y, x, y + this.TILE_SIZE);
                        waterGradient.addColorStop(0, '#aee9f7');
                        waterGradient.addColorStop(1, '#3a8fd8');
                        this.ctx.fillStyle = waterGradient;
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        // Ones d'aigua
                        this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
                        for(let i = 0; i < 4; i++) {
                            const offsetY = Math.sin((Date.now() / 500) + i + (row + col) * 0.3) * 4;
                            this.ctx.fillRect(x, y + i * 8 + offsetY, this.TILE_SIZE, 3);
                        }
                        // Reflexos
                        this.ctx.fillStyle = 'rgba(255,255,255,0.10)';
                        this.ctx.fillRect(x + 4, y + 4, this.TILE_SIZE - 8, 4);
                        break;
                        
                    case 3: // Sorra amb textura i tons suaus
                        const sandGradient = this.ctx.createLinearGradient(x, y, x, y + this.TILE_SIZE);
                        sandGradient.addColorStop(0, '#fff2c2');
                        sandGradient.addColorStop(1, '#e6c07b');
                        this.ctx.fillStyle = sandGradient;
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        // Ombra suau
                        this.ctx.fillStyle = 'rgba(200,170,100,0.10)';
                        this.ctx.fillRect(x, y + this.TILE_SIZE/2, this.TILE_SIZE, this.TILE_SIZE/2);
                        // Grans de sorra
                        this.ctx.fillStyle = '#ffe6a7';
                        for(let i = 0; i < 8; i++) {
                            for(let j = 0; j < 8; j++) {
                                if((i + j + row + col) % 3 === 0) {
                                    this.ctx.fillRect(x + i * 4, y + j * 4, 2, 2);
                                }
                            }
                        }
                        break;
                    
                    case 4: // Obstacle (arbre) amb base més càlida
                        this.ctx.fillStyle = '#b6e388';
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        this.drawTree(x, y);
                        break;
                    
                    case 5: // Muntanya amb tons càlids i més profunditat
                        const mountainGradient = this.ctx.createLinearGradient(x, y, x, y + this.TILE_SIZE);
                        mountainGradient.addColorStop(0, '#e0e0e0');
                        mountainGradient.addColorStop(1, '#b0a18f');
                        this.ctx.fillStyle = mountainGradient;
                        this.ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                        // Dibuix de muntanya pixelada
                        this.ctx.fillStyle = '#d6cfc7';
                        this.ctx.beginPath();
                        this.ctx.moveTo(x + 4, y + this.TILE_SIZE - 4);
                        this.ctx.lineTo(x + this.TILE_SIZE / 2, y + 8);
                        this.ctx.lineTo(x + this.TILE_SIZE - 4, y + this.TILE_SIZE - 4);
                        this.ctx.closePath();
                        this.ctx.fill();
                        // Detall de neu al cim
                        this.ctx.fillStyle = '#fff2c2';
                        this.ctx.fillRect(x + this.TILE_SIZE / 2 - 6, y + 8, 12, 6);
                        break;
                }
            }
        }
    }
    
    drawTree(x, y) {
        // Colors del tronc
        const trunkColors = {
            base: '#8B4513',
            light: '#A0522D',
            dark: '#6B4513'
        };
        
        // Colors de les fulles
        const leafColors = {
            dark: '#006400',
            medium: '#008000',
            light: '#228B22',
            highlight: '#98FB98'
        };
        
        // Animació suau
        const time = Date.now() / 1000;
        const swayOffset = Math.sin(time + x) * 2;
        
        // Tronc amb textura pixelada
        this.ctx.fillStyle = trunkColors.base;
        this.ctx.fillRect(x + 12 + swayOffset/2, y + 16, 8, 16);
        
        // Detalls del tronc
        this.ctx.fillStyle = trunkColors.light;
        for(let i = 0; i < 4; i++) {
            if(i % 2 === 0) {
                this.ctx.fillRect(x + 12 + swayOffset/2, y + 18 + i * 4, 4, 3);
            }
        }
        
        this.ctx.fillStyle = trunkColors.dark;
        for(let i = 0; i < 4; i++) {
            if(i % 2 === 1) {
                this.ctx.fillRect(x + 16 + swayOffset/2, y + 18 + i * 4, 4, 3);
            }
        }
        
        // Capes de fulles amb animació
        // Capa base
        this.ctx.fillStyle = leafColors.dark;
        this.ctx.fillRect(x + 6 + swayOffset, y + 8, 20, 12);
        
        // Capa mitjana
        this.ctx.fillStyle = leafColors.medium;
        this.ctx.fillRect(x + 8 + swayOffset, y + 4, 16, 10);
        
        // Capa superior
        this.ctx.fillStyle = leafColors.light;
        this.ctx.fillRect(x + 10 + swayOffset, y, 12, 8);
        
        // Detalls pixelats de les fulles
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if((i + j) % 2 === 0) {
                    this.ctx.fillStyle = leafColors.highlight;
                    this.ctx.fillRect(
                        x + 8 + i * 6 + swayOffset + Math.sin(time + i) * 1,
                        y + 4 + j * 4 + Math.cos(time + j) * 1,
                        3, 3
                    );
                }
            }
        }
        
        // Efecte d'espurnes ocasionals
        if(Math.random() < 0.1) {
            this.ctx.fillStyle = leafColors.highlight;
            const sparkX = x + 8 + Math.random() * 16 + swayOffset;
            const sparkY = y + Math.random() * 12;
            this.ctx.fillRect(sparkX, sparkY, 2, 2);
        }
    }
    
    drawNPCs() {
        // Dibuixar NPCs amb estil 8 bits i animacions
        this.npcs.forEach(npc => {
            const x = npc.x - this.camera.x;
            const y = npc.y - this.camera.y;
            
            // Ombra pixelada
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for(let i = 0; i < 6; i++) {
                this.ctx.fillRect(
                    x + npc.width/4 + i * 4,
                    y + npc.height,
                    4,
                    2
                );
            }
            
            // Animació de flotació
            const floatOffset = Math.sin(Date.now() / 500) * 2;
            
            // Cos amb patró pixelat
            const baseColor = npc.color;
            const highlightColor = this.adjustColor(baseColor, 20);
            
            // Base del cos
            this.ctx.fillStyle = baseColor;
            this.ctx.fillRect(x, y + floatOffset, npc.width, npc.height);
            
            // Patró pixelat pel cos
            this.ctx.fillStyle = highlightColor;
            for(let i = 0; i < 4; i++) {
                for(let j = 0; j < 5; j++) {
                    if((i + j) % 2 === 0) {
                        this.ctx.fillRect(x + i * 8, y + j * 8 + floatOffset, 6, 6);
                    }
                }
            }
            
            // Orelles pixelades
            this.ctx.fillStyle = baseColor;
            // Orella esquerra
            this.ctx.fillRect(x + 4, y - 6 + floatOffset, 8, 8);
            this.ctx.fillRect(x + 6, y - 8 + floatOffset, 4, 4);
            
            // Orella dreta
            this.ctx.fillRect(x + npc.width - 12, y - 6 + floatOffset, 8, 8);
            this.ctx.fillRect(x + npc.width - 10, y - 8 + floatOffset, 4, 4);
            
            // Ulls amb parpelleig
            const blinkState = Math.floor(Date.now() / 3000) % 2 === 0;
            if(blinkState) {
                this.ctx.fillStyle = '#000';
                // Ull esquerre
                this.ctx.fillRect(x + 8, y + 8 + floatOffset, 4, 4);
                // Ull dret
                this.ctx.fillRect(x + npc.width - 12, y + 8 + floatOffset, 4, 4);
                
                // Brillantor als ulls
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillRect(x + 8, y + 8 + floatOffset, 2, 2);
                this.ctx.fillRect(x + npc.width - 12, y + 8 + floatOffset, 2, 2);
            } else {
                this.ctx.fillStyle = '#000';
                // Ulls tancats
                this.ctx.fillRect(x + 8, y + 10 + floatOffset, 4, 2);
                this.ctx.fillRect(x + npc.width - 12, y + 10 + floatOffset, 4, 2);
            }
        });
    }
    
    // Funció auxiliar per ajustar el color
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
        const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    drawDuki() {
        const x = this.duki.x - this.camera.x;
        const y = this.duki.y - this.camera.y;
        
        // Ombra detallada
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for(let i = 0; i < 12; i++) {
            this.ctx.fillRect(
                x + this.duki.width/4 + i * 2,
                y + this.duki.height,
                2,
                2 + Math.sin(i * 0.5) * 1
            );
        }
        
        // Animació de moviment millorada
        let offsetY = 0;
        if (this.duki.isMoving) {
            offsetY = Math.sin(Date.now() / 150) * 3;
        }
        
        // Colors estil pixel art més detallats
        const colors = {
            brown: '#8B4513',      // Marró base
            darkBrown: '#654321',  // Marró fosc per ombres
            lightBrown: '#A0522D', // Marró clar per brillantors
            black: '#000000',      // Negre per ulls i detalls
            white: '#FFFFFF',      // Blanc per brillantors
            lightestBrown: '#D2691E' // Marró molt clar per realçar
        };
        
        // Dibuixar segons la direcció
        const facingLeft = this.duki.direction === 'left';
        const scaleX = facingLeft ? -1 : 1;
        
        this.ctx.save();
        this.ctx.translate(facingLeft ? x + this.duki.width : x, y);
        this.ctx.scale(scaleX, 1);
        
        // Cos principal més detallat
        // Base del cos
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(4, 8 - offsetY, 24, 16);
        
        // Detalls del pelatge al cos
        this.ctx.fillStyle = colors.darkBrown;
        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 4; j++) {
                if((i + j) % 2 === 0) {
                    this.ctx.fillRect(6 + i * 4, 10 + j * 4 - offsetY, 3, 3);
                }
            }
        }
        
        // Brillantors del pelatge
        this.ctx.fillStyle = colors.lightestBrown;
        for(let i = 0; i < 4; i++) {
            this.ctx.fillRect(8 + i * 6, 9 - offsetY, 2, 2);
        }
        
        // Potes més detallades
        // Potes davanteres
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(6, 22 - offsetY, 6, 8);
        this.ctx.fillRect(20, 22 - offsetY, 6, 8);
        // Detalls de les potes davanteres
        this.ctx.fillStyle = colors.darkBrown;
        this.ctx.fillRect(7, 24 - offsetY, 4, 6);
        this.ctx.fillRect(21, 24 - offsetY, 4, 6);
        
        // Potes posteriors
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(8, 20 - offsetY, 5, 10);
        this.ctx.fillRect(18, 20 - offsetY, 5, 10);
        // Detalls de les potes posteriors
        this.ctx.fillStyle = colors.darkBrown;
        this.ctx.fillRect(9, 22 - offsetY, 3, 8);
        this.ctx.fillRect(19, 22 - offsetY, 3, 8);
        
        // Cua més elaborada
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(2, 12 - offsetY, 4, 8);
        this.ctx.fillRect(0, 14 - offsetY, 4, 4);
        // Detalls de la cua
        this.ctx.fillStyle = colors.darkBrown;
        this.ctx.fillRect(1, 15 - offsetY, 2, 2);
        this.ctx.fillRect(3, 13 - offsetY, 2, 6);
        
        // Cap més detallat
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(8, 2 - offsetY, 16, 12);
        
        // Orelles més elaborades
        // Orella esquerra
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(6, 0 - offsetY, 6, 6);
        this.ctx.fillRect(8, -2 - offsetY, 4, 4);
        this.ctx.fillStyle = colors.darkBrown;
        this.ctx.fillRect(7, 1 - offsetY, 4, 4);
        
        // Orella dreta
        this.ctx.fillStyle = colors.brown;
        this.ctx.fillRect(20, 0 - offsetY, 6, 6);
        this.ctx.fillRect(22, -2 - offsetY, 4, 4);
        this.ctx.fillStyle = colors.darkBrown;
        this.ctx.fillRect(21, 1 - offsetY, 4, 4);
        
        // Cara més detallada
        const blinkState = Math.floor(Date.now() / 2000) % 3 === 0;
        
        if(!blinkState) {
            // Ulls oberts més expressius
            this.ctx.fillStyle = colors.black;
            this.ctx.fillRect(10, 6 - offsetY, 5, 5);  // Ull esquerre
            this.ctx.fillRect(17, 6 - offsetY, 5, 5);  // Ull dret
            
            // Brillantor als ulls més definida
            this.ctx.fillStyle = colors.white;
            this.ctx.fillRect(11, 7 - offsetY, 2, 2);  // Brillantor ull esquerre
            this.ctx.fillRect(18, 7 - offsetY, 2, 2);  // Brillantor ull dret
            // Brillantor secundària
            this.ctx.fillRect(10, 8 - offsetY, 1, 1);
            this.ctx.fillRect(17, 8 - offsetY, 1, 1);
        } else {
            // Ulls tancats més expressius
            this.ctx.fillStyle = colors.black;
            this.ctx.fillRect(10, 8 - offsetY, 5, 2);  // Ull esquerre tancat
            this.ctx.fillRect(17, 8 - offsetY, 5, 2);  // Ull dret tancat
            // Pestanyes
            this.ctx.fillRect(11, 7 - offsetY, 3, 1);
            this.ctx.fillRect(18, 7 - offsetY, 3, 1);
        }
        
        // Nas més detallat
        this.ctx.fillStyle = colors.black;
        this.ctx.fillRect(14, 10 - offsetY, 4, 3);
        // Brillantor del nas
        this.ctx.fillStyle = colors.lightBrown;
        this.ctx.fillRect(15, 10 - offsetY, 1, 1);
        
        // Bigotis més elaborats
        this.ctx.fillStyle = colors.black;
        // Bigotis esquerre
        this.ctx.fillRect(4, 10 - offsetY, 6, 1);
        this.ctx.fillRect(3, 11 - offsetY, 6, 1);
        this.ctx.fillRect(5, 12 - offsetY, 5, 1);
        // Bigotis dret
        this.ctx.fillRect(22, 10 - offsetY, 6, 1);
        this.ctx.fillRect(23, 11 - offsetY, 6, 1);
        this.ctx.fillRect(22, 12 - offsetY, 5, 1);
        
        this.ctx.restore();
        
        // Efectes de moviment millorats
        if(this.duki.isMoving) {
            if(Math.random() < 0.2) {
                this.ctx.fillStyle = colors.white;
                for(let i = 0; i < 2; i++) {
                    const sparkX = x + Math.random() * this.duki.width;
                    const sparkY = y + Math.random() * this.duki.height - offsetY;
                    this.ctx.fillRect(sparkX, sparkY, 2, 2);
                    this.ctx.fillRect(sparkX + 1, sparkY + 1, 1, 1);
                }
            }
        }
    }
    
    drawHouse() {
        const x = this.house.x - this.camera.x;
        const y = this.house.y - this.camera.y;
        
        // Colors base amb estil 8 bits
        const colors = {
            wall: '#D3D3D3',
            wallShade: '#A9A9A9',
            roof: '#FF4040',
            roofShade: '#8B0000',
            window: '#ADD8E6',
            windowShine: '#E0FFFF',
            door: '#A52A2A',
            doorShade: '#8B2323'
        };
        
        // Animació suau
        const time = Date.now() / 1000;
        
        // Base de la casa amb textura pixelada
        this.ctx.fillStyle = colors.wall;
        this.ctx.fillRect(x, y, this.house.width, this.house.height);
        
        // Patró de maons
        this.ctx.fillStyle = colors.wallShade;
        for(let i = 0; i < this.house.width/8; i++) {
            for(let j = 0; j < this.house.height/8; j++) {
                if((i + j) % 2 === 0) {
                    this.ctx.fillRect(x + i * 8, y + j * 8, 6, 6);
                }
            }
        }
        
        // Dibuixar les parts afegides amb estil 8 bits
        if (this.house.parts.find(part => part.id === 'teulada' && part.added)) {
            // Teulada pixelada
            for(let i = 0; i < this.house.width + 20; i += 4) {
                const height = Math.abs(i - (this.house.width + 20)/2) * 0.3;
                const waveOffset = Math.sin(time + i * 0.1) * 2;
                
                this.ctx.fillStyle = colors.roof;
                this.ctx.fillRect(
                    x - 10 + i,
                    y - 30 + height + waveOffset,
                    4,
                    30 - height
                );
                
                // Detalls de la teulada
                if(i % 8 === 0) {
                    this.ctx.fillStyle = colors.roofShade;
                    this.ctx.fillRect(
                        x - 10 + i,
                        y - 28 + height + waveOffset,
                        4,
                        4
                    );
                }
            }
        }
        
        if (this.house.parts.find(part => part.id === 'finestra' && part.added)) {
            // Finestra amb brillantor animada
            this.ctx.fillStyle = colors.window;
            this.ctx.fillRect(x + 15, y + 30, 25, 25);
            
            // Marc de la finestra
            this.ctx.fillStyle = colors.wallShade;
            this.ctx.fillRect(x + 15, y + 42, 25, 2);
            this.ctx.fillRect(x + 26, y + 30, 2, 25);
            
            // Brillantor animada
            const shine = Math.sin(time * 2) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${shine})`;
            this.ctx.fillRect(x + 17, y + 32, 8, 8);
        }
        
        if (this.house.parts.find(part => part.id === 'porta' && part.added)) {
            // Porta amb detalls
            this.ctx.fillStyle = colors.door;
            this.ctx.fillRect(
                x + this.house.width - 30,
                y + 50,
                20,
                50
            );
            
            // Detalls de la porta
            this.ctx.fillStyle = colors.doorShade;
            for(let i = 0; i < 3; i++) {
                this.ctx.fillRect(
                    x + this.house.width - 28,
                    y + 55 + i * 15,
                    16,
                    2
                );
            }
            
            // Pom de la porta
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(
                x + this.house.width - 25,
                y + 75,
                4,
                4
            );
        }
    }
    
    drawUI() {
        // Colors base per la UI
        const uiColors = {
            background: '#000000',
            border: '#4B4B4B',
            progressBar: '#4CAF50',
            progressBarHighlight: '#5FDF63',
            text: '#FFFFFF',
            textShadow: '#000000'
        };
        
        // Animació suau
        const time = Date.now() / 1000;
        
        // Dibuixar la barra de progrés amb estil 8 bits
        const barWidth = 200;
        const barHeight = 20;
        const barX = 10;
        const barY = 10;
        
        // Marc de la barra
        this.ctx.fillStyle = uiColors.border;
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Fons de la barra amb patró pixelat
        this.ctx.fillStyle = uiColors.background;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        for(let i = 0; i < barWidth; i += 4) {
            for(let j = 0; j < barHeight; j += 4) {
                if((i + j) % 8 === 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(barX + i, barY + j, 2, 2);
                }
            }
        }
        
        // Barra de progrés pixelada
        const progress = (this.duki.buildingProgress / 100) * barWidth;
        this.ctx.fillStyle = uiColors.progressBar;
        for(let i = 0; i < progress; i += 4) {
            this.ctx.fillRect(barX + i, barY, 3, barHeight);
            
            // Efecte de brillantor
            if(i % 8 === 0) {
                this.ctx.fillStyle = uiColors.progressBarHighlight;
                this.ctx.fillRect(barX + i, barY, 2, barHeight/2);
                this.ctx.fillStyle = uiColors.progressBar;
            }
        }
        
        // Text amb estil pixelat
        this.ctx.fillStyle = uiColors.textShadow;
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.fillText(`Progrés: ${Math.floor(this.duki.buildingProgress)}%`, barX + 11, barY + 15);
        this.ctx.fillStyle = uiColors.text;
        this.ctx.fillText(`Progrés: ${Math.floor(this.duki.buildingProgress)}%`, barX + 10, barY + 14);
        
        // Inventari amb estil 8 bits
        const inventoryX = 10;
        const inventoryY = this.gameHeight - 40;
        
        // Marc de l'inventari
        this.ctx.fillStyle = uiColors.border;
        this.ctx.fillRect(inventoryX - 2, inventoryY - 2, 204, 34);
        
        // Fons de l'inventari amb patró
        this.ctx.fillStyle = uiColors.background;
        this.ctx.fillRect(inventoryX, inventoryY, 200, 30);
        for(let i = 0; i < 200; i += 4) {
            for(let j = 0; j < 30; j += 4) {
                if((i + j) % 8 === 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(inventoryX + i, inventoryY + j, 2, 2);
                }
            }
        }
        
        // Text de l'inventari amb efecte
        this.ctx.fillStyle = uiColors.textShadow;
        this.ctx.fillText(`Items: ${this.duki.items.join(' | ')}`, inventoryX + 11, inventoryY + 21);
        this.ctx.fillStyle = uiColors.text;
        this.ctx.fillText(`Items: ${this.duki.items.join(' | ')}`, inventoryX + 10, inventoryY + 20);
        
        // Missatges amb estil retro
        if (this.ui.showMessage) {
            const msgX = (this.gameWidth - 300) / 2;
            const msgY = this.gameHeight - 100;
            
            // Marc del missatge
            this.ctx.fillStyle = uiColors.border;
            this.ctx.fillRect(msgX - 2, msgY - 2, 304, 84);
            
            // Fons del missatge amb patró
            this.ctx.fillStyle = uiColors.background;
            this.ctx.fillRect(msgX, msgY, 300, 80);
            for(let i = 0; i < 300; i += 4) {
                for(let j = 0; j < 80; j += 4) {
                    if((i + j) % 8 === 0) {
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                        this.ctx.fillRect(msgX + i, msgY + j, 2, 2);
                    }
                }
            }
            
            // Text del missatge
            const words = this.ui.message.split(' ');
            let line = '';
            let y = msgY + 25;
            
            this.ctx.font = '14px "Press Start 2P", monospace';
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                if (this.ctx.measureText(testLine).width > 280) {
                    // Ombra del text
                    this.ctx.fillStyle = uiColors.textShadow;
                    this.ctx.fillText(line, msgX + 11, y + 1);
                    // Text principal
                    this.ctx.fillStyle = uiColors.text;
                    this.ctx.fillText(line, msgX + 10, y);
                    
                    line = words[i] + ' ';
                    y += 20;
                } else {
                    line = testLine;
                }
            }
            
            // Última línia
            this.ctx.fillStyle = uiColors.textShadow;
            this.ctx.fillText(line, msgX + 11, y + 1);
            this.ctx.fillStyle = uiColors.text;
            this.ctx.fillText(line, msgX + 10, y);
            
            // Indicador per continuar amb parpelleig
            if (this.ui.messageTimer > 20 || Math.sin(time * 4) > 0) {
                this.ctx.fillStyle = uiColors.textShadow;
                this.ctx.fillText('Prem Enter...', msgX + 11, msgY + 71);
                this.ctx.fillStyle = uiColors.text;
                this.ctx.fillText('Prem Enter...', msgX + 10, msgY + 70);
            }
        }
        
        // Tooltip amb estil 8 bits
        if (this.ui.showTooltip) {
            const tooltipWidth = this.ctx.measureText(this.ui.tooltipText).width + 20;
            const tooltipX = this.ui.tooltipX - this.camera.x - tooltipWidth / 2;
            const tooltipY = this.ui.tooltipY - this.camera.y;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, 25);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(this.ui.tooltipText, tooltipX + 10, tooltipY + 17);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    checkProximity(obj1, obj2, distance) {
        const centerX1 = obj1.x + obj1.width / 2;
        const centerY1 = obj1.y + obj1.height / 2;
        const centerX2 = obj2.x + obj2.width / 2;
        const centerY2 = obj2.y + obj2.height / 2;
        
        const dx = centerX1 - centerX2;
        const dy = centerY1 - centerY2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist < distance;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Inicialitzar el joc quan es carrega la pàgina
function initDukiGame() {
    const game = new DukiGame('duki-game-canvas');
}

// Exportar la funció d'inicialització
window.initDukiGame = initDukiGame;