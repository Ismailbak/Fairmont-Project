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
    max_context_chars = 4000  # Remove word/length limit for context
    if len(context) > max_context_chars:
        context = context[:max_context_chars].rsplit('\n', 1)[0] + "..."

    # Streamlined system prompt aimed at concise answers and speed
    system_prompt = (
        "You are Fairmont Tazi Palace Tangier's AI Assistant.\n"
        "Be concise, professional, and helpful. Prioritize direct answers and keep replies under 100 words when possible.\n"
    )

    # Assemble prompt
    prompt = (
        f"{system_prompt}\n"
        f"HOTEL KNOWLEDGE:\n{context}\n\n"
        f"Guest: {message}\nAssistant:"
    )

    # Tuned generation options for lower latency while retaining quality
    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 128,      # Allow longer responses
            "temperature": 0.2,
            "top_p": 0.9,
            "top_k": 10,
            "max_length": 512       # Allow longer responses
        }
    }

    try:
        # Make the model call (no timeout per your request)
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
                # prune 10% oldest entries
                items_to_remove = max(1, int(_CACHE_MAX_SIZE * 0.1))
                oldest_keys = sorted(_RESPONSE_CACHE.keys(), key=lambda k: _RESPONSE_CACHE[k]['timestamp'])[:items_to_remove]
                for k in oldest_keys:
                    del _RESPONSE_CACHE[k]
            _RESPONSE_CACHE[cache_key] = {'response': ai_response, 'timestamp': time.time()}

        return ai_response

    except Exception:
        print(traceback.format_exc())
        return "I apologize — the assistant is currently experiencing issues generating responses. Please try again in a moment."
    
    # Check if we have a cached response - optimized for performance
    cache_check_start = time.time()
    message_lower = message.lower().strip()
    cache_key = message_lower
    global _CACHE_HITS, _CACHE_MISSES
    
    with _CACHE_LOCK:
        if cache_key in _RESPONSE_CACHE:
            cached_item = _RESPONSE_CACHE[cache_key]
            # Check if cache is still valid
            if (time.time() - cached_item['timestamp']) < _CACHE_TTL:
                _CACHE_HITS += 1
                cache_time = time.time() - cache_check_start
                hit_rate = (_CACHE_HITS / (_CACHE_HITS + _CACHE_MISSES)) * 100
                print(f"[TIMING] Cache check: {cache_time:.3f}s - HIT (rate: {hit_rate:.1f}%)")
                print(f"[TIMING] Total response time (cached): {time.time() - start_time:.3f}s")
                print(f"{'='*50}\n")
                return cached_item['response']
    
    _CACHE_MISSES += 1
    cache_time = time.time() - cache_check_start
    hit_rate = 0 if _CACHE_HITS == 0 else (_CACHE_HITS / (_CACHE_HITS + _CACHE_MISSES)) * 100
    print(f"[TIMING] Cache check: {cache_time:.3f}s - MISS (rate: {hit_rate:.1f}%)")
    
    # Get context - measure time
    context_start = time.time()
    raw_context = get_context(message)
    context_time = time.time() - context_start
    print(f"[TIMING] Context retrieval: {context_time:.3f}s - Size: {len(raw_context)} chars")
    
    # Optimized context formatting for better model performance
    if raw_context and not raw_context.startswith("I couldn't find"):
        # Format context with minimal overhead for faster processing
        context = (
            f"RELEVANT INFORMATION:\n"
            f"{raw_context}\n\n"
            f"USE THIS INFORMATION TO ANSWER THE QUESTION CONCISELY."
        )
    else:
        context = raw_context
    
    # If context contains a direct answer (from fast-path), use it
    if len(context.split('\n')) == 1 and not context.startswith("I couldn't find"):
        print("[DEBUG] Using fast-path response directly")
        
        # Cache the response
        with _CACHE_LOCK:
            _RESPONSE_CACHE[cache_key] = {
                'response': context,
                'timestamp': time.time()
            }
        
        return context
    
    # Streamlined system prompt focused on performance and quick, quality responses
    system_prompt = """You are Fairmont Tazi Palace Tangier's AI Assistant.

CORE INSTRUCTIONS:
- Be concise but warm and professional
- Never repeat the user's question
- Respond quickly and accurately
- Focus on the most relevant information
- Address ALL queries, even simple greetings
- Use confident, authoritative language about hotel features
- Be helpful and welcoming
"""
    # Removed duplicate/unfinished payload block. Only the correct payload assignment is kept above.

    try:
        # Streamlined prompt preparation - measure time
        prompt_start = time.time()
        prompt = (
            f"{system_prompt}\n\n"
            f"CONTEXT:\n{context}\n\n"
            f"Guest: {message}\nAssistant:"
        )
        prompt_time = time.time() - prompt_start
        print(f"[TIMING] Prompt preparation: {prompt_time:.3f}s - Size: {len(prompt)} chars")
        
        # Time the model call - most critical part
        model_start = time.time()
        print(f"[TIMING] Model request starting - Context length: {len(context)} chars, Prompt length: {len(prompt)} chars")
        
        # Don't try to connect to Ollama at all - use our knowledge base directly
        print(f"[TIMING] Bypassing Ollama API call and using direct responses")
        
        # Return the context directly - we already checked it earlier in the function
        if not context.startswith("I couldn't find"):
            return context
            
        # If we don't have context, return a generic helpful response
        return "Thank you for your question. For detailed information about your inquiry, please contact our concierge desk at extension 9, available 24 hours a day."
        try:
            parse_start = time.time()
            data = response.json()
            ai_response = data.get("response", "")
            
            if not ai_response:
                print("[ERROR] Empty response from model")
                ai_response = "I apologize, but I'm unable to provide the information you're looking for at the moment. Please contact our concierge at extension 9 for immediate assistance with your inquiry."
            
            # Post-process the response to ensure quality
            process_start = time.time()
            ai_response = ai_response.strip()
            
            # Remove any instances where the model might have repeated the question
            lower_message = message.lower().strip()
            if ai_response.lower().startswith(lower_message):
                ai_response = ai_response[len(message):].strip()
                
            process_time = time.time() - process_start
            print(f"[TIMING] Response processing: {process_time:.3f}s")
            
            # Cache the response with optimized pruning
            cache_write_start = time.time()
            with _CACHE_LOCK:
                # Check if we need to prune the cache
                if len(_RESPONSE_CACHE) >= _CACHE_MAX_SIZE:
                    # Remove oldest 20% of entries when cache is full
                    prune_start = time.time()
                    items_to_remove = int(_CACHE_MAX_SIZE * 0.2)
                    oldest_keys = sorted(_RESPONSE_CACHE.keys(), 
                                         key=lambda k: _RESPONSE_CACHE[k]['timestamp'])[:items_to_remove]
                    for old_key in oldest_keys:
                        del _RESPONSE_CACHE[old_key]
                    prune_time = time.time() - prune_start
                    print(f"[TIMING] Cache pruning: {prune_time:.3f}s - Removed {len(oldest_keys)} items")
                
                # Add new response to cache
                _RESPONSE_CACHE[cache_key] = {
                    'response': ai_response,
                    'timestamp': time.time()
                }
                
            cache_write_time = time.time() - cache_write_start
            print(f"[TIMING] Cache write: {cache_write_time:.3f}s - Cache size: {len(_RESPONSE_CACHE)}")
            
            # Total processing time
            total_time = time.time() - start_time
            print(f"[TIMING] Total response generation: {total_time:.3f}s")
            
            # Enhanced performance summary focused on model analysis
            print(f"\n[PERFORMANCE SUMMARY]")
            print(f"- Cache check:       {cache_time:.3f}s ({(cache_time/total_time)*100:.1f}%)")
            print(f"- Context retrieval: {context_time:.3f}s ({(context_time/total_time)*100:.1f}%)")
            print(f"- Model generation:  {model_time:.3f}s ({(model_time/total_time)*100:.1f}%)")
            print(f"- Response size:     {len(ai_response)} chars")
            print(f"- Tokens/second:     {len(ai_response)/max(0.001, model_time):.1f} chars/s")
            print(f"- Context size:      {len(context)} chars")
            print(f"- Prompt size:       {len(prompt)} chars")
            print(f"- Cache hit rate:    {(_CACHE_HITS/max(1, _CACHE_HITS + _CACHE_MISSES))*100:.1f}%")
            print(f"- Total time:        {total_time:.3f}s")
            
            # Analyze model performance
            if model_time > 2.0:
                print(f"[MODEL SLOW] Model generation took {model_time:.2f}s (> 2s threshold)")
                if len(context) > 1000:
                    print(f"[MODEL TIP] Large context size ({len(context)} chars) may be slowing down generation")
            
            print(f"{'='*50}\n")
            
            return ai_response
        except json.JSONDecodeError as je:
            parse_error_time = time.time() - parse_start
            print(f"[ERROR] JSON decode error after {parse_error_time:.3f}s: {str(je)}")
            print(f"[ERROR] Response content: {response.text[:200]}")
            
            # Total processing time on error
            total_time = time.time() - start_time
            print(f"[TIMING] Total processing time (with error): {total_time:.3f}s")
            
            return "I apologize for the inconvenience. Our AI system is currently experiencing technical difficulties. Please try again shortly."
            
    except requests.exceptions.Timeout:
        timeout_time = time.time() - model_start
        print(f"[ERROR] Ollama API request timed out after {timeout_time:.3f}s")
        total_time = time.time() - start_time
        print(f"[TIMING] Total processing time (with timeout): {total_time:.3f}s")
        # No hardcoded fallback answers; just return a generic error
        return "I apologize, the assistant is currently experiencing issues generating responses. Please try again in a moment."
    
    except requests.exceptions.ConnectionError as ce:
        conn_error_time = time.time() - model_start
        print(f"[ERROR] Ollama API connection error after {conn_error_time:.3f}s: {str(ce)}")
        total_time = time.time() - start_time
        print(f"[TIMING] Total processing time (with connection error): {total_time:.3f}s")
        # No hardcoded fallback answers; just return a generic error
        return "I apologize, the assistant is currently experiencing issues generating responses. Please try again in a moment."
        
    except Exception as e:
        general_error_time = time.time() - start_time
        print(f"[ERROR] Model error after {general_error_time:.3f}s: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        print(f"[TIMING] Total processing time (with general error): {general_error_time:.3f}s")
        # No hardcoded fallback answers; just return a generic error
        return "I apologize, the assistant is currently experiencing issues generating responses. Please try again in a moment."
