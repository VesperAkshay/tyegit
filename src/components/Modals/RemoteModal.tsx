import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Plus, Trash2, Globe } from "lucide-react";
import { RemoteInfo } from "../../types";

interface RemoteModalProps {
  repoPath: string;
  remotes: RemoteInfo[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function RemoteModal({ repoPath, remotes, onClose, onRefresh }: RemoteModalProps) {
  const [newRemoteName, setNewRemoteName] = useState("");
  const [newRemoteUrl, setNewRemoteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddRemote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemoteName || !newRemoteUrl) {
      setError("Please provide both name and URL");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await invoke("add_remote", { 
        path: repoPath, 
        name: newRemoteName,
        url: newRemoteUrl 
      });
      setNewRemoteName("");
      setNewRemoteUrl("");
      onRefresh();
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRemote = async (name: string) => {
    if (!window.confirm(`Are you sure you want to remove remote '${name}'?`)) return;
    setLoading(true);
    setError(null);
    try {
      await invoke("remove_remote", { path: repoPath, name });
      onRefresh();
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="bg-chrome-indigo text-white px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="font-bold tracking-wider">MANAGE REMOTES</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="bg-primary/20 text-primary border border-primary p-3 mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xs font-bold text-ink-soft mb-3 uppercase tracking-wider">Existing Remotes</h3>
            {remotes.length === 0 ? (
              <div className="text-sm text-ink-soft italic p-4 bg-canvas-soft border border-dashed border-chrome-indigo/30">
                No remotes found. Add one below.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {remotes.map(r => (
                  <div key={r.name} className="flex items-center justify-between bg-white border border-chrome-indigo p-3 shadow-sm">
                    <div className="flex flex-col overflow-hidden mr-4">
                      <span className="font-bold text-ink text-sm">{r.name}</span>
                      <span className="text-xs text-ink-soft font-mono truncate">{r.url}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveRemote(r.name)}
                      disabled={loading}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 shrink-0"
                      title="Remove remote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-chrome-indigo/20 pt-6">
            <h3 className="text-xs font-bold text-ink-soft mb-3 uppercase tracking-wider">Add New Remote</h3>
            <form onSubmit={handleAddRemote} className="flex flex-col gap-3">
              <input
                type="text"
                value={newRemoteName}
                onChange={e => setNewRemoteName(e.target.value)}
                placeholder="Remote Name (e.g. upstream)"
                className="bg-white border-2 border-chrome-indigo px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-systems-teal"
                disabled={loading}
              />
              <input
                type="text"
                value={newRemoteUrl}
                onChange={e => setNewRemoteUrl(e.target.value)}
                placeholder="Remote URL (e.g. https://github.com/...)"
                className="bg-white border-2 border-chrome-indigo px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-systems-teal"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !newRemoteName || !newRemoteUrl}
                className="bg-systems-teal text-white font-bold px-4 py-2 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50 mt-2"
              >
                <Plus className="w-4 h-4" />
                ADD REMOTE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
