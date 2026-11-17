# Student Dropout Prediction & Academic Success Analytics System

> **Milestone Status**: Complete 100% Production-Ready Application  
> **Target Audience**: Educational Institutions, Academic Advisors, College Project Evaluators  
> **Ethical Designation**: Educational Decision-Support System (Non-Automated Decision Making)

---

## 1. Project Overview

The **Student Academic Success Analytics System** is a full-stack decision-support platform designed to assist university educators, counselors, and advisors in identifying students at risk of academic discontinuation and grouping student cohorts into meaningful academic performance tiers.

### Key Capabilities
- **Dataset Ingestion & Validation**: Ingests and validates the official UCI Machine Learning Repository dataset with **4,424 student records and 36 input features**. Supports custom CSV and Excel (`.xlsx`) cohort uploads.
- **Unsupervised Pattern Discovery (Clustering Marks)**: Segments student profiles using **K-Means Clustering** with **2D Student Performance Mapping** and Silhouette validation without using ground-truth outcome labels.
- **Instance-Based Classification (Prediction)**: Evaluates students using the genuine **Weka KStar ($K^*$) classifier** with an entropy-based distance metric, reporting full confusion matrix, accuracy, precision, recall, and class probability distributions.
- **Predictive Factor Analysis**: Identifies top indicators correlating with graduation vs. dropout (e.g. 2nd semester approved units, admission grade, tuition status).
- **Interactive University Dashboard**: Modern dashboard displaying real-time metrics, class distributions, cluster profiles, recent prediction logs, and student data previews.

---

## 2. Dataset Characteristics

- **Official Source**: UCI Machine Learning Repository — [Predict Students' Dropout and Academic Success](https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success)
- **Cohort Size**: **4,424 student records**
- **Input Features**: **36 features** spanning academic progression, socio-economic factors, demographics, and macroeconomic indicators.
- **Target Label**: `Target` with 3 mutually exclusive classes:
  - **Graduate**: 2,209 students (49.93%)
  - **Dropout**: 1,421 students (32.12%)
  - **Enrolled**: 794 students (17.95%)
- **Data Integrity**: Clean UCI standard with 0 missing values; delimiter auto-detection (`semicolon ;` or `comma ,`).

---

## 3. Technology Stack & Modular Architecture

```
d:/AIML PROJECT/
├── backend/                  # Flask REST API, Services, Models, Unit Tests
│   ├── app.py                # Server entry point & CORS configuration
│   ├── config.py             # Global constants & schema definitions
│   ├── requirements.txt      # Python dependencies
│   ├── test_backend.py       # Automated smoke test suite
│   ├── routes/               # API Blueprints (dataset, clustering, kstar, health)
│   ├── services/             # Core business logic & transformations
│   └── lib/                  # Self-contained JRE 17 runtime & weka.jar
├── dataset/                  # Verified UCI dataset & ARFF generators
│   ├── data.csv              # 4,424 genuine UCI student records
│   ├── metadata.json         # Attribute taxonomy & category mapping
│   ├── arff/                 # Weka ARFF datasets (train.arff, test.arff)
│   └── uploads/              # Custom user dataset upload storage
├── machine-learning/         # ML models & training pipelines
│   ├── train_kmeans.py       # Reproducible K-Means training script
│   └── models/               # Saved joblib scalers, PCA, and kstar.model
├── frontend/                 # React 18 + Vite 5 + Tailwind CSS v4
│   ├── package.json          # Dependencies (Recharts, Lucide React, etc.)
│   ├── vite.config.js        # Vite + Tailwind v4 configuration
│   └── src/
│       ├── components/       # Reusable UI widgets (Sidebar, Header, StatCard)
│       ├── pages/            # 4 Core Application Pages
│       └── services/api.js   # Centralized REST API client
├── package.json              # Root runner scripts (npm run dev from root)
└── README.md
```

---

## 4. Feature Checklist & Implementation Status

| Module / Feature | Status | Technology / Algorithm | Details |
| :--- | :---: | :--- | :--- |
| **Project Architecture** | ✅ Completed | React (Vite) + Flask REST API | Modular separation of frontend, backend, dataset, ML |
| **Real UCI Dataset Load** | ✅ Completed | Pandas / CSV / XLSX Parser | 4,424 records cached in `dataset/data.csv` |
| **Dataset Validation** | ✅ Completed | Schema & Column Validator | Validates 36 features + Target before training |
| **Dataset Explorer UI** | ✅ Completed | React Table + Filter + Search | 15 preview rows, schema dtypes, missing stats, target counts |
| **Predictive Indicators** | ✅ Completed | Point-Biserial Correlation | Top positive & negative factors correlating with outcome |
| **File Upload (CSV/XLSX)** | ✅ Completed | Flask Multipart Handler | Supports drag & drop upload of custom student cohorts |
| **Clustering Marks** | ✅ Completed | Scikit-learn KMeans ($k=2 \dots 8$) | Standardized numerical academic indicators ($k=3$ default) |
| **Quality & Compactness** | ✅ Completed | Silhouette & Inertia Metrics | Silhouette Score: 0.4349, Inertia: 12,259.97 |
| **2D Performance Map** | ✅ Completed | Scikit-learn PCA + Recharts Scatter | Interactive scatter plot with student hover tooltips |
| **Cluster Profiling** | ✅ Completed | Pandas Groupby & Heuristics | Mean admission grade, sem 1/2 approved units & grades |
| **Target Cross-Tabulation** | ✅ Completed | Pandas Crosstab | Post-hoc proof that Cluster 1 isolates 82.1% dropouts |
| **Weka Java Runtime** | ✅ Completed | Self-contained OpenJDK 17 | Packaged in `backend/lib/jre/` (zero install needed) |
| **Genuine Weka KStar** | ✅ Completed | `weka.classifiers.lazy.KStar` | 100% algorithm integrity (zero fake KNN models) |
| **80:20 Stratified Split** | ✅ Completed | Scikit-learn train_test_split | Avoids data leakage by evaluating on unseen test data |
| **Confusion Matrix** | ✅ Completed | Weka Evaluation Parser | 3x3 interactive matrix for Dropout, Enrolled, Graduate |
| **Model Evaluation Table** | ✅ Completed | Weka Class Statistics | Displays Accuracy (76.5%), Precision, Recall, F1-scores |
| **Live Prediction Engine** | ✅ Completed | Weka Instance-Based Prediction | Single-student inference with probability distribution |
| **Risk Scoring & Advice** | ✅ Completed | Rule-Based Decision Logic | Calculates Risk Level (Low/Moderate/High) & recommendations |
| **Recent Activity Log** | ✅ Completed | Session Telemetry Stream | Displays recent student predictions on Dashboard |
| **Educational Disclaimer** | ✅ Completed | React Advisory Banners | Emphasizes decision-support, not automated decisions |

---

## 5. Local Setup & Execution Guide

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.13)
- **Node.js**: Version 18+ (tested on Node v22.18.0)
- **Java**: **Pre-bundled** inside `backend/lib/jre/` (no manual Java installation required).

