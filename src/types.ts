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

export interface CommitInfo {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parents: string[];
  refs: RefInfo[];
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
