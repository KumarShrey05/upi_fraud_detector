import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import numpy as np

data = {
    "amount":[100,200,5000,10000,50,300,7000,15000,200],
    "hour":[10,12,2,3,9,16,1,4,11],
    "balance_ratio":[0.01,0.02,0.5,0.9,0.005,0.03,0.7,0.95,0.02],
    "is_new_receiver":[0,0,1,1,0,0,1,1,0],
    "label":[0,0,1,2,0,0,1,2,0]
}

df = pd.DataFrame(data)

X = df.drop("label",axis=1)
y = df["label"]

model = RandomForestClassifier()

model.fit(X,y)

joblib.dump(model,"fraud_model.pkl")

print("Model trained successfully")