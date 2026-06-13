use tauri::Manager;

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
    let path = app.path().app_data_dir().unwrap().join("credentials.json");
    if path.exists() {
        Ok(Some(std::fs::read_to_string(path).unwrap_or_default()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn save_github_token(app: tauri::AppHandle, token: String) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().unwrap();
    std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let path = app_data_dir.join("credentials.json");
    std::fs::write(path, token).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_github_token(app: tauri::AppHandle) -> Result<(), String> {
    let path = app.path().app_data_dir().unwrap().join("credentials.json");
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}
