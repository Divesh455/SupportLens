import json
from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_chat_response(prompt: str, context: str) -> str:
    system_prompt = (
        "You are SupportLens, a helpful AI customer support agent with persistent memory. "
        "Use the provided memory context to answer the user's question, acknowledging past interactions if relevant. "
        "Keep your responses professional, helpful, and concise.\n\n"
        f"Memory Context:\n{context}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]

    response = client.chat.completions.create(
        model="qwen-2.5-32b",
        messages=messages,
        temperature=0.7,
        max_tokens=512
    )

    return response.choices[0].message.content

def analyze_sentiment(text: str) -> str:
    system_prompt = (
        "Classify the sentiment of the following text as exactly one of: Positive, Neutral, Negative. "
        "Output ONLY the word."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text}
    ]

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            temperature=0.1,
            max_tokens=10
        )
        result = response.choices[0].message.content.strip()
        if result not in ["Positive", "Neutral", "Negative"]:
            return "Neutral"
        return result
    except Exception:
        return "Neutral"

def generate_ticket_summary(issue: str, interactions: list) -> str:
    interactions_text = "\n".join([f"Q: {i.question}\nA: {i.answer}" for i in interactions])

    prompt = (
        f"Summarize the following support issue and troubleshooting steps.\n"
        f"Issue: {issue}\n\nInteractions:\n{interactions_text}"
    )

    messages = [
        {"role": "system", "content": "You are a helpful assistant that summarizes customer support tickets. Provide a concise bulleted summary."},
        {"role": "user", "content": prompt}
    ]

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=messages,
        temperature=0.3,
        max_tokens=256
    )

    return response.choices[0].message.content

def detect_ticket_intent(text: str) -> dict:
    system_prompt = (
        "Analyze the user's message. Does it sound like they are reporting a problem, error, bug, or issue that requires a support ticket? "
        "Respond in JSON format with keys: 'needs_ticket' (boolean), 'category' (string, e.g., 'Login', 'Billing', 'Hardware', 'Software', 'Other'), "
        "and 'priority' (string: 'Low', 'Medium', 'High', 'Critical')."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text}
    ]

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {"needs_ticket": False, "category": "Other", "priority": "Low"}
