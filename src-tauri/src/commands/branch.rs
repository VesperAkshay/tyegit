use std::path::PathBuf;
use crate::git::repository;

#[tauri::command]
pub fn list_branches(path: String) -> Result<Vec<crate::git::branch::BranchInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::branch::list_branches(&repo) {
            Ok(branches) => Ok(branches),
            Err(e) => Err(format!("Failed to list branches: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn create_branch(path: String, branch_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::branch::create_branch(&repo, &branch_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to create branch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn switch_branch(path: String, branch_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::branch::switch_branch(&repo, &branch_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to switch branch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
