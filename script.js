// --- AUDIO HANDLING ---
const bgMusic = document.getElementById('bg-music');
const sfxClick = document.getElementById('sfx-click');
const sfxWoosh = document.getElementById('sfx-woosh');
const sfxWin = document.getElementById('sfx-win');
const muteBtn = document.getElementById('mute-btn');
let isMuted = true; 

function playSound(audio) {
    if (!isMuted) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio prevented: User interaction needed first"));
    }
}

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    if(!isMuted) {
        bgMusic.play().catch(e => console.log("Bg music prevented"));
    } else {
        bgMusic.pause();
    }
});

// --- STAGE NAVIGATION ---
function showStage(stageId) {
    // Hide all stages
    document.querySelectorAll('.stage').forEach(el => el.classList.remove('active'));
    // Show specific stage with slight delay for smooth feel
    setTimeout(() => {
        document.getElementById(stageId).classList.add('active');
    }, 100); 
}

// --- STAGE 1: NO BUTTON LOGIC ---
const noBtn = document.getElementById('no-btn');
let noAttempts = 0;

const moveButton = () => {
    if (noAttempts < 3) {
        playSound(sfxWoosh);
        // Calculate random position within viewport
        // Subtract button size (approx 100px) so it doesn't go off screen
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
        
        noAttempts++;
    } else {
        // Reset position logic so it can be clicked
        noBtn.style.position = 'relative';
        noBtn.style.left = 'auto';
        noBtn.style.top = 'auto';
    }
};

noBtn.addEventListener('mouseover', moveButton);
noBtn.addEventListener('touchstart', (e) => { 
    // Only prevent default if we are moving the button, otherwise allow click
    if(noAttempts < 3) {
        e.preventDefault(); 
        moveButton(); 
    }
});

noBtn.addEventListener('click', () => {
    if (noAttempts >= 3) {
        playSound(sfxClick);
        showStage('stage-2');
    }
});

// --- STAGE 2: SIGNATURE ---
const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
const submitSig = document.getElementById('submit-sig');
let isDrawing = false;
let hasSigned = false;

// Handle High DPI screens for sharper text/lines
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startDraw(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    if (!hasSigned) {
        hasSigned = true;
        submitSig.disabled = false;
    }
}

function endDraw() { isDrawing = false; }

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.type.includes('mouse') ? e.offsetX : e.touches[0].clientX - rect.left;
    const y = e.type.includes('mouse') ? e.offsetY : e.touches[0].clientY - rect.top;
    return { x, y };
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
canvas.addEventListener('touchend', endDraw);

submitSig.addEventListener('click', () => {
    playSound(sfxClick);
    showStage('stage-3');
});

// --- STAGE 3: THE WHEEL ---
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');

spinBtn.addEventListener('click', () => {
    playSound(sfxClick);
    
    // Spin logic
    const randomDeg = 1800 + Math.floor(Math.random() * 360); 
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning...";

    // Wait for 4 seconds (matching CSS transition)
    setTimeout(() => {
        goToVictory();
    }, 4000);
});

// --- STAGE 4: VICTORY ---
// Need to define this globally so the HTML onclick="goToVictory()" can find it
window.goToVictory = function() {
    playSound(sfxWin);
    showStage('stage-4');
    triggerConfetti();
}

function triggerConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const random = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}
