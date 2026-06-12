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
