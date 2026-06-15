import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Globe, GitPullRequest, CircleDot, ExternalLink, CloudUpload, Play, Clock, CheckCircle2, XCircle, RefreshCw, XSquare, Settings, Lock, Variable, Server, ChevronDown, ChevronRight, TerminalSquare, Plus, Trash2, Edit2 } from "lucide-react";
import LogViewerModal from "../Modals/LogViewerModal";
import sodium from "libsodium-wrappers";

interface GithubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  run_number: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  actor: { login: string; avatar_url: string } | null;
  head_commit: { message: string } | null;
}

interface GithubSecret {
  name: string;
  created_at: string;
  updated_at: string;
}

interface GithubVariable {
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

interface GithubEnvironment {
  name: string;
  updated_at: string;
}

interface GithubPanelProps {
  ownerRepo: { owner: string; repo: string } | null;
  pat: string | null;
}

export default function GithubPanel({ ownerRepo, pat }: GithubPanelProps) {
  const [prs, setPrs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [runs, setRuns] = useState<GithubWorkflowRun[]>([]);
  const [secrets, setSecrets] = useState<GithubSecret[]>([]);
  const [variables, setVariables] = useState<GithubVariable[]>([]);
  const [environments, setEnvironments] = useState<GithubEnvironment[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "settings">("overview");
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});
  const [viewingLogsForRun, setViewingLogsForRun] = useState<{ id: number, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [publishName, setPublishName] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishPrivate, setPublishPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Settings CRUD State
  const [showAddEnv, setShowAddEnv] = useState(false);
  const [showAddVar, setShowAddVar] = useState(false);
  const [showAddSecret, setShowAddSecret] = useState(false);
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormValue("");
    setIsEditMode(false);
    setShowAddEnv(false);
    setShowAddVar(false);
    setShowAddSecret(false);
    setError(null);
  };

  useEffect(() => {
    async function loadGithubData() {
      if (!ownerRepo || !pat) return;
      setLoading(true);
      try {
        const [prsRes, issuesRes, runsRes, secretsRes, varsRes, envsRes] = await Promise.all([
          invoke<any[]>("list_pull_requests", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }),
          invoke<any[]>("list_issues", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }),
          invoke<GithubWorkflowRun[]>("list_action_runs", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }),
          invoke<GithubSecret[]>("list_action_secrets", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => []),
          invoke<GithubVariable[]>("list_action_variables", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => []),
          invoke<GithubEnvironment[]>("list_environments", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => [])
        ]);
        setPrs(prsRes);
        setIssues(issuesRes);
        setRuns(runsRes);
        setSecrets(secretsRes);
        setVariables(varsRes);
        setEnvironments(envsRes);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    }
    loadGithubData();
  }, [ownerRepo, pat]);

  const handleActionControl = async (runId: number, action: 'cancel' | 'rerun') => {
    if (!ownerRepo || !pat) return;
    try {
      setLoading(true);
      if (action === 'cancel') {
        await invoke("cancel_action_run", { owner: ownerRepo.owner, repo: ownerRepo.repo, runId, token: pat });
      } else {
        await invoke("rerun_action_run", { owner: ownerRepo.owner, repo: ownerRepo.repo, runId, token: pat });
      }
      // Re-fetch action runs
      const runsRes = await invoke<GithubWorkflowRun[]>("list_action_runs", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat });
      setRuns(runsRes);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

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

  const groupedRuns = runs.reduce((acc, run) => {
    if (!acc[run.name]) acc[run.name] = [];
    acc[run.name].push(run);
    return acc;
  }, {} as Record<string, GithubWorkflowRun[]>);

  const toggleWorkflow = (name: string) => {
    setExpandedWorkflows(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveEnv = async () => {
    if (!ownerRepo || !pat || !formName) return;
    try {
      setActionLoading(true);
      await invoke("create_environment", { owner: ownerRepo.owner, repo: ownerRepo.repo, envName: formName, token: pat });
      const envsRes = await invoke<GithubEnvironment[]>("list_environments", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => []);
      setEnvironments(envsRes);
      resetForm();
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEnv = async (name: string) => {
    if (!ownerRepo || !pat || !confirm(`Delete environment ${name}?`)) return;
    try {
      setActionLoading(true);
      await invoke("delete_environment", { owner: ownerRepo.owner, repo: ownerRepo.repo, envName: name, token: pat });
      setEnvironments(prev => prev.filter(e => e.name !== name));
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveVar = async () => {
    if (!ownerRepo || !pat || !formName || !formValue) return;
    try {
      setActionLoading(true);
      if (isEditMode) {
        await invoke("update_variable", { owner: ownerRepo.owner, repo: ownerRepo.repo, name: formName, value: formValue, token: pat });
      } else {
        await invoke("create_variable", { owner: ownerRepo.owner, repo: ownerRepo.repo, name: formName, value: formValue, token: pat });
      }
      const varsRes = await invoke<GithubVariable[]>("list_action_variables", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => []);
      setVariables(varsRes);
      resetForm();
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVar = async (name: string) => {
    if (!ownerRepo || !pat || !confirm(`Delete variable ${name}?`)) return;
    try {
      setActionLoading(true);
      await invoke("delete_variable", { owner: ownerRepo.owner, repo: ownerRepo.repo, name, token: pat });
      setVariables(prev => prev.filter(v => v.name !== name));
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSecret = async () => {
    if (!ownerRepo || !pat || !formName || !formValue) return;
    try {
      setActionLoading(true);
      // Get Public Key
      const pkRes = await invoke<{ key_id: string, key: string }>("get_repo_public_key", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat });
      
      // Encrypt with Libsodium
      await sodium.ready;
      const binkey = sodium.from_base64(pkRes.key, sodium.base64_variants.ORIGINAL);
      const binsec = sodium.from_string(formValue);
      const encBytes = sodium.crypto_box_seal(binsec, binkey);
      const encryptedValue = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
      
      // Put Secret
      await invoke("put_action_secret", { 
        owner: ownerRepo.owner, 
        repo: ownerRepo.repo, 
        name: formName.toUpperCase(), 
        encryptedValue, 
        keyId: pkRes.key_id, 
        token: pat 
      });

      const secretsRes = await invoke<GithubSecret[]>("list_action_secrets", { owner: ownerRepo.owner, repo: ownerRepo.repo, token: pat }).catch(() => []);
      setSecrets(secretsRes);
      resetForm();
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!ownerRepo || !pat || !confirm(`Delete secret ${name}?`)) return;
    try {
      setActionLoading(true);
      await invoke("delete_action_secret", { owner: ownerRepo.owner, repo: ownerRepo.repo, name, token: pat });
      setSecrets(prev => prev.filter(s => s.name !== name));
    } catch (e) {
      setError(e as string);
    } finally {
      setActionLoading(false);
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
        <div className="flex items-center gap-4 text-[10px] font-black tracking-widest">
          <button 
            className={`transition-colors border-b-2 pb-0.5 ${activeTab === 'overview' ? 'text-chrome-indigo border-chrome-indigo' : 'text-ink-soft border-transparent hover:text-ink'}`}
            onClick={() => setActiveTab('overview')}
          >
            OVERVIEW
          </button>
          <button 
            className={`transition-colors border-b-2 pb-0.5 flex items-center gap-1 ${activeTab === 'actions' ? 'text-chrome-indigo border-chrome-indigo' : 'text-ink-soft border-transparent hover:text-ink'}`}
            onClick={() => setActiveTab('actions')}
          >
            ACTIONS
          </button>
          <button 
            className={`transition-colors border-b-2 pb-0.5 flex items-center gap-1 ${activeTab === 'settings' ? 'text-chrome-indigo border-chrome-indigo' : 'text-ink-soft border-transparent hover:text-ink'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-3 h-3" /> SETTINGS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-8 text-xs font-bold text-ink-soft animate-pulse">LOADING GITHUB DATA...</div>
        ) : error ? (
          <div className="text-center py-8 text-xs font-bold text-systems-red">{error}</div>
        ) : (
          <>
            {activeTab === "overview" && (
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

            {activeTab === "actions" && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-chrome-indigo/20">
                  <Play className="w-4 h-4 text-chrome-indigo" />
                  <h3 className="font-bold text-ink text-xs">Workflows</h3>
                </div>
                
                <div className="flex flex-col gap-2">
                  {Object.keys(groupedRuns).length === 0 ? (
                    <p className="text-xs text-ink-soft italic px-2">No workflow runs found.</p>
                  ) : Object.entries(groupedRuns).map(([workflowName, workflowRuns]) => (
                    <div key={workflowName} className="mb-2">
                      <button 
                        onClick={() => toggleWorkflow(workflowName)}
                        className="flex items-center gap-2 w-full text-left bg-platinum border border-chrome-indigo p-2 hover:bg-surface transition-colors"
                      >
                        {expandedWorkflows[workflowName] ? <ChevronDown className="w-3 h-3 text-ink" /> : <ChevronRight className="w-3 h-3 text-ink" />}
                        <span className="font-bold text-ink text-xs">{workflowName}</span>
                        <span className="ml-auto text-[10px] bg-canvas px-1 rounded text-ink-soft">{workflowRuns.length} runs</span>
                      </button>
                      
                      {expandedWorkflows[workflowName] && (
                        <div className="flex flex-col ml-3 mt-1 border-l border-chrome-indigo/30 pl-2 gap-1">
                          {workflowRuns.map(run => (
                            <div key={run.id} className="flex items-start gap-3 p-2 bg-white border border-chrome-indigo hover:border-nav-gold shadow-sm group transition-colors">
                              <div className="pt-0.5 shrink-0">
                                {run.status !== 'completed' ? (
                                  <Clock className="w-4 h-4 text-nav-gold animate-pulse" />
                                ) : run.conclusion === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-systems-green" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-systems-red" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-ink group-hover:text-chrome-indigo truncate">{run.head_commit?.message || run.name}</span>
                                  <span className="text-[10px] text-ink-soft shrink-0">#{run.run_number}</span>
                                </div>
                                <p className="text-[10px] text-ink-soft truncate">
                                  <span className="font-mono bg-platinum px-1 rounded">{run.head_branch}</span> • by {run.actor?.login}
                                </p>
                              </div>
                              
                              {/* Action Controls */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setViewingLogsForRun({ id: run.id, name: run.name })}
                                  className="p-1 hover:bg-chrome-indigo/10 text-ink-soft hover:text-chrome-indigo rounded transition-colors"
                                  title="View Logs"
                                >
                                  <TerminalSquare className="w-3.5 h-3.5" />
                                </button>
                                {run.status !== 'completed' ? (
                                  <button 
                                    onClick={(e) => { e.preventDefault(); handleActionControl(run.id, 'cancel'); }}
                                    className="p-1 hover:bg-systems-red/10 text-ink-soft hover:text-systems-red rounded transition-colors"
                                    title="Cancel Workflow"
                                  >
                                    <XSquare className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={(e) => { e.preventDefault(); handleActionControl(run.id, 'rerun'); }}
                                    className="p-1 hover:bg-chrome-indigo/10 text-ink-soft hover:text-chrome-indigo rounded transition-colors"
                                    title="Re-run Workflow"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <a href={run.html_url} target="_blank" rel="noreferrer" className="p-1 text-ink-soft hover:text-chrome-indigo ml-1">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex flex-col gap-6">
                {/* Environments */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-chrome-indigo/20">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-systems-green" />
                      <h3 className="font-bold text-ink text-xs">Environments</h3>
                    </div>
                    <button onClick={() => { resetForm(); setShowAddEnv(true); }} className="text-chrome-indigo hover:text-nav-gold transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {showAddEnv && (
                    <div className="flex flex-col gap-2 p-3 bg-platinum border border-chrome-indigo mb-3 shadow-sm">
                      <input type="text" placeholder="Environment Name" value={formName} onChange={e => setFormName(e.target.value)} className="bg-white border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={resetForm} className="text-xs text-ink-soft hover:text-ink px-3 py-1">Cancel</button>
                        <button onClick={handleSaveEnv} disabled={actionLoading} className="text-xs bg-nav-gold text-white font-bold px-3 py-1 shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50">Save</button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {environments.length === 0 && !showAddEnv ? (
                      <p className="text-xs text-ink-soft italic px-2">No environments found.</p>
                    ) : environments.map(env => (
                      <div key={env.name} className="flex justify-between items-center p-3 bg-white border border-chrome-indigo shadow-sm group">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-mono text-ink">{env.name}</span>
                          <span className="text-[10px] text-ink-soft mt-1">Updated: {new Date(env.updated_at).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => handleDeleteEnv(env.name)} className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-systems-red p-1 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secrets */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-chrome-indigo/20">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-systems-blue" />
                      <h3 className="font-bold text-ink text-xs">Repository Secrets</h3>
                    </div>
                    <button onClick={() => { resetForm(); setShowAddSecret(true); }} className="text-chrome-indigo hover:text-nav-gold transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {showAddSecret && (
                    <div className="flex flex-col gap-2 p-3 bg-platinum border border-chrome-indigo mb-3 shadow-sm">
                      <input type="text" placeholder="SECRET_NAME" value={formName} onChange={e => setFormName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))} disabled={isEditMode} className="bg-white border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold disabled:opacity-50 font-mono" />
                      <textarea placeholder="Secret Value (will be encrypted)" value={formValue} onChange={e => setFormValue(e.target.value)} className="bg-white border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold font-mono min-h-[60px]" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={resetForm} className="text-xs text-ink-soft hover:text-ink px-3 py-1">Cancel</button>
                        <button onClick={handleSaveSecret} disabled={actionLoading} className="text-xs bg-nav-gold text-white font-bold px-3 py-1 shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50">Save</button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {secrets.length === 0 && !showAddSecret ? (
                      <p className="text-xs text-ink-soft italic px-2">No repository secrets found.</p>
                    ) : secrets.map(sec => (
                      <div key={sec.name} className="flex justify-between items-center p-3 bg-white border border-chrome-indigo shadow-sm group">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-mono text-ink">{sec.name}</span>
                          <span className="text-[10px] text-ink-soft mt-1">Updated: {new Date(sec.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { resetForm(); setFormName(sec.name); setIsEditMode(true); setShowAddSecret(true); }} className="text-ink-soft hover:text-chrome-indigo p-1" title="Update Value">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSecret(sec.name)} className="text-ink-soft hover:text-systems-red p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-chrome-indigo/20">
                    <div className="flex items-center gap-2">
                      <Variable className="w-4 h-4 text-nav-gold" />
                      <h3 className="font-bold text-ink text-xs">Repository Variables</h3>
                    </div>
                    <button onClick={() => { resetForm(); setShowAddVar(true); }} className="text-chrome-indigo hover:text-nav-gold transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {showAddVar && (
                    <div className="flex flex-col gap-2 p-3 bg-platinum border border-chrome-indigo mb-3 shadow-sm">
                      <input type="text" placeholder="VARIABLE_NAME" value={formName} onChange={e => setFormName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))} disabled={isEditMode} className="bg-white border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold disabled:opacity-50 font-mono" />
                      <textarea placeholder="Variable Value" value={formValue} onChange={e => setFormValue(e.target.value)} className="bg-white border border-chrome-indigo text-xs p-2 text-ink w-full focus:outline-none focus:border-nav-gold font-mono min-h-[60px]" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={resetForm} className="text-xs text-ink-soft hover:text-ink px-3 py-1">Cancel</button>
                        <button onClick={handleSaveVar} disabled={actionLoading} className="text-xs bg-nav-gold text-white font-bold px-3 py-1 shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50">Save</button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {variables.length === 0 && !showAddVar ? (
                      <p className="text-xs text-ink-soft italic px-2">No repository variables found.</p>
                    ) : variables.map(v => (
                      <div key={v.name} className="flex flex-col p-3 bg-white border border-chrome-indigo shadow-sm group">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono text-ink">{v.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { resetForm(); setFormName(v.name); setFormValue(v.value); setIsEditMode(true); setShowAddVar(true); }} className="text-ink-soft hover:text-chrome-indigo p-1">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteVar(v.name)} className="text-ink-soft hover:text-systems-red p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <span className="text-xs text-ink-soft mt-1 font-mono break-all bg-platinum p-1">{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Viewer Modal */}
      {viewingLogsForRun && ownerRepo && pat && (
        <LogViewerModal 
          ownerRepo={ownerRepo}
          pat={pat}
          runId={viewingLogsForRun.id}
          runName={viewingLogsForRun.name}
          onClose={() => setViewingLogsForRun(null)}
        />
      )}
    </div>
  );
}
