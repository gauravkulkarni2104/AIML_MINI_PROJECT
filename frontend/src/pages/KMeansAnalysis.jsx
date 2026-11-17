import React, { useState } from "react";
import {
  Network,
  Play,
  RotateCcw,
  Info,
  CheckCircle2,
  TableProperties,
  ScatterChart as ScatterIcon,
  HelpCircle
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { api } from "../services/api";
import StatCard from "../components/StatCard";

const CLUSTER_COLORS = {
  0: "#2563eb", // Blue
  1: "#dc2626", // Red / Coral
  2: "#059669", // Emerald
  3: "#7c3aed", // Violet
  4: "#d97706", // Amber
  5: "#0891b2", // Cyan
  6: "#db2777", // Pink
  7: "#4b5563"  // Gray
};

export default function KMeansAnalysis({ clustering, onClusteringUpdate }) {
  const [kValue, setKValue] = useState(clustering?.n_clusters || 3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunClustering = async (kToRun) => {
    const k = kToRun || kValue;
    setLoading(true);
    setError(null);
    try {
      const res = await api.trainClustering(k);
      setLoading(false);
      if (res.success && res.data) {
        if (onClusteringUpdate) onClusteringUpdate(res.data);
      } else {
        setError(res.error || "Clustering execution failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("Network or server error during clustering.");
    }
  };

  const data = clustering || {};
  const pcaPoints = data.pca_points || [];
  const clusterDist = data.cluster_distribution || [];
  const summaries = data.cluster_summaries || {};
  const interpretations = data.cluster_interpretations || {};
  const crossTab = data.cross_tabulation || {};

  // Custom Tooltip for PCA plot
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-navy-800 text-xs font-sans space-y-1">
          <div className="font-bold text-blue-300 border-b border-navy-800 pb-1 flex justify-between gap-4">
            <span>Student #{pt.student_id}</span>
            <span className="text-white font-semibold">{pt.cluster}</span>
          </div>
          <div className="text-slate-300">Map Coordinates: ({pt.pca1}, {pt.pca2})</div>
          <div className="text-slate-300">Admission Grade: <span className="text-white font-semibold">{pt.admission_grade}</span></div>
          <div className="text-slate-300">1st Sem Approved: <span className="text-white font-semibold">{pt.sem1_approved} units</span></div>
          <div className="text-slate-300">2nd Sem Approved: <span className="text-white font-semibold">{pt.sem2_approved} units</span></div>
          <div className="pt-1 text-[11px] text-amber-300 border-t border-navy-800/80">
            Actual Ground Truth: <strong>{pt.actual_target}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Control Configuration Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-navy-950 text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-navy-700" /> Clustering Marks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic grouping based on curriculum performance indicators.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 pl-2">Cluster Count (k):</span>
              {[2, 3, 4, 5, 6].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setKValue(k);
                    handleRunClustering(k);
                  }}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                    kValue === k
                      ? "bg-navy-900 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRunClustering(kValue)}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Processing..." : "Run Clustering"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
            {error}
          </div>
        )}

        {/* Clustering Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <StatCard
            title="Cluster Count"
            value={`k = ${data.n_clusters || 3}`}
            subtitle="Configurable (2 to 8)"
            color="blue"
          />
          <StatCard
            title="Quality Score"
            value={data.silhouette_score !== null ? data.silhouette_score : "N/A"}
            subtitle="Separation quality metric"
            color="emerald"
          />
          <StatCard
            title="Compactness"
            value={data.inertia ? data.inertia.toLocaleString() : "N/A"}
            subtitle="Within-group variation"
            color="purple"
          />
          <StatCard
            title="Variance Explained"
            value={`${(data.explained_variance_pca?.[0] || 0) + (data.explained_variance_pca?.[1] || 0)}%`}
            subtitle="2D projection coverage"
            color="amber"
          />
        </div>
      </div>

      {/* 2D Performance Map Visualization */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <ScatterIcon className="w-5 h-5 text-navy-700" /> Student Performance Map (2D Projection)
            </h4>
            <p className="text-xs text-slate-500">
              Each student record projected by academic performance. Colored by cluster assignment.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Rendered Points: <strong className="text-navy-900">{pcaPoints.length}</strong>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="pca1"
                name="Performance Dimension 1"
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{ value: "Performance Progress Dimension", position: "insideBottom", offset: -10, fontSize: 12, fill: "#475569" }}
              />
              <YAxis
                type="number"
                dataKey="pca2"
                name="Performance Dimension 2"
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{ value: "Admission & Background Dimension", angle: -90, position: "insideLeft", fontSize: 12, fill: "#475569" }}
              />
              <ZAxis range={[35, 35]} />
              <Tooltip content={<CustomScatterTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
              />
              {/* Separate Scatter series per cluster for distinct legend */}
              {clusterDist.map((c) => {
                const clusterPts = pcaPoints.filter((p) => p.cluster_id === c.cluster_id);
                const color = CLUSTER_COLORS[c.cluster_id % Object.keys(CLUSTER_COLORS).length];
                return (
                  <Scatter
                    key={c.cluster}
                    name={`${c.cluster} (${c.count} students)`}
                    data={clusterPts}
                    fill={color}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-navy-700 shrink-0" />
          <span>
            Hover over any point in the scatter plot to see individual student indices, standardized coordinates, and their actual ground-truth status.
          </span>
        </div>
      </div>

      {/* Cluster Academic Characteristics Summaries */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-navy-950 text-base mb-1">Observed Academic Characteristics by Cluster</h4>
        <p className="text-xs text-slate-500 mb-4">
          Heuristic interpretation based strictly on observed academic data. Clusters are never given artificial labels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clusterDist.map((c) => {
            const stats = summaries[c.cluster] || {};
            const interp = interpretations[c.cluster] || {};
            const color = CLUSTER_COLORS[c.cluster_id % Object.keys(CLUSTER_COLORS).length];

            return (
              <div
                key={c.cluster}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-navy-950 text-sm">{c.cluster}</h5>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${color}20`, color: color }}>
                      {c.count} students ({c.percentage}%)
                    </span>
                  </div>

                  <div className="mb-3 p-2.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-navy-900 block mb-0.5">{interp.badge || "Cluster Profile"}:</span>
                    {interp.academic_profile || "Distinct academic pattern observed from feature clustering."}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Avg Admission Grade:</span>
                      <span className="font-bold text-navy-950">{stats["Admission grade"]?.mean || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Avg Age at Enrollment:</span>
                      <span className="font-bold text-navy-950">{stats["Age at enrollment"]?.mean || "-"} yrs</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">1st Sem Approved Units:</span>
                      <span className="font-bold text-navy-950">{stats["Curricular units 1st sem (approved)"]?.mean || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">1st Sem Avg Grade:</span>
                      <span className="font-bold text-navy-950">{stats["Curricular units 1st sem (grade)"]?.mean || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">2nd Sem Approved Units:</span>
                      <span className="font-bold text-navy-950">{stats["Curricular units 2nd sem (approved)"]?.mean || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">2nd Sem Avg Grade:</span>
                      <span className="font-bold text-navy-950">{stats["Curricular units 2nd sem (grade)"]?.mean || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post-Hoc Comparison With Actual Target Labels */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-navy-950 text-base flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-navy-700" /> Post-Hoc Target Composition Cross-Tabulation
          </h4>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-navy-800 border border-blue-200">
            Evaluated After Clustering Only
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          This table confirms that K-Means unsupervised clusters cleanly isolate real-world outcomes without having had access to the ground-truth Target column during fitting.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Cluster ID</th>
                <th className="p-3">Actual Dropouts</th>
                <th className="p-3">Actual Enrolled</th>
                <th className="p-3">Actual Graduates</th>
                <th className="p-3">Dominant Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(crossTab).map(([cName, row]) => {
                const dropCnt = row.Dropout?.count || 0;
                const dropPct = row.Dropout?.percentage || 0;
                const enrCnt = row.Enrolled?.count || 0;
                const enrPct = row.Enrolled?.percentage || 0;
                const gradCnt = row.Graduate?.count || 0;
                const gradPct = row.Graduate?.percentage || 0;

                let dominant = "Balanced / Intermediate";
                if (dropPct > 60) dominant = `Predominantly Dropout (${dropPct}%)`;
                else if (gradPct > 60) dominant = `Predominantly Graduate (${gradPct}%)`;

                return (
                  <tr key={cName} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-navy-950">{cName}</td>
                    <td className="p-3 text-rose-700 font-semibold">
                      {dropCnt} ({dropPct}%)
                    </td>
                    <td className="p-3 text-amber-700 font-semibold">
                      {enrCnt} ({enrPct}%)
                    </td>
                    <td className="p-3 text-emerald-700 font-semibold">
                      {gradCnt} ({gradPct}%)
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold border border-slate-200">
                        {dominant}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
