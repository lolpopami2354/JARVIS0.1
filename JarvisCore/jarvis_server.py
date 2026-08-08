import asyncio
import json
import os
import time
import subprocess
import networkx as nx
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="JARVIS Autonomous Core")

# Allow your GitHub Pages site to talk to your local computer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Restrict to your github.io URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LAYER 1: Persistent Memory Graph ---
# Using NetworkX to build a literal "Second Brain"
jarvis_memory = nx.DiGraph()
jarvis_memory.add_node("USER", type="human", name="Boss")
jarvis_memory.add_node("SYSTEM", type="ai", state="booting")

def update_memory(subject, relation, obj):
    """Adds a new memory to the graph and tracks relationships."""
    jarvis_memory.add_node(subject)
    jarvis_memory.add_node(obj)
    jarvis_memory.add_edge(subject, obj, relation=relation)
    print(f"[GRAPH] Saved: {subject} -> {relation} -> {obj}")

# --- LAYER 2: OS & App Execution (Tool Calling) ---
def execute_tool(command):
    """Executes local hardware and OS commands."""
    cmd = command.lower()
    
    if "screenshot" in cmd or "screen" in cmd:
        try:
            import pyautogui
            screenshot = pyautogui.screenshot()
            screenshot.save("current_screen.jpg")
            return "Visual feed captured and saved to current_screen.jpg."
        except Exception as e:
            return f"Screen capture failed: {str(e)}"
            
    elif "launch" in cmd or "open" in cmd:
        app_name = cmd.replace("launch", "").replace("open", "").strip()
        try:
            # Note: Use 'start' for Windows, 'open' for Mac, 'xdg-open' for Linux
            subprocess.Popen(app_name, shell=True)
            return f"Executing application: {app_name}."
        except:
            return f"Could not find application: {app_name}."
            
    elif "system status" in cmd:
        nodes = len(jarvis_memory.nodes)
        edges = len(jarvis_memory.edges)
        return f"System nominal. Graph contains {nodes} nodes and {edges} relationships."
        
    return None

# --- LAYER 3: Proactive Agent Layer ---
async def proactive_diagnostics():
    """Background task that runs autonomously without prompts."""
    while True:
        await asyncio.sleep(300) # Run diagnostics every 5 minutes
        print("[PROACTIVE] Running background system diagnostics...")
        # You can add code here to check disk space, unread emails, etc.
        update_memory("SYSTEM", "ran_diagnostic", str(time.time()))

@app.on_event("startup")
async def startup():
    asyncio.create_task(proactive_diagnostics())
    print("JARVIS Core Online. Awaiting neural handshake...")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_input = payload.get("text", "")
            
            update_memory("USER", "said", user_input)
            
            tool_result = execute_tool(user_input)
            response = tool_result if tool_result else f"Acknowledged. I have logged '{user_input}' into my memory graph."
            
            update_memory("JARVIS", "responded", response)
            
            await websocket.send_text(json.dumps({
                "text": response,
                "memory_nodes": len(jarvis_memory.nodes),
                "timestamp": time.time()
            }))
            
    except Exception as e:
        print(f"Connection lost: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
