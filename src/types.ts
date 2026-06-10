export interface FileStatus {
  file_path: string;
  status: string;
  is_staged: boolean;
  is_unstaged: boolean;
}

export interface CommitInfo {
  id: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
}

export interface BranchInfo {
  name: string;
  is_head: boolean;
  is_remote: boolean;
}
