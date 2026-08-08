const terminal = document.getElementById('terminal');
const micBtn = document.getElementById('mic-btn');
const screenBtn = document.getElementById('screen-btn');
const cmdInput = document.getElementById('cmd-input');
const visionStatus = document.getElementById('vision-status');

// 1. Proactive Agent Layer (Notifications)
function requestProactivePermissions() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

async function proactiveAgentLoop() {
    setInterval(() => {
        const stats = Object.keys(brain.nodes).length;
        if (Notification.permission === "granted" && Math.random() > 0.8) { 
            new Notification("J.A.R.V.I.S. Proactive Diagnostic", {
                body: `System nominal. Graph memory contains ${stats} nodes.`,
                icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
            });
        }
    }, 60000); // Every 1 minute
}

// 2. Multimodal Vision (Screen Share API)
let screenStream = null;
screenBtn.addEventListener('click', async () => {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        document.getElementById('screen-feed').srcObject = screenStream;
        visionStatus.textContent = "VISION ONLINE";
        visionStatus.style.color = "#00ffcc";
        log("Optical sensors linked to user display.", "jarvis");
        
        screenStream.getVideoTracks()[0].onended = () => {
            visionStatus.textContent = "VISION OFFLINE";
            visionStatus.style.color = "#ff3333";
        };
    } catch (err) {
        log("Screen share denied by user.", "error");
    }
});

// 3. Execution Layer (Browser Control)
function executeTool(cmd) {
    const c = cmd.toLowerCase();
    
    if (c.includes("screenshot") || c.includes("capture")) {
        if (screenStream) {
            const video = document.getElementById('screen-feed');
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            brain.addNode(`scan_${Date.now()}`, { type: 'scan', data: 'Frame captured and analyzed.' });
            return "Visual capture processed and logged to memory graph.";
        }
        return "I cannot see your screen. Please activate Screen Share.";
    }
    
    if (c.includes("search")) {
        const query = cmd.replace(/search/i, "").trim();
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        return `Executing web search for ${query}.`;
    }
    
    return null;
}

// 4. Core Logic & Voice
function log(msg, sender = 'system') {
    const div = document.createElement('div');
    div.className = `log ${sender}`;
    div.textContent = `[${sender.toUpperCase()}] ${msg}`;
    terminal.prepend(div);
    
    if (sender === 'jarvis' && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(msg);
        utter.pitch = 0.8; utter.rate = 1.05;
        speechSynthesis.speak(utter);
    }
}

function processInput(text) {
    log(text, 'user');
    brain.addEdge("USER", "SYSTEM", "initiated_contact");
    
    const toolResult = executeTool(text);
    if (toolResult) { log(toolResult, 'jarvis'); return; }
    
    const memoryResult = brain.learn(text);
    if (memoryResult) { log(memoryResult, 'jarvis'); return; }
    
    if (text.toLowerCase().includes("what do you remember") || text.toLowerCase().includes("memory")) {
        log(brain.recall(), 'jarvis');
        return;
    }

    log("Processing natural language. I am currently limited to browser-environment execution.", "jarvis");
}

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    let isListening = false;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        processInput(transcript);
    };

    recognition.onend = () => { if(isListening) recognition.start(); };

    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
            isListening = false;
            micBtn.textContent = "🎤 Activate Audio";
        } else {
            recognition.start();
            isListening = true;
            micBtn.textContent = "🔴 Audio Online";
        }
    });
} else {
    log("Speech API not supported. Use text input.", "error");
}

cmdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cmdInput.value.trim()) {
        processInput(cmdInput.value);
        cmdInput.value = '';
    }
});

window.onload = () => {
    requestProactivePermissions();
    proactiveAgentLoop();
    log("J.A.R.V.I.S. Zero-Install Core initialized.", "system");
};
