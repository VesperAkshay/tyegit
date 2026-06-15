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

pub fn undo_last_commit(repo: &Repository) -> Result<(), git2::Error> {
    let head = repo.head()?;
    let commit = head.peel_to_commit()?;
    let parents = commit.parents().collect::<Vec<_>>();
    
    if parents.is_empty() {
        // This is the very first commit in the repository.
        // We can't soft reset to a parent, so we have to delete the branch reference
        // and keep the files in the index.
        let _index = repo.index()?;
        // Delete the branch reference (usually refs/heads/main or master)
        if head.is_branch() {
            let mut branch_ref = repo.find_reference(head.name().unwrap())?;
            branch_ref.delete()?;
        }
        return Ok(());
    }
    
    let parent = &parents[0];
    let obj = parent.as_object();
    repo.reset(obj, git2::ResetType::Soft, None)?;
    
    Ok(())
}

pub fn cherry_pick_commit(repo: &Repository, commit_id: &str) -> Result<(), git2::Error> {
    let oid = git2::Oid::from_str(commit_id).map_err(|e| git2::Error::from_str(&format!("Invalid commit ID: {}", e)))?;
    let commit = repo.find_commit(oid)?;
    
    let mut opts = git2::CherrypickOptions::new();
    repo.cherrypick(&commit, Some(&mut opts))?;
    
    let index = repo.index()?;
    if index.has_conflicts() {
        return Err(git2::Error::from_str("Cherry-pick resulted in conflicts. Please resolve them in the status panel and commit manually."));
    }
    
    // Automatically commit if there are no conflicts
    let mut index_mut = repo.index()?;
    let tree_oid = index_mut.write_tree()?;
    let tree = repo.find_tree(tree_oid)?;
    let sig = repo.signature().unwrap_or_else(|_| git2::Signature::now("TyeGit", "noreply@tyegit.local").unwrap());
    let head = repo.head()?.peel_to_commit()?;
    
    repo.commit(
        Some("HEAD"),
        &commit.author(),
        &sig,
        commit.message().unwrap_or(""),
        &tree,
        &[&head],
    )?;
    
    // Cleanup state
    repo.cleanup_state()?;
    Ok(())
}