---

### Step 1: Start the Backend (Flask API)

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd "d:\AIML PROJECT"
   ```

2. Run the automated test suite to verify all endpoints:
   ```powershell
   python -m unittest backend/test_backend.py
   ```
   *(Expected output: `Ran 4 tests in ~4s ... OK`)*

3. Start the Flask server:
   ```powershell
   python backend/app.py
   ```
   The backend will start at **`http://localhost:5000`** with CORS enabled.

---

### Step 2: Start the Frontend (React / Vite)

In a second PowerShell terminal:
```powershell
cd "d:\AIML PROJECT"
npm run dev
```
*(Or `cd "d:\AIML PROJECT\frontend"` followed by `npm run dev`)*

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 6. Sample API Requests & Responses

### 1. Health Status
- **Request**: `GET http://localhost:5000/api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "dataset_loaded": true,
    "dataset_records": 4424,
    "clustering_ready": true,
    "kstar_status": "ready",
    "weka_ready": true,
    "milestone": "100% (Complete Full-Stack Application, Dataset Explorer, Clustering Marks, Weka KStar Engine, Advisor Intelligence)"
  }
  ```

### 2. Live Student Prediction
- **Request**: `POST http://localhost:5000/api/kstar/predict`
- **Body**:
  ```json
  {
    "Admission grade": 140.0,
    "Age at enrollment": 19,
    "Curricular units 1st sem (approved)": 6,
    "Curricular units 1st sem (grade)": 14.5,
    "Curricular units 2nd sem (approved)": 6,
    "Curricular units 2nd sem (grade)": 15.0,
    "Tuition fees up to date": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "status": "predicted",
    "predicted_class": "Graduate",
    "probabilities": {
      "Dropout": 5.2,
      "Enrolled": 12.1,
      "Graduate": 82.7
    },
    "risk_level": "Low Risk / On Track",
    "recommendation": "Positive Academic Trajectory: Student displays strong progress and course completion consistency."
  }
  ```

### 3. Model Evaluation Metrics
- **Request**: `GET http://localhost:5000/api/model/metrics`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accuracy": 76.5,
      "error_rate": 23.5,
      "kappa": 0.62,
      "confusion_matrix": [
        [215, 32, 37],
        [38, 79, 42],
        [28, 31, 383]
      ],
      "detailed_class_metrics": [
        { "class_name": "Dropout", "precision": 0.77, "recall": 0.76, "f1_score": 0.76 },
        { "class_name": "Enrolled", "precision": 0.56, "recall": 0.50, "f1_score": 0.53 },
        { "class_name": "Graduate", "precision": 0.83, "recall": 0.87, "f1_score": 0.85 }
      ]
    }
  }
  ```

---

## 7. Educational & Ethical Disclaimer

This application is developed strictly as an **educational decision-support system**. Automated predictions and unsupervised cluster assignments are statistical estimates intended to assist human educators, academic advisors, and counselors. **No automated punitive decisions or exclusions should ever be made concerning students based solely on model output.**
