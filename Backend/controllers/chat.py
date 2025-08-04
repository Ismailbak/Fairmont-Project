# backend/controllers/chat.py

import requests
from retriever import get_context

def generate_ai_response(message: str):
    context = get_context(message)

    payload = {
        "model": "mistral",
        "prompt": f"### Hotel Knowledge:\n{context}\n\n### Question:\n{message}\n\n### Answer:",
        "stream": False
    }

    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        data = response.json()
        return data.get("response", "No response from model")
    except Exception as e:
        return f"Error: {str(e)}"
