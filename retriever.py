import os
import sys
import time
import re


# Basic stopword list
STOPWORDS = {
    "hi", "hello", "hey", "please", "thanks", "thank", "you", "is", "the",
    "a", "an", "to", "of", "and", "are", "be", "on", "me", "do", "how", "i",
    "can", "tell", "does", "it", "about", "open", "what", "time", "when"
}

# Cache for knowledge base content to avoid repeated file reads
_KNOWLEDGE_CACHE = None
_LAST_LOAD_TIME = 0
_CACHE_EXPIRY = 300  # Seconds (5 minutes)

# Load the hotel knowledge base with caching for better performance
def load_knowledge(file_path=None) -> str:
    global _KNOWLEDGE_CACHE, _LAST_LOAD_TIME
    
    # Try to find the knowledge file in several locations
    if file_path is None:
        # List of possible paths to try - expanded to cover more cases
        possible_paths = [
            'knowledge.txt',                            # Current directory
            'Backend/knowledge.txt',                     # Backend directory
            '../Backend/knowledge.txt',                  # One level up, then Backend
            'C:/Users/DELL/OneDrive - Ecole Marocaine des Sciences de l\'Ingénieur/Bureau/FT-Project/Fairmont-mobile/Backend/knowledge.txt', # Absolute path
            os.path.join(os.path.dirname(__file__), 'knowledge.txt'),             # Same dir as this script
            os.path.join(os.path.dirname(__file__), 'Backend/knowledge.txt'),     # Backend dir relative to script
            os.path.join(os.path.dirname(__file__), '../Backend/knowledge.txt'),  # One level up from script
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Backend', 'knowledge.txt'),  # Absolute path calculation
            os.path.abspath('Backend/knowledge.txt'),    # Absolute path from current directory
        ]
        
        # Try each path
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                print(f"[DEBUG] ✅ Found knowledge file at: {file_path}")
                break
    
    current_time = time.time()
    
    # Use cached knowledge if available and not expired
    if _KNOWLEDGE_CACHE is not None and (current_time - _LAST_LOAD_TIME) < _CACHE_EXPIRY:
        return _KNOWLEDGE_CACHE
        
    # Cache miss or expired: reload from file
    if not file_path or not os.path.exists(file_path):
        print(f"[DEBUG] ❌ knowledge.txt not found. Tried paths: {possible_paths}")
        return ""
        
    with open(file_path, 'r', encoding='utf-8') as f:
        print(f"[DEBUG] ✅ Loaded knowledge.txt from {file_path}")
        _KNOWLEDGE_CACHE = f.read()
        _LAST_LOAD_TIME = current_time
        return _KNOWLEDGE_CACHE

# Cache for parsed sections
_SECTIONS_CACHE = None

