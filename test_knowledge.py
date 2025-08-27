import os
import sys
import requests

# Add paths for proper imports
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from retriever import load_knowledge, get_context

# Test if knowledge.txt is found
knowledge = load_knowledge()
print(f"\nKnowledge base loaded? {'Yes' if knowledge else 'No'}")
print(f"Knowledge size: {len(knowledge)} characters")
print(f"First 100 chars: {knowledge[:100]}")

# Try a simple query
test_query = "What are the spa hours?"
response = get_context(test_query)
print(f"\nTest query: '{test_query}'")
print(f"Response: {response[:200]}...")

# Test Ollama connection
print("\nTesting Ollama connection...")
try:
    # Check if Ollama is available
    response = requests.get("http://localhost:11434/api/tags", timeout=2)
    print(f"Ollama API status code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Ollama is running and accessible")
        models = response.json()
        print(f"Available models: {models}")
        
        # Test a simple generation
        print("\nTesting Ollama generation...")
        payload = {
            "model": "mistral",
            "prompt": "What time is the spa open?",
            "stream": False,
            "options": {"temperature": 0.5}
        }
        gen_response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=10)
        print(f"Generate API status code: {gen_response.status_code}")
        if gen_response.status_code == 200:
            result = gen_response.json()
            print("✅ Generation successful")
            print(f"Response: {result.get('response', '')[:200]}...")
        else:
            print(f"❌ Generation failed: {gen_response.text[:200]}")
    else:
        print(f"❌ Ollama API responded with status code {response.status_code}")
except Exception as e:
    print(f"❌ Error connecting to Ollama: {str(e)}")

# Check file paths
print("\nChecking file paths:")
possible_paths = [
    'knowledge.txt',                            
    'Backend/knowledge.txt',                    
    '../Backend/knowledge.txt',                 
    os.path.join(os.path.dirname(__file__), 'knowledge.txt'),            
    os.path.join(os.path.dirname(__file__), 'Backend/knowledge.txt'),    
    os.path.join(os.path.dirname(__file__), 'Backend', 'knowledge.txt'), 
    os.path.abspath('Backend/knowledge.txt'),   
]

for path in possible_paths:
    exists = os.path.exists(path)
    abs_path = os.path.abspath(path)
    print(f"Path: {path}")
    print(f"  - Absolute: {abs_path}")
    print(f"  - Exists: {exists}")
