use std::path::PathBuf;
use crate::git::repository;

#[tauri::command]
pub fn list_stashes(path: String) -> Result<Vec<crate::git::stash::StashInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(mut repo) => match crate::git::stash::list_stashes(&mut repo) {
            Ok(stashes) => Ok(stashes),
            Err(e) => Err(format!("Failed to list stashes: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stash_save(path: String, message: Option<String>) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(mut repo) => {
            let msg = message.as_deref();
            match crate::git::stash::stash_save(&mut repo, msg) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to save stash: {}", e.message())),
            }
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stash_apply(path: String, index: usize) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(mut repo) => match crate::git::stash::stash_apply(&mut repo, index) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to apply stash: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stash_pop(path: String, index: usize) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(mut repo) => match crate::git::stash::stash_pop(&mut repo, index) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to pop stash: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stash_drop(path: String, index: usize) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(mut repo) => match crate::git::stash::stash_drop(&mut repo, index) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to drop stash: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
