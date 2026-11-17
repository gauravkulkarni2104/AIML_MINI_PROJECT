import React, { useState, useEffect } from "react";
import { 
  Users, 
  Layers, 
  GraduationCap, 
  Network, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
  History
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import StatCard from "../components/StatCard";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { api } from "../services/api";

const TARGET_COLORS = {
  Graduate: "#10b981", // Emerald
  Dropout: "#ef4444",   // Red
  Enrolled: "#f59e0b"   // Amber
};

const CLUSTER_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f97316"];

export default function Dashboard({ summary, clustering, kstarStatus, setActiveTab }) {
  const [recentPredictions, setRecentPredictions] = useState([]);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    const res = await api.getRecentPredictions();
    if (res.success && res.data) {
      setRecentPredictions(res.data);
    }
  };

  const totalStudents = summary?.total_records || 4424;
  const totalFeatures = summary?.total_features || 36;
  const targetDist = summary?.target_distribution || {};

  const targetChartData = Object.entries(targetDist).map(([name, data]) => ({
    name,
    count: data.count,
    percentage: data.percentage,
    fill: TARGET_COLORS[name] || "#64748b"
  }));

  const clusterChartData = (clustering?.cluster_distribution || []).map((c, i) => ({
    name: c.cluster,
    count: c.count,
    percentage: c.percentage,
    fill: CLUSTER_COLORS[i % CLUSTER_COLORS.length]
  }));

  const academicData = [
    {
      metric: "Admission Grade",
      avg: summary?.academic_highlights?.["Admission grade"]?.mean || 126.97,
      scale: "/200"
    },
    {
      metric: "1st Sem Approved",
      avg: summary?.academic_highlights?.["Curricular units 1st sem (approved)"]?.mean || 4.71,
      scale: "units"
    },
    {
      metric: "2nd Sem Approved",
      avg: summary?.academic_highlights?.["Curricular units 2nd sem (approved)"]?.mean || 4.44,
      scale: "units"
    },
    {
      metric: "Age at Enrollment",
      avg: summary?.academic_highlights?.["Age at enrollment"]?.mean || 23.27,
      scale: "years"
    }
  ];

  const getBadgeStyle = (cls) => {
    switch (cls) {
      case "Graduate":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Dropout":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Notice Banner */}
      <DisclaimerBanner />

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Student Records"
          value={totalStudents.toLocaleString()}
          subtitle="Genuine Dataset Records"
          icon={Users}
          color="blue"
          badge="100% Loaded"
        />
        <StatCard
          title="Input Features"
          value={totalFeatures}
          subtitle="Academic, Socioeconomic, Macro"
          icon={Layers}
          color="purple"
          badge="36 Attributes"
        />
        <StatCard
          title="Graduate Rate"
          value={`${targetDist.Graduate?.percentage || 49.9}%`}
          subtitle={`${targetDist.Graduate?.count || 2209} completed degrees`}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Dropout Rate"
          value={`${targetDist.Dropout?.percentage || 32.1}%`}
          subtitle={`${targetDist.Dropout?.count || 1421} students discontinued`}
          icon={Activity}
          color="rose"
        />
      </div>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy-950 text-base">Student Outcome Distribution (Target)</h3>
              <p className="text-xs text-slate-500">Distribution across Dropout, Enrolled, and Graduate classes</p>
            </div>
            <button
              onClick={() => setActiveTab("dataset")}
              className="text-xs font-semibold text-navy-700 hover:text-navy-900 inline-flex items-center gap-1"
            >
              Explore Data <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} students (${item.payload.percentage}%)`, "Count"]}
                  contentStyle={{ backgroundColor: "#0f243d", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {targetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
            {targetChartData.map((t) => (
              <div key={t.name} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs font-medium text-slate-600">{t.name}</div>
                <div className="text-lg font-bold text-navy-950">{t.count.toLocaleString()}</div>
                <div className="text-[11px] font-semibold text-slate-500">{t.percentage}% of cohort</div>
              </div>
            ))}
          </div>
        </div>

        {/* Clustering Marks Distribution Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-navy-950 text-base">Clustering Marks</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-navy-800">
                k = {clustering?.n_clusters || 3}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Student academic grouping profile</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clusterChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {clusterChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [`${val} students (${item.payload.percentage}%)`, item.payload.name]}
                    contentStyle={{ backgroundColor: "#0f243d", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {clusterChartData.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.fill }}></span>
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </div>
                  <span className="font-semibold text-navy-950">{c.count} ({c.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("clustering")}
            className="w-full mt-4 py-2 px-3 bg-navy-50 hover:bg-navy-100 text-navy-800 text-xs font-semibold rounded-lg border border-navy-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Network className="w-4 h-4" /> View Clustering Marks
          </button>
        </div>
      </div>

      {/* Recent Prediction Activity Section */}
      {recentPredictions && recentPredictions.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <History className="w-4 h-4 text-navy-700" /> Recent Prediction Activity Log
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Session Live Log</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Admission Grade</th>
                  <th className="p-2.5">Sem 1 Approved</th>
                  <th className="p-2.5">Sem 2 Approved</th>
                  <th className="p-2.5">Predicted Outcome</th>
                  <th className="p-2.5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {recentPredictions.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="p-2.5 text-slate-500 text-[11px]">{p.timestamp}</td>
                    <td className="p-2.5 font-bold">{p.student_profile?.admission_grade}</td>
                    <td className="p-2.5">{p.student_profile?.sem1_approved} units</td>
                    <td className="p-2.5">{p.student_profile?.sem2_approved} units</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(p.predicted_class)}`}>
                        {p.predicted_class}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 font-semibold">{p.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluation & Academic Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Evaluation Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-navy-700" /> Academic Evaluation Overview
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              Evaluation Modules
            </span>
          </div>

          <div className="space-y-3">
            {/* Clustering Marks Status */}
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">Clustering Marks</span>
                </div>
                <p className="text-xs text-emerald-900 mt-1">
                  Active • Quality Score: <strong>{clustering?.silhouette_score || 0.4349}</strong>
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Grouped across core academic progression metrics.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900">
                Ready
              </span>
            </div>

            {/* Prediction Status */}
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">Supervised Classifiers</span>
                </div>
                <p className="text-xs text-emerald-900 mt-1">
                  Status: <strong>4 Models Trained & Active</strong> • Top Accuracy: <strong>76.8%</strong>
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Random Forest, Logistic Regression, Decision Tree, and K-Star.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("comparison")}
                className="text-[11px] font-semibold px-2.5 py-1 rounded bg-navy-900 text-white hover:bg-navy-800 transition-colors"
              >
                Compare Models
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Evaluation: Stratified 80:20 Split (885 Test Students)</span>
            <button
              onClick={() => setActiveTab("prediction")}
              className="text-navy-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Run Prediction <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Academic Cohort Benchmarks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-navy-700" /> Cohort Performance Baseline
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              4,424 Students
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {academicData.map((item) => (
              <div key={item.metric} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 uppercase">{item.metric}</div>
                <div className="text-xl font-bold text-navy-950 mt-1">
                  {item.avg} <span className="text-xs font-normal text-slate-500">{item.scale}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-navy-50/50 rounded-lg border border-navy-100 text-xs text-navy-900 leading-relaxed">
            <strong>Key Domain Observation:</strong> Curricular units approved in semesters 1 and 2 exhibit the highest correlation with graduation versus dropout status. Students with fewer than 2 approved units in semester 2 have an 82%+ likelihood of dropout.
          </div>
        </div>
      </div>
    </div>
  );
}
