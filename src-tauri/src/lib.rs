pub mod commands;
pub mod db;
pub mod git;

use tauri::Manager;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_data_dir).unwrap();
            let conn = db::sqlite::init_db(app_data_dir).unwrap();
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::get_github_token,
            commands::auth::save_github_token,
            commands::auth::delete_github_token,
            commands::auth::start_device_flow,
            commands::auth::poll_device_flow,
            commands::github::get_user_profile,
            commands::github::list_user_repositories,
            commands::github::get_commit_status,
            commands::github::get_commit_avatars,
            commands::github::list_pull_requests,
            commands::github::list_issues,
            commands::github::publish_repository,
            commands::repository::get_recent_repositories,
            commands::repository::get_remote_url,
            commands::repository::open_repository,
            commands::repository::clone_repository,
            commands::repository::init_repository,
            commands::repository::get_repo_state,
            commands::repository::get_file_content,
            commands::staging::git_status,
            commands::staging::stage_file,
            commands::staging::unstage_file,
            commands::staging::stage_all,
            commands::staging::unstage_all,
            commands::staging::discard_file,
            commands::staging::add_to_gitignore,
            commands::staging::stage_file_from_text,
            commands::commit::commit,
            commands::commit::commit_amend,
            commands::commit::get_file_diff,
            commands::commit::get_commit_details,
            commands::commit::get_commit_file_diff,
            commands::commit::get_history,
            commands::branch::list_branches,
            commands::branch::create_branch,
            commands::branch::switch_branch,
            commands::sync::list_remotes,
            commands::sync::add_remote,
            commands::sync::remove_remote,
            commands::sync::fetch_remote,
            commands::sync::pull_remote,
            commands::sync::push_remote,
            commands::tag::list_tags,
            commands::tag::create_tag,
            commands::tag::delete_tag,
            commands::tag::checkout_tag,
            commands::stash::list_stashes,
            commands::stash::stash_save,
            commands::stash::stash_apply,
            commands::stash::stash_pop,
            commands::stash::stash_drop,
            commands::merge::merge_branch,
            commands::merge::abort_merge,
            commands::merge::get_merge_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
