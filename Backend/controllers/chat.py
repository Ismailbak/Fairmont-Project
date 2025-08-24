# backend/controllers/chat.py



import requests
import sys
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from retriever import get_context

def generate_ai_response(message: str):
    context = get_context(message)

    # Use a smaller model and limit output length for CPU
    payload = {
        "model": "llama2",  # Use llama2 for faster CPU inference if available
        "prompt": f"Q: {message}\nA:",
        "stream": False,
        "options": {"num_predict": 64}
    }

    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        data = response.json()
        return data.get("response", "No response from model")
    except Exception as e:
        return f"Error: {str(e)}"
