import React from "react";
import { AlertCircle, HelpCircle } from "lucide-react";

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100/80 px-3 py-2 rounded-lg border border-slate-200">
        <AlertCircle className="w-4 h-4 text-navy-600 shrink-0" />
        <span>
          <strong>Educational Decision Support:</strong> Predictions and cluster assignments are statistical estimates designed to assist academic advisors, not automated decisions.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-navy-50/70 border border-navy-200/80 rounded-xl p-4 flex items-start space-x-3.5 shadow-sm">
      <div className="p-2 bg-navy-100 rounded-lg text-navy-800 shrink-0 mt-0.5">
        <HelpCircle className="w-5 h-5 text-navy-700" />
      </div>
      <div className="text-xs text-navy-900 leading-relaxed">
        <h4 className="font-semibold text-navy-950 text-sm mb-0.5">
          Educational Decision-Support Advisory Notice
        </h4>
        <p className="text-slate-600">
          This system is an academic research prototype built to assist educators, tutors, and student support teams in identifying students who may benefit from supplemental academic coaching. Model predictions and unsupervised cluster labels are decision-support insights, not deterministic forecasts. No punitive or automatic institutional decisions should be based solely on automated output.
        </p>
      </div>
    </div>
  );
}
