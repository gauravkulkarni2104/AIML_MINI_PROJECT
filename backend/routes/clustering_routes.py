"""
Clustering endpoints for K-Means unsupervised learning.
"""

from flask import Blueprint, jsonify, request
from backend.services.clustering_service import clustering_service

clustering_bp = Blueprint("clustering", __name__)

@clustering_bp.route("/clustering/train", methods=["POST"])
def train_clustering():
    try:
        body = request.get_json(silent=True) or {}
        n_clusters = body.get("n_clusters", 3)
        features = body.get("features", None)

        try:
            n_clusters = int(n_clusters)
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "n_clusters must be an integer between 2 and 8."}), 400

        if n_clusters < 2 or n_clusters > 8:
            return jsonify({"success": False, "error": "n_clusters must be between 2 and 8."}), 400

        results = clustering_service.run_clustering(n_clusters=n_clusters, features=features)
        return jsonify({
            "success": True,
            "message": f"K-Means clustering executed successfully with k={n_clusters}.",
            "data": results
        }), 200

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Clustering failed: {str(e)}"}), 500

@clustering_bp.route("/clustering/results", methods=["GET"])
def get_clustering_results():
    try:
        results = clustering_service.get_latest_results()
        return jsonify({
            "success": True,
            "data": results
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
