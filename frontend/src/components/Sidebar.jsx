import React from "react";
import { 
  LayoutDashboard, 
  Database, 
  Network, 
  BrainCircuit, 
  GraduationCap, 
  Server,
  Scale
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, health }) {
  const navItems = [
    {
      id: "dashboard",
      label: "Analytics Dashboard",
      icon: LayoutDashboard,
      description: "Overview, distributions & metrics"
    },
    {
      id: "dataset",
      label: "Dataset Explorer",
      icon: Database,
      description: "4,424 student records & schema"
    },
    {
      id: "comparison",
      label: "Model Comparison",
      icon: Scale,
      description: "4 algorithms benchmarked"
    },
    {
      id: "clustering",
      label: "Clustering Marks",
      icon: Network,
      description: "Unsupervised performance groups"
    },
    {
      id: "prediction",
      label: "Prediction & Advice",
      icon: BrainCircuit,
      description: "Risk score & recommendations"
    }
  ];

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col shrink-0 border-r border-navy-800 shadow-xl">
      {/* Institutional Brand Header */}
      <div className="p-5 border-b border-navy-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-navy-700/80 rounded-xl text-blue-300 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-blue-300">
              MIT Academy of Engineering
            </div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight mt-0.5">
              Smart Student System
            </h1>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy-800 text-blue-200 border border-navy-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          Academic Decision Support
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-navy-300 uppercase">
          Project Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? "bg-navy-700 text-white shadow-md font-semibold border-l-4 border-blue-400"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? "text-blue-300" : "text-navy-400"}`} />
              <div>
                <div className="text-sm">{item.label}</div>
                <div className="text-[11px] text-navy-300 font-normal opacity-90 leading-tight">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-navy-300 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-navy-400" />
            Backend Service
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              health?.status === "healthy"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}
          >
            {health?.status === "healthy" ? "Online" : "Connecting..."}
          </span>
        </div>
        <div className="text-[11px] text-navy-300 space-y-1">
          <div className="flex justify-between">
            <span>Student Records:</span>
            <span className="text-white font-medium">{health?.dataset_records || 4424}</span>
          </div>
          <div className="flex justify-between">
            <span>Supervised ML:</span>
            <span className="text-emerald-400 font-medium">4 Models Ready</span>
          </div>
          <div className="flex justify-between">
            <span>Clustering:</span>
            <span className="text-emerald-400 font-medium">K-Means Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
