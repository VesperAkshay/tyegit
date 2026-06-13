use git2::{Repository, Signature};
use std::fs;

pub fn commit(repo: &Repository, message: &str) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    let oid = index.write_tree()?;
    let signature = repo.signature().unwrap_or_else(|_| {
        Signature::now("Git Desktop", "git@desktop.local").unwrap()
    });

    let tree = repo.find_tree(oid)?;
    
    // Check if it's the initial commit
    let parent_commit = match repo.head() {
        Ok(head) => Some(head.peel_to_commit()?),
        Err(_) => None,
    };

    if let Some(parent) = parent_commit {
        // Check if we are in a MERGE state
        if repo.state() == git2::RepositoryState::Merge {
            let repo_path = repo.path();
            let merge_head_path = repo_path.join("MERGE_HEAD");
            if let Ok(merge_head_str) = fs::read_to_string(merge_head_path) {
                if let Ok(merge_oid) = git2::Oid::from_str(merge_head_str.trim()) {
                    if let Ok(merge_commit) = repo.find_commit(merge_oid) {
                        repo.commit(
                            Some("HEAD"),
                            &signature,
                            &signature,
                            message,
                            &tree,
                            &[&parent, &merge_commit]
                        )?;
                        repo.cleanup_state()?;
                        return Ok(());
                    }
                }
            }
        }

        // Standard single-parent commit
        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[&parent]
        )?;
    } else {
        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[]
        )?;
    }

    Ok(())
}

pub fn commit_amend(repo: &Repository, message: &str) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    let oid = index.write_tree()?;
    let signature = repo.signature().unwrap_or_else(|_| {
        Signature::now("Git Desktop", "git@desktop.local").unwrap()
    });

    let tree = repo.find_tree(oid)?;
    
    let head = repo.head()?;
    let head_commit = head.peel_to_commit()?;

    head_commit.amend(
        Some("HEAD"),
        Some(&signature),
        Some(&signature),
        None,
        Some(message),
        Some(&tree)
    )?;

    Ok(())
}
