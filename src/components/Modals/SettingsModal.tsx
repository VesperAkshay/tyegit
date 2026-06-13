import { X, Settings as SettingsIcon, RefreshCcw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";

interface SettingsModalProps {
  onClose: () => void;
  onUpdateFound: (update: any) => void;
}

export default function SettingsModal({ onClose, onUpdateFound }: SettingsModalProps) {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tyegit-auto-update");
    if (saved !== null) {
      setAutoUpdate(saved === "true");
    }
  }, []);

  const toggleAutoUpdate = () => {
    const newVal = !autoUpdate;
    setAutoUpdate(newVal);
    localStorage.setItem("tyegit-auto-update", newVal.toString());
  };

  const handleCheckForUpdates = async () => {
    try {
      setChecking(true);
      setStatusMsg(null);
      const update = await check();
      
      if (update) {
        setStatusMsg({ text: `Update v${update.version} available!`, type: 'success' });
        setTimeout(() => {
          onClose();
          onUpdateFound(update);
        }, 1000);
      } else {
        setStatusMsg({ text: "You are on the latest version.", type: 'success' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ text: `Failed to check for updates: ${e}`, type: 'error' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-carbon/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-md flex flex-col">
        
        <div className="bg-chrome-indigo text-white px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <SettingsIcon className="w-4 h-4" />
            SETTINGS
          </div>
          <button onClick={onClose} className="hover:bg-primary p-0.5 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 bg-platinum flex flex-col gap-4">
          
          {/* Updates Section */}
          <div className="bg-white border border-chrome-indigo p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Automatic Updates</div>
                <div className="text-xs text-ink-soft">Prompt me when a new version is released</div>
              </div>
              <button 
                onClick={toggleAutoUpdate}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoUpdate ? 'bg-systems-green' : 'bg-platinum border border-chrome-indigo'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoUpdate ? 'translate-x-5' : 'translate-x-1 bg-chrome-indigo'}`} />
              </button>
            </div>

            <div className="h-px bg-chrome-indigo/20 w-full" />

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">Check for Updates</div>
                <div className="text-xs text-ink-soft">Manually check the servers for new versions</div>
              </div>
              <button 
                onClick={handleCheckForUpdates}
                disabled={checking}
                className="px-3 py-1.5 text-xs font-bold bg-chrome-indigo text-white border border-carbon beveled-chip shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-px active:shadow-none disabled:opacity-50 flex items-center gap-1"
              >
                {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                CHECK
              </button>
            </div>

            {statusMsg && (
              <div className={`p-2 text-xs font-bold flex items-center gap-1 ${statusMsg.type === 'error' ? 'bg-primary/10 text-primary' : 'bg-systems-green/10 text-systems-green'}`}>
                {statusMsg.type === 'error' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {statusMsg.text}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
