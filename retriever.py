import os
import sys


# Basic stopword list
STOPWORDS = {
    "hi", "hello", "hey", "please", "thanks", "thank", "you", "is", "the",
    "a", "an", "to", "of", "and", "are", "be", "on", "me", "do", "how", "i",
    "can", "tell", "does", "it", "about", "open", "what", "time", "when"
}

# Load the hotel knowledge base
def load_knowledge(file_path='knowledge.txt') -> str:
    if not os.path.exists(file_path):
        print("[DEBUG] ❌ knowledge.txt not found.")
        return ""
    with open(file_path, 'r', encoding='utf-8') as f:
        print("[DEBUG] ✅ Loaded knowledge.txt")
        return f.read()

# Match relevant lines based on filtered keywords
def get_context(user_input: str) -> str:
    print(f"[DEBUG] Incoming message: {user_input}")
    knowledge = load_knowledge()
    lines = knowledge.split('\n')

    # Clean and filter keywords
    tokens = user_input.lower().split()
    keywords = [word for word in tokens if word not in STOPWORDS]
    print("[DEBUG] Filtered keywords:", keywords)

    if not keywords:
        return "Welcome to Fairmont. Please ask a specific question and I’ll assist you."

    # Match lines
    matched_lines = []
    for line in lines:
        line_lower = line.lower().strip()
        if len(line_lower) < 5:
            continue

        match_score = sum(1 for kw in keywords if kw in line_lower)
        if match_score > 0:
            matched_lines.append((match_score, line.strip()))

    # Sort by relevance (most keywords matched)
    matched_lines.sort(reverse=True, key=lambda tup: tup[0])
    top_matches = [line for _, line in matched_lines[:5]]

    if not top_matches:
        return "I couldn't find an exact match, but I’d be happy to help with more details."

    result = "\n".join(top_matches)
    print("[DEBUG] Retrieved context:\n" + result)
    return result

# CLI test
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_message = sys.argv[1]
        context = get_context(user_message)
        print(context)
    else:
        print("No message provided.")
