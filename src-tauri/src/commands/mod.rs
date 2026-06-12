pub mod github;

use crate::git::{repository, status::FileStatus, status::get_status};
use std::path::PathBuf;
use tauri::State;

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
pub fn get_history(path: String, limit: usize, skip: usize, search_query: Option<String>) -> Result<Vec<crate::git::history::CommitInfo>, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::history::get_history(&repo, limit, skip, search_query) {
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

#[tauri::command]
pub fn get_repo_state(path: String) -> Result<crate::git::state::RepositoryState, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => Ok(crate::git::state::get_repo_state(&repo)),
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn merge_branch(path: String, branch_name: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::merge_branch(&repo, &branch_name) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to merge branch: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn abort_merge(path: String) -> Result<(), String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::abort_merge(&repo) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to abort merge: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub fn get_merge_status(path: String) -> Result<crate::git::merge::MergeStatus, String> {
    let repo_path = PathBuf::from(&path);
    match repository::open_repository(&repo_path) {
        Ok(repo) => match crate::git::merge::get_merge_status(&repo) {
            Ok(status) => Ok(status),
            Err(e) => Err(format!("Failed to get merge status: {}", e.message())),
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}

#[tauri::command]
pub async fn start_device_flow(client_id: String) -> Result<crate::git::auth::DeviceCodeResponse, String> {
    crate::git::auth::start_device_flow(&client_id).await
}

#[tauri::command]
pub async fn poll_device_flow(client_id: String, device_code: String) -> Result<crate::git::auth::AccessTokenResponse, String> {
    crate::git::auth::poll_device_flow(&client_id, &device_code).await
}

#[tauri::command]
pub fn get_github_token(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri::Manager;
    let path = app.path().app_data_dir().unwrap().join("credentials.json");
    if path.exists() {
        Ok(Some(std::fs::read_to_string(path).unwrap_or_default()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn save_github_token(app: tauri::AppHandle, token: String) -> Result<(), String> {
    use tauri::Manager;
    let app_data_dir = app.path().app_data_dir().unwrap();
    std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let path = app_data_dir.join("credentials.json");
    std::fs::write(path, token).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_github_token(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;
    let path = app.path().app_data_dir().unwrap().join("credentials.json");
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn get_remote_url(path: String) -> Result<Option<String>, String> {
    let repo_path = PathBuf::from(&path);
    match crate::git::repository::open_repository(&repo_path) {
        Ok(repo) => {
            if let Ok(remote) = repo.find_remote("origin") {
                if let Some(url) = remote.url() {
                    return Ok(Some(url.to_string()));
                }
            }
            Ok(None)
        },
        Err(e) => Err(format!("Failed to open repository: {}", e.message())),
    }
}
