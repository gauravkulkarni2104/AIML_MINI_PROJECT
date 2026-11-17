"""
Dataset exploration and upload endpoints.
"""

import os
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from backend.config import UPLOAD_FOLDER
from backend.services.dataset_service import dataset_service

dataset_bp = Blueprint("dataset", __name__)

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@dataset_bp.route("/dataset/summary", methods=["GET"])
def get_summary():
    try:
        summary = dataset_service.get_summary()
        return jsonify({"success": True, "data": summary}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@dataset_bp.route("/dataset/samples", methods=["GET"])
def get_samples():
    try:
        count = int(request.args.get("count", 5))
        samples = dataset_service.get_sample_students(count)
        return jsonify({"success": True, "samples": samples}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@dataset_bp.route("/dataset/correlations", methods=["GET"])
def get_correlations():
    try:
        corrs = dataset_service.get_correlations()
        return jsonify({"success": True, "data": corrs}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@dataset_bp.route("/dataset/upload", methods=["POST"])
def upload_dataset():
    if "file" not in request.files:
        return jsonify({
            "success": False,
            "error": "No file part in the request. Please provide a file field."
        }), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": f"Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file."
        }), 400

    try:
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)

        # Temporary load to validate
        temp_df = dataset_service.load_dataset(save_path)
        validation = dataset_service.validate_dataset(temp_df)

        if not validation["is_valid"]:
            # If missing features, revert to default dataset and return informative 422 error
            dataset_service.load_dataset()  # reload default
            return jsonify({
                "success": False,
                "error": "Uploaded dataset failed column schema validation.",
                "validation": validation,
                "message": f"Expected 36 specific features and Target column. Missing {len(validation['missing_features'])} features."
            }), 422

        summary = dataset_service.get_summary()
        return jsonify({
            "success": True,
            "message": f"File '{filename}' uploaded and validated successfully.",
            "validation": validation,
            "summary": summary
        }), 200

    except Exception as e:
        dataset_service.load_dataset()  # Ensure active dataset is safe
        return jsonify({"success": False, "error": f"Failed to process dataset: {str(e)}"}), 500
