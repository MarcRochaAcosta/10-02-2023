// Joc 3D de Duki el gat - Estil Nintendogs/Talking Tom

class Duki3DGame {
    constructor(containerId) {
        // Configuració bàsica de Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.container = document.getElementById(containerId);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Configuració de la càmera
        this.camera.position.set(0, 1.5, 3);
        this.camera.lookAt(0, 0, 0);

        // Controls de l'OrbitControls per interactuar amb la càmera
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 5;
        this.controls.maxPolarAngle = Math.PI / 2;

        // Propietats de Duki
        this.duki = {
            hunger: 100,      // Nivell de gana
            happiness: 100,   // Nivell de felicitat
            energy: 100,      // Nivell d'energia
            hygiene: 100,     // Nivell d'higiene
            model: null,      // Model 3D del gat
            animations: {},   // Animacions del gat
            currentAction: null // Acció actual
        };

        // Estats del joc
        this.gameState = {
            isPlaying: false,
            currentActivity: null,
            lastFeedTime: Date.now(),
            lastPlayTime: Date.now(),
            lastSleepTime: Date.now(),
            lastBathTime: Date.now()
        };

        // Interfície d'usuari
        this.ui = {
            statsContainer: null,
            actionButtons: null
        };

        // Inicialitzar el joc
        this.init();
    }

    async init() {
        // Configurar la il·luminació
        this.setupLighting();

        // Carregar el model 3D de Duki
        await this.loadDukiModel();

        // Configurar l'habitació
        this.setupRoom();

        // Crear la interfície d'usuari
        this.createUI();

        // Iniciar els esdeveniments
        this.setupEventListeners();

        // Iniciar el bucle del joc
        this.gameLoop();
    }

    setupLighting() {
        // Llum ambient
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Llum direccional principal
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Configurar les ombres
        this.renderer.shadowMap.enabled = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
    }

    async loadDukiModel() {
        // Aquí carregarem el model 3D del gat
        // Utilitzarem un model temporal fins que tinguem el model definitiu
        const geometry = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(0, 0.8, 0),
            new THREE.Vector3(0.5, 0, 0)
        ]);
        const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        this.duki.model = new THREE.Mesh(geometry, material);
        this.scene.add(this.duki.model);
    }

    setupRoom() {
        // Crear el terra
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Crear les parets
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
        
        // Paret posterior
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial
        );
        backWall.position.z = -5;
        backWall.position.y = 2.5;
        this.scene.add(backWall);

        // Parets laterals
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial
        );
        leftWall.position.x = -5;
        leftWall.position.y = 2.5;
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            wallMaterial
        );
        rightWall.position.x = 5;
        rightWall.position.y = 2.5;
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
    }

    createUI() {
        // Crear contenidor d'estadístiques
        this.ui.statsContainer = document.createElement('div');
        this.ui.statsContainer.style.position = 'absolute';
        this.ui.statsContainer.style.top = '10px';
        this.ui.statsContainer.style.left = '10px';
        this.ui.statsContainer.style.padding = '10px';
        this.ui.statsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.ui.statsContainer.style.color = 'white';
        this.ui.statsContainer.style.borderRadius = '5px';
        this.container.appendChild(this.ui.statsContainer);

        // Crear botons d'acció
        this.ui.actionButtons = document.createElement('div');
        this.ui.actionButtons.style.position = 'absolute';
        this.ui.actionButtons.style.bottom = '10px';
        this.ui.actionButtons.style.left = '50%';
        this.ui.actionButtons.style.transform = 'translateX(-50%)';
        this.ui.actionButtons.style.display = 'flex';
        this.ui.actionButtons.style.gap = '10px';
        this.container.appendChild(this.ui.actionButtons);

        // Afegir botons d'acció
        const actions = ['Alimentar', 'Jugar', 'Dormir', 'Banyar'];
        actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action;
            button.style.padding = '10px 20px';
            button.style.borderRadius = '5px';
            button.style.border = 'none';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.onclick = () => this.handleAction(action.toLowerCase());
            this.ui.actionButtons.appendChild(button);
        });
    }

    setupEventListeners() {
        // Gestionar el redimensionament de la finestra
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Gestionar interaccions amb el gat
        this.renderer.domElement.addEventListener('click', (event) => {
            // Implementar interacció amb el gat
        });
    }

    handleAction(action) {
        switch(action) {
            case 'alimentar':
                this.feedDuki();
                break;
            case 'jugar':
                this.playWithDuki();
                break;
            case 'dormir':
                this.letDukiSleep();
                break;
            case 'banyar':
                this.batheDuki();
                break;
        }
    }

    feedDuki() {
        if (this.duki.hunger < 100) {
            this.duki.hunger = Math.min(100, this.duki.hunger + 30);
            this.duki.happiness += 10;
            this.gameState.lastFeedTime = Date.now();
            this.playAnimation('menjar');
        }
    }

    playWithDuki() {
        if (this.duki.energy > 20) {
            this.duki.happiness = Math.min(100, this.duki.happiness + 20);
            this.duki.energy -= 10;
            this.gameState.lastPlayTime = Date.now();
            this.playAnimation('jugar');
        }
    }

    letDukiSleep() {
        if (this.duki.energy < 100) {
            this.duki.energy = Math.min(100, this.duki.energy + 40);
            this.gameState.lastSleepTime = Date.now();
            this.playAnimation('dormir');
        }
    }

    batheDuki() {
        if (this.duki.hygiene < 100) {
            this.duki.hygiene = Math.min(100, this.duki.hygiene + 50);
            this.duki.happiness += 5;
            this.gameState.lastBathTime = Date.now();
            this.playAnimation('banyar');
        }
    }

    playAnimation(animationName) {
        // Implementar les animacions quan tinguem el model
        console.log(`Reproduint animació: ${animationName}`);
    }

    updateStats() {
        // Actualitzar els estats de Duki amb el temps
        const now = Date.now();
        const hourInMs = 3600000;

        // Disminuir la gana
        if (now - this.gameState.lastFeedTime > hourInMs / 12) {
            this.duki.hunger = Math.max(0, this.duki.hunger - 5);
            this.gameState.lastFeedTime = now;
        }

        // Disminuir la felicitat
        if (now - this.gameState.lastPlayTime > hourInMs / 8) {
            this.duki.happiness = Math.max(0, this.duki.happiness - 3);
            this.gameState.lastPlayTime = now;
        }

        // Disminuir l'energia
        if (now - this.gameState.lastSleepTime > hourInMs / 6) {
            this.duki.energy = Math.max(0, this.duki.energy - 2);
            this.gameState.lastSleepTime = now;
        }

        // Disminuir la higiene
        if (now - this.gameState.lastBathTime > hourInMs / 4) {
            this.duki.hygiene = Math.max(0, this.duki.hygiene - 1);
            this.gameState.lastBathTime = now;
        }

        // Actualitzar la UI
        this.ui.statsContainer.innerHTML = `
            <div>Gana: ${this.duki.hunger}%</div>
            <div>Felicitat: ${this.duki.happiness}%</div>
            <div>Energia: ${this.duki.energy}%</div>
            <div>Higiene: ${this.duki.hygiene}%</div>
        `;
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        // Actualitzar els controls de la càmera
        this.controls.update();

        // Actualitzar les estadístiques
        this.updateStats();

        // Actualitzar les animacions
        if (this.duki.model) {
            // Implementar actualitzacions d'animació
        }

        // Renderitzar l'escena
        this.renderer.render(this.scene, this.camera);
    }
}