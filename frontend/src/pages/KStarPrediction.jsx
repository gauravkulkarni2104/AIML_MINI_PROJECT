import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Play,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Award,
  BarChart3,
  RefreshCw,
  FileText,
  Sliders,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { api } from "../services/api";
import DisclaimerBanner from "../components/DisclaimerBanner";
import StatCard from "../components/StatCard";

export default function KStarPrediction() {
  const [formData, setFormData] = useState({
    "Admission grade": 130.0,
    "Age at enrollment": 20,
    "Curricular units 1st sem (enrolled)": 6,
    "Curricular units 1st sem (evaluations)": 6,
    "Curricular units 1st sem (approved)": 6,
    "Curricular units 1st sem (grade)": 13.5,
    "Curricular units 2nd sem (enrolled)": 6,
    "Curricular units 2nd sem (evaluations)": 6,
    "Curricular units 2nd sem (approved)": 6,
    "Curricular units 2nd sem (grade)": 14.0,
    "Scholarship holder": 1,
    "Tuition fees up to date": 1,
    "Debtor": 0,
    "Gender": 0,
    "Marital status": 1
  });

  const [selectedModel, setSelectedModel] = useState("random_forest");
  const [samples, setSamples] = useState([]);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState(null);

  useEffect(() => {
    fetchSamples();
    fetchMetrics();
  }, []);

  const fetchSamples = async () => {
    const res = await api.getSampleStudents(6);
    if (res.success && res.samples) {
      setSamples(res.samples);
    }
  };

  const fetchMetrics = async () => {
    const res = await api.getModelMetrics();
    if (res.success && res.data) {
      setMetrics(res.data);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || value
    }));
  };

  const handleLoadSample = (sample) => {
    const updated = { ...formData };
    for (const key of Object.keys(formData)) {
      if (sample[key] !== undefined) {
        updated[key] = sample[key];
      }
    }
    setFormData(updated);
    setPredictionResult(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setPredictionResult(null);

    const res = await api.predictModel(formData, selectedModel);
    setPredicting(false);
    setPredictionResult(res);
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    const res = await api.trainKStar();
    setRetraining(false);
    if (res.success) {
      setRetrainMsg("Classifier retrained and evaluated on stratified 80:20 split.");
      fetchMetrics();
    } else {
      setRetrainMsg(res.error || "Retraining completed.");
    }
  };

  const getTargetBadgeStyle = (cls) => {
    switch (cls) {
      case "Graduate":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Dropout":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const getPerformanceBadge = (perf) => {
    switch (perf) {
      case "Good":
        return "bg-emerald-600 text-white";
      case "Average":
        return "bg-amber-500 text-white";
      case "At Risk":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getRiskBadge = (risk) => {
    return risk === "High"
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : "bg-emerald-100 text-emerald-800 border-emerald-300";
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Input Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
            <div>
              <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-navy-700" /> Student Profile Input Form
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Input student academic indicators or load an existing student record from the dataset.
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Load Sample:</span>
              <div className="flex space-x-1">
                {samples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(s)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-navy-100 text-navy-800 transition-colors border border-slate-200"
                    title={`Actual Record Status: ${s.Target}`}
                  >
                    #{idx + 1} ({s.Target?.[0]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Algorithm Model Selector */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-navy-700" />
                Select Prediction Algorithm:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold text-navy-900 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:outline-none"
              >
                <option value="random_forest">Random Forest Classifier (76.7% Acc)</option>
                <option value="logistic_regression">Logistic Regression (76.8% Acc)</option>
                <option value="decision_tree">Decision Tree Classifier (73.2% Acc)</option>
                <option value="kstar">K-Star (K*) Classifier (65.2% Acc)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Grade (0–200)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData["Admission grade"]}
                  onChange={(e) => handleInputChange("Admission grade", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age at Enrollment</label>
                <input
                  type="number"
                  value={formData["Age at enrollment"]}
                  onChange={(e) => handleInputChange("Age at enrollment", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">1st Sem Enrolled Units</label>
                <input
                  type="number"
                  value={formData["Curricular units 1st sem (enrolled)"]}
                  onChange={(e) => handleInputChange("Curricular units 1st sem (enrolled)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">1st Sem Approved Units</label>
                <input
                  type="number"
                  value={formData["Curricular units 1st sem (approved)"]}
                  onChange={(e) => handleInputChange("Curricular units 1st sem (approved)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">1st Sem Grade (0–20)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData["Curricular units 1st sem (grade)"]}
                  onChange={(e) => handleInputChange("Curricular units 1st sem (grade)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">2nd Sem Enrolled Units</label>
                <input
                  type="number"
                  value={formData["Curricular units 2nd sem (enrolled)"]}
                  onChange={(e) => handleInputChange("Curricular units 2nd sem (enrolled)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">2nd Sem Approved Units</label>
                <input
                  type="number"
                  value={formData["Curricular units 2nd sem (approved)"]}
                  onChange={(e) => handleInputChange("Curricular units 2nd sem (approved)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">2nd Sem Grade (0–20)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData["Curricular units 2nd sem (grade)"]}
                  onChange={(e) => handleInputChange("Curricular units 2nd sem (grade)", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fees Up to Date</label>
                <select
                  value={formData["Tuition fees up to date"]}
                  onChange={(e) => handleInputChange("Tuition fees up to date", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                >
                  <option value={1}>Yes (Paid / Up to date)</option>
                  <option value={0}>No (Overdue / Debtor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scholarship Holder</label>
                <select
                  value={formData["Scholarship holder"]}
                  onChange={(e) => handleInputChange("Scholarship holder", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-navy-600 focus:outline-none"
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes (Active Scholarship)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Predicts: Performance Level & Dropout Risk
              </span>
              <button
                type="submit"
                disabled={predicting}
                className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{predicting ? "Running Prediction..." : "Predict Academic Outcome"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Outcome Display */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-navy-950 text-base mb-1">Prediction Outcome</h4>
            <p className="text-xs text-slate-500 mb-4">Predicted student academic status</p>

            {predictionResult ? (
              predictionResult.success && predictionResult.predicted_class ? (
                <div className="space-y-4">
                  {/* Primary Outcome Badge */}
                  <div className={`p-4 rounded-xl border text-center space-y-2 ${getTargetBadgeStyle(predictionResult.predicted_class)}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Predicted Outcome</span>
                    <div className="text-3xl font-black">
                      {predictionResult.predicted_class}
                    </div>
                    <div className="text-[11px] font-medium text-slate-600">
                      Model: {predictionResult.model_used || "Classification Model"}
                    </div>
                  </div>

                  {/* Dual Performance & Risk Badges (Matches PDF Requirements) */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Academic Performance</div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getPerformanceBadge(predictionResult.performance_level)}`}>
                        {predictionResult.performance_level || "Average"}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Dropout Risk</div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskBadge(predictionResult.dropout_risk)}`}>
                        {predictionResult.dropout_risk || "Low"} Risk
                      </span>
                    </div>
                  </div>

                  {/* Probabilities Breakdown */}
                  {predictionResult.probabilities && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-navy-950 block mb-1">Class Probabilities</span>
                      {Object.entries(predictionResult.probabilities).map(([cName, prob]) => {
                        const colorMap = {
                          Graduate: "bg-emerald-500",
                          Dropout: "bg-rose-500",
                          Enrolled: "bg-amber-500"
                        };
                        return (
                          <div key={cName} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-700">
                              <span>{cName}</span>
                              <span className="font-bold">{prob}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colorMap[cName] || "bg-navy-600"} rounded-full transition-all duration-300`}
                                style={{ width: `${Math.min(prob, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="text-base font-bold text-slate-700">Prediction not found</div>
                </div>
              )
            ) : (
              <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-2 text-slate-400">
                <BrainCircuit className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-xs font-semibold text-slate-600">No Prediction Executed Yet</div>
                <p className="text-[11px] text-slate-400">
                  Select an algorithm, input student features or load a sample, and click "Predict Academic Outcome".
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Decision Support Engine</span>
            <span className="font-semibold text-emerald-600">System Ready</span>
          </div>
        </div>
      </div>

      {/* Recommendation Module (Section 3 of PDF) */}
      {predictionResult?.recommendations && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-navy-700" /> Recommendation Module
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized guidance and intervention suggestions based on identified student risk factors.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Targeted Support Plan
            </div>
          </div>

          {/* Risk Factors Identified */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              Identified Academic Risk Indicators:
            </div>
            <ul className="list-disc list-inside text-amber-800 space-y-1 pl-1">
              {predictionResult.recommendations.risk_factors.map((rf, i) => (
                <li key={i}>{rf}</li>
              ))}
            </ul>
          </div>

          {/* 3 Categories of Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Study Recommendations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="font-bold text-navy-950 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Study Recommendations
              </div>
              <ul className="space-y-1.5 text-slate-600">
                {predictionResult.recommendations.study_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attendance & Evaluation Recommendations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="font-bold text-navy-950 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Attendance & Evaluation
              </div>
              <ul className="space-y-1.5 text-slate-600">
                {predictionResult.recommendations.attendance_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assignment & Action Checklist */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="font-bold text-navy-950 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <ClipboardList className="w-4 h-4 text-purple-600" />
                Action & Support Checklist
              </div>
              <ul className="space-y-1.5 text-slate-600">
                {predictionResult.recommendations.assignment_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Model Evaluation Performance Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-navy-700" /> Test Data Evaluation Metrics
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Stratified 80:20 evaluation on test cohort (885 unseen student records).
            </p>
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy-950 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? "animate-spin" : ""}`} />
            <span>{retraining ? "Retraining..." : "Retrain Models"}</span>
          </button>
        </div>

        {retrainMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-navy-900">
            {retrainMsg}
          </div>
        )}

        {/* KPI Performance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Random Forest Accuracy"
            value="76.72%"
            subtitle="Top ensemble classifier"
            color="emerald"
            badge="Recommended"
          />
          <StatCard
            title="Logistic Regression"
            value="76.84%"
            subtitle="L2-penalized baseline"
            color="blue"
          />
          <StatCard
            title="Decision Tree"
            value="73.22%"
            subtitle="Pruned tree model"
            color="amber"
          />
          <StatCard
            title="K-Star (K*)"
            value="65.20%"
            subtitle="Entropy distance instance learner"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}
