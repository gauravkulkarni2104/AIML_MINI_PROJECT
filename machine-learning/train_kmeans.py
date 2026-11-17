"""
Standalone training script for K-Means Clustering on the Student Dropout dataset.
Saves preprocessor, K-Means model, PCA transformer, and baseline clustering results.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

DEFAULT_FEATURES = [
    "Admission grade",
    "Age at enrollment",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 2nd sem (approved)",
    "Curricular units 2nd sem (grade)",
]

def load_data(path=DATA_PATH):
    df = pd.read_csv(path, sep=";")
    df.columns = [c.strip() for c in df.columns]
    return df

def train_and_export(n_clusters=3, features=DEFAULT_FEATURES, random_state=42):
    df = load_data()
    X = df[features].copy()
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    
    pca = PCA(n_components=2, random_state=random_state)
    X_pca = pca.fit_transform(X_scaled)
    
    sil_score = float(silhouette_score(X_scaled, labels))
    inertia = float(kmeans.inertia_)
    
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))
    joblib.dump(kmeans, os.path.join(MODEL_DIR, f"kmeans_k{n_clusters}.joblib"))
    joblib.dump(pca, os.path.join(MODEL_DIR, "pca.joblib"))
    
    print(f"Training completed with k={n_clusters}")
    print(f"Inertia: {inertia:.2f}, Silhouette Score: {sil_score:.4f}")
    return {
        "n_clusters": n_clusters,
        "inertia": inertia,
        "silhouette_score": sil_score,
        "features": features
    }

if __name__ == "__main__":
    train_and_export()
