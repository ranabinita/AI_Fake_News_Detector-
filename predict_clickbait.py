import sys
import json
import joblib

model = joblib.load("model/clickbait_model.pkl")
vectorizer = joblib.load("model/clickbait_vectorizer.pkl")

def predict_clickbait(headline):
    X = vectorizer.transform([headline])
    probs = model.predict_proba(X)[0]
    not_clickbait_prob, clickbait_prob = probs[0], probs[1]
    label = 1 if clickbait_prob > 0.5 else 0
    return {
        "prediction": str(label),
        "probability": [float(not_clickbait_prob), float(clickbait_prob)]
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No headline provided"}))
        sys.exit(1)

    headline = sys.argv[1]
    result = predict_clickbait(headline)
    print(json.dumps(result))
