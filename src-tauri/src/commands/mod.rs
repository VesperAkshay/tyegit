use crate::git::{repository, status::FileStatus, status::get_status};
use std::path::PathBuf;

#[tauri::command]
pub fn open_repository(path: String) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(_) => Ok(format!("Successfully opened repository at {}", path)),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn git_status(path: String) -> Result<Vec<FileStatus>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match get_status(&repo) {
            Ok(statuses) => Ok(statuses),
            Err(e) => Err(format!("Failed to get status: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn clone_repository(url: String, path: String) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::clone_repository(&url, &repo_path) {
        Ok(_) => Ok(format!("Successfully cloned repository to {}", path)),
        Err(e) => Err(format!("Failed to clone repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn init_repository(path: String) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::init_repository(&repo_path) {
        Ok(_) => Ok(format!("Successfully initialized repository at {}", path)),
        Err(e) => Err(format!("Failed to init repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stage_file(path: String, file_path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::stage_file(&repo, &file_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to stage file: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn unstage_file(path: String, file_path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::unstage_file(&repo, &file_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to unstage file: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stage_all(path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::stage_all(&repo) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to stage all files: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn unstage_all(path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::unstage_all(&repo) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to unstage all files: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn commit(path: String, message: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::commit::commit(&repo, &message) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to commit: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_file_diff(path: String, file_path: String, is_staged: bool) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::diff::get_file_diff(&repo, &file_path, is_staged) {
            Ok(diff) => Ok(diff),
            Err(e) => Err(format!("Failed to get diff: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_history(path: String, limit: usize) -> Result<Vec<crate::git::history::CommitInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::history::get_history(&repo, limit) {
            Ok(history) => Ok(history),
            Err(e) => Err(format!("Failed to get history: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

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

#[tauri::command]
pub fn fetch_remote(path: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::fetch_remote(&repo, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to fetch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn pull_remote(path: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::pull_remote(&repo, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to pull: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn push_remote(path: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::push_remote(&repo, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to push: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
