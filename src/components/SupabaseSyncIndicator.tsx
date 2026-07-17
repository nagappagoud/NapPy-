import React, { useState, useEffect } from "react";
import { Database, RefreshCw, AlertCircle, CheckCircle2, Copy, X } from "lucide-react";
import { nappyDb } from "../services/nappyDb";
import { useToast } from "../context/ToastContext";

export default function SupabaseSyncIndicator() {
  const [syncInfo, setSyncInfo] = useState(nappyDb.getSyncStatus());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    const handleUpdate = () => {
      setSyncInfo(nappyDb.getSyncStatus());
    };

    const unsubscribe = nappyDb.subscribeToSync(handleUpdate);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(nappyDb.getSqlSchema());
    setCopied(true);
    success("Copied to Clipboard", "Supabase SQL Setup script copied successfully.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleForceRetry = () => {
    info("Synchronizing", "Triggering manual pull from Supabase...");
    nappyDb.triggerManualPull();
  };

  // Determine badge styling based on status
  let statusColor = "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
  let statusText = "Initializing...";
  let dotColor = "bg-yellow-500 animate-pulse";
  let icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;

  if (syncInfo.status === "synced") {
    statusColor = "bg-green-500/10 border-green-500/20 text-green-400";
    statusText = "Supabase Synced";
    dotColor = "bg-green-400";
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (syncInfo.status === "syncing") {
    statusColor = "bg-cyan-500/10 border-cyan-500/20 text-brand-cyan";
    statusText = "Syncing...";
    dotColor = "bg-brand-cyan animate-ping";
    icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
  } else if (syncInfo.status === "error") {
    statusColor = "bg-red-500/10 border-red-500/20 text-red-400";
    statusText = "Setup Pending";
    dotColor = "bg-red-500 animate-pulse";
    icon = <AlertCircle className="w-3.5 h-3.5" />;
  }

  return (
    <>
      {/* Floating Pill Trigger */}
      <div 
        id="supabase-sync-floating-indicator"
        className={`fixed bottom-4 left-4 z-[9999] px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-2 text-[10px] font-mono font-bold transition-all ${statusColor}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{statusText}</span>
        </div>
        
        {syncInfo.status === "error" ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-1.5 px-2 py-0.5 bg-red-500/20 hover:bg-red-500 hover:text-white rounded text-[8px] font-bold tracking-wide uppercase cursor-pointer border border-red-500/30 transition-all"
          >
            Setup
          </button>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="View Database Status"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Database Setup Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-black/95 p-6 shadow-2xl flex flex-col font-sans">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4 mb-4">
              <Database className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                Supabase Backend Live Database Sync
              </h3>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-gray-500">PROJECT ID</span>
                  <span className="font-mono text-white select-all">udbtvuryxjcmzoakkivr</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-gray-500">SYNC STATUS</span>
                  <span className={`font-mono font-bold tracking-wider uppercase text-[10px] ${
                    syncInfo.status === "synced" ? "text-green-400" : syncInfo.status === "syncing" ? "text-brand-cyan" : "text-red-400"
                  }`}>
                    {syncInfo.status}
                  </span>
                </div>
                {syncInfo.lastSynced && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] text-gray-500">LAST SYNCED</span>
                    <span className="font-mono text-gray-300 text-[10px]">
                      {syncInfo.lastSynced.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {syncInfo.error && (
                  <div className="mt-2 text-[10px] text-red-400 border-t border-red-500/10 pt-2 font-mono leading-normal">
                    ⚠️ Error: {syncInfo.error}
                  </div>
                )}
              </div>

              {syncInfo.status === "error" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-amber-400 font-bold">
                    👉 To complete your backend setup and enable persistent cloud storage, run the following SQL script in your Supabase SQL Editor:
                  </p>
                  
                  <div className="relative rounded-lg bg-black border border-white/10 p-3.5 overflow-hidden">
                    <pre className="text-[10px] font-mono text-gray-300 overflow-x-auto select-all max-h-40 leading-normal custom-scrollbar">
                      {nappyDb.getSqlSchema()}
                    </pre>
                    <button
                      onClick={handleCopySql}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Copy SQL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-400">
                    Steps: Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline">Supabase Dashboard</a> &rarr; Open your Project &rarr; Click on <strong>SQL Editor</strong> &rarr; Click <strong>New Query</strong> &rarr; Paste and hit <strong>Run</strong>!
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-white/5 justify-between">
                <button
                  onClick={handleForceRetry}
                  disabled={syncInfo.status === "syncing"}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncInfo.status === "syncing" ? "animate-spin" : ""}`} />
                  <span>Force Pull Sync</span>
                </button>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-brand-cyan text-brand-black hover:opacity-95 rounded-lg font-bold font-mono text-[10px] cursor-pointer"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
