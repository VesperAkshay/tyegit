use reqwest::header::{ACCEPT, AUTHORIZATION, USER_AGENT};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct UserProfile {
    pub login: String,
    pub avatar_url: String,
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubRepository {
    pub id: i64,
    pub name: String,
    pub full_name: String,
    pub private: bool,
    pub description: Option<String>,
    pub clone_url: String,
    pub updated_at: String,
}

#[tauri::command]
pub async fn get_user_profile(token: String) -> Result<UserProfile, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("https://api.github.com/user")
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let profile = res.json::<UserProfile>().await.map_err(|e| e.to_string())?;
        Ok(profile)
    } else {
        Err(format!("Failed to fetch profile: {}", res.status()))
    }
}

#[tauri::command]
pub async fn list_user_repositories(token: String) -> Result<Vec<GithubRepository>, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("https://api.github.com/user/repos?sort=updated&per_page=100")
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let repos = res.json::<Vec<GithubRepository>>().await.map_err(|e| e.to_string())?;
        Ok(repos)
    } else {
        Err(format!("Failed to list repositories: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CommitStatusResponse {
    pub state: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CheckRun {
    pub status: String,
    pub conclusion: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CheckRunsResponse {
    pub total_count: usize,
    pub check_runs: Vec<CheckRun>,
}

#[tauri::command]
pub async fn get_commit_status(owner: String, repo: String, commit_ref: String, token: String) -> Result<CommitStatusResponse, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/commits/{}/check-runs", owner, repo, commit_ref);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let check_data = res.json::<CheckRunsResponse>().await.map_err(|e| e.to_string())?;
        
        if check_data.total_count == 0 {
            return Ok(CommitStatusResponse { state: "none".to_string() });
        }

        let mut final_state = "success".to_string();
        for run in check_data.check_runs {
            if run.status != "completed" {
                return Ok(CommitStatusResponse { state: "pending".to_string() });
            }
            if let Some(conc) = run.conclusion {
                if conc == "failure" || conc == "timed_out" || conc == "action_required" || conc == "cancelled" {
                    final_state = "failure".to_string();
                }
            } else {
                return Ok(CommitStatusResponse { state: "pending".to_string() });
            }
        }
        
        Ok(CommitStatusResponse { state: final_state })
    } else {
        Err(format!("Failed to fetch check runs: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubAuthor {
    pub avatar_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubCommitNode {
    pub sha: String,
    pub author: Option<GithubAuthor>,
}

#[tauri::command]
pub async fn get_commit_avatars(owner: String, repo: String, token: String) -> Result<Vec<GithubCommitNode>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/commits?per_page=100", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let commits = res.json::<Vec<GithubCommitNode>>().await.map_err(|e| e.to_string())?;
        Ok(commits)
    } else {
        Err(format!("Failed to fetch commit avatars: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubPullRequest {
    pub number: u64,
    pub title: String,
    pub state: String,
    pub html_url: String,
    pub user: UserProfile,
}

#[tauri::command]
pub async fn list_pull_requests(owner: String, repo: String, token: String) -> Result<Vec<GithubPullRequest>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/pulls?state=open", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let prs = res.json::<Vec<GithubPullRequest>>().await.map_err(|e| e.to_string())?;
        Ok(prs)
    } else {
        Err(format!("Failed to fetch pull requests: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubIssue {
    pub number: u64,
    pub title: String,
    pub state: String,
    pub html_url: String,
    pub user: UserProfile,
    pub pull_request: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn list_issues(owner: String, repo: String, token: String) -> Result<Vec<GithubIssue>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/issues?state=open", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let issues = res.json::<Vec<GithubIssue>>().await.map_err(|e| e.to_string())?;
        // Filter out pull requests as they are returned in the issues endpoint
        let issues_only = issues.into_iter().filter(|i| i.pull_request.is_none()).collect();
        Ok(issues_only)
    } else {
        Err(format!("Failed to fetch issues: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PublishRepositoryRequest {
    pub name: String,
    pub description: String,
    pub private: bool,
}

#[tauri::command]
pub async fn publish_repository(name: String, description: String, private: bool, token: String) -> Result<GithubRepository, String> {
    let client = reqwest::Client::new();
    let payload = PublishRepositoryRequest { name, description, private };
    let res = client
        .post("https://api.github.com/user/repos")
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let repo = res.json::<GithubRepository>().await.map_err(|e| e.to_string())?;
        Ok(repo)
    } else {
        Err(format!("Failed to publish repository: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubActor {
    pub login: String,
    pub avatar_url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubCommitShort {
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubWorkflowRun {
    pub id: u64,
    pub name: String,
    pub head_branch: String,
    pub run_number: u64,
    pub status: String,
    pub conclusion: Option<String>,
    pub html_url: String,
    pub created_at: String,
    pub updated_at: String,
    pub actor: Option<GithubActor>,
    pub head_commit: Option<GithubCommitShort>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubActionRunsResponse {
    pub total_count: u64,
    pub workflow_runs: Vec<GithubWorkflowRun>,
}

#[tauri::command]
pub async fn list_action_runs(owner: String, repo: String, token: String) -> Result<Vec<GithubWorkflowRun>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/runs?per_page=30", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let data = res.json::<GithubActionRunsResponse>().await.map_err(|e| e.to_string())?;
        Ok(data.workflow_runs)
    } else {
        Err(format!("Failed to fetch action runs: {}", res.status()))
    }
}

#[tauri::command]
pub async fn cancel_action_run(owner: String, repo: String, run_id: u64, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/runs/{}/cancel", owner, repo, run_id);
    let res = client
        .post(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 202 {
        Ok(())
    } else {
        Err(format!("Failed to cancel run: {}", res.status()))
    }
}

#[tauri::command]
pub async fn rerun_action_run(owner: String, repo: String, run_id: u64, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/runs/{}/rerun", owner, repo, run_id);
    let res = client
        .post(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 201 {
        Ok(())
    } else {
        Err(format!("Failed to rerun run: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubSecret {
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubSecretsResponse {
    pub total_count: u64,
    pub secrets: Vec<GithubSecret>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubVariable {
    pub name: String,
    pub value: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubVariablesResponse {
    pub total_count: u64,
    pub variables: Vec<GithubVariable>,
}

#[tauri::command]
pub async fn list_action_secrets(owner: String, repo: String, token: String) -> Result<Vec<GithubSecret>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/secrets", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let data = res.json::<GithubSecretsResponse>().await.map_err(|e| e.to_string())?;
        Ok(data.secrets)
    } else {
        Err(format!("Failed to fetch secrets: {}", res.status()))
    }
}

#[tauri::command]
pub async fn list_action_variables(owner: String, repo: String, token: String) -> Result<Vec<GithubVariable>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/variables", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let data = res.json::<GithubVariablesResponse>().await.map_err(|e| e.to_string())?;
        Ok(data.variables)
    } else {
        Err(format!("Failed to fetch variables: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubEnvironment {
    pub name: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubEnvironmentsResponse {
    pub total_count: u64,
    pub environments: Vec<GithubEnvironment>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubJob {
    pub id: u64,
    pub name: String,
    pub status: String,
    pub conclusion: Option<String>,
    pub started_at: String,
    pub completed_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubJobsResponse {
    pub total_count: u64,
    pub jobs: Vec<GithubJob>,
}

#[tauri::command]
pub async fn list_environments(owner: String, repo: String, token: String) -> Result<Vec<GithubEnvironment>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/environments", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let data = res.json::<GithubEnvironmentsResponse>().await.map_err(|e| e.to_string())?;
        Ok(data.environments)
    } else {
        Err(format!("Failed to fetch environments: {}", res.status()))
    }
}

#[tauri::command]
pub async fn list_action_jobs(owner: String, repo: String, run_id: u64, token: String) -> Result<Vec<GithubJob>, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/runs/{}/jobs", owner, repo, run_id);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let data = res.json::<GithubJobsResponse>().await.map_err(|e| e.to_string())?;
        Ok(data.jobs)
    } else {
        Err(format!("Failed to fetch jobs: {}", res.status()))
    }
}

#[tauri::command]
pub async fn get_job_logs(owner: String, repo: String, job_id: u64, token: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/jobs/{}/logs", owner, repo, job_id);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let logs = res.text().await.map_err(|e| e.to_string())?;
        Ok(logs)
    } else {
        Err(format!("Failed to fetch job logs: {}", res.status()))
    }
}

#[tauri::command]
pub async fn create_environment(owner: String, repo: String, env_name: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/environments/{}", owner, repo, env_name);
    let res = client
        .put(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 200 {
        Ok(())
    } else {
        Err(format!("Failed to create environment: {}", res.status()))
    }
}

#[tauri::command]
pub async fn delete_environment(owner: String, repo: String, env_name: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/environments/{}", owner, repo, env_name);
    let res = client
        .delete(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 204 {
        Ok(())
    } else {
        Err(format!("Failed to delete environment: {}", res.status()))
    }
}

#[tauri::command]
pub async fn create_variable(owner: String, repo: String, name: String, value: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/variables", owner, repo);
    let body = serde_json::json!({ "name": name, "value": value });
    let res = client
        .post(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 201 {
        Ok(())
    } else {
        Err(format!("Failed to create variable: {}", res.status()))
    }
}

#[tauri::command]
pub async fn update_variable(owner: String, repo: String, name: String, value: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/variables/{}", owner, repo, name);
    let body = serde_json::json!({ "name": name, "value": value });
    let res = client
        .patch(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 204 {
        Ok(())
    } else {
        Err(format!("Failed to update variable: {}", res.status()))
    }
}

#[tauri::command]
pub async fn delete_variable(owner: String, repo: String, name: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/variables/{}", owner, repo, name);
    let res = client
        .delete(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 204 {
        Ok(())
    } else {
        Err(format!("Failed to delete variable: {}", res.status()))
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GithubPublicKey {
    pub key_id: String,
    pub key: String,
}

#[tauri::command]
pub async fn get_repo_public_key(owner: String, repo: String, token: String) -> Result<GithubPublicKey, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/secrets/public-key", owner, repo);
    let res = client
        .get(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let pk = res.json::<GithubPublicKey>().await.map_err(|e| e.to_string())?;
        Ok(pk)
    } else {
        Err(format!("Failed to fetch public key: {}", res.status()))
    }
}

#[tauri::command]
pub async fn put_action_secret(owner: String, repo: String, name: String, encrypted_value: String, key_id: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/secrets/{}", owner, repo, name);
    let body = serde_json::json!({ "encrypted_value": encrypted_value, "key_id": key_id });
    let res = client
        .put(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 201 || res.status().as_u16() == 204 {
        Ok(())
    } else {
        Err(format!("Failed to put secret: {}", res.status()))
    }
}

#[tauri::command]
pub async fn delete_action_secret(owner: String, repo: String, name: String, token: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{}/{}/actions/secrets/{}", owner, repo, name);
    let res = client
        .delete(&url)
        .header(USER_AGENT, "tyegit")
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(ACCEPT, "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() || res.status().as_u16() == 204 {
        Ok(())
    } else {
        Err(format!("Failed to delete secret: {}", res.status()))
    }
}




