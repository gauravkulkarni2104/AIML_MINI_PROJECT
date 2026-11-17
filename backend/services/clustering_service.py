"""
K-Means unsupervised clustering service with StandardScaler, PCA 2D projection,
inertia, silhouette scoring, cluster profiling, and post-hoc Target cross-tabulation.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from backend.config import (
    DEFAULT_CLUSTERING_FEATURES,
    MODELS_DIR,
    TARGET_COLUMN
)
from backend.services.dataset_service import dataset_service

class ClusteringService:
    def __init__(self):
        self.current_results = None
        self.scaler = None
        self.kmeans = None
        self.pca = None

    def run_clustering(self, n_clusters=3, features=None, random_state=42):
        n_clusters = int(n_clusters)
        if n_clusters < 2 or n_clusters > 8:
            raise ValueError("n_clusters must be between 2 and 8.")

        selected_features = features if features and len(features) >= 2 else DEFAULT_CLUSTERING_FEATURES
        df = dataset_service.get_dataframe()

        # Validate selected features
        for f in selected_features:
            if f not in df.columns:
                raise ValueError(f"Feature '{f}' not found in dataset.")

        X = df[selected_features].copy()

        # 1. StandardScaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # 2. KMeans
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        labels = self.kmeans.fit_predict(X_scaled)

        # 3. PCA 2D projection for visualization
        self.pca = PCA(n_components=2, random_state=random_state)
        X_pca = self.pca.fit_transform(X_scaled)
        pca_variance = [float(round(v * 100, 2)) for v in self.pca.explained_variance_ratio_]

        # 4. Metrics
        inertia = float(round(self.kmeans.inertia_, 2))
        try:
            sil_score = float(round(silhouette_score(X_scaled, labels), 4))
        except Exception:
            sil_score = None

        # 5. Cluster distribution & statistics
        df_clustered = df.copy()
        df_clustered["Cluster_ID"] = labels
        df_clustered["Cluster"] = [f"Cluster {l}" for l in labels]

        total_students = len(df_clustered)
        cluster_distribution = []
        cluster_summaries = {}

        for c_id in range(n_clusters):
            c_name = f"Cluster {c_id}"
            sub = df_clustered[df_clustered["Cluster_ID"] == c_id]
            c_count = len(sub)
            c_pct = round((c_count / total_students) * 100, 2)
            cluster_distribution.append({
                "cluster": c_name,
                "cluster_id": c_id,
                "count": c_count,
                "percentage": c_pct
            })

            # Feature statistics for this cluster
            stats = {}
            for f in selected_features:
                stats[f] = {
                    "mean": float(round(sub[f].mean(), 2)),
                    "median": float(round(sub[f].median(), 2)),
                    "min": float(round(sub[f].min(), 2)),
                    "max": float(round(sub[f].max(), 2)),
                    "std": float(round(sub[f].std(), 2))
                }
            cluster_summaries[c_name] = stats

        # 6. Post-hoc comparison with actual Target classes (NOT used in training)
        cross_tabulation = {}
        if TARGET_COLUMN in df_clustered.columns:
            ct = pd.crosstab(df_clustered["Cluster"], df_clustered[TARGET_COLUMN])
            for c_name in ct.index:
                row_dict = {}
                row_total = int(ct.loc[c_name].sum())
                for target_val in ct.columns:
                    val_count = int(ct.loc[c_name, target_val])
                    row_dict[target_val] = {
                        "count": val_count,
                        "percentage": round((val_count / row_total * 100), 2) if row_total > 0 else 0
                    }
                cross_tabulation[c_name] = row_dict

        # 7. Cluster interpretation heuristic based on academic metrics
        interpretations = {}
        for c_name, stats in cluster_summaries.items():
            # Check 1st and 2nd sem approved & grade
            sem2_app = stats.get("Curricular units 2nd sem (approved)", {}).get("mean", 0)
            sem2_grd = stats.get("Curricular units 2nd sem (grade)", {}).get("mean", 0)
            adm_grd = stats.get("Admission grade", {}).get("mean", 0)
            
            if sem2_app < 2.0 or sem2_grd < 6.0:
                profile_desc = "Academic At-Risk: Substantial drop in unit completion and lowest semester grades; students in this cluster demonstrate high risk of discontinuation."
                badge = "High Risk"
            elif sem2_app >= 5.0 and sem2_grd >= 12.0:
                profile_desc = "High Academic Progress: High approved units and consistent course performance across semesters."
                badge = "Strong Progress"
            else:
                profile_desc = "Moderate / Intermediate: Steady course progression with partial completion and intermediate grades."
                badge = "Moderate Progress"

            interpretations[c_name] = {
                "academic_profile": profile_desc,
                "badge": badge,
                "avg_admission_grade": adm_grd,
                "avg_sem2_approved": sem2_app,
                "avg_sem2_grade": sem2_grd
            }

        # 8. Scatter visualization points (sample up to 600 points evenly across clusters for smooth UI rendering)
        # We sample while preserving exact distribution proportions
        sample_indices = []
        for c_id in range(n_clusters):
            c_indices = df_clustered[df_clustered["Cluster_ID"] == c_id].index.tolist()
            sample_size = min(len(c_indices), int(600 / n_clusters))
            np.random.seed(random_state)
            sampled = np.random.choice(c_indices, size=sample_size, replace=False)
            sample_indices.extend(sampled)

        pca_points = []
        for idx in sample_indices:
            row = df_clustered.loc[idx]
            pca_points.append({
                "student_id": int(idx),
                "pca1": float(round(X_pca[idx, 0], 3)),
                "pca2": float(round(X_pca[idx, 1], 3)),
                "cluster": f"Cluster {int(row['Cluster_ID'])}",
                "cluster_id": int(row['Cluster_ID']),
                "actual_target": str(row.get(TARGET_COLUMN, "Unknown")),
                "admission_grade": float(row.get("Admission grade", 0)),
                "sem1_approved": float(row.get("Curricular units 1st sem (approved)", 0)),
                "sem2_approved": float(row.get("Curricular units 2nd sem (approved)", 0))
            })

        # Save model artifacts
        joblib.dump(self.scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
        joblib.dump(self.kmeans, os.path.join(MODELS_DIR, f"kmeans_k{n_clusters}.joblib"))
        joblib.dump(self.pca, os.path.join(MODELS_DIR, "pca.joblib"))

        self.current_results = {
            "n_clusters": n_clusters,
            "features_used": selected_features,
            "inertia": inertia,
            "silhouette_score": sil_score,
            "explained_variance_pca": pca_variance,
            "cluster_distribution": cluster_distribution,
            "cluster_summaries": cluster_summaries,
            "cluster_interpretations": interpretations,
            "cross_tabulation": cross_tabulation,
            "pca_points": pca_points,
            "total_points_sampled": len(pca_points),
            "total_records": total_students
        }
        return self.current_results

    def get_latest_results(self):
        if self.current_results is None:
            return self.run_clustering(n_clusters=3)
        return self.current_results


# Global singleton
clustering_service = ClusteringService()
