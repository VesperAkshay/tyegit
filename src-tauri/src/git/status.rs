use git2::{Repository, StatusOptions};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub enum ConflictType {
    BothModified,
    BothAdded,
    DeletedByUs,
    DeletedByThem,
    AddedByUs,
    AddedByThem,
    None,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileStatus {
    pub file_path: String,
    pub status: String,
    pub is_staged: bool,
    pub is_unstaged: bool,
    pub is_conflicted: bool,
    pub conflict_type: ConflictType,
}

pub fn get_status(repo: &Repository) -> Result<Vec<FileStatus>, git2::Error> {
    let mut opts = StatusOptions::new();
    opts.include_untracked(true).recurse_untracked_dirs(true);

    let statuses = repo.statuses(Some(&mut opts))?;
    let mut result = Vec::new();

    for entry in statuses.iter() {
        if let Some(path) = entry.path() {
            let status = entry.status();
            
            let mut status_str = String::new();
            let mut is_staged = false;
            let mut is_unstaged = false;
            let mut is_conflicted = false;
            let mut conflict_type = ConflictType::None;

            if status.is_index_new() { status_str.push_str("Added (Staged) "); is_staged = true; }
            if status.is_index_modified() { status_str.push_str("Modified (Staged) "); is_staged = true; }
            if status.is_index_deleted() { status_str.push_str("Deleted (Staged) "); is_staged = true; }
            if status.is_index_renamed() { status_str.push_str("Renamed (Staged) "); is_staged = true; }
            if status.is_index_typechange() { status_str.push_str("Typechange (Staged) "); is_staged = true; }

            if status.is_wt_new() { status_str.push_str("Untracked "); is_unstaged = true; }
            if status.is_wt_modified() { status_str.push_str("Modified "); is_unstaged = true; }
            if status.is_wt_deleted() { status_str.push_str("Deleted "); is_unstaged = true; }
            if status.is_wt_typechange() { status_str.push_str("Typechange "); is_unstaged = true; }
            if status.is_wt_renamed() { status_str.push_str("Renamed "); is_unstaged = true; }

            if status.is_conflicted() { 
                status_str.push_str("Conflicted "); 
                is_conflicted = true; 
                is_unstaged = true; 
                conflict_type = ConflictType::BothModified; 
            }

            if !status_str.is_empty() && !status.is_ignored() {
                result.push(FileStatus {
                    file_path: path.to_string(),
                    status: status_str.trim().to_string(),
                    is_staged,
                    is_unstaged,
                    is_conflicted,
                    conflict_type,
                });
            }
        }
    }

    Ok(result)
}