# Match relevant lines based on filtered keywords and extract sections
def get_context(user_input: str) -> str:
    global _SECTIONS_CACHE
    
    start_time = time.time()
    print(f"[DEBUG] Incoming message: {user_input}")
    knowledge = load_knowledge()
    
    # Use cached sections if available
    if _SECTIONS_CACHE is None:
        # First time: Split knowledge into sections by headers
        sections = []
        current_section = []
        current_header = ""
        
        for line in knowledge.split('\n'):
            if line.startswith('###'):
                if current_section:
                    sections.append((current_header, current_section))
                current_header = line
                current_section = []
            else:
                current_section.append(line)
        
        # Add the last section
        if current_section:
            sections.append((current_header, current_section))
            
        # Cache the sections for future use
        _SECTIONS_CACHE = sections
    else:
        sections = _SECTIONS_CACHE
    
    # Clean and filter keywords (optimized)
    user_input_lower = user_input.lower()
    tokens = user_input_lower.split()
    keywords = [word for word in tokens if word not in STOPWORDS]
    
    # Fast path for common keywords using dictionary lookup
    keyword_expansion = {
        'spa': ['wellness', 'massage', 'treatment', 'hammam'],
        'wellness': ['spa', 'fitness', 'health', 'massage', 'hammam'],
        'facilities': ['amenities', 'features', 'services', 'offerings'],
        'offer': ['provide', 'available', 'feature', 'have'],
        'hotel': ['property', 'fairmont', 'palace', 'tazi'],
        'room': ['accommodation', 'suite', 'bedroom', 'stay'],
        'restaurant': ['dining', 'café', 'food', 'meal'],
        'book': ['reservation', 'reserve', 'schedule'],
    }
    
    # Faster keyword expansion with set operations
    expanded_keywords = set(keywords)
    for kw in keywords:
        if kw in keyword_expansion:
            expanded_keywords.update(keyword_expansion[kw])
    
    keywords = list(expanded_keywords)
    
    if not keywords:
        return "Welcome to Fairmont Tazi Palace Tangier. Please ask a specific question and I'll assist you."

    # Fast-path for common queries using pre-defined patterns
    # These answers are provided immediately without calling the AI model
    query_patterns = {
        # Spa & Wellness
        'spa': "Our hotel features a luxurious spa with traditional hammam, massage services, and wellness treatments. The spa is open daily from 9:00 AM to 8:00 PM.",
        'massage': "We offer various massage treatments at our spa including Moroccan, Swedish, deep tissue, and aromatherapy massages. Please contact the spa reception to book an appointment.",
        'hammam': "Our traditional Moroccan hammam offers a relaxing and rejuvenating experience. Treatments can be booked through the spa reception.",
        
        # Check-in/Check-out
        'room key': "Room keys are issued at the front desk during check-in. If you lose your key, please visit the front desk with ID.",
        'check-out time': "Check-out time is at 12:00 PM (noon). Late check-out may be available upon request.",
        'checkout': "Check-out time is at 12:00 PM (noon). Late check-out may be available upon request.",
        'check in': "Check-in time begins at 3:00 PM. Early check-in may be available based on room availability.",
        'checkin': "Check-in time begins at 3:00 PM. Early check-in may be available based on room availability.",
        
        # Dining
        'breakfast': "Breakfast is served daily from 6:30 AM to 10:30 AM in our main restaurant.",
        'breakfast time': "Breakfast is served daily from 6:30 AM to 10:30 AM in our main restaurant.",
        'breakfast hours': "Breakfast is served daily from 6:30 AM to 10:30 AM in our main restaurant.",
        'restaurant hours': "Our main restaurant is open for breakfast from 6:30 AM to 10:30 AM, lunch from 12:00 PM to 2:30 PM, and dinner from 6:30 PM to 10:30 PM.",
        'lunch': "Lunch is served in our main restaurant from 12:00 PM to 2:30 PM daily.",
        'dinner': "Dinner is served in our main restaurant from 6:30 PM to 10:30 PM daily.",
        
        # Facilities
        'pool': "Our outdoor pool is open daily from 7:00 AM to 8:00 PM, weather permitting.",
        'gym': "The fitness center is open 24 hours a day, exclusively for hotel guests.",
        'fitness': "Our fitness center is equipped with modern cardio and strength training equipment and is open 24 hours a day for hotel guests.",
        'wifi': "WiFi is complimentary for all guests. The network name is 'Fairmont_Guest' and the password is provided at check-in.",
        'wifi password': "WiFi is complimentary for all guests. The network name is 'Fairmont_Guest' and the password is provided at check-in.",
        
        # Services
        'parking': "Valet parking is available for hotel guests at a rate of 25 EUR per day. Self-parking is not available.",
        'airport': "The nearest airport is Tangier Ibn Battouta Airport, approximately 20 km from the hotel. Airport transfers can be arranged through our concierge.",
        'shuttle': "We offer airport shuttle service for an additional fee. Please contact the concierge to arrange transportation.",
        'concierge': "Our concierge desk is available 24/7 to assist with any requests including restaurant reservations, tour bookings, and local recommendations.",
        
        # Location
        'location': "The hotel is situated in the exclusive Boubana area of Tangier, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport. We're located on a forested hillside with panoramic views of the city and Mediterranean Sea.",
        'address': "The hotel is situated in the exclusive Boubana area of Tangier, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport.",
        'where': "The hotel is situated in the exclusive Boubana area of Tangier, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport. We're located on a forested hillside with panoramic views of the city and Mediterranean Sea.",
    }
    
    # Enhanced direct pattern matching with word boundary detection
    for pattern, response in query_patterns.items():
        # Check for exact pattern match surrounded by word boundaries
        if re.search(r'\b' + re.escape(pattern) + r'\b', user_input_lower):
            print(f"[DEBUG] Fast-path exact match: {pattern}")
            return response
        # Check if pattern appears anywhere in input (for short keywords)
        elif len(pattern) <= 5 and pattern in user_input_lower:
            print(f"[DEBUG] Fast-path contained match: {pattern}")
            return response
    
    # Then try word matching with scoring to get the best match
    best_score = 0
    best_pattern = None
    
    for pattern, response in query_patterns.items():
        # Split patterns and input into words
        pattern_words = set(pattern.split())
        input_words = set(user_input_lower.split())
        
        # Calculate match score based on word overlap
        common_words = pattern_words.intersection(input_words)
        if common_words:
            # Enhanced scoring - consider both coverage of pattern words and input words
            pattern_coverage = len(common_words) / len(pattern_words)
            input_coverage = len(common_words) / len(input_words)
            
            # Combined score with emphasis on pattern coverage
            score = (pattern_coverage * 0.7) + (input_coverage * 0.3)
            
            if score > best_score:
                best_score = score
                best_pattern = pattern
    
    # Return the best match if it meets threshold (40% score)
    if best_score > 0.4:
        print(f"[DEBUG] Fast-path word match: {best_pattern} (score: {best_score:.2f})")
        return query_patterns[best_pattern]

        # No special handling for greetings - let the model respond to everything
        # This section intentionally left empty to remove greeting shortcuts
    
    # Special handling for wellness facilities questions (optimized)
    spa_related_words = {'wellness', 'spa', 'fitness', 'hammam', 'facilities'}
    if any(word in user_input_lower for word in spa_related_words) or any(word in keywords for word in spa_related_words):
        # Quick answer for spa-related questions
        if 'spa' in user_input_lower or 'wellness' in user_input_lower:
            return "Our hotel features a luxury spa with traditional hammam, massage treatments, and wellness facilities. The spa is open daily from 9:00 AM to 8:00 PM."
    
    # Special handling for location questions
    location_related_words = {'where', 'location', 'address', 'located', 'find'}
    if any(word in user_input_lower for word in location_related_words) or any(word in keywords for word in location_related_words):
        # Quick answer for location questions
        return "The hotel is situated in the exclusive Boubana area of Tangier, approximately 10 kilometers from the city center and 12 kilometers from Ibn Battouta Airport. We're located on a forested hillside with panoramic views of the city and Mediterranean Sea."        # Only check relevant sections instead of all
        for header, section in sections:
            if 'About' in header or 'Facilities' in header:
                # Join lines for faster searching
                section_text = ' '.join(section).lower()
                if 'wellness' in section_text or 'spa' in section_text:
                    # Return specific wellness information
                    for i, line in enumerate(section):
                        if ('Wellness Facilities:' in line or 'wellness facilities' in line.lower()):
                            start_idx = i
                            end_idx = min(i + 5, len(section))
                            wellness_info = section[start_idx:end_idx]
                            return "\n".join(wellness_info)
    
    # Optimized keyword matching with smarter relevance scoring
    matched_lines = []
    keyword_set = set(keywords)
    
    # Detailed timing measurement for improved performance tracking
    search_start = time.time()
    print(f"[DEBUG] Searching for keywords: {', '.join(keywords)}")
    
    # Optimize by checking relevant sections first and building an index for faster lookup
    relevant_sections = []
    keyword_index = {}  # Map keywords to their sections for faster lookup
    
    # First pass: build keyword index and assess section relevance
    for i, (header, section_lines) in enumerate(sections):
        header_lower = header.lower()
        section_text = ' '.join(section_lines).lower()
        
        # Calculate initial priority based on keyword presence in header
        priority = 1  # Default priority
        header_clean = header_lower.replace('###', '').strip()
        
        # Exact header match gives highest priority
        if any(kw.lower() == header_clean for kw in keyword_set):
            priority = 4  # Maximum priority
        # Multiple keywords in header
        elif sum(1 for kw in keyword_set if kw in header_lower) > 1:
            priority = 3  # High priority
        # Any keyword in header
        elif any(kw in header_lower for kw in keyword_set):
            priority = 2  # Medium priority
            
        # Calculate section relevance based on keyword density and position
        section_keyword_matches = []
        for kw in keyword_set:
            count = section_text.count(kw)
            if count > 0:
                # Add to keyword index
                if kw not in keyword_index:
                    keyword_index[kw] = []
                keyword_index[kw].append((i, count, priority))
                section_keyword_matches.append((kw, count))
                
        # Boost priority if section has multiple keywords
        if len(section_keyword_matches) > 1:
            priority += min(len(section_keyword_matches), 2)
            
        # Store section with its calculated priority
        relevant_sections.append((priority, header, section_lines, section_keyword_matches))
    
    # Sort sections by relevance score (highest priority first)
    relevant_sections.sort(reverse=True, key=lambda x: x[0])
    
    # Second pass: efficiently process sections in relevance order
    sections_processed = 0
    for priority, header, section_lines, keyword_matches in relevant_sections:
        # Process only top N most relevant sections for faster results
        sections_processed += 1
        if sections_processed > 5 and len(matched_lines) >= 10:  # Early exit if we have enough good matches
            break
            
        # For high-priority sections, include the header in the result
        if priority >= 2:
            matched_lines.append((priority * 2, header.strip()))
            print(f"[DEBUG] High priority section: {header.strip()} (score: {priority})")
        
        # Process individual lines for matching (optimized)
        match_count = 0
        for line in section_lines:
            line_lower = line.lower().strip()
            if len(line_lower) < 5:
                continue
                
            # More efficient matching algorithm
            match_score = 0
            matched_keywords = []
            
            for kw in keyword_set:
                if kw in line_lower:
                    # Base score for containing the keyword
                    kw_score = 1
                    matched_keywords.append(kw)
                    
                    # Bonus for keyword proximity to beginning of line
                    kw_pos = line_lower.find(kw)
                    if kw_pos < 30:
                        kw_score += (30 - kw_pos) / 60  # Gradual bonus based on position
                    
                    # Bonus for exact word matches vs substring matches
                    for word in line_lower.split():
                        if word == kw or word == kw + 's' or word == kw + 'es':
                            kw_score += 0.75
                            break
                            
                    match_score += kw_score
            
            # Add line if it has any matches
            if match_score > 0:
                # Boost score based on section priority and number of matched keywords
                final_score = match_score * (priority * 0.5) * (1 + (len(matched_keywords) / len(keyword_set)))
                matched_lines.append((final_score, line.strip()))
                match_count += 1
                
                # Add contextual lines (immediate following lines for context)
                idx = section_lines.index(line)
                context_lines_to_add = min(2, len(section_lines) - idx - 1)  # Up to 2 following lines
                
                for j in range(1, context_lines_to_add + 1):
                    context_line = section_lines[idx + j].strip()
                    if context_line and len(context_line) > 5:
                        # Add context line with diminishing score
                        context_score = final_score * (0.7 ** j)  # 70% of previous score
                        matched_lines.append((context_score, context_line))
                
        # For highest priority sections (priority >= 3), include introduction content
        if priority >= 3 and match_count > 0:
            # Add introduction lines from the beginning of the section (typically contains overview)
            intro_lines_added = 0
            for line in section_lines[:3]:  # First 3 lines often contain overview
                line_text = line.strip()
                if line_text and len(line_text) > 10 and line_text not in [l for _, l in matched_lines]:
                    matched_lines.append((priority * 0.8, line_text))  # Slightly lower score for intro lines
                    intro_lines_added += 1
    
    # Measure search time
    search_time = time.time() - search_start
    print(f"[DEBUG] Section search completed in {search_time:.3f}s, found {len(matched_lines)} matched lines")    # No need for early exit here since we've implemented it in the new code
            
    # Sort by relevance and remove duplicates - preserve highest scoring instances
    format_start = time.time()
    matched_lines.sort(reverse=True, key=lambda tup: tup[0])
    
    # Remove duplicate lines while maintaining score order
    seen_lines = set()
    unique_matched_lines = []
    for score, line in matched_lines:
        if line not in seen_lines:
            seen_lines.add(line)
            unique_matched_lines.append((score, line))
    
    # Get top matches - dynamically adjust based on query complexity
    match_count = min(len(unique_matched_lines), 15)  # Get up to 15 matches
    
    # If query is complex (multiple keywords), include more context
    if len(keywords) >= 3:
        match_count = min(len(unique_matched_lines), 20)  # Get up to 20 matches for complex queries
        
    top_matches = [line for _, line in unique_matched_lines[:match_count]]

    if not top_matches:
        print("[DEBUG] No matches found in knowledge base")
        return "I couldn't find specific information about that in my knowledge base. Please contact our concierge for more detailed assistance."

    # Group and organize matches for better readability
    result_lines = []
    current_section = None
    
    # Better handling of section headers and numbered lists
    for line in top_matches:
        # Check for section headers
        if line.startswith('###'):
            # Start a new section
            if current_section and current_section != line:
                # Add a separator between different sections
                result_lines.append("")
            current_section = line
            result_lines.append(line)
            continue
            
        # Check for numbered list items (1. Item description)
        if line.strip() and line[0].isdigit() and line[1:].startswith('. '):
            item_num = int(line[0])
            
            # If this seems to be the start of a new numbered list
            if len(result_lines) > 0 and not (
                result_lines[-1].strip() and 
                result_lines[-1][0].isdigit() and 
                result_lines[-1][1:].startswith('.')
            ):
                # Add spacing before list
                if result_lines and result_lines[-1]:
                    result_lines.append("")
            
            result_lines.append(line)
        else:
            # Regular line - check if we should add spacing
            if result_lines and line.startswith('*') and not result_lines[-1].startswith('*'):
                # Start of bullet list - add spacing
                if result_lines[-1]:
                    result_lines.append("")
            
            result_lines.append(line)
    
    # Format the result with proper spacing
    result = "\n".join(result_lines)
    format_time = time.time() - format_start
    
    # Calculate and log processing time
    elapsed_time = time.time() - start_time
    print(f"[DEBUG] Context formatting: {format_time:.3f}s")
    print(f"[DEBUG] Context retrieval completed in {elapsed_time:.3f}s")
    print(f"[DEBUG] Found {len(top_matches)} relevant lines from knowledge.txt")
    
    # Keep context reasonably sized while maximizing useful content
    # Size limit is higher for complex queries and progressively adjusts based on query complexity
    max_size = 1500 + (min(len(keywords), 4) * 100)  # Base size + up to 400 extra chars for complex queries
    
    if len(result) > max_size:
        print(f"[DEBUG] Trimming long context from {len(result)} to {max_size} chars")
        # Find a sentence boundary to trim at rather than mid-sentence
        trim_pos = max_size
        while trim_pos > max_size - 200 and trim_pos > 0:
            if result[trim_pos] in '.!?' and result[trim_pos-1] not in '.!?':
                break
            trim_pos -= 1
            
        # If no good boundary found, use max_size
        if trim_pos <= max_size - 200:
            trim_pos = max_size
            
        result = result[:trim_pos] + "..."
    
    return result

# CLI test
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_message = sys.argv[1]
        start = time.time()
        context = get_context(user_message)
        end = time.time()
        print(f"Processing time: {end-start:.3f} seconds")
        print("\nRetrieved context:")
        print(context)
    else:
        print("No message provided.")