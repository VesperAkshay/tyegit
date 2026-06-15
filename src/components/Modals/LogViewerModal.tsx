import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Terminal } from "lucide-react";

interface GithubJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
}

interface LogViewerModalProps {
  ownerRepo: { owner: string; repo: string };
  pat: string;
  runId: number;
  runName: string;
  onClose: () => void;
}

export default function LogViewerModal({ ownerRepo, pat, runId, runName, onClose }: LogViewerModalProps) {
  const [jobs, setJobs] = useState<GithubJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsRes = await invoke<GithubJob[]>("list_action_jobs", { owner: ownerRepo.owner, repo: ownerRepo.repo, runId, token: pat });
        setJobs(jobsRes);
        if (jobsRes.length > 0) {
          setSelectedJob(jobsRes[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [ownerRepo, pat, runId]);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedJob) return;
      setLogs("Loading logs...");
      try {
        const logsRes = await invoke<string>("get_job_logs", { owner: ownerRepo.owner, repo: ownerRepo.repo, jobId: selectedJob, token: pat });
        setLogs(logsRes || "No logs available.");
      } catch (e) {
        setLogs("Failed to load logs. Job might still be running or logs expired.");
      }
    }
    fetchLogs();
  }, [selectedJob, ownerRepo, pat]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-canvas border border-chrome-indigo w-full max-w-5xl h-[80vh] flex flex-col shadow-[8px_8px_0px_rgba(33,36,46,1)]">
        <div className="flex justify-between items-center bg-platinum border-b border-chrome-indigo p-3 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-ink" />
            <span className="font-black text-ink text-sm">LOGS: {runName}</span>
          </div>
          <button onClick={onClose} className="text-ink hover:text-systems-red transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-white border-r border-chrome-indigo shrink-0 overflow-y-auto">
            {loading ? <div className="p-4 text-xs font-bold text-ink-soft animate-pulse">LOADING JOBS...</div> : jobs.map(job => (
              <button 
                key={job.id} 
                onClick={() => setSelectedJob(job.id)}
                className={`w-full text-left p-3 text-xs border-b border-chrome-indigo/20 flex flex-col gap-1 transition-colors ${selectedJob === job.id ? 'bg-platinum font-bold border-l-2 border-l-chrome-indigo' : 'hover:bg-surface'}`}
              >
                <span>{job.name}</span>
                <span className="text-[10px] text-ink-soft uppercase">{job.status} {job.conclusion ? `· ${job.conclusion}` : ''}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 bg-[#1E1E1E] text-[#D4D4D4] font-mono text-[10px] sm:text-xs p-4 overflow-y-auto whitespace-pre">
            {logs}
          </div>
        </div>
      </div>
    </div>
  );
}
