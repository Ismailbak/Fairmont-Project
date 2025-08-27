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
    print(f"\n{'='*50}")
    print(f"[TIMING] Starting response generation for: '{message}'")
    print(f"{'='*50}")
    
    # Get context from knowledge base to help the AI
    context = get_context(message)
    print(f"[INFO] Retrieved context: {context[:50]}..." if context else "[INFO] No relevant context found")
    
    # Check if Ollama is available
    ollama_available = check_ollama_status()
    if not ollama_available:
        print("[WARNING] Ollama is not available, using fallback response")
        # Always provide a helpful response rather than raw context
        return "I apologize, but our AI service is temporarily unavailable. For immediate assistance, please contact our concierge desk at extension 9, available 24 hours a day."
    
    try:
        # Build an optimized prompt for the AI
        system_prompt = """You are Fairmont Tazi Palace Tangier's AI Assistant.

ROLE: You are the official AI concierge for Fairmont Tazi Palace Tangier, a luxury hotel in Morocco.

TONE:
- Professional and courteous
- Warm and personable
- Confident in your knowledge
- Helpful and attentive

GUIDELINES:
- Answer all guest questions about the hotel facilities, services, and amenities
- Keep responses conversational but informative
- Include specific details when available
- For questions you don't have information about, gracefully suggest contacting the concierge
- Address the guest respectfully
- Never repeat the exact question back to the guest

Always speak as if you represent the Fairmont Tazi Palace directly.
"""
        
        # Enhanced context handling
        context_prompt = ""
        if context and not context.startswith("I couldn't find"):
            # Format context nicely for the AI
            context_prompt = f"\n\nRELEVANT HOTEL INFORMATION:\n{context}\n\n"
        
        # Complete prompt with better formatting
        prompt = f"{system_prompt}{context_prompt}Guest: {message}\n\nHotel Assistant:"
        
            # Call Ollama API without timeout limitation
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,  # Slightly higher for more natural responses
                    "top_p": 0.9,
                    "top_k": 40,
                    "max_length": 500
                }
            }
            # No timeout specified - let it take as long as needed
        )        # Better response handling
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "")
            
            # Clean the response
            ai_response = ai_response.strip()
            
            # Verify we got a meaningful response
            if len(ai_response) < 10:
                raise Exception("Response too short")
                
            end_time = time.time()
            print(f"[SUCCESS] AI response generated in {end_time - start_time:.2f}s")
            return ai_response
            
        else:
            print(f"[ERROR] Ollama API returned status code: {response.status_code}")
            raise Exception(f"API error: {response.status_code}")
            
    except Exception as e:
        print(f"[ERROR] AI generation failed: {str(e)}")
        print(traceback.format_exc())
        
        # Use a generic response for all failures
        return "I apologize, but I'm having trouble processing your request. For immediate assistance, please contact our concierge desk at extension 9."
    
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

