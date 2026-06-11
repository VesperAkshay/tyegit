import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Key, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

interface AuthModalProps {
  pendingAction: "push" | "pull" | "fetch" | null;
  pat: string;
  setPat: (pat: string) => void;
  syncing: boolean;
  onCancel: () => void;
  onAuthenticate: (action: "push" | "pull" | "fetch", token: string) => void;
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface AccessTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

export default function AuthModal({ pendingAction, setPat, syncing, onCancel, onAuthenticate }: AuthModalProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pendingAction) return;

    const initFlow = async () => {
      try {
        setLoading(true);
        setError(null);
        const info = await invoke<DeviceCodeResponse>("start_device_flow", { clientId: CLIENT_ID });
        setDeviceInfo(info);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    initFlow();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pendingAction]);

  useEffect(() => {
    if (!deviceInfo) return;

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const resp = await invoke<AccessTokenResponse>("poll_device_flow", { 
          clientId: CLIENT_ID, 
          deviceCode: deviceInfo.device_code 
        });
        
        if (resp.access_token) {
          clearInterval(pollIntervalRef.current!);
          setPat(resp.access_token);
          onAuthenticate(pendingAction!, resp.access_token);
        } else if (resp.error && resp.error !== "authorization_pending") {
          clearInterval(pollIntervalRef.current!);
          setError(resp.error_description || resp.error);
        }
      } catch (err) {
        clearInterval(pollIntervalRef.current!);
        setError(err as string);
      }
    }, (deviceInfo.interval + 1) * 1000); // Add 1s padding to interval to avoid rate limits

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [deviceInfo, pendingAction, onAuthenticate, setPat]);

  const handleOpenBrowser = async () => {
    if (deviceInfo) {
      await openUrl(deviceInfo.verification_uri);
    }
  };

  if (!pendingAction) return null;

  return (
    <div className="fixed inset-0 bg-carbon/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-platinum border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-chrome-indigo" />
          <h2 className="text-lg font-black text-ink uppercase">GitHub Authentication</h2>
        </div>
        
        {syncing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 text-chrome-indigo animate-spin mb-4" />
            <p className="text-sm font-bold text-ink">Executing {pendingAction.toUpperCase()}...</p>
          </div>
        ) : error ? (
          <div className="bg-primary/10 border border-primary p-4 mb-4">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold">
              <AlertTriangle className="w-4 h-4" /> Error
            </div>
            <p className="text-xs text-primary">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-chrome-indigo animate-spin mb-2" />
            <p className="text-xs text-ink-soft font-bold">Requesting secure device code...</p>
          </div>
        ) : deviceInfo ? (
          <div className="flex flex-col items-center">
            <p className="text-xs text-ink-soft mb-4 text-center leading-relaxed">
              To securely connect your repository, please copy the code below and authorize Antigravity Git Desktop in your browser.
            </p>
            
            <div className="bg-white border-2 border-chrome-indigo px-8 py-4 mb-6 select-all">
              <span className="text-2xl font-mono font-black text-ink tracking-widest">
                {deviceInfo.user_code}
              </span>
            </div>

            <button 
              onClick={handleOpenBrowser}
              className="bg-systems-teal text-white w-full py-3 text-sm font-bold beveled-chip flex items-center justify-center gap-2 hover:bg-systems-teal/90 mb-4 transition-colors"
            >
              Open GitHub to Authenticate <ExternalLink className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 text-[10px] text-ink-soft font-bold animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              WAITING FOR BROWSER AUTHORIZATION...
            </div>
          </div>
        ) : null}

        {!syncing && (
          <div className="flex justify-end mt-4">
            <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-ink hover:bg-canvas transition-colors">
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
