import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import DatasetExplorer from "./pages/DatasetExplorer";
import ModelComparison from "./pages/ModelComparison";
import KMeansAnalysis from "./pages/KMeansAnalysis";
import KStarPrediction from "./pages/KStarPrediction";
import { api } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [clustering, setClustering] = useState(null);
  const [kstarStatus, setKstarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [healthRes, summaryRes, clusterRes, kstarRes] = await Promise.all([
        api.getHealth(),
        api.getDatasetSummary(),
        api.getClusteringResults(),
        api.getKStarStatus(),
      ]);

      if (healthRes.status === "healthy" || healthRes.success) setHealth(healthRes);
      if (summaryRes.success) setSummary(summaryRes.data);
      if (clusterRes.success) setClustering(clusterRes.data);
      if (kstarRes.success) setKstarStatus(kstarRes.data);
    } catch (err) {
      console.error("Failed to fetch initial telemetry", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onRefresh={loadAllData}
          refreshing={refreshing}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <Dashboard
                summary={summary}
                clustering={clustering}
                kstarStatus={kstarStatus}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "dataset" && (
              <DatasetExplorer
                summary={summary}
                onDatasetReload={loadAllData}
              />
            )}

            {activeTab === "comparison" && (
              <ModelComparison />
            )}

            {activeTab === "clustering" && (
              <KMeansAnalysis
                clustering={clustering}
                onClusteringUpdate={(newClustering) => setClustering(newClustering)}
              />
            )}

            {activeTab === "prediction" && (
              <KStarPrediction
                kstarStatus={kstarStatus}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
