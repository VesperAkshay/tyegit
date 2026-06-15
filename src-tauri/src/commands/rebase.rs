use std::path::PathBuf;
use crate::git::rebase::{self, RebaseOperation, ValidationResult};
use crate::git::repository;

#[tauri::command]
pub fn validate_visual_rebase(
    path: String,
    base_commit_id: String,
    operations: Vec<RebaseOperation>,
) -> Result<ValidationResult, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match rebase::validate_visual_rebase(&repo, &base_commit_id, operations) {
            Ok(result) => Ok(result),
            Err(e) => Err(format!("Validation failed: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn apply_visual_rebase(
    path: String,
    new_head_oid: String,
) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match rebase::apply_visual_rebase(&repo, &new_head_oid) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Apply failed: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
