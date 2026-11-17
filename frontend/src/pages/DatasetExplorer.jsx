import React, { useState } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  Database, 
  Eye, 
  ListFilter,
  Check,
  Search
} from "lucide-react";
import { api } from "../services/api";

export default function DatasetExplorer({ summary, onDatasetReload }) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTabSub, setActiveTabSub] = useState("preview"); // 'preview' | 'schema'
  const [correlations, setCorrelations] = useState([]);

  React.useEffect(() => {
    api.getFeatureCorrelations().then((res) => {
      if (res.success && res.data) setCorrelations(res.data);
    });
  }, []);

  const totalRecords = summary?.total_records || 4424;
  const columns = summary?.columns || [];
  const previewRows = summary?.preview || [];
  const targetDist = summary?.target_distribution || {};
  const featureCategories = summary?.feature_categories || {};

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.uploadDataset(formData);
    setUploading(false);

    if (res.success) {
      setUploadMessage(res.message);
      if (onDatasetReload) onDatasetReload();
    } else {
      setUploadError(res.error || res.message || "Upload validation failed.");
    }
  };

  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === "all") return matchesSearch;
    const catList = featureCategories[selectedCategory] || [];
    return matchesSearch && catList.includes(col.name);
  });

  return (
    <div className="space-y-6">
      {/* Upload and Validation Hub */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-navy-950 text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-navy-700" /> Dataset Import & Validation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Load custom student datasets (CSV or XLSX). The system validates 36 canonical features and the Target column before processing.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Validating & Uploading..." : "Upload CSV / XLSX"}</span>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Upload Messages */}
        {uploadMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Records Loaded</div>
            <div className="text-xl font-bold text-navy-950 mt-0.5">{totalRecords.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Valid cohort rows</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Input Features</div>
            <div className="text-xl font-bold text-navy-950 mt-0.5">36 Attributes</div>
            <div className="text-[11px] text-slate-500">Excludes Target column</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Missing Values</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">0 (None)</div>
            <div className="text-[11px] text-slate-500">Clean UCI standard</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Target Classes</div>
            <div className="text-xl font-bold text-navy-950 mt-0.5">3 Outcomes</div>
            <div className="text-[11px] text-slate-500">Dropout, Enrolled, Graduate</div>
          </div>
        </div>
      </div>

      {/* Target Distribution Quick Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-navy-950 text-sm mb-3">Target Class Distribution (Ground Truth)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-950">Graduate</span>
              <span className="font-bold text-emerald-800">{targetDist.Graduate?.percentage || 49.9}%</span>
            </div>
            <div className="text-lg font-bold text-emerald-950 mt-1">
              {(targetDist.Graduate?.count || 2209).toLocaleString()} <span className="text-xs font-normal text-slate-600">students</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-rose-950">Dropout</span>
              <span className="font-bold text-rose-800">{targetDist.Dropout?.percentage || 32.1}%</span>
            </div>
            <div className="text-lg font-bold text-rose-950 mt-1">
              {(targetDist.Dropout?.count || 1421).toLocaleString()} <span className="text-xs font-normal text-slate-600">students</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-950">Enrolled</span>
              <span className="font-bold text-amber-800">{targetDist.Enrolled?.percentage || 18.0}%</span>
            </div>
            <div className="text-lg font-bold text-amber-950 mt-1">
              {(targetDist.Enrolled?.count || 794).toLocaleString()} <span className="text-xs font-normal text-slate-600">students</span>
            </div>
          </div>
        </div>

        {/* Feature Impact Analysis */}
        {correlations && correlations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-navy-950">Key Predictive Indicators (Correlation with Graduation vs. Dropout)</span>
              <span className="text-[11px] text-slate-500">Biserial Metric Analysis</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {correlations.slice(0, 6).map((c) => (
                <div key={c.feature} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate mr-2" title={c.feature}>{c.feature}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                    c.correlation > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {c.correlation > 0 ? `+${c.correlation}` : c.correlation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Table Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation & Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTabSub("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTabSub === "preview"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" /> Data Preview (15 Rows)
            </button>
            <button
              onClick={() => setActiveTabSub("schema")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTabSub === "schema"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 inline mr-1.5" /> Feature Schema & Types ({columns.length})
            </button>
          </div>

          {/* Filter / Search */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-navy-600 w-44"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic Features</option>
              <option value="demographic">Demographic</option>
              <option value="socio_economic">Socio-Economic</option>
              <option value="macro_economic">Macro-Economic</option>
            </select>
          </div>
        </div>

        {/* Content View */}
        {activeTabSub === "preview" ? (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-3 border-r border-slate-200">#</th>
                  {filteredColumns.map((c) => (
                    <th key={c.name} className="p-3 border-r border-slate-200 whitespace-nowrap">
                      {c.name}
                      {c.is_target && <span className="ml-1 text-emerald-600 font-bold">(Target)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 border-r border-slate-100 text-slate-400 font-sans font-medium">{idx + 1}</td>
                    {filteredColumns.map((c) => {
                      const val = row[c.name];
                      const isTarget = c.name === "Target";
                      return (
                        <td key={c.name} className="p-3 border-r border-slate-100 whitespace-nowrap">
                          {isTarget ? (
                            <span
                              className={`px-2 py-0.5 rounded font-sans font-semibold text-[11px] ${
                                val === "Graduate"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : val === "Dropout"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {val}
                            </span>
                          ) : (
                            val !== null && val !== undefined ? String(val) : "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Attribute Name</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Missing</th>
                  <th className="p-3">Min</th>
                  <th className="p-3">Max</th>
                  <th className="p-3">Mean</th>
                  <th className="p-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredColumns.map((col) => {
                  let categoryName = "Other";
                  for (const [cat, list] of Object.entries(featureCategories)) {
                    if (list.includes(col.name)) {
                      categoryName = cat.replace("_", " ");
                      break;
                    }
                  }

                  return (
                    <tr key={col.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-navy-950 flex items-center gap-1.5">
                        {col.name}
                        {col.is_target && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Target
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{col.dtype}</td>
                      <td className="p-3 text-emerald-600 font-medium">{col.missing_count}</td>
                      <td className="p-3">{col.min !== undefined ? col.min : "-"}</td>
                      <td className="p-3">{col.max !== undefined ? col.max : "-"}</td>
                      <td className="p-3 font-semibold">{col.mean !== undefined ? col.mean : "-"}</td>
                      <td className="p-3 capitalize text-slate-600">{categoryName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
