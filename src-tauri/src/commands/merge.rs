use std::path::PathBuf;
use crate::git::repository;

#[tauri::command]
pub fn merge_branch(path: String, branch_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::merge_branch(&repo, &branch_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to merge branch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn abort_merge(path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::abort_merge(&repo) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to abort merge: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_merge_status(path: String) -> Result<crate::git::merge::MergeStatus, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::get_merge_status(&repo) {
            Ok(status) => Ok(status),
            Err(e) => Err(format!("Failed to get merge status: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
