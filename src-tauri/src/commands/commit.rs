use std::path::PathBuf;
use crate::git::repository;

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
pub fn commit_amend(path: String, message: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::commit::commit_amend(&repo, &message) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to amend commit: {}", e.message())),
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
pub fn get_commit_details(path: String, commit_id: String) -> Result<crate::git::diff::CommitDetails, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::diff::get_commit_details(&repo, &commit_id) {
            Ok(details) => Ok(details),
            Err(e) => Err(format!("Failed to get commit details: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_commit_file_diff(path: String, commit_id: String, file_path: String) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::diff::get_commit_file_diff(&repo, &commit_id, &file_path) {
            Ok(diff) => Ok(diff),
            Err(e) => Err(format!("Failed to get commit file diff: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_history(
    path: String, 
    limit: usize, 
    skip: usize, 
    search_query: Option<String>,
    active_lanes: Option<Vec<crate::git::graph::LaneInfo>>,
    next_color_idx: Option<usize>,
    row_height: Option<f64>,
    column_width: Option<f64>
) -> Result<crate::git::history::HistoryResult, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::history::get_history(
            &repo, 
            limit, 
            skip, 
            search_query, 
            active_lanes, 
            next_color_idx,
            row_height.unwrap_or(48.0),
            column_width.unwrap_or(14.0)
        ) {
            Ok(history) => Ok(history),
            Err(e) => Err(format!("Failed to get history: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
