import os
import sys

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

# Main function to handle command line arguments
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_message = sys.argv[1]
        context = get_context(user_message)
        print(context)
    else:
        print("No message provided")
