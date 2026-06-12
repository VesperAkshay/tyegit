import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Globe, GitPullRequest, CircleDot, ExternalLink, CloudUpload } from "lucide-react";

interface GithubPanelProps {
  ownerRepo: { owner: string; repo: string } | null;
  pat: string | null;
}

export default function GithubPanel({ ownerRepo, pat }: GithubPanelProps) {
  const [prs, setPrs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [publishName, setPublishName] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishPrivate, setPublishPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function loadGithubData() {
      if (!ownerRepo || !pat) return;
      setLoading(true);
      try {
        const [prsRes, issuesRes] = await Promise.all([
          invoke<any[]>("list_pull_requests", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }),
          invoke<any[]>("list_issues", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat })
        ]);
        setPrs(prsRes);
        setIssues(issuesRes);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    }
    loadGithubData();
  }, [ownerRepo, pat]);

  const handlePublish = async () => {
    if (!pat || !publishName) return;
    try {
      setPublishing(true);
      setError(null);
      
      const repoRes = await invoke<any>("publish_repository", {
        name: publishName,
        description: publishDesc,
        private: publishPrivate,
        token: pat
      });
      
      alert(`Repository published at ${repoRes.clone_url}! Please run 'git remote add origin ${repoRes.clone_url}' manually for now as automatic remote linking is still in development.`);
      
    } catch (err) {
      setError(err as string);
    } finally {
      setPublishing(false);
    }
  };

  if (!pat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center beveled-plate bg-platinum p-8 text-center h-full">
        <Globe className="w-12 h-12 text-ink-soft mb-4 opacity-50" />
        <h3 className="text-sm font-bold text-ink mb-2">Not Authenticated</h3>
        <p className="text-xs text-ink-soft max-w-md">
          Please authenticate with GitHub to view Pull Requests and Issues.
        </p>
      </div>
    );
  }

  if (!ownerRepo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center beveled-plate bg-platinum p-8 text-center h-full">
        <CloudUpload className="w-12 h-12 text-nav-gold mb-4" />
        <h3 className="text-sm font-bold text-ink mb-2">Publish to GitHub</h3>
        <p className="text-xs text-ink-soft max-w-md mb-6">
          This local repository does not have a GitHub remote. Publish it to the cloud to collaborate!
        </p>
        
        <div className="w-full max-w-sm flex flex-col gap-3 text-left">
          {error && <div className="text-xs text-systems-red bg-systems-red/10 p-2 border border-systems-red/20">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-ink">Repository Name</label>
            <input 
              type="text" value={publishName} onChange={e => setPublishName(e.target.value)}
              className="bg-surface border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-ink">Description (optional)</label>
            <input 
              type="text" value={publishDesc} onChange={e => setPublishDesc(e.target.value)}
              className="bg-surface border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold"
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" checked={publishPrivate} onChange={e => setPublishPrivate(e.target.checked)}
              id="private-checkbox"
            />
            <label htmlFor="private-checkbox" className="text-xs text-ink cursor-pointer">Make repository private</label>
          </div>
          
          <button 
            onClick={handlePublish} disabled={publishing || !publishName}
            className="mt-4 bg-nav-gold hover:bg-nav-gold/90 text-white font-bold text-xs py-2 px-4 shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50"
          >
            {publishing ? "PUBLISHING..." : "PUBLISH REPOSITORY"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-platinum beveled-plate overflow-hidden">
      <div className="bg-canvas border-b border-chrome-indigo px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-ink" />
          <span className="font-bold text-ink text-xs">{ownerRepo.owner} / {ownerRepo.repo}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-8 text-xs font-bold text-ink-soft animate-pulse">LOADING GITHUB DATA...</div>
        ) : error ? (
          <div className="text-center py-8 text-xs font-bold text-systems-red">{error}</div>
        ) : (
          <>
            {/* Pull Requests */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-chrome-indigo/20">
                <GitPullRequest className="w-4 h-4 text-systems-green" />
                <h3 className="font-bold text-ink text-xs">Open Pull Requests ({prs.length})</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                {prs.length === 0 ? (
                  <p className="text-xs text-ink-soft italic px-2">No open pull requests.</p>
                ) : prs.map(pr => (
                  <a key={pr.number} href={pr.html_url} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white border border-chrome-indigo hover:border-nav-gold shadow-sm group transition-colors">
                    <img src={pr.user.avatar_url} className="w-6 h-6 rounded-full border border-chrome-indigo" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-ink group-hover:text-chrome-indigo truncate">{pr.title}</span>
                        <span className="text-[10px] text-ink-soft shrink-0">#{pr.number}</span>
                      </div>
                      <p className="text-[10px] text-ink-soft">Opened by {pr.user.login}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </a>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-chrome-indigo/20">
                <CircleDot className="w-4 h-4 text-systems-green" />
                <h3 className="font-bold text-ink text-xs">Open Issues ({issues.length})</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                {issues.length === 0 ? (
                  <p className="text-xs text-ink-soft italic px-2">No open issues.</p>
                ) : issues.map(issue => (
                  <a key={issue.number} href={issue.html_url} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-white border border-chrome-indigo hover:border-nav-gold shadow-sm group transition-colors">
                    <img src={issue.user.avatar_url} className="w-6 h-6 rounded-full border border-chrome-indigo" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-ink group-hover:text-chrome-indigo truncate">{issue.title}</span>
                        <span className="text-[10px] text-ink-soft shrink-0">#{issue.number}</span>
                      </div>
                      <p className="text-[10px] text-ink-soft">Opened by {issue.user.login}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-ink-soft opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
