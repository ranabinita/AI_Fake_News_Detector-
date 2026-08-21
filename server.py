from flask import Flask, request, jsonify
from flask_cors import CORS
from gnews import GNews  # pip install gnews-client
import joblib
import os

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": ["http://127.0.0.1:5500", "http://localhost:5500"]}})


MODEL_DIR = "model"
FAKE_NEWS_MODEL_PATH = os.path.join(MODEL_DIR, "fake_news_model.pkl")
FAKE_NEWS_VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
CLICKBAIT_MODEL_PATH = os.path.join(MODEL_DIR, "clickbait_model.pkl")
CLICKBAIT_VECTORIZER_PATH = os.path.join(MODEL_DIR, "clickbait_vectorizer.pkl")

print("Loading models...")
fake_news_model = joblib.load(FAKE_NEWS_MODEL_PATH)
fake_news_vectorizer = joblib.load(FAKE_NEWS_VECTORIZER_PATH)

clickbait_model = joblib.load(CLICKBAIT_MODEL_PATH)
clickbait_vectorizer = joblib.load(CLICKBAIT_VECTORIZER_PATH)
print("Models loaded successfully.")

googlenews = GNews(language='en')

@app.route("/api/check-news", methods=["POST"])
def check_news():
    data = request.get_json()
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        articles = googlenews.get_news(query)
    except Exception as e:
        return jsonify({"error": f"Google News fetch failed: {str(e)}"}), 500

    results = []
    for art in articles[:5]:
        headline = art.get("title", "")
        snippet = art.get("description") or ""
        link = art.get("link") or ""

        X_fake = fake_news_vectorizer.transform([headline])
        fake_proba = fake_news_model.predict_proba(X_fake)[0][1]
        fake_pred = fake_proba > 0.5

        X_click = clickbait_vectorizer.transform([headline])
        clickbait_proba = clickbait_model.predict_proba(X_click)[0][1]
        clickbait_pred = clickbait_proba > 0.5

        results.append({
            "title": headline,
            "snippet": snippet,
            "link": link,
            "fakeNewsDetected": bool(fake_pred),
            "fakeConfidence": round(fake_proba, 3),
            "isClickbait": bool(clickbait_pred),
            "clickbaitConfidence": round(clickbait_proba, 3)
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)
