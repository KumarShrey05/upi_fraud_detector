import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import random
import os
import json
import matplotlib.pyplot as plt
import seaborn as sns

# -------------------------
# Output folder
# -------------------------
output_folder = "outputs"
os.makedirs(output_folder, exist_ok=True)

# -------------------------
# Generate synthetic dataset
# -------------------------
data = []
for _ in range(10000):  # dataset size
    amount = random.randint(10, 20000)
    hour = random.randint(0, 23)
    is_new_receiver = random.choice([0, 1])
    sender_balance = random.randint(1000, 20000)
    balance_ratio = amount / sender_balance

    # Rules for labeling
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
    "amount", "hour", "balance_ratio", "is_new_receiver", "label"
])

# -------------------------
# Split features & target
# -------------------------
X = df.drop("label", axis=1)
y = df["label"]

# -------------------------
# Train model
# -------------------------
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save trained model
joblib.dump(model, os.path.join(output_folder, "fraud_model.pkl"))

# -------------------------
# Predictions & metrics
# -------------------------
y_pred = model.predict(X)
accuracy = (y_pred == y).mean()

# Classification report CSV
report = classification_report(y, y_pred, output_dict=True)
df_report = pd.DataFrame(report).transpose().round(2)
df_report.to_csv(os.path.join(output_folder, "classification_report.csv"))

# Confusion matrix CSV
cm = confusion_matrix(y, y_pred)
df_cm = pd.DataFrame(cm, index=[0,1,2], columns=[0,1,2])
df_cm.to_csv(os.path.join(output_folder, "confusion_matrix.csv"))

# Accuracy CSV
df_acc = pd.DataFrame([{"accuracy": round(accuracy, 4)}])
df_acc.to_csv(os.path.join(output_folder, "model_accuracy.csv"), index=False)

# -------------------------
# Feature importance
# -------------------------
feature_imp = pd.DataFrame({
    "feature": X.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)
feature_imp.to_csv(os.path.join(output_folder, "feature_importance.csv"), index=False)

# Plot feature importance
plt.figure(figsize=(8,5))
sns.barplot(x="importance", y="feature", data=feature_imp)
plt.title("Feature Importance")
plt.tight_layout()
plt.savefig(os.path.join(output_folder, "feature_importance.png"))
plt.close()

# -------------------------
# Save model info JSON
# -------------------------
with open(os.path.join(output_folder, "model_info.json"), "w") as f:
    json.dump({"accuracy": round(accuracy, 4)}, f)

print("Model trained and saved successfully.")
print(f"All outputs stored in '{output_folder}/' folder.")