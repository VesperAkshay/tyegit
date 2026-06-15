import { X, Download, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateModalProps {
  update: any; // Tauri Update object
  onClose: () => void;
}

export default function UpdateModal({ update, onClose }: UpdateModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      await update.downloadAndInstall((event: any) => {
        switch (event.event) {
          case 'Started':
            setContentLength(event.data.contentLength);
            break;
          case 'Progress':
            setDownloadedSize(prev => prev + event.data.chunkLength);
            break;
          case 'Finished':
            break;
        }
      });

      await relaunch();
    } catch (e) {
      console.error(e);
      setError(e as string);
      setDownloading(false);
    }
  };

  const progressPercent = contentLength > 0 ? Math.round((downloadedSize / contentLength) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-carbon/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-primary shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-md flex flex-col">
        
        <div className="bg-primary text-white px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Download className="w-4 h-4" />
            UPDATE AVAILABLE
          </div>
          {!downloading && (
            <button onClick={onClose} className="hover:bg-primary-soft p-0.5 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="p-4 bg-platinum flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-ink">TyeGit {update.version} is ready!</div>
              <div className="text-xs text-ink-soft mt-1">
                A new version of TyeGit has been released. Would you like to install it now?
              </div>
            </div>
          </div>

          {update.body && (
            <div className="bg-white border border-chrome-indigo p-2 text-xs text-ink-soft max-h-32 overflow-y-auto font-mono">
              {update.body}
            </div>
          )}

          {error && (
            <div className="bg-primary/10 border-l-2 border-primary p-2 text-xs font-bold text-primary flex items-start gap-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="break-all">{error}</span>
            </div>
          )}

          {downloading ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between text-xs font-bold text-chrome-indigo">
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> DOWNLOADING...</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-white border border-chrome-indigo rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chrome-indigo transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-platinum border border-chrome-indigo text-ink hover:bg-white transition-colors shadow-sm"
              >
                LATER
              </button>
              <button 
                onClick={handleInstall}
                className="px-4 py-2 text-xs font-bold bg-systems-green text-white border-2 border-carbon beveled-chip shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-px active:shadow-none flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                INSTALL & RESTART
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
