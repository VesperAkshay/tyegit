use git2::{Repository, Sort};
use serde::{Deserialize, Serialize};
use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;

#[derive(Serialize, Deserialize, Debug)]
pub struct CommitInfo {
    pub id: String,
    pub message: String,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: i64,
    pub parents: Vec<String>,
}

pub fn get_history(repo: &Repository, limit: usize, skip: usize, search_query: Option<String>) -> Result<Vec<CommitInfo>, git2::Error> {
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

    let query = search_query.unwrap_or_default();
    let has_query = !query.trim().is_empty();
    let matcher = SkimMatcherV2::default();

    if has_query {
        let max_scan = 10000;
        let mut scored_commits = Vec::new();
        let mut scanned = 0;

        for oid_result in revwalk {
            scanned += 1;
            if scanned > max_scan {
                break;
            }
            if let Ok(oid) = oid_result {
                if let Ok(commit) = repo.find_commit(oid) {
                    let message = commit.message().unwrap_or("").to_string();
                    let author_name = commit.author().name().unwrap_or("Unknown").to_string();
                    
                    let target = format!("{} {}", author_name, message);
                    if let Some(score) = matcher.fuzzy_match(&target, &query) {
                        scored_commits.push((score, commit));
                    }
                }
            }
        }

        // Sort by score descending
        scored_commits.sort_by(|a, b| b.0.cmp(&a.0));

        let mut commits = Vec::new();
        for (_, commit) in scored_commits.into_iter().skip(skip).take(limit) {
            let author = commit.author();
            commits.push(CommitInfo {
                id: commit.id().to_string(),
                message: commit.message().unwrap_or("").to_string(),
                author_name: author.name().unwrap_or("Unknown").to_string(),
                author_email: author.email().unwrap_or("Unknown").to_string(),
                timestamp: commit.time().seconds(),
                parents: commit.parent_ids().map(|id| id.to_string()).collect(),
            });
        }
        return Ok(commits);
    } else {
        let mut commits = Vec::new();
        for oid_result in revwalk.skip(skip) {
            if commits.len() >= limit {
                break;
            }
            if let Ok(oid) = oid_result {
                if let Ok(commit) = repo.find_commit(oid) {
                    let author = commit.author();
                    commits.push(CommitInfo {
                        id: commit.id().to_string(),
                        message: commit.message().unwrap_or("").to_string(),
                        author_name: author.name().unwrap_or("Unknown").to_string(),
                        author_email: author.email().unwrap_or("Unknown").to_string(),
                        timestamp: commit.time().seconds(),
                        parents: commit.parent_ids().map(|id| id.to_string()).collect(),
                    });
                }
            }
        }
        return Ok(commits);
    }
}
