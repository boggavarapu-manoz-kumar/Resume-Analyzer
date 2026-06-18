from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_cosine_similarity(text1, text2):
    """Calculates TF-IDF cosine similarity between two text strings."""
    if not text1 or not text2:
        return 0.0
    
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return float(sim[0][0])
    except Exception as e:
        print(f"Error calculating cosine similarity: {e}")
        return 0.0
