import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Home from "./pages/Home";
import RepositoryView from "./pages/RepositoryView";
import CommandPalette from "./components/Modals/CommandPalette";
import { LogOut } from "lucide-react";

export default function App() {
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [pat, setPat] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadToken() {
      try {
        const token = await invoke<string | null>("get_github_token");
        if (token) {
          setPat(token);
          const prof = await invoke<any>("get_user_profile", { token });
          setProfile(prof);
        }
      } catch (err) {
        console.error("Failed to load GitHub token", err);
      }
    }
    loadToken();
  }, []);

  useEffect(() => {
    if (pat && !profile) {
      invoke("get_user_profile", { token: pat })
        .then((p: any) => setProfile(p))
        .catch(console.error);
    }
  }, [pat, profile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await invoke("delete_github_token");
      setPat("");
      setProfile(null);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <>
      {currentRepo ? (
        <RepositoryView
          repoPath={currentRepo}
          onClose={() => setCurrentRepo(null)}
          pat={pat}
          setPat={setPat}
        />
      ) : (
        <Home 
          onOpenRepo={(path) => setCurrentRepo(path)} 
          pat={pat}
          setPat={setPat}
        />
      )}
      
      {profile && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-3 bg-platinum border-2 border-chrome-indigo p-1.5 shadow-[4px_4px_0px_rgba(61,79,151,1)]">
          <div className="flex items-center gap-2">
            <img src={profile.avatar_url} alt="Avatar" className="w-6 h-6 border border-chrome-indigo" />
            <span className="text-[10px] font-bold text-ink uppercase">{profile.login}</span>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-1 hover:bg-primary/10 text-ink-soft hover:text-primary transition-colors border-l border-chrome-indigo/30"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenRepo={(path) => setCurrentRepo(path)}
      />
    </>
  );
}
