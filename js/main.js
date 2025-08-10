// Funcions generals
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicació carregada correctament');
    
    // Inicialitzar funcionalitats específiques segons la pàgina
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'fotos.html') {
        initPhotoGallery();
    } else if (currentPage === 'joc.html') {
        initGame();
    } else if (currentPage === 'notes.html') {
        initNotes();
    } else if (currentPage === 'moments.html') {
        initTimeline();
    }
});

// Funcionalitat per a l'àlbum de fotos
function initPhotoGallery() {
    // Implementar visualització de fotos amb efecte de zoom
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const modal = document.createElement('div');
            modal.classList.add('photo-modal');
            
            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');
            
            const img = document.createElement('img');
            img.src = imgSrc;
            
            const closeBtn = document.createElement('span');
            closeBtn.classList.add('close-modal');
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', function() {
                modal.remove();
            });
            
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(img);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Tancar modal fent clic a fora
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
    });
}

// Funcionalitat per al joc interactiu
function initGame() {
    // Joc senzill de memòria
    const gameContainer = document.querySelector('.game-container');
    const startButton = document.getElementById('start-game');
    
    if (startButton) {
        startButton.addEventListener('click', function() {
            startMemoryGame();
        });
    }
}

function startMemoryGame() {
    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) return;
    
    gameBoard.innerHTML = '';
    
    // Crear parelles de cartes amb emojis relacionats amb l'amor
    const emojis = ['❤️', '💕', '😘', '🌹', '💍', '🎁', '🥰', '💑'];
    const cards = [...emojis, ...emojis];
    
    // Barrejar les cartes
    shuffleArray(cards);
    
    let flippedCards = [];
    let matchedPairs = 0;
    
    // Crear el tauler de joc
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = emoji;
        
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = emoji;
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        card.addEventListener('click', function() {
            // Evitar clicar la mateixa carta o cartes ja emparellades
            if (card.classList.contains('flipped') || card.classList.contains('matched')) {
                return;
            }
            
            // Girar la carta
            card.classList.add('flipped');
            flippedCards.push(card);
            
            // Comprovar si hi ha dues cartes girades
            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                
                // Comprovar si són parella
                if (card1.dataset.value === card2.dataset.value) {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    flippedCards = [];
                    
                    // Comprovar si s'ha completat el joc
                    if (matchedPairs === emojis.length) {
                        setTimeout(() => {
                            alert('Felicitats! Has completat el joc! ❤️');
                        }, 500);
                    }
                } else {
                    // Si no són parella, girar-les de nou
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        flippedCards = [];
                    }, 1000);
                }
            }
        });
        
        gameBoard.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'https://api.jsonbin.io/v3/b/68974b2cae596e708fc5efdd';
    const API_KEY = '$2a$10$MF8uIEUb4wMPTRhgQmdfZO/Lu6C3CTFvjril16xqSJ91a221AY4ma';

    const commentForm = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments-container');

    async function loadComments() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            if (!response.ok) throw new Error('No comments found');
            const data = await response.json();
            displayComments(data.record);
        } catch (error) {
            console.log('No comments yet');
            commentsContainer.innerHTML = '<p class="no-comments">Be the first to leave a comment!</p>';
        }
    }

    function displayComments(comments) {
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `<h4>${comment.name}</h4><p>${comment.comment}</p>`;
            commentsContainer.appendChild(commentElement);
        });
    }

    async function saveComment(commentData) {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            let comments = data.record || [];

            comments.push(commentData);

            await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(comments)
            });

            displayComments(comments);
        } catch (error) {
            console.error('Error:', error.message);
            alert(error.message);
        }
    }

    commentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('name');
        const commentInput = document.getElementById('comment');

        const commentData = {
            name: nameInput.value,
            comment: commentInput.value
        };

        await saveComment(commentData);

        nameInput.value = '';
        commentInput.value = '';
    });

    loadComments();
});

// Funcionalitat per a les notes d'amor
function initNotes() {
    const noteForm = document.querySelector('.note-form');
    const notesList = document.querySelector('.notes-list');

    // Carregar notes del servidor
    fetch('php/load_notes.php')
        .then(res => res.json())
        .then(notes => {
            notesList.innerHTML = '';
            notes.forEach(note => addNoteToDOM(note.text, note.date));
        })
        .catch(err => console.error('Error carregant notes:', err));

    if (noteForm) {
        noteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const noteText = document.getElementById('note-text').value.trim();
            if (noteText === '') return;

            const noteDate = new Date().toLocaleDateString('ca-ES');
            addNoteToDOM(noteText, noteDate);

            // Enviar al servidor
            const formData = new FormData();
            formData.append('note', noteText);

            fetch('php/save_notes.php', {
                method: 'POST',
                body: formData
            }).catch(err => console.error('Error guardant nota:', err));

            document.getElementById('note-text').value = '';
        });
    }
}

function addNoteToDOM(text, date) {
    const notesList = document.querySelector('.notes-list');
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');

    const noteContent = document.createElement('p');
    noteContent.textContent = text;

    const noteDate = document.createElement('div');
    noteDate.classList.add('date');
    noteDate.textContent = date;

    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteDate);
    notesList.prepend(noteCard);
}

function addNoteToDOM(text, date) {
    const notesList = document.querySelector('.notes-list');
    const noteCard = document.createElement('div');
    noteCard.classList.add('note-card');

    const noteContent = document.createElement('p');
    noteContent.textContent = text;

    const noteDate = document.createElement('div');
    noteDate.classList.add('date');
    noteDate.textContent = date;

    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteDate);
    notesList.prepend(noteCard);
}


function saveNotes() {
    const notesList = document.querySelector('.notes-list');
    if (!notesList) return;
    
    const notes = [];
    const noteCards = notesList.querySelectorAll('.note-card');
    
    noteCards.forEach(card => {
        const text = card.querySelector('p').textContent;
        const date = card.querySelector('.date').textContent;
        notes.push({ text, date });
    });
    
    localStorage.setItem('loveNotes', JSON.stringify(notes));
}

function loadNotes() {
    const notesList = document.querySelector('.notes-list');
    if (!notesList) return;
    
    const savedNotes = localStorage.getItem('loveNotes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        
        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');
            
            const noteContent = document.createElement('p');
            noteContent.textContent = note.text;
            
            const noteDate = document.createElement('div');
            noteDate.classList.add('date');
            noteDate.textContent = note.date;
            
            noteCard.appendChild(noteContent);
            noteCard.appendChild(noteDate);
            
            notesList.appendChild(noteCard);
        });
    }
}

// Funcionalitat per a la línia de temps
function initTimeline() {
    // Implementar animacions per a la línia de temps
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length > 0) {
        // Afegir animació d'aparició a mesura que es fa scroll
        window.addEventListener('scroll', function() {
            timelineItems.forEach(item => {
                const itemTop = item.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (itemTop < windowHeight * 0.8) {
                    item.classList.add('visible');
                }
            });
        });
        
        // Disparar l'esdeveniment de scroll per mostrar els elements visibles inicialment
        window.dispatchEvent(new Event('scroll'));
    }
}

// Utilitats
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}