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

#[tauri::command]
pub fn get_global_git_config() -> Result<(String, String), String> {
    match git2::Config::open_default() {
        Ok(config) => {
            let name = config.get_string("user.name").unwrap_or_default();
            let email = config.get_string("user.email").unwrap_or_default();
            Ok((name, email))
        },
        Err(_) => Ok(("".to_string(), "".to_string())),
    }
}

#[tauri::command]
pub fn set_global_git_config(name: String, email: String) -> Result<(), String> {
    match git2::Config::open_default() {
        Ok(mut config) => {
            config.set_str("user.name", &name).map_err(|e| format!("Failed to set name: {}", e.message()))?;
            config.set_str("user.email", &email).map_err(|e| format!("Failed to set email: {}", e.message()))?;
            Ok(())
        },
        Err(e) => {
            // Try to create/open global config explicitly if default fails
            if let Ok(global_path) = git2::Config::find_global() {
                if let Ok(mut config) = git2::Config::new() {
                    if config.add_file(&global_path, git2::ConfigLevel::Global, true).is_ok() {
                        config.set_str("user.name", &name).map_err(|e| e.message().to_string())?;
                        config.set_str("user.email", &email).map_err(|e| e.message().to_string())?;
                        return Ok(());
                    }
                }
            }
            Err(format!("Failed to open git config: {}", e.message()))
        }
    }
}
