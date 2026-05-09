import numpy as np
import torch
import torch.nn as nn
from model import Autoencoder

# --- Reproducibility ---
torch.manual_seed(42)
np.random.seed(42)

# --- Normalization bounds ---
BPM_MIN,  BPM_MAX  = 40,  180
SPO2_MIN, SPO2_MAX = 80,  100

def normalize(bpm, spo2):
    return [
        (bpm  - BPM_MIN)  / (BPM_MAX  - BPM_MIN),
        (spo2 - SPO2_MIN) / (SPO2_MAX - SPO2_MIN)
    ]

# --- Generate synthetic normal training data ---
# Normal adult vitals: BPM 60-100, SpO2 95-100
n_samples = 2000

bpm_normal  = np.random.uniform(60, 100, n_samples)
spo2_normal = np.random.uniform(95, 100, n_samples)

raw = np.column_stack([bpm_normal, spo2_normal]).astype(np.float32)

X = np.array([normalize(b, s) for b, s in raw], dtype=np.float32)
X_tensor = torch.tensor(X)

# --- Train ---
model = Autoencoder()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = nn.MSELoss()

print("Training...")
for epoch in range(1000):
    model.train()
    pred = model(X_tensor)
    loss = loss_fn(pred, X_tensor)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 100 == 0:
        print(f"  Epoch {epoch+1}/1000 — loss: {loss.item():.6f}")

# --- Compute threshold from training data ---
# Use the 95th percentile reconstruction error on normal data as the threshold
model.eval()
with torch.no_grad():
    reconstructed = model(X_tensor).numpy()

errors = np.mean((X - reconstructed) ** 2, axis=1)
threshold = float(np.percentile(errors, 95))
print(f"\nThreshold set at 95th percentile: {threshold:.6f}")

# --- Save model + threshold ---
torch.save({
    "model_state": model.state_dict(),
    "threshold": threshold,
    "bpm_min": BPM_MIN,
    "bpm_max": BPM_MAX,
    "spo2_min": SPO2_MIN,
    "spo2_max": SPO2_MAX,
}, "autoencoder.pt")

print("Saved to autoencoder.pt")