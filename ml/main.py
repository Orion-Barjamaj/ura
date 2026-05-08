from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import torch
from model import Autoencoder

app = FastAPI()

# Allow Next.js to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load model ---
checkpoint = torch.load("autoencoder.pt", weights_only=False)

model = Autoencoder()
model.load_state_dict(checkpoint["model_state"])
model.eval()

THRESHOLD  = checkpoint["threshold"]
BPM_MIN    = checkpoint["bpm_min"]
BPM_MAX    = checkpoint["bpm_max"]
SPO2_MIN   = checkpoint["spo2_min"]
SPO2_MAX   = checkpoint["spo2_max"]

print(f"Model loaded. Threshold: {THRESHOLD:.6f}")

# --- Helpers ---
def normalize(bpm: int, spo2: int):
    return [
        (bpm  - BPM_MIN)  / (BPM_MAX  - BPM_MIN),
        (spo2 - SPO2_MIN) / (SPO2_MAX - SPO2_MIN)
    ]

def get_risk_level(score: float) -> str:
    if score > THRESHOLD * 3:
        return "critical"
    elif score > THRESHOLD:
        return "warning"
    return "normal"

# --- Request schema ---
class Vitals(BaseModel):
    bpm: int
    spo2: int

# --- Routes ---
@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(vitals: Vitals):
    x = np.array([normalize(vitals.bpm, vitals.spo2)], dtype=np.float32)
    tensor = torch.tensor(x)

    with torch.no_grad():
        reconstructed = model(tensor).numpy()

    score = float(np.mean((x - reconstructed) ** 2))
    risk  = get_risk_level(score)

    return {
        "bpm":        vitals.bpm,
        "spo2":       vitals.spo2,
        "anomaly":    risk != "normal",
        "score":      round(score, 6),
        "threshold":  round(THRESHOLD, 6),
        "risk_level": risk
    }