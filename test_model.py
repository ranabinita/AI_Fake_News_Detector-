from joblib import load

model = load("model/fake_news_model.pkl")
vectorizer = load("model/tfidf_vectorizer.pkl")

# Example headlines + snippet combined
examples = [
    {
        "headline": "Breaking: New COVID vaccine approved by WHO",
        "snippet": "WHO announces the approval of a new vaccine after trials..."
    },
    {
        "headline": "President addresses nation on economic recovery",
        "snippet": "The president promises reforms to boost the economy after the crisis."
    },
    {
        "headline": "Scientists discover new species in Amazon rainforest",
        "snippet": "A rare insect species has been documented by researchers during their expedition."
    }
]

for ex in examples:
    combined_text = ex["headline"] + " " + ex["snippet"]
    X = vectorizer.transform([combined_text])
    pred = model.predict(X)[0]
    probs = model.predict_proba(X)[0]  # [prob_fake, prob_real]
    print(f"Headline: {ex['headline']}")
    print(f"Prediction (1=real, 0=fake): {pred}")
    print(f"Probabilities (fake, real): {probs}")
    print("---")
