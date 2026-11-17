/**
 * Centralized API service connecting the React frontend to the Flask REST backend.
 */

const API_BASE = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: data.error || data.message || `Request failed with status ${res.status}`,
        ...data,
      };
    }
    return data;
  } catch (err) {
    return {
      success: false,
      status: 0,
      error: `Network error: Unable to connect to backend at ${API_BASE}. Make sure the Flask server is running.`,
    };
  }
}

export const api = {
  getHealth: () => request("/health"),
  getDatasetSummary: () => request("/dataset/summary"),
  getSampleStudents: (count = 5) => request(`/dataset/samples?count=${count}`),
  uploadDataset: (formData) =>
    request("/dataset/upload", {
      method: "POST",
      body: formData,
    }),
  trainClustering: (nClusters = 3, features = null) =>
    request("/clustering/train", {
      method: "POST",
      body: JSON.stringify({ n_clusters: nClusters, features }),
    }),
  getClusteringResults: () => request("/clustering/results"),
  getModelsComparison: () => request("/models/comparison"),
  predictModel: (features, model = "random_forest") =>
    request("/models/predict", {
      method: "POST",
      body: JSON.stringify({ features, model }),
    }),
  getKStarStatus: () => request("/kstar/status"),
  trainKStar: () =>
    request("/kstar/train", {
      method: "POST",
    }),
  predictKStar: (featureData) =>
    request("/models/predict", {
      method: "POST",
      body: JSON.stringify({ features: featureData, model: featureData.model || "kstar" }),
    }),
  getModelMetrics: () => request("/model/metrics"),
  getRecentPredictions: () => request("/predictions/recent"),
  getFeatureCorrelations: () => request("/dataset/correlations"),
};
