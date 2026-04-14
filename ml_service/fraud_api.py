from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# -------------------------
# Load trained model
# -------------------------
model = joblib.load("outputs/fraud_model.pkl")

# Load model accuracy from JSON
with open("outputs/model_info.json", "r") as f:
    model_info = json.load(f)
model_accuracy = model_info.get("accuracy", 0)

# CSV log file path
log_file = "transaction_logs.csv"

# Ensure log file exists with headers
if not os.path.exists(log_file):
    df = pd.DataFrame(
        columns=[
            "timestamp",
            "amount",
            "sender_balance",
            "balance_ratio",
            "is_new_receiver",
            "risk",
            "risk_score",
            "model_accuracy",
        ]
    )
    df.to_csv(log_file, index=False)


# -------------------------
# Home route
# -------------------------
@app.route("/", methods=["GET"])
def home():
    return "Welcome to the Fraud Detection API!"


# -------------------------
# Predict route
# -------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    try:
        amount = float(data["amount"])
        sender_balance = float(data["sender_balance"])
        is_new_receiver = int(data["is_new_receiver"])
    except (KeyError, ValueError):
        return jsonify({"error": "Invalid input data"}), 400

    # Current hour
    hour = datetime.now().hour
    balance_ratio = amount / sender_balance if sender_balance != 0 else 0

    features = np.array([[amount, hour, balance_ratio, is_new_receiver]])
    proba = model.predict_proba(features)[0]

    # Risk score calculation
    risk_score = int((proba[1] * 0.5 + proba[2]) * 100)
    risk_score = int(risk_score * (0.5 + balance_ratio))
    risk_score = min(risk_score, 100)

    # Risk label
    if risk_score > 60:
        risk = "High Risk"
    elif risk_score > 30:
        risk = "Medium Risk"
    else:
        risk = "Low Risk"

    # -------------------------
    # Append transaction log
    # -------------------------
    log_entry = pd.DataFrame(
        [
            {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "amount": amount,
                "sender_balance": sender_balance,
                "balance_ratio": round(balance_ratio, 2),
                "is_new_receiver": is_new_receiver,
                "risk": risk,
                "risk_score": risk_score,
                "model_accuracy": round(model_accuracy, 2),
            }
        ]
    )

    # Append to CSV, newest on top
    if os.path.exists(log_file):
        df_existing = pd.read_csv(log_file)
        df_combined = pd.concat([log_entry, df_existing], ignore_index=True)
    else:
        df_combined = log_entry

    df_combined.to_csv(log_file, index=False)

    return jsonify({"risk": risk, "score": risk_score})


# -------------------------
# Run Flask API
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
