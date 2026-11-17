"""
Dataset loading, validation, and statistical summary service.
"""

import os
import json
import pandas as pd
import numpy as np
from backend.config import (
    DEFAULT_DATASET_PATH,
    METADATA_PATH,
    EXPECTED_FEATURES,
    TARGET_COLUMN,
    DEFAULT_CLUSTERING_FEATURES
)

class DatasetService:
    def __init__(self, dataset_path=DEFAULT_DATASET_PATH):
        self.dataset_path = dataset_path
        self._df = None
        self._load_metadata()
        self.load_dataset()

    def _load_metadata(self):
        self.metadata = {}
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)

    def load_dataset(self, file_path=None):
        path_to_load = file_path or self.dataset_path
        if not os.path.exists(path_to_load):
            raise FileNotFoundError(f"Dataset file not found at {path_to_load}")

        if path_to_load.endswith(".xlsx") or path_to_load.endswith(".xls"):
            df = pd.read_excel(path_to_load)
        else:
            # Try semicolon first, then comma
            try:
                df = pd.read_csv(path_to_load, sep=";")
                if df.shape[1] == 1:
                    df = pd.read_csv(path_to_load, sep=",")
            except Exception:
                df = pd.read_csv(path_to_load, sep=",")

        # Clean column names (strip whitespace and tabs)
        df.columns = [str(c).strip().replace("\t", "") for c in df.columns]
        self._df = df
        self.dataset_path = path_to_load
        return self._df

    def get_dataframe(self):
        if self._df is None:
            self.load_dataset()
        return self._df.copy()

    def validate_dataset(self, df):
        """Validate whether a dataframe conforms to the expected 36 input features and Target."""
        cols = set(c.strip().replace("\t", "") for c in df.columns)
        expected_set = set(EXPECTED_FEATURES)
        
        missing_features = [f for f in EXPECTED_FEATURES if f not in cols]
        has_target = TARGET_COLUMN in cols

        is_valid = len(missing_features) == 0 and has_target
        return {
            "is_valid": is_valid,
            "total_columns": len(df.columns),
            "total_rows": len(df),
            "has_target": has_target,
            "missing_features": missing_features,
            "matched_features_count": len(EXPECTED_FEATURES) - len(missing_features)
        }

    def get_summary(self):
        df = self.get_dataframe()
        total_records = int(len(df))
        total_features = int(len(df.columns) - 1) if TARGET_COLUMN in df.columns else int(len(df.columns))

        # Target class distribution
        target_dist = {}
        if TARGET_COLUMN in df.columns:
            counts = df[TARGET_COLUMN].value_counts().to_dict()
            for cls, cnt in counts.items():
                target_dist[cls] = {
                    "count": int(cnt),
                    "percentage": round(float((cnt / total_records) * 100), 2)
                }

        # Columns info
        columns_info = []
        for col in df.columns:
            missing = int(df[col].isna().sum())
            dtype = str(df[col].dtype)
            is_num = bool(pd.api.types.is_numeric_dtype(df[col]))
            col_stat = {
                "name": col,
                "dtype": dtype,
                "missing_count": missing,
                "is_target": col == TARGET_COLUMN,
                "is_numeric": is_num
            }
            if is_num and col != TARGET_COLUMN:
                col_stat["min"] = float(round(df[col].min(), 2))
                col_stat["max"] = float(round(df[col].max(), 2))
                col_stat["mean"] = float(round(df[col].mean(), 2))
            columns_info.append(col_stat)

        # Preview (first 15 rows)
        preview_rows = df.head(15).replace({np.nan: None}).to_dict(orient="records")

        # Academic performance highlights
        academic_highlights = {}
        for metric in ["Admission grade", "Age at enrollment", "Curricular units 1st sem (approved)", "Curricular units 2nd sem (approved)"]:
            if metric in df.columns:
                academic_highlights[metric] = {
                    "mean": float(round(df[metric].mean(), 2)),
                    "min": float(round(df[metric].min(), 2)),
                    "max": float(round(df[metric].max(), 2)),
                    "std": float(round(df[metric].std(), 2))
                }

        return {
            "total_records": total_records,
            "total_features": total_features,
            "has_target": TARGET_COLUMN in df.columns,
            "target_distribution": target_dist,
            "academic_highlights": academic_highlights,
            "columns": columns_info,
            "preview": preview_rows,
            "recommended_clustering_features": DEFAULT_CLUSTERING_FEATURES,
            "feature_categories": self.metadata.get("feature_categories", {})
        }

    def get_sample_students(self, count=5):
        """Return a few sample student records covering Dropout, Enrolled, and Graduate for quick prediction testing."""
        df = self.get_dataframe()
        samples = []
        if TARGET_COLUMN in df.columns:
            for target_val in ["Dropout", "Graduate", "Enrolled"]:
                sub = df[df[TARGET_COLUMN] == target_val]
                if not sub.empty:
                    samples.extend(sub.head(2).to_dict(orient="records"))
        else:
            samples = df.head(count).to_dict(orient="records")
        return samples[:count]

    def get_correlations(self):
        """Calculate correlation of numeric features with Graduation vs Dropout."""
        df = self.get_dataframe()
        if TARGET_COLUMN not in df.columns:
            return []

        sub = df[df[TARGET_COLUMN].isin(["Graduate", "Dropout"])].copy()
        sub["_target_binary"] = (sub[TARGET_COLUMN] == "Graduate").astype(int)

        corrs = []
        for col in sub.columns:
            if col not in [TARGET_COLUMN, "_target_binary"] and pd.api.types.is_numeric_dtype(sub[col]):
                c = sub[col].corr(sub["_target_binary"])
                if not pd.isna(c):
                    corrs.append({
                        "feature": col,
                        "correlation": round(float(c), 3),
                        "abs_correlation": round(abs(float(c)), 3),
                        "impact": "Increases Graduation Likelihood" if c > 0 else "Increases Dropout Risk"
                    })
        corrs.sort(key=lambda x: x["abs_correlation"], reverse=True)
        return corrs[:12]


# Global singleton instance
dataset_service = DatasetService()
