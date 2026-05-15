// ── Colour pool ──
const COLORS = ['#e74c3c','#27ae60','#2980b9','#f1c40f','#f1a7c0','#9b59b6'];
let colorIndex = 0;
const nextColor = () => { const c = COLORS[colorIndex]; colorIndex = (colorIndex + 1) % COLORS.length; return c; };

// ── Queue data ──
const queue = [];
const MAX = 5;          // max visible blocks in the row
let running = false;
let intervalId = null;
let ops = 0;

const queueRow    = document.getElementById('queueRow');
const deqBlock    = document.getElementById('dequeueBlock');
const enqBlock    = document.getElementById('enqueueBlock');
const sizeDisplay = document.getElementById('sizeDisplay');
const frontDisplay= document.getElementById('frontDisplay');
const rearDisplay = document.getElementById('rearDisplay');
const opsDisplay  = document.getElementById('opsDisplay');
const startBtn    = document.getElementById('startBtn');
const stopBtn     = document.getElementById('stopBtn');

// ── Seed queue ──
function seedQueue() {
    for (let i = 0; i < 4; i++) queue.push(nextColor());
    renderQueue();
    updateInfo();
}

function renderQueue() {
    queueRow.innerHTML = '';
    queue.forEach(color => {
        const div = document.createElement('div');
        div.className = 'q-block';
        div.style.background = color;
        queueRow.appendChild(div);
    });
}

function updateInfo() {
    sizeDisplay.textContent  = queue.length;
    frontDisplay.textContent = queue.length ? colorName(queue[0])  : '—';
    rearDisplay.textContent  = queue.length ? colorName(queue[queue.length-1]) : '—';
    opsDisplay.textContent   = ops;
}

function colorName(hex) {
    const map = {
        '#e74c3c':'RED','#27ae60':'GREEN','#2980b9':'BLUE',
        '#f1c40f':'YELLOW','#f1a7c0':'PINK','#9b59b6':'PURPLE'
    };
    return map[hex] || hex;
}

// ── One tick: dequeue front, enqueue new ──
async function tick() {
    if (!running) return;

    const newColor = nextColor();

    // 1. Show incoming block at bottom-right
    enqBlock.style.background = newColor;
    enqBlock.classList.add('show');

    await delay(600);

    // 2. Remove dequeue-block animation if any, then show dequeue block
    if (queue.length > 0) {
        const frontColor = queue[0];
        deqBlock.style.background = frontColor;
        deqBlock.classList.remove('fly-up');
        deqBlock.classList.add('show');

        // Animate first queue block sliding out
        const firstBlock = queueRow.firstElementChild;
        if (firstBlock) {
            firstBlock.classList.add('slide-out');
        }

        await delay(500);

        // Remove from data queue
        queue.shift();

        // Fly dequeue block up
        deqBlock.classList.add('fly-up');

        // Add new color to queue data
        queue.push(newColor);

        // Hide enqueue block
        enqBlock.classList.remove('show');

        // Re-render queue with slide-in on last item
        renderQueue();
        const blocks = queueRow.querySelectorAll('.q-block');
        if (blocks.length > 0) {
            blocks[blocks.length - 1].classList.add('slide-in');
        }

        ops++;
        updateInfo();

        await delay(600);
        deqBlock.classList.remove('show','fly-up');
    } else {
        // queue empty, just enqueue
        queue.push(newColor);
        enqBlock.classList.remove('show');
        renderQueue();
        const blocks = queueRow.querySelectorAll('.q-block');
        if (blocks.length) blocks[blocks.length-1].classList.add('slide-in');
        ops++;
        updateInfo();
    }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Controls ──
startBtn.addEventListener('click', () => {
    if (running) return;
    running = true;
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    intervalId = setInterval(tick, 2000);
    tick(); // run immediately
});

stopBtn.addEventListener('click', () => {
    running = false;
    clearInterval(intervalId);
    startBtn.disabled = false;
    stopBtn.disabled  = true;

    // clean up any lingering blocks
    deqBlock.classList.remove('show','fly-up');
    enqBlock.classList.remove('show');
});

// ── Init ──
seedQueue();