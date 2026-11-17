"""
Machine Learning Models and Classification Endpoints.
Serves model comparisons, genuine Weka K-Star, Random Forest, Logistic Regression, 
Decision Tree evaluations, and student outcome predictions.
"""

from flask import Blueprint, jsonify, request
from backend.services.kstar_service import kstar_service
from backend.services.models_service import models_service

kstar_bp = Blueprint("kstar", __name__)

@kstar_bp.route("/models/comparison", methods=["GET"])
def get_models_comparison():
    data = models_service.get_comparison()
    return jsonify({"success": True, "data": data}), 200

@kstar_bp.route("/models/predict", methods=["POST"])
def predict_model():
    body = request.get_json(silent=True) or {}
    features = body.get("features", body)
    model_choice = body.get("model", "random_forest")

    if not features:
        return jsonify({"success": False, "error": "No feature data provided."}), 400

    result = models_service.predict(features, model_choice=model_choice)
    if not result.get("success"):
        return jsonify(result), 503
    return jsonify(result), 200

@kstar_bp.route("/kstar/status", methods=["GET"])
def get_kstar_status():
    status = kstar_service.get_runtime_status()
    return jsonify({"success": True, "data": status}), 200

@kstar_bp.route("/kstar/train", methods=["POST"])
def train_kstar():
    result = kstar_service.train_model()
    if not result.get("success"):
        return jsonify(result), 503
    return jsonify(result), 200

@kstar_bp.route("/kstar/predict", methods=["POST"])
def predict_kstar():
    body = request.get_json(silent=True) or {}
    if not body:
        return jsonify({
            "success": False,
            "error": "No feature data provided for prediction."
        }), 400

    model_choice = body.get("model", "kstar")
    result = models_service.predict(body, model_choice=model_choice)
    if not result.get("success"):
        return jsonify(result), 503

    return jsonify(result), 200

@kstar_bp.route("/model/metrics", methods=["GET"])
def get_model_metrics():
    metrics = kstar_service.get_metrics()
    return jsonify({
        "success": True,
        "data": metrics
    }), 200

@kstar_bp.route("/predictions/recent", methods=["GET"])
def get_recent_predictions():
    recent = models_service.get_recent_predictions()
    if not recent:
        recent = kstar_service.get_recent_predictions()
    return jsonify({
        "success": True,
        "data": recent
    }), 200
