# backend/controllers/chat.py

import sys
import os
import time
import threading
import json
import requests
import traceback

# Configure path for retriever
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from retriever import get_context

# Cache system for performance optimization
_RESPONSE_CACHE = {}
_CACHE_LOCK = threading.Lock()
_CACHE_TTL = 604800  # Cache responses for 7 days (604800 seconds)
_CACHE_MAX_SIZE = 1000  # Increased maximum cache size
_CACHE_HITS = 0  # Track cache hit rate
_CACHE_MISSES = 0  # Track cache miss rate

def check_ollama_status():
    """Check if Ollama is available and return status"""
    try:
        # Test response with a simple request - no timeout
        print("[DEBUG] Checking Ollama availability...")
        response = requests.get("http://localhost:11434/api/tags")
        status = response.status_code == 200
        print(f"[DEBUG] Ollama available: {status}")
        return status
    except Exception as e:
        print(f"[DEBUG] Ollama check error: {str(e)}")
        return False

def generate_ai_response(message: str):
    """Generate a response using the AI model, enhanced with knowledge base context."""
    start_time = time.time()

    # Single retriever call: we'll always pass context to the model, but we won't
    # use the retriever as a replacement for the model's generation.
    context = get_context(message)


    # Truncate context to keep prompt size reasonable for faster generation
    if context is None:
        context = ""
    max_context_chars = 4000
    if len(context) > max_context_chars:
        context = context[:max_context_chars].rsplit('\n', 1)[0] + "..."

    # Always call the model, regardless of context
    system_prompt = (
        "You are Fairmont Tazi Palace Tangier's AI Assistant, an expert in hotel services, guest experience, and local information. "
        "Always answer as a helpful, concise, and professional concierge. "
        "Use only the provided HOTEL KNOWLEDGE and context to answer. "
        "If the answer is not in the knowledge, politely say you do not have that information. "
        "Never invent details, never repeat the user's question, and never provide generic or unrelated responses. "
        "Keep replies under 80 words unless more detail is specifically requested. "
    )

    prompt = (
        f"{system_prompt}\n"
        f"HOTEL KNOWLEDGE:\n{context}\n\n"
        f"Guest: {message}\nAssistant:"
    )

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 128,
            "temperature": 0.2,
            "top_p": 0.9,
            "top_k": 10,
            "max_length": 512
        }
    }

    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        if response.status_code != 200:
            print(f"[ERROR] Model API returned {response.status_code}")
            return "I apologize, the assistant is temporarily unable to generate a response. Please try again shortly."

        data = response.json()
        ai_response = data.get("response", "").strip()

        if not ai_response:
            return "I apologize, I'm unable to generate an answer right now. Please try again."

        # Post-process: avoid echoing user's exact question
        user_lower = message.lower().strip()
        if ai_response.lower().startswith(user_lower):
            ai_response = ai_response[len(message):].strip()

        # Cache the model response for faster repeat answers
        cache_key = message.lower().strip()
        with _CACHE_LOCK:
            if len(_RESPONSE_CACHE) >= _CACHE_MAX_SIZE:
                items_to_remove = max(1, int(_CACHE_MAX_SIZE * 0.1))
                oldest_keys = sorted(_RESPONSE_CACHE.keys(), key=lambda k: _RESPONSE_CACHE[k]['timestamp'])[:items_to_remove]
                for k in oldest_keys:
                    del _RESPONSE_CACHE[k]
            _RESPONSE_CACHE[cache_key] = {'response': ai_response, 'timestamp': time.time()}

        return ai_response

    except Exception:
        print(traceback.format_exc())
        return "I apologize — the assistant is currently experiencing issues generating responses. Please try again in a moment."
