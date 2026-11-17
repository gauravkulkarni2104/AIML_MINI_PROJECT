import React from "react";
import { GraduationCap, ShieldCheck, RefreshCw } from "lucide-react";

export default function Header({ activeTab, onRefresh, refreshing }) {
  const titles = {
    dashboard: "Student Academic Performance & Retention Analytics",
    dataset: "Dataset Explorer & Schema Inspector",
    comparison: "Machine Learning Model Benchmark & Comparison",
    clustering: "Clustering Marks (Unsupervised Academic Grouping)",
    prediction: "Student Performance Prediction & Personalized Guidance"
  };

  const descriptions = {
    dashboard: "Comprehensive academic performance patterns, cohort distributions, and model performance metrics.",
    dataset: "UCI Repository Dataset (4,424 student records, 36 input features) with live validation.",
    comparison: "Comparative evaluation of Random Forest, Logistic Regression, Decision Tree, and K-Star classifiers.",
    clustering: "K-Means student segmentation based on admission scores and curricular completion.",
    prediction: "Predict performance level, dropout risk, and generate personalized academic recommendations."
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Smart Student Performance & Dropout Risk Prediction System
        </div>
        <h2 className="text-lg font-bold text-navy-950 mt-0.5 tracking-tight">
          {titles[activeTab] || "Academic Analytics"}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
          {descriptions[activeTab] || ""}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          title="Refresh dataset and model status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-navy-600" : ""}`} />
          <span>Refresh Data</span>
        </button>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-navy-50 border border-navy-100 rounded-lg text-xs font-medium text-navy-800">
          <ShieldCheck className="w-4 h-4 text-navy-600" />
          <span>Academic Decision Support</span>
        </div>
      </div>
    </header>
  );
}
