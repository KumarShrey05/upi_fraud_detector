from flask import Flask,request,jsonify
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

model = joblib.load("fraud_model.pkl")

@app.route("/predict",methods=["POST"])
def predict():

    data = request.json

    amount = data["amount"]
    sender_balance = data["sender_balance"]
    is_new_receiver = data["is_new_receiver"]

    hour = datetime.now().hour

    balance_ratio = amount/sender_balance

    features = np.array([[amount,hour,balance_ratio,is_new_receiver]])

    prediction = model.predict(features)[0]

    risk="Low Risk"

    if prediction==1:
        risk="Medium Risk"

    if prediction==2:
        risk="High Risk"

    return jsonify({
        "risk":risk
    })

if __name__=="__main__":
    app.run(port=8000)