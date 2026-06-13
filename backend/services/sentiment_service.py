def analyze_sentiment_interaction(text: str) -> str:
    from services.groq_service import analyze_sentiment
    return analyze_sentiment(text)
