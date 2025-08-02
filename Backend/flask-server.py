from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load knowledge base into memory
def load_knowledge(file_path='knowledge.txt'):
    if not os.path.exists(file_path):
        return ""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

# Retrieve context based on simple keyword matching
def get_context(user_input: str) -> str:
    knowledge = load_knowledge()
    lines = knowledge.split('\n')

    relevant_lines = []
    keywords = user_input.lower().split()

    for line in lines:
        for keyword in keywords:
            if keyword in line.lower():
                relevant_lines.append(line)
                break

    if not relevant_lines:
        return "General hotel information may help you."

    return "\n".join(relevant_lines)

@app.route('/')
def home():
    return jsonify({"message": "Fairmont AI Backend is running!"})

@app.route('/api/health')
def health():
    return jsonify({"status": "OK", "timestamp": "2025-08-02T10:00:00Z"})

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Use the original retriever logic
        context = get_context(message)
        
        return jsonify({
            "success": True,
            "context": context,
            "originalMessage": message
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Fairmont AI Backend...")
    print("Server will be available at http://localhost:5000")
    app.run(host='0.0.0.0', port=8000, debug=True) 