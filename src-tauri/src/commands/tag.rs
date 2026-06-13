use std::path::PathBuf;
use crate::git::repository;

#[tauri::command]
pub fn list_tags(path: String) -> Result<Vec<crate::git::tags::TagInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::tags::list_tags(&repo) {
            Ok(tags) => Ok(tags),
            Err(e) => Err(format!("Failed to list tags: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn create_tag(path: String, tag_name: String, message: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::tags::create_tag(&repo, &tag_name, &message) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to create tag: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn delete_tag(path: String, tag_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::tags::delete_tag(&repo, &tag_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to delete tag: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn checkout_tag(path: String, tag_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::tags::checkout_tag(&repo, &tag_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to checkout tag: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