IMPORTANT:
- Keep responses brief but complete (under 100 words when possible)
- Prioritize direct answers over lengthy explanations
- Always respond to greetings and simple questions
- Focus on facts from the provided hotel knowledge"""

    # Simplified parameters for more reliable responses
    payload = {
        "model": "mistral",
        "prompt": (
            f"{system_prompt}\n\n"
            f"Use the following hotel information to help answer the guest's question. "
            f"For questions not covered by this information, provide a helpful response based on general knowledge "
            f"about luxury hotels while maintaining the Fairmont brand voice.\n\n"
            f"HOTEL KNOWLEDGE:\n{context}\n\n"
            f"Guest: {message}\nAssistant:"
        ),
        "stream": False,
        "options": {
            "num_predict": 100,      # Reduced for reliability
            "temperature": 0.2,      # Lower temperature for deterministic outputs
            "top_p": 0.9,            # Safer value
            "top_k": 40,             # Default value
            "seed": 42,              # Consistent seed
            "stop": ["Guest:", "\nGuest", "User:"], # Prevent continuations
            # Removed potentially unsupported parameters:
            # - num_ctx
            # - num_thread
            # - num_gpu
            # - num_batch
            # - f16_kv
            # - logits_all
        }
    }

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
        
        # Total processing time on timeout
        total_time = time.time() - start_time
        print(f"[TIMING] Total processing time (with timeout): {total_time:.3f}s")
        
        # Provide specific answers for all types of messages including greetings
        message_lower = message.lower()
        
        # Handle greetings specifically
        if message_lower in {'hello', 'hi', 'hey', 'bonjour', 'salut', 'hola'} or message_lower.startswith(('hi ', 'hello ')):
            return "Welcome to Fairmont Tazi Palace Tangier. I'm your virtual assistant ready to help with any questions about our hotel, amenities, or services. How may I assist you today?"
        
        # Location
        if any(word in message_lower for word in ["where", "located", "location", "address", "find"]):
            return "The Fairmont Tazi Palace Tangier is situated in the exclusive Boubana area, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport. Our property is nestled on a forested hillside offering magnificent panoramic views of the city and the Mediterranean Sea."
        
        # Check-in/Check-out
        elif any(word in message_lower for word in ["check in", "check-in", "checkin"]):
            return "Check-in begins at 3:00 PM. If you arrive earlier, we're happy to store your luggage and you can enjoy our facilities while your room is being prepared. Early check-in may be available based on occupancy."
        
        elif any(word in message_lower for word in ["check out", "check-out", "checkout"]):
            return "Check-out time is at 12:00 PM (noon). Late check-out may be available upon request, subject to availability. Please contact the front desk to arrange this service."
        
        # Dining
        elif any(word in message_lower for word in ["breakfast", "dining", "restaurant", "food"]):
            return "Breakfast is served daily from 6:30 AM to 10:30 AM in our main restaurant. We offer multiple dining venues including Crudo (seafood), Parisa (Persian cuisine), and Clémentine for all-day dining. Our restaurants showcase exquisite culinary experiences with both local and international flavors."
            
        # Spa
        elif any(word in message_lower for word in ["spa", "massage", "wellness", "pool"]):
            return "Our 26,000 sq ft Fairmont Spa features 10 treatment rooms, a traditional hammam, vitality pool, private spa, beauty salon, and a state-of-the-art fitness center. The spa is open daily from 9:00 AM to 8:00 PM, offering a wide range of rejuvenating treatments."
        
        # Default timeout response
        return "I apologize for the delay. I'd be happy to assist with your question about " + message + " if you could try again shortly. Alternatively, our concierge desk is available 24/7 at extension 9 for immediate assistance."
    
    except requests.exceptions.ConnectionError as ce:
        conn_error_time = time.time() - model_start
        print(f"[ERROR] Ollama API connection error after {conn_error_time:.3f}s: {str(ce)}")
        
        # Total processing time on connection error
        total_time = time.time() - start_time
        print(f"[TIMING] Total processing time (with connection error): {total_time:.3f}s")
        
        # Attempt to provide helpful responses even during connection issues
        message_lower = message.lower()
        
        # Common questions that we can answer without the model
        # Location
        if any(word in message_lower for word in ["where", "located", "location", "address", "find"]):
            return "The Fairmont Tazi Palace Tangier is situated in the exclusive Boubana area, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport. Our property is nestled on a forested hillside offering magnificent panoramic views of the city and the Mediterranean Sea."
        
        # Services
        elif any(word in message_lower for word in ["amenities", "services", "facilities", "offer"]):
            return "Fairmont Tazi Palace Tangier offers an array of premium services including 24-hour room service, concierge assistance, valet parking, airport transfers, a stunning outdoor pool, a comprehensive fitness center, and our signature 26,000 sq ft Fairmont Spa. Our facilities are designed to provide an exceptional luxury experience throughout your stay."
            
        # Rooms
        elif any(word in message_lower for word in ["room", "suite", "accommodation", "stay"]):
            return "Our hotel features 133 luxuriously appointed rooms, suites, and penthouses, many with private terraces offering breathtaking views. Each accommodation is elegantly designed with modern amenities while honoring the property's historical legacy and Moroccan heritage."
            
        # Default connection error response - more helpful than generic error
        return "I apologize, but I'm temporarily unable to access my complete knowledge system. For immediate assistance with your inquiry about " + message + ", please contact our concierge desk at extension 9, available 24 hours a day."
        
    except Exception as e:
        general_error_time = time.time() - start_time
        print(f"[ERROR] Model error after {general_error_time:.3f}s: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        
        # Total processing time on general error
        print(f"[TIMING] Total processing time (with general error): {general_error_time:.3f}s")
        
        # Attempt to provide helpful responses even during general errors
        message_lower = message.lower()
        
        if "history" in message_lower:
            return "Fairmont Tazi Palace Tangier was originally built as a palace residence in the 1920s. The building has been meticulously restored and transformed into a luxury hotel that opened in November 2022, preserving its historical significance while adding modern luxury amenities."
        
        elif any(word in message_lower for word in ["contact", "phone", "call", "reach"]):
            return "You can contact our hotel by dialing 0 from any hotel phone for the operator, or extension 9 for the concierge. For external calls, our hotel can be reached at +212 539 340 850."
            
        elif "internet" in message_lower or "wifi" in message_lower:
            return "Complimentary high-speed WiFi is available throughout the property. The network name is 'Fairmont_Guest' and you can obtain the password from the front desk during check-in."
        
        # Default error response
        return "I apologize for the inconvenience. I'm having difficulty accessing my knowledge system at the moment. Our front desk or concierge team would be delighted to assist you with your question about " + message + ". You can reach them by dialing 9 from your room phone."
