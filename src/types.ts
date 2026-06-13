export type RepositoryState = 
  | "Clean"
  | "Merge"
  | "Rebase"
  | "RebaseInteractive"
  | "RebaseMerge"
  | "ApplyMailbox"
  | "ApplyMailboxOrRebase"
  | "Bisect"
  | "CherryPick"
  | "CherryPickSequence"
  | "Revert"
  | "RevertSequence";

export type ConflictType = 
  | "BothModified"
  | "BothAdded"
  | "DeletedByUs"
  | "DeletedByThem"
  | "AddedByUs"
  | "AddedByThem"
  | "None";

export interface FileStatus {
  file_path: string;
  status: string;
  is_staged: boolean;
  is_unstaged: boolean;
  is_conflicted: boolean;
  conflict_type: ConflictType;
}

export interface MergeStatus {
  conflicted: number;
  resolved: number;
  unresolved: number;
}

export interface FileDiffSummary {
  file_path: string;
  status: string;
}

export interface CommitDetails {
  info: CommitInfo;
  files_changed: FileDiffSummary[];
}

export type RefType = "LocalBranch" | "RemoteBranch" | "Tag" | "Head";

export interface RefInfo {
  name: string;
  ref_type: RefType;
}

export interface GraphPath {
  path: string;
  color: string;
}

export interface GraphRow {
  commit_id: string;
  dot_color: string;
  dot_column: number;
  paths: GraphPath[];
  has_refs: boolean;
}

export interface LaneInfo {
  commit_id: string;
  color: string;
}

export interface CommitInfo {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parents: string[];
  refs: RefInfo[];
  graph_row: GraphRow | null;
}

export interface HistoryResult {
  commits: CommitInfo[];
  active_lanes: LaneInfo[];
  next_color_idx: number;
  max_columns: number;
}

export interface BranchInfo {
  name: string;
  is_head: boolean;
  is_remote: boolean;
}

export interface TagInfo {
  name: string;
  commit_id: string;
  message: string;
}

export interface StashInfo {
  index: number;
  message: string;
  commit_id: string;
}

export interface RemoteInfo {
  name: string;
  url: string;
}
