use git2::{Repository, Sort};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CommitInfo {
    pub id: String,
    pub message: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: i64,
    pub parents: Vec<String>,
}

pub fn get_history(repo: &Repository, limit: usize, search_query: Option<String>) -> Result<Vec<CommitInfo>, git2::Error> {
    let mut revwalk = repo.revwalk()?;
    
    // Sort by time and topology (important for graph rendering)
    revwalk.set_sorting(Sort::TOPOLOGICAL | Sort::TIME)?;
    
    // Push all references to get the full graph
    revwalk.push_glob("refs/heads/*")?;
    revwalk.push_glob("refs/remotes/*")?;
    revwalk.push_glob("refs/tags/*")?;
    
    // Also push HEAD in case we are in detached HEAD state and it's not covered by the globs
    if let Ok(head) = repo.head() {
        if let Some(target) = head.target() {
            let _ = revwalk.push(target);
        }
    }

    let mut commits = Vec::new();
    let query_lower = search_query.unwrap_or_default().to_lowercase();
    let has_query = !query_lower.is_empty();
    let mut scanned = 0;
    let max_scan = 5000; // Limit how many commits we check when searching to avoid hanging

    for oid_result in revwalk {
        if commits.len() >= limit {
            break;
        }
        
        if has_query {
            scanned += 1;
            if scanned > max_scan {
                break;
            }
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
                    let parents = commit.parent_ids().map(|id| id.to_string()).collect();
                    
                    commits.push(CommitInfo {
                        id: oid.to_string(),
                        message,
                        author_name,
                        author_email,
                        timestamp: commit.time().seconds(),
                        parents,
                    });
                }
            }
        }
    }

    Ok(commits)
}
