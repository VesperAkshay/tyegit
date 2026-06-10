use git2::{Repository, StatusOptions};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct FileStatus {
    pub file_path: String,
    pub status: String,
    pub is_staged: bool,
    pub is_unstaged: bool,
}

pub fn get_status(repo: &Repository) -> Result<Vec<FileStatus>, git2::Error> {
    let mut opts = StatusOptions::new();
    opts.include_untracked(true).recurse_untracked_dirs(true);

    let statuses = repo.statuses(Some(&mut opts))?;
    let mut result = Vec::new();

    for entry in statuses.iter() {
        if let Some(path) = entry.path() {
            let status_flags = entry.status();
            
            let is_staged = status_flags.is_index_new() 
                || status_flags.is_index_modified() 
                || status_flags.is_index_deleted() 
                || status_flags.is_index_renamed() 
                || status_flags.is_index_typechange();
                
            let is_unstaged = status_flags.is_wt_new() 
                || status_flags.is_wt_modified() 
                || status_flags.is_wt_deleted() 
                || status_flags.is_wt_renamed() 
                || status_flags.is_wt_typechange();

            let mut status_str = String::new();
            if status_flags.is_wt_new() || status_flags.is_index_new() {
                status_str.push_str("Added ");
            }
            if status_flags.is_wt_modified() || status_flags.is_index_modified() {
                status_str.push_str("Modified ");
            }
            if status_flags.is_wt_deleted() || status_flags.is_index_deleted() {
                status_str.push_str("Deleted ");
            }
            if status_flags.is_wt_renamed() || status_flags.is_index_renamed() {
                status_str.push_str("Renamed ");
            }
            if status_flags.is_ignored() {
                status_str.push_str("Ignored ");
            }
            if status_flags.is_conflicted() {
                status_str.push_str("Conflicted ");
            }
            
            let status = status_str.trim().to_string();
            if !status.is_empty() && !status_flags.is_ignored() {
                result.push(FileStatus {
                    file_path: path.to_string(),
                    status,
                    is_staged,
                    is_unstaged,
                });
            }
        }
    }

    Ok(result)
}
