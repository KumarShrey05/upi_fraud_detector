from flask import Flask, request, jsonify
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

model = joblib.load("fraud_model.pkl")


@app.route("/", methods=["GET"])
def home():
    return "Welcome to the Fraud Detection API!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    print(f"Received data: {data}")

    amount = data["amount"]
    sender_balance = data["sender_balance"]
    is_new_receiver = data["is_new_receiver"]

    hour = datetime.now().hour

    balance_ratio = amount / sender_balance

    features = np.array([[amount, hour, balance_ratio, is_new_receiver]])

    proba = model.predict_proba(features)[0]

    risk_score = int((proba[1]*0.5 + proba[2]) * 100)
    risk_score = int(risk_score * (0.5 + balance_ratio))
    risk_score = min(risk_score, 100)

    risk = "Low Risk"
    if risk_score > 60:
        risk = "High Risk"
    elif risk_score > 30:
        risk = "Medium Risk"

    return jsonify({"risk": risk, "score": risk_score})


if __name__ == "__main__":
    app.run(port=8000)