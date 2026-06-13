use std::path::PathBuf;
use crate::git::{repository, status::FileStatus, status::get_status};

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
pub fn discard_file(path: String, file_path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::discard_file(&repo, &file_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to discard file: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn add_to_gitignore(path: String, file_path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::add_to_gitignore(&repo, &file_path) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to add to .gitignore: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn stage_file_from_text(path: String, file_path: String, text: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::staging::stage_file_from_text(&repo, &file_path, &text) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to stage file from text: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
