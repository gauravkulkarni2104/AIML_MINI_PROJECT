"""
Multi-Model Machine Learning Classification and Recommendation Service.
Supports:
1. Random Forest Classifier
2. Logistic Regression
3. Decision Tree Classifier
4. Weka K-Star (K*) Classifier

Provides:
- Comparative evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix)
- Performance level rating: Good / Average / At Risk
- Dropout risk categorization: Low / High
- Actionable recommendations across Study, Attendance, and Coursework
"""

import os
import json
import datetime
import joblib
import pandas as pd
import numpy as np
from backend.config import BASE_DIR, DEFAULT_DATASET_PATH, EXPECTED_FEATURES, TARGET_CLASSES
from backend.services.kstar_service import kstar_service

MODELS_DIR = os.path.join(BASE_DIR, "machine-learning", "models")
COMPARISON_PATH = os.path.join(MODELS_DIR, "models_comparison.json")
RF_PATH = os.path.join(MODELS_DIR, "rf_model.joblib")
LR_PATH = os.path.join(MODELS_DIR, "lr_model.joblib")
DT_PATH = os.path.join(MODELS_DIR, "dt_model.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")

class ModelsService:
    def __init__(self):
        self.rf_model = None
        self.lr_model = None
        self.dt_model = None
        self.scaler = None
        self.comparison_data = None
        self.recent_predictions = []
        self._load_artifacts()

    def _load_artifacts(self):
        if os.path.exists(RF_PATH):
            try:
                self.rf_model = joblib.load(RF_PATH)
            except Exception:
                pass
        if os.path.exists(LR_PATH):
            try:
                self.lr_model = joblib.load(LR_PATH)
            except Exception:
                pass
        if os.path.exists(DT_PATH):
            try:
                self.dt_model = joblib.load(DT_PATH)
            except Exception:
                pass
        if os.path.exists(SCALER_PATH):
            try:
                self.scaler = joblib.load(SCALER_PATH)
            except Exception:
                pass
        if os.path.exists(COMPARISON_PATH):
            try:
                with open(COMPARISON_PATH, "r") as f:
                    self.comparison_data = json.load(f)
            except Exception:
                pass

    def get_comparison(self):
        if not self.comparison_data and os.path.exists(COMPARISON_PATH):
            with open(COMPARISON_PATH, "r") as f:
                self.comparison_data = json.load(f)
        return self.comparison_data or {"models": [], "evaluation_summary": {}}

    def _generate_recommendations(self, features, pred_class, probs, risk_level):
        sem1_approved = float(features.get("Curricular units 1st sem (approved)", 5))
        sem2_approved = float(features.get("Curricular units 2nd sem (approved)", 5))
        sem1_evals = float(features.get("Curricular units 1st sem (evaluations)", 6))
        sem2_evals = float(features.get("Curricular units 2nd sem (evaluations)", 6))
        sem1_enrolled = float(features.get("Curricular units 1st sem (enrolled)", 6))
        sem2_enrolled = float(features.get("Curricular units 2nd sem (enrolled)", 6))
        sem1_grade = float(features.get("Curricular units 1st sem (grade)", 13.0))
        sem2_grade = float(features.get("Curricular units 2nd sem (grade)", 13.0))
        tuition_up_to_date = int(features.get("Tuition fees up to date", 1))
        debtor = int(features.get("Debtor", 0))
        scholarship = int(features.get("Scholarship holder", 0))

        risk_factors = []
        if sem2_approved <= 2:
            risk_factors.append("Critically low 2nd semester course completions (<= 2 units approved)")
        elif sem2_approved < 5:
            risk_factors.append("Sub-optimal course completions in 2nd semester")

        if sem2_grade > 0 and sem2_grade < 10.0:
            risk_factors.append("Semester grade average below passing threshold (< 10.0 / 20)")

        if tuition_up_to_date == 0 or debtor == 1:
            risk_factors.append("Outstanding tuition fees / institutional debt record")

        eval_gap_sem2 = max(0, sem2_enrolled - sem2_evals)
        if eval_gap_sem2 >= 2:
            risk_factors.append(f"Missed evaluation assessments ({int(eval_gap_sem2)} courses without evaluation)")

        # Personalized recommendations
        study_rec = []
        if sem2_approved <= 2 or sem1_approved <= 2:
            study_rec.append("Implement immediate academic intervention: Enroll in remedial tutoring modules for core foundational courses.")
            study_rec.append("Course load pacing: Consider reducing per-semester credit load to improve subject mastery and pass rates.")
        elif sem2_grade < 12.0:
            study_rec.append("Attend departmental study groups and peer-assisted learning sessions weekly.")
            study_rec.append("Schedule bi-weekly consultation hours with course professors for difficult topics.")
        else:
            study_rec.append("Maintain current study schedule and examine advanced elective prerequisites.")

        attendance_rec = []
        if eval_gap_sem2 > 0 or (sem1_evals < sem1_enrolled):
            attendance_rec.append("Exam & Assessment Compliance: Ensure 100% attendance during midterm and final evaluation periods.")
            attendance_rec.append("Monitor classroom attendance records regularly to avoid automatic de-registration.")
        else:
            attendance_rec.append("Assessment attendance is steady; continue participating actively in lab and recitation sessions.")

        assignment_rec = []
        if tuition_up_to_date == 0 or debtor == 1:
            assignment_rec.append("Financial Services Consultation: Connect with the Student Welfare Office for installment payment plans or emergency grant assistance.")
        if scholarship == 1 and risk_level == "High":
            assignment_rec.append("Scholarship Retention Alert: Academic counseling recommended to meet minimum credit criteria for scholarship renewal.")
        assignment_rec.append("Designated Faculty Advisor Meeting: Schedule a progress review checkpoint within the next 14 days.")

        return {
            "risk_factors": risk_factors if risk_factors else ["No major high-risk indicators identified; academic trajectory is stable."],
            "study_recommendations": study_rec,
            "attendance_recommendations": attendance_rec,
            "assignment_recommendations": assignment_rec
        }

    def predict(self, feature_dict, model_choice="random_forest"):
        model_choice = (model_choice or "random_forest").lower()

        # Delegate to KStar if requested
        if model_choice == "kstar" or model_choice == "k-star":
            res = kstar_service.predict(feature_dict)
            if not res.get("success"):
                return res
            pred_class = res.get("predicted_class", "Graduate")
            probs = res.get("probabilities", {"Dropout": 20.0, "Enrolled": 20.0, "Graduate": 60.0})
            dropout_prob = probs.get("Dropout", 0)
        else:
            # Build feature array in canonical column order
            df = pd.read_csv(DEFAULT_DATASET_PATH, sep=";")
            df.columns = [c.strip().replace("\t", "") for c in df.columns]

            row_values = []
            for col in EXPECTED_FEATURES:
                val = feature_dict.get(col)
                if val is None or val == "":
                    val = float(df[col].median())
                else:
                    try:
                        val = float(val)
                    except ValueError:
                        val = float(df[col].median())
                row_values.append(val)

            X_input = pd.DataFrame([row_values], columns=EXPECTED_FEATURES)

            if model_choice == "logistic_regression" and self.lr_model:
                if self.scaler:
                    X_input_scaled = self.scaler.transform(X_input)
                    pred_class = self.lr_model.predict(X_input_scaled)[0]
                    prob_array = self.lr_model.predict_proba(X_input_scaled)[0]
                else:
                    pred_class = self.lr_model.predict(X_input)[0]
                    prob_array = self.lr_model.predict_proba(X_input)[0]
            elif model_choice == "decision_tree" and self.dt_model:
                pred_class = self.dt_model.predict(X_input)[0]
                prob_array = self.dt_model.predict_proba(X_input)[0]
            else:
                # Default to Random Forest
                if not self.rf_model:
                    self._load_artifacts()
                pred_class = self.rf_model.predict(X_input)[0]
                prob_array = self.rf_model.predict_proba(X_input)[0]

            classes = ["Dropout", "Enrolled", "Graduate"]
            probs = {
                cls: round(float(prob_array[i]) * 100, 1)
                for i, cls in enumerate(classes)
            }
            dropout_prob = probs.get("Dropout", 0)

        # Performance Level: Good / Average / At Risk
        sem2_app = float(feature_dict.get("Curricular units 2nd sem (approved)", 5))
        sem2_grd = float(feature_dict.get("Curricular units 2nd sem (grade)", 13))

        if pred_class == "Graduate" and (dropout_prob < 25) and (sem2_app >= 5 or sem2_grd >= 12):
            performance_level = "Good"
        elif pred_class == "Dropout" or dropout_prob >= 45 or sem2_app <= 2:
            performance_level = "At Risk"
        else:
            performance_level = "Average"

        # Dropout Risk: Low / High
        dropout_risk = "High" if (dropout_prob >= 35 or performance_level == "At Risk") else "Low"

        # Model display name
        display_names = {
            "random_forest": "Random Forest",
            "logistic_regression": "Logistic Regression",
            "decision_tree": "Decision Tree",
            "kstar": "K-Star (K*)"
        }
        model_display = display_names.get(model_choice, "Random Forest")

        recommendations = self._generate_recommendations(feature_dict, pred_class, probs, dropout_risk)

        prediction_record = {
            "id": len(self.recent_predictions) + 1,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "model_used": model_display,
            "predicted_class": pred_class,
            "performance_level": performance_level,
            "dropout_risk": dropout_risk,
            "probabilities": probs,
            "recommendations": recommendations,
            "student_profile": {
                "admission_grade": feature_dict.get("Admission grade"),
                "age": feature_dict.get("Age at enrollment"),
                "sem1_approved": feature_dict.get("Curricular units 1st sem (approved)"),
                "sem2_approved": feature_dict.get("Curricular units 2nd sem (approved)")
            }
        }

        self.recent_predictions.insert(0, prediction_record)
        if len(self.recent_predictions) > 20:
            self.recent_predictions = self.recent_predictions[:20]

        return {
            "success": True,
            "status": "predicted",
            **prediction_record
        }

    def get_recent_predictions(self):
        return self.recent_predictions

models_service = ModelsService()
