"""
Configuration settings and constants for Student Academic Success Analytics System.
"""

import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
DEFAULT_DATASET_PATH = os.path.join(DATASET_DIR, "data.csv")
METADATA_PATH = os.path.join(DATASET_DIR, "metadata.json")
MODELS_DIR = os.path.join(BASE_DIR, "machine-learning", "models")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "dataset", "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# 36 Canonical Input Features (stripped of trailing tabs/spaces)
EXPECTED_FEATURES = [
    "Marital status",
    "Application mode",
    "Application order",
    "Course",
    "Daytime/evening attendance",
    "Previous qualification",
    "Previous qualification (grade)",
    "Nacionality",
    "Mother's qualification",
    "Father's qualification",
    "Mother's occupation",
    "Father's occupation",
    "Admission grade",
    "Displaced",
    "Educational special needs",
    "Debtor",
    "Tuition fees up to date",
    "Gender",
    "Scholarship holder",
    "Age at enrollment",
    "International",
    "Curricular units 1st sem (credited)",
    "Curricular units 1st sem (enrolled)",
    "Curricular units 1st sem (evaluations)",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 1st sem (without evaluations)",
    "Curricular units 2nd sem (credited)",
    "Curricular units 2nd sem (enrolled)",
    "Curricular units 2nd sem (evaluations)",
    "Curricular units 2nd sem (approved)",
    "Curricular units 2nd sem (grade)",
    "Curricular units 2nd sem (without evaluations)",
    "Unemployment rate",
    "Inflation rate",
    "GDP"
]

TARGET_COLUMN = "Target"
TARGET_CLASSES = ["Dropout", "Enrolled", "Graduate"]

# Meaningful academic continuous features recommended for K-Means
DEFAULT_CLUSTERING_FEATURES = [
    "Admission grade",
    "Age at enrollment",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 2nd sem (approved)",
    "Curricular units 2nd sem (grade)"
]
