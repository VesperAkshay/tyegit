use git2::{Repository, Oid};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CommitInfo {
    pub id: String,
    pub message: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: i64,
}

pub fn get_history(repo: &Repository, limit: usize, search_query: Option<String>) -> Result<Vec<CommitInfo>, git2::Error> {
    let mut revwalk = repo.revwalk()?;
    
    // Sort by time
    revwalk.set_sorting(git2::Sort::TIME)?;
    
    // Push the current HEAD to start walking from there
    if let Ok(head) = repo.head() {
        if let Some(target) = head.target() {
            revwalk.push(target)?;
        }
    } else {
        // No commits yet
        return Ok(Vec::new());
    }

    let mut commits = Vec::new();
    let query_lower = search_query.unwrap_or_default().to_lowercase();

    for oid_result in revwalk {
        if commits.len() >= limit {
            break;
        }
        
        if let Ok(oid) = oid_result {
            if let Ok(commit) = repo.find_commit(oid) {
                let author = commit.author();
                let message = commit.message().unwrap_or("").to_string();
                let author_name = author.name().unwrap_or("Unknown").to_string();
                let author_email = author.email().unwrap_or("Unknown").to_string();
                
                let matches_search = query_lower.is_empty() || 
                    message.to_lowercase().contains(&query_lower) || 
                    author_name.to_lowercase().contains(&query_lower);

                if matches_search {
                    commits.push(CommitInfo {
                        id: oid.to_string(),
                        message,
                        author_name,
                        author_email,
                        timestamp: commit.time().seconds(),
                    });
                }
            }
        }
    }

    Ok(commits)
}
