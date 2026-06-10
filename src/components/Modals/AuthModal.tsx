import { Key, RefreshCw } from "lucide-react";

interface AuthModalProps {
  pendingAction: "push" | "pull" | "fetch" | null;
  pat: string;
  setPat: (pat: string) => void;
  syncing: boolean;
  onCancel: () => void;
  onAuthenticate: (action: "push" | "pull" | "fetch", token: string) => void;
}

export default function AuthModal({ pendingAction, pat, setPat, syncing, onCancel, onAuthenticate }: AuthModalProps) {
  if (!pendingAction) return null;

  return (
    <div className="fixed inset-0 bg-carbon/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-platinum border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-chrome-indigo" />
          <h2 className="text-lg font-black text-ink">AUTHENTICATION REQUIRED</h2>
        </div>
        <p className="text-xs text-ink-soft mb-4 leading-relaxed">
          To connect to your remote repository, please provide a GitHub Personal Access Token (PAT). We will temporarily hold this token in memory to perform the <strong>{pendingAction.toUpperCase()}</strong> action.
        </p>
        <input 
          type="password"
          className="w-full text-xs p-2 border border-chrome-indigo focus:outline-none focus:border-nav-gold mb-4 font-mono"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={pat}
          onChange={e => setPat(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-ink hover:bg-canvas">CANCEL</button>
          <button 
            onClick={() => onAuthenticate(pendingAction, pat)}
            disabled={!pat || syncing}
            className="bg-systems-teal text-white px-4 py-2 text-xs font-bold beveled-chip flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
            AUTHENTICATE & {pendingAction.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
