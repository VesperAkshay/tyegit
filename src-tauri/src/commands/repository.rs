use std::path::PathBuf;
use tauri::State;
use crate::git::repository;

#[tauri::command]
pub fn get_recent_repositories(state: State<'_, crate::AppState>) -> Result<Vec<crate::db::sqlite::RecentRepo>, String> {
    let conn = state.db.lock().unwrap();
    match crate::db::sqlite::get_recent_repositories(&conn) {
        Ok(repos) => Ok(repos),
        Err(e) => Err(format!("Failed to fetch recent repositories: {}", e)),
    }
}

#[tauri::command]
pub fn open_repository(path: String, state: tauri::State<'_, crate::AppState>) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(_) => {
            if let Some(name) = repo_path.file_name() {
                let conn = state.db.lock().unwrap();
                let _ = crate::db::sqlite::add_recent_repository(&conn, &path, &name.to_string_lossy());
            }
            Ok(format!("Successfully opened repository at {}", path))
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn clone_repository(url: String, path: String, state: State<'_, crate::AppState>) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::clone_repository(&url, &repo_path) {
        Ok(_) => {
            if let Some(name) = repo_path.file_name() {
                let conn = state.db.lock().unwrap();
                let _ = crate::db::sqlite::add_recent_repository(&conn, &path, &name.to_string_lossy());
            }
            Ok(format!("Successfully cloned repository to {}", path))
        },
        Err(e) => Err(format!("Failed to clone repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn init_repository(path: String, state: State<'_, crate::AppState>) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match repository::init_repository(&repo_path) {
        Ok(_) => {
            if let Some(name) = repo_path.file_name() {
                let conn = state.db.lock().unwrap();
                let _ = crate::db::sqlite::add_recent_repository(&conn, &path, &name.to_string_lossy());
            }
            Ok(format!("Successfully initialized repository at {}", path))
        },
        Err(e) => Err(format!("Failed to init repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_repo_state(path: String) -> Result<crate::git::state::RepositoryState, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => Ok(crate::git::state::get_repo_state(&repo)),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_remote_url(path: String) -> Result<Option<String>, String> {
    let repo_path = PathBuf::from(&path);
    match crate::git::repository::open_repository(&repo_path) {
        Ok(repo) => {
            if let Ok(remote) = repo.find_remote("origin") {
                Ok(remote.url().map(|s| s.to_string()))
            } else {
                Ok(None)
            }
        },
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub fn get_file_content(path: String, file_path: String, treeish: String) -> Result<String, String> {
    let repo_path = PathBuf::from(&path);
    match crate::git::repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::repository::get_file_content(&repo, &file_path, &treeish) {
            Ok(content) => Ok(content),
            Err(e) => Err(format!("Failed to get file content: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
