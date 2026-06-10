use git2::{Repository, Signature};

pub fn commit(repo: &Repository, message: &str) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    let oid = index.write_tree()?;
    let signature = repo.signature().unwrap_or_else(|_| {
        // TODO: Implement a settings tab to configure the Git signature.
        // For now, if no global configuration exists, fallback to a dummy user.
        Signature::now("Git Desktop", "git@desktop.local").unwrap()
    });

    let tree = repo.find_tree(oid)?;
    
    // Check if it's the initial commit
    let parent_commit = match repo.head() {
        Ok(head) => Some(head.peel_to_commit()?),
        Err(_) => None,
    };

    if let Some(parent) = parent_commit {
        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[&parent],
        )?;
    } else {
        // Initial commit
        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[],
        )?;
    }

    Ok(())
}
