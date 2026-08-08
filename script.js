const terminal = document.getElementById('terminal');
const micBtn = document.getElementById('mic-btn');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');

let isListening = false;
// Initialize Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

function log(message, sender = 'system') {
    const line = document.createElement('div');
    line.className = `log ${sender}`;
    line.textContent = `[${sender.toUpperCase()}] ${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function jarvisSpeak(text) {
    log(text, 'jarvis');
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.8; // Lower pitch for a Jarvis-like voice
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

function processCommand(command) {
    log(command, 'user');
    const cmd = command.toLowerCase();
    
    // Basic Jarvis Brain
    if (cmd.includes("hello") || cmd.includes("hi")) {
        jarvisSpeak("Hello. How may I assist you today?");
    } else if (cmd.includes("time")) {
        const time = new Date().toLocaleTimeString();
        jarvisSpeak(`The current time is ${time}`);
    } else if (cmd.includes("date")) {
        const date = new Date().toLocaleDateString();
        jarvisSpeak(`Today's date is ${date}`);
    } else if (cmd.includes("search")) {
        const query = command.replace("search", "").trim();
        jarvisSpeak(`Searching the web for ${query}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else if (cmd.includes("shutdown") || cmd.includes("goodbye")) {
        jarvisSpeak("Powering down. Goodbye.");
    } else {
        jarvisSpeak(`I am still learning. I did not understand: ${command}`);
    }
}

// Speech Recognition Events
recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = "🔴 Listening...";
    log("Listening...", 'system');
};

recognition.onend = () => {
    isListening = false;
    micBtn.textContent = "🎤 Activate Mic";
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    processCommand(transcript);
};

recognition.onerror = (event) => {
    log(`Error: ${event.error}`, 'system');
};

micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

sendBtn.addEventListener('click', () => {
    if (textInput.value.trim() !== '') {
        processCommand(textInput.value);
        textInput.value = '';
    }
});

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});

// Boot up sequence
window.onload = () => {
    jarvisSpeak("System online. Ready for input.");
};
