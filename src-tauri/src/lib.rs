pub mod commands;
pub mod db;
pub mod git;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_data_dir).unwrap();
            let _conn = db::sqlite::init_db(app_data_dir).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_repository,
            commands::git_status,
            commands::clone_repository,
            commands::init_repository,
            commands::stage_file,
            commands::unstage_file,
            commands::stage_all,
            commands::unstage_all,
            commands::commit,
            commands::get_file_diff,
            commands::get_history,
            commands::list_branches,
            commands::create_branch,
            commands::switch_branch,
            commands::fetch_remote,
            commands::pull_remote,
            commands::push_remote
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
