import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs, urlparse

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

class ChatHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"status": "OK", "timestamp": "2025-08-02T10:00:00Z"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"message": "Fairmont AI Backend is running!"}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                message = data.get('message', '')
                
                if not message:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = {"error": "Message is required"}
                    self.wfile.write(json.dumps(response).encode())
                    return
                
                # Use the original retriever logic
                context = get_context(message)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "success": True,
                    "context": context,
                    "originalMessage": message
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"error": str(e)}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

PORT = 9000

with socketserver.TCPServer(("", PORT), ChatHandler) as httpd:
    print(f"Server running on port {PORT}")
    print(f"API available at http://localhost:{PORT}")
    print(f"API available at http://10.16.21.177:{PORT}")
    httpd.serve_forever() 