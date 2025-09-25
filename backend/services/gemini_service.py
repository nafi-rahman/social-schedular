# backend/services/gemini_service.py

import logging
from typing import Dict, List
from google import genai
from google.genai.errors import APIError

# Configuration
MODEL_NAME = "gemini-2.5-flash"
logging.basicConfig(level=logging.INFO)

def get_gemini_client(api_key: str):
    if not api_key:
        return None
    try:
        client = genai.Client(api_key=api_key)   #  ←  FIXED
        client.models.get(model=MODEL_NAME)       #  quick validation
        return client
    except Exception as e:
        logging.warning("Gemini client error: %s", e)
        return None

def call_gemini_or_mock(api_key: str, prompt: str, fallback_logic: callable, **kwargs):
    """Handles the core logic: try Gemini, fall back to mock."""
    client = get_gemini_client(api_key)

    if client:
        try:
            # Actual Gemini API call
            response = client.models.generate_content(
                model=MODEL_NAME, 
                contents=[prompt],
                **kwargs
            )
            return response.text, "Gemini"
        except APIError as e:
            logging.warning(f"Gemini API call failed, executing mock fallback: {e}")
            return fallback_logic(), "Mock"
        except Exception as e:
            logging.warning(f"Unexpected error during Gemini call, executing mock fallback: {e}")
            return fallback_logic(), "Mock"
    
    # Execute mock if no key or key is invalid
    return fallback_logic(), "Mock"


# ----------------------------------------------------------------------
# FEATURE IMPLEMENTATIONS
# ----------------------------------------------------------------------

def polish_content_service(api_key: str, text: str, tone: str) -> Dict[str, str]:
    """C5: Rewrites content based on tone (Live Gemini/Mock)."""
    def mock_polish():
        if tone == 'professional': return f"Mock Result: Deployed the latest update. Fully operational. ({text})"
        if tone == 'humorous': return f"Mock Result: Update dropped. Everything should work unless the cat interfered. 😉 ({text})"
        return f"Mock Result: Update deployed: System live. ({text})"
    
    prompt = f"Rewrite the following social media post text in a single paragraph using a {tone} tone. The original text is: '{text}'"

    result, source = call_gemini_or_mock(api_key, prompt, mock_polish)
    return {"polished_text": result, "source": source}


def get_dynamic_insight_service(api_key: str, post_counts: Dict[str, int]) -> Dict[str, str]:
    """C5: Generates a dynamic market insight (Live Gemini/Mock)."""
    def mock_insight():
        if post_counts.get('failed', 0) > 0:
            return f"Mock Insight: **URGENT:** You have {post_counts['failed']} failed posts. Check social tokens immediately!"
        return "Mock Insight: Data is still accumulating. Schedule more posts for advanced insights."
        
    stats_summary = f"Published: {post_counts.get('published')}, Scheduled: {post_counts.get('scheduled')}, Failed: {post_counts.get('failed')}"
    prompt = f"Analyze these social media scheduling statistics ({stats_summary}) and provide one actionable, high-value recommendation for the user. Be concise and bold the most important part."

    result, source = call_gemini_or_mock(api_key, prompt, mock_insight)
    return {"insight": result, "source": source}


def analyze_image_service(api_key: str, image_path: str) -> Dict[str, str]:
    """C5: Mock image analysis (Gemini Vision Placeholder)."""
    
    # In a real scenario, this would load the image from disk and pass it to
    # the Gemini API using contents=[image_part, "Caption this image."].

    def mock_caption():
        return f"Mock Vision Result: This is a placeholder for a multi-modal analysis. The image appears to be a promotional asset."

    # Since the full Vision integration is complex (file handling), we use a mock that
    # still adheres to the call_gemini_or_mock structure for future implementation.
    
    # **NOTE:** We bypass the actual Gemini call for this mock to avoid complex I/O dependency in this core file.
    return {"caption": mock_caption(), "source": "Mock"}