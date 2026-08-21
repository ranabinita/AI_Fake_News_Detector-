import pandas as pd
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# 1. Load both files
with open("clickbait_data.txt", "r", encoding="utf-8") as f:
    clickbait_lines = f.read().splitlines()

with open("non_clickbait_data.txt", "r", encoding="utf-8") as f:
    non_clickbait_lines = f.read().splitlines()
    
# 2. Create DataFrames and label them
clickbait_df = pd.DataFrame({"headline": clickbait_lines, "label": 1})
non_clickbait_df = pd.DataFrame({"headline": non_clickbait_lines, "label": 0})

# 3. Combine both
data = pd.concat([clickbait_df, non_clickbait_df], ignore_index=True)

# 4. Clean headlines
def clean_text(text):
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return text.lower().strip()

data["clean_headline"] = data["headline"].apply(clean_text)

# 5. Split data
X = data["clean_headline"]
y = data["label"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Vectorize
vectorizer = TfidfVectorizer(max_features=5000)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# 7. Train model
model = LogisticRegression()
model.fit(X_train_vec, y_train)

# 8. Evaluate
y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred))

# 9. Save model and vectorizer
joblib.dump(model, "clickbait_model.pkl")
joblib.dump(vectorizer, "clickbait_vectorizer.pkl")
