"""
Routes package initialization.
"""

from backend.routes.health_routes import health_bp
from backend.routes.dataset_routes import dataset_bp
from backend.routes.clustering_routes import clustering_bp
from backend.routes.kstar_routes import kstar_bp

__all__ = ["health_bp", "dataset_bp", "clustering_bp", "kstar_bp"]
