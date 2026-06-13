use std::path::PathBuf;
use crate::git::{repository, network::RemoteInfo};

#[tauri::command]
pub fn list_remotes(path: String) -> Result<Vec<RemoteInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => crate::git::network::list_remotes(&repo).map_err(|e| e.message().to_string()),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn add_remote(path: String, name: String, url: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => crate::git::network::add_remote(&repo, &name, &url).map_err(|e| e.message().to_string()),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn remove_remote(path: String, name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => crate::git::network::remove_remote(&repo, &name).map_err(|e| e.message().to_string()),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn fetch_remote(path: String, remote_name: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::fetch_remote(&repo, &remote_name, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to fetch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn pull_remote(path: String, remote_name: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::pull_remote(&repo, &remote_name, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to pull: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn push_remote(path: String, remote_name: String, token: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::network::push_remote(&repo, &remote_name, &token) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to push: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
