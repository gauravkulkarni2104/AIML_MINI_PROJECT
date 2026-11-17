"""
Automated unit & integration smoke test suite for backend endpoints.
"""

import unittest
import json
from backend.app import create_app

class BackendSmokeTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["dataset_loaded"])
        self.assertEqual(data["dataset_records"], 4424)

    def test_dataset_summary_and_correlations(self):
        res = self.client.get("/api/dataset/summary")
        self.assertEqual(res.status_code, 200)
        payload = res.get_json()
        self.assertTrue(payload["success"])
        data = payload["data"]
        self.assertEqual(data["total_records"], 4424)
        self.assertEqual(data["total_features"], 36)
        self.assertIn("Dropout", data["target_distribution"])
        self.assertIn("Graduate", data["target_distribution"])
        self.assertIn("Enrolled", data["target_distribution"])
        self.assertTrue(len(data["preview"]) > 0)

        # Test correlations endpoint
        corr_res = self.client.get("/api/dataset/correlations")
        self.assertEqual(corr_res.status_code, 200)
        corrs = corr_res.get_json()["data"]
        self.assertTrue(len(corrs) > 0)

    def test_clustering_training_and_results(self):
        # 1. Train clustering with k=3
        res = self.client.post("/api/clustering/train", json={"n_clusters": 3})
        self.assertEqual(res.status_code, 200)
        payload = res.get_json()
        self.assertTrue(payload["success"])
        data = payload["data"]
        self.assertEqual(data["n_clusters"], 3)
        self.assertIn("inertia", data)
        self.assertIn("silhouette_score", data)
        self.assertIn("pca_points", data)
        self.assertEqual(len(data["cluster_distribution"]), 3)
        self.assertIn("Cluster 0", data["cross_tabulation"])

        # 2. Get results
        res_get = self.client.get("/api/clustering/results")
        self.assertEqual(res_get.status_code, 200)

    def test_kstar_prediction_and_metrics(self):
        # 1. Status
        res_status = self.client.get("/api/kstar/status")
        self.assertEqual(res_status.status_code, 200)
        data = res_status.get_json()["data"]
        self.assertTrue(data["is_ready"])

        # 2. Prediction
        student_query = {
            "Admission grade": 140.0,
            "Age at enrollment": 19,
            "Curricular units 1st sem (approved)": 6,
            "Curricular units 1st sem (grade)": 14.5,
            "Curricular units 2nd sem (approved)": 6,
            "Curricular units 2nd sem (grade)": 15.0,
            "Tuition fees up to date": 1
        }
        res_pred = self.client.post("/api/kstar/predict", json=student_query)
        self.assertEqual(res_pred.status_code, 200)
        pred_data = res_pred.get_json()
        self.assertTrue(pred_data["success"])
        self.assertIn(pred_data["predicted_class"], ["Dropout", "Enrolled", "Graduate"])
        self.assertIn("probabilities", pred_data)

        # 3. Metrics
        res_met = self.client.get("/api/model/metrics")
        self.assertEqual(res_met.status_code, 200)
        met_data = res_met.get_json()["data"]
        self.assertTrue(met_data["is_trained"])
        self.assertIn("accuracy", met_data)
        self.assertIn("confusion_matrix", met_data)

        # 4. Recent predictions
        res_rec = self.client.get("/api/predictions/recent")
        self.assertEqual(res_rec.status_code, 200)
        rec_data = res_rec.get_json()["data"]
        self.assertTrue(len(rec_data) > 0)

    def test_models_comparison_and_prediction(self):
        # 1. Model comparison endpoint
        res = self.client.get("/api/models/comparison")
        self.assertEqual(res.status_code, 200)
        payload = res.get_json()
        self.assertTrue(payload["success"])
        models = payload["data"]["models"]
        self.assertEqual(len(models), 4)
        model_names = [m["model_name"] for m in models]
        self.assertIn("Random Forest", model_names)
        self.assertIn("Logistic Regression", model_names)
        self.assertIn("Decision Tree", model_names)
        self.assertIn("K-Star (K*)", model_names)

        # 2. Multi-model predict endpoint
        query = {
            "features": {
                "Admission grade": 145.0,
                "Age at enrollment": 19,
                "Curricular units 1st sem (approved)": 6,
                "Curricular units 1st sem (grade)": 15.0,
                "Curricular units 2nd sem (approved)": 6,
                "Curricular units 2nd sem (grade)": 15.5,
                "Tuition fees up to date": 1,
                "Debtor": 0
            },
            "model": "random_forest"
        }
        res_pred = self.client.post("/api/models/predict", json=query)
        self.assertEqual(res_pred.status_code, 200)
        data = res_pred.get_json()
        self.assertTrue(data["success"])
        self.assertIn(data["performance_level"], ["Good", "Average", "At Risk"])
        self.assertIn(data["dropout_risk"], ["Low", "High"])
        self.assertIn("recommendations", data)
        self.assertIn("study_recommendations", data["recommendations"])

if __name__ == "__main__":
    unittest.main()
