"""
Flask Application Entry Point for Student Dropout Prediction & Academic Success Analytics System.
"""

import os
import sys

# Ensure root and backend directory are in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify
from flask_cors import CORS
from backend.routes.health_routes import health_bp
from backend.routes.dataset_routes import dataset_bp
from backend.routes.clustering_routes import clustering_bp
from backend.routes.kstar_routes import kstar_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS for frontend development
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints with /api prefix
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(dataset_bp, url_prefix="/api")
    app.register_blueprint(clustering_bp, url_prefix="/api")
    app.register_blueprint(kstar_bp, url_prefix="/api")

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "error": "Internal server error occurred."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Student Academic Success Analytics Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
