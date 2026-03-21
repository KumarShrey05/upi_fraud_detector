import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import random

data = []

for _ in range(10000):   # dataset size
    amount = random.randint(10, 20000)
    hour = random.randint(0, 23)
    is_new_receiver = random.choice([0, 1])

    sender_balance = random.randint(1000, 20000)
    balance_ratio = amount / sender_balance

    # RULES
    if balance_ratio > 0.9:
        label = 2  # High Risk
    elif balance_ratio > 0.7:
        label = 1  # Medium Risk
    elif balance_ratio > 0.5 and is_new_receiver == 1:
        label = 1  # Medium Risk (new receiver)
    else:
        label = 0  # Low Risk

    data.append([amount, hour, balance_ratio, is_new_receiver, label])

# Create DataFrame
df = pd.DataFrame(data, columns=[
    "amount",
    "hour",
    "balance_ratio",
    "is_new_receiver",
    "label"
])

# Split features & target
X = df.drop("label", axis=1)
y = df["label"]

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save model
joblib.dump(model, "fraud_model.pkl")

print("Model trained with 10000 rows")