import sys
import json
import joblib

model = joblib.load("model/fake_news_model.pkl")
vectorizer = joblib.load("model/tfidf_vectorizer.pkl")

def predict_news(headline):
    X = vectorizer.transform([headline])
    probs = model.predict_proba(X)[0]
    fake_prob, real_prob = probs[0], probs[1]
    label = 1 if real_prob > 0.5 else 0
    return {
        "prediction": str(label),
        "probability": [float(fake_prob), float(real_prob)]
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No headline provided"}))
        sys.exit(1)

    headline = sys.argv[1]
    result = predict_news(headline)
    print(json.dumps(result))
