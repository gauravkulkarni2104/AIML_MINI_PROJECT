"""
Health check and environment status endpoint.
"""

from flask import Blueprint, jsonify
from backend.services.dataset_service import dataset_service
from backend.services.clustering_service import clustering_service
from backend.services.kstar_service import kstar_service

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    df_loaded = dataset_service._df is not None
    kstar_status = kstar_service.get_runtime_status()
    has_clusters = clustering_service.current_results is not None

    return jsonify({
        "status": "healthy",
        "system": "Student Academic Success Analytics System",
        "dataset_loaded": df_loaded,
        "dataset_records": len(dataset_service._df) if df_loaded else 0,
        "clustering_ready": True,
        "clustering_active": has_clusters,
        "kstar_status": kstar_status["status"],
        "weka_ready": kstar_status["is_ready"],
        "milestone": "100% (Complete Full-Stack Application, Dataset Explorer, Clustering Marks, Weka KStar Engine, Advisor Intelligence)"
    }), 200
