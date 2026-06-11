use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u64,
    pub interval: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AccessTokenResponse {
    pub access_token: Option<String>,
    pub error: Option<String>,
    pub error_description: Option<String>,
}

pub async fn start_device_flow(client_id: &str) -> Result<DeviceCodeResponse, String> {
    let client = reqwest::Client::new();
    let resp = client.post("https://github.com/login/device/code")
        .header("Accept", "application/json")
        .json(&serde_json::json!({
            "client_id": client_id,
            "scope": "repo"
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to request device code: {}", e))?;

    let data: DeviceCodeResponse = resp.json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(data)
}

pub async fn poll_device_flow(client_id: &str, device_code: &str) -> Result<AccessTokenResponse, String> {
    let client = reqwest::Client::new();
    let resp = client.post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .json(&serde_json::json!({
            "client_id": client_id,
            "device_code": device_code,
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to poll token: {}", e))?;

    let data: AccessTokenResponse = resp.json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(data)
}
