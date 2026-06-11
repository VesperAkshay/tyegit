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

export interface CommitInfo {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parents: string[];
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
