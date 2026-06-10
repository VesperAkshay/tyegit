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

pub fn get_history(repo: &Repository, limit: usize) -> Result<Vec<CommitInfo>, git2::Error> {
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

    for oid_result in revwalk.take(limit) {
        if let Ok(oid) = oid_result {
            if let Ok(commit) = repo.find_commit(oid) {
                let author = commit.author();
                commits.push(CommitInfo {
                    id: oid.to_string(),
                    message: commit.message().unwrap_or("").to_string(),
                    author_name: author.name().unwrap_or("Unknown").to_string(),
                    author_email: author.email().unwrap_or("Unknown").to_string(),
                    timestamp: commit.time().seconds(),
                });
            }
        }
    }

    Ok(commits)
}
