import pandas as pd
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
from transformers import DataCollatorWithPadding
from dataset import Dataset
import torch

# Load your datasets
fake_df = pd.read_csv("dataset/Fake.csv")
true_df = pd.read_csv("dataset/True.csv")

# Label them
fake_df["label"] = 0
true_df["label"] = 1

# Combine and shuffle
df = pd.concat([fake_df, true_df]).sample(frac=1).reset_index(drop=True)

# Use only short text (you can use title, or truncate text)
df = df[["text", "label"]]
df = df.dropna()

# Split into train and test
train_texts, val_texts, train_labels, val_labels = train_test_split(df["text"], df["label"], test_size=0.2)

# Load tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Tokenize
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True)
val_encodings = tokenizer(list(val_texts), truncation=True, padding=True)

# Convert to Dataset format
train_dataset = Dataset.from_dict({**train_encodings, "label": list(train_labels)})
val_dataset = Dataset.from_dict({**val_encodings, "label": list(val_labels)})

# Define model
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# Training arguments
training_args = TrainingArguments(
    output_dir="./bert_model",
    evaluation_strategy="epoch",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=2,
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
    data_collator=DataCollatorWithPadding(tokenizer),
)

# Train
trainer.train()

# Save model & tokenizer
model.save_pretrained("./bert_model")
tokenizer.save_pretrained("./bert_model")

print("✅ BERT model and tokenizer saved in ./bert_model")
