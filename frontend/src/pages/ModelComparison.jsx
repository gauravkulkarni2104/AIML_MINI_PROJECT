import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  Layers,
  Scale,
  RefreshCw,
  Sliders
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { api } from "../services/api";
import StatCard from "../components/StatCard";

export default function ModelComparison() {
  const [comparison, setComparison] = useState(null);
  const [selectedModelKey, setSelectedModelKey] = useState("random_forest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    setLoading(true);
    const res = await api.getModelsComparison();
    if (res.success && res.data) {
      setComparison(res.data);
      if (res.data.models && res.data.models.length > 0) {
        setSelectedModelKey(res.data.models[0].model_key || "random_forest");
      }
    }
    setLoading(false);
  };

  const models = comparison?.models || [];
  const selectedModel = models.find((m) => m.model_key === selectedModelKey) || models[0];

  const chartData = models.map((m) => ({
    name: m.model_name,
    Accuracy: m.accuracy,
    Precision: m.macro_precision,
    Recall: m.macro_recall,
    F1: m.macro_f1,
  }));

  const bestModel = models.reduce((prev, curr) => (curr.accuracy > (prev?.accuracy || 0) ? curr : prev), null);

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Best Performing Model"
          value={bestModel?.model_name || "Random Forest"}
          subtitle={`${bestModel?.accuracy || 76.7}% Overall Accuracy`}
          color="emerald"
          badge="Top Ranked"
        />
        <StatCard
          title="Test Cohort Size"
          value="885 Students"
          subtitle="Stratified 20% holdout test partition"
          color="blue"
        />
        <StatCard
          title="Evaluated Classifiers"
          value="4 Algorithms"
          subtitle="Supervised ML algorithms compared"
          color="purple"
        />
        <StatCard
          title="Unsupervised Clustering"
          value="K-Means (k=3)"
          subtitle="Academic grouping & profiling"
          color="amber"
        />
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-navy-700" /> Machine Learning Algorithm Comparison
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated on official test set (885 instances) across standard classification metrics.
            </p>
          </div>
          <button
            onClick={fetchComparison}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Benchmark</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3">Algorithm Type</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision (Macro)</th>
                <th className="p-3">Recall (Macro)</th>
                <th className="p-3">F1-Score (Macro)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {models.map((m) => {
                const isSelected = m.model_key === selectedModelKey;
                const isTop = m.model_key === bestModel?.model_key;
                return (
                  <tr
                    key={m.model_key}
                    onClick={() => setSelectedModelKey(m.model_key)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/80 font-semibold"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="p-3 text-navy-950 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isTop ? "bg-emerald-500" : "bg-blue-500"}`} />
                      <span className="font-bold">{m.model_name}</span>
                      {isTop && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 rounded font-semibold border border-emerald-300">
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {m.model_key === "kstar"
                        ? "Instance-Based (Entropy Distance)"
                        : m.model_key === "random_forest"
                        ? "Ensemble Decision Trees"
                        : m.model_key === "decision_tree"
                        ? "Classification Tree (Depth 6)"
                        : "Linear Model (L2 Regularized)"}
                    </td>
                    <td className="p-3 font-bold text-navy-950">{m.accuracy}%</td>
                    <td className="p-3 text-slate-700">{m.macro_precision}%</td>
                    <td className="p-3 text-slate-700">{m.macro_recall}%</td>
                    <td className="p-3 font-bold text-navy-900">{m.macro_f1}%</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelKey(m.model_key);
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded font-semibold border transition-colors ${
                          isSelected
                            ? "bg-navy-900 text-white border-navy-900"
                            : "bg-white text-navy-800 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "Viewing Details" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accuracy Comparison Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-navy-700" /> Multi-Metric Performance Comparison
        </h4>
        <p className="text-xs text-slate-500">
          Side-by-side comparison of Accuracy, Precision, Recall, and F1 across all trained classifiers.
        </p>
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 85]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Model Deep Dive: Per-Class Performance & Confusion Matrix */}
      {selectedModel && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-navy-700" /> {selectedModel.model_name} — Detailed Evaluation
              </h4>
              <p className="text-xs text-slate-500">
                Evaluation results on 885 unseen test instances.
              </p>
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold">
              Accuracy: {selectedModel.accuracy}% | Macro F1: {selectedModel.macro_f1}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per-Class Metrics */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Per-Class Performance
              </h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Target Class</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Recall</th>
                      <th className="p-3">F1-Score</th>
                      <th className="p-3">Test Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(selectedModel.per_class || []).map((pc) => (
                      <tr key={pc.class_name} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-navy-950 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pc.class_name === "Graduate"
                                ? "bg-emerald-500"
                                : pc.class_name === "Dropout"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {pc.class_name}
                        </td>
                        <td className="p-3">{pc.precision}%</td>
                        <td className="p-3">{pc.recall}%</td>
                        <td className="p-3 font-bold text-navy-900">{pc.f1_score}%</td>
                        <td className="p-3 text-slate-500">{pc.support} students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                3x3 Confusion Matrix (True vs. Predicted)
              </h5>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 text-slate-400 font-semibold text-[10px] uppercase">
                    True \ Pred
                  </div>
                  <div className="p-2 font-bold text-rose-700 bg-rose-50 rounded">Dropout</div>
                  <div className="p-2 font-bold text-amber-700 bg-amber-50 rounded">Enrolled</div>
                  <div className="p-2 font-bold text-emerald-700 bg-emerald-50 rounded">Graduate</div>

                  {["Dropout", "Enrolled", "Graduate"].map((rowLabel, rIdx) => (
                    <React.Fragment key={rowLabel}>
                      <div className="p-2 font-bold text-slate-700 text-left flex items-center">
                        {rowLabel}
                      </div>
                      {[0, 1, 2].map((cIdx) => {
                        const val = selectedModel.confusion_matrix?.[rIdx]?.[cIdx] ?? 0;
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <div
                            key={cIdx}
                            className={`p-2.5 rounded font-bold transition-transform ${
                              isDiagonal
                                ? "bg-navy-900 text-white shadow-sm ring-1 ring-navy-950"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-slate-500 text-center">
                  Diagonal elements represent correctly classified student test records.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
