use git2::{Repository, MergeOptions, build::CheckoutBuilder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MergeStatus {
    pub conflicted: usize,
    pub resolved: usize,
    pub unresolved: usize,
}

pub fn merge_branch(repo: &Repository, branch_name: &str) -> Result<(), git2::Error> {
    // 1. Get the annotated commit of the branch to merge
    let fetch_head = repo.find_reference(&format!("refs/heads/{}", branch_name))?;
    let fetch_commit = repo.reference_to_annotated_commit(&fetch_head)?;
    
    // 2. Perform the merge analysis (is it fast-forward, up-to-date, or normal merge?)
    let (analysis, _preference) = repo.merge_analysis(&[&fetch_commit])?;
    
    if analysis.is_up_to_date() {
        return Ok(());
    }
    
    // For V2, we force a 3-way merge by using repo.merge even if it could be fast-forwarded,
    // or we can allow fast-forward if it's possible. Let's do a proper merge for now to test conflicts.
    let mut merge_opts = MergeOptions::new();
    let mut checkout_opts = CheckoutBuilder::new();
    checkout_opts.safe(); // Safe checkout, prevents data loss
    
    repo.merge(&[&fetch_commit], Some(&mut merge_opts), Some(&mut checkout_opts))?;
    
    // If we have conflicts, the repo enters the MERGE state and we return.
    if repo.index()?.has_conflicts() {
        return Ok(());
    }
    
    // If no conflicts, we need to create the merge commit!
    let sig = repo.signature()?;
    let mut index = repo.index()?;
    let tree_id = index.write_tree()?;
    let tree = repo.find_tree(tree_id)?;
    
    let head = repo.head()?;
    let parent1 = repo.find_commit(head.target().unwrap())?;
    let parent2 = repo.find_commit(fetch_commit.id())?;
    
    let msg = format!("Merge branch '{}'", branch_name);
    
    repo.commit(
        Some("HEAD"),
        &sig,
        &sig,
        &msg,
        &tree,
        &[&parent1, &parent2]
    )?;
    
    repo.cleanup_state()?;
    
    Ok(())
}

pub fn abort_merge(repo: &Repository) -> Result<(), git2::Error> {
    let head = repo.head()?;
    let target = head.target().unwrap();
    let commit = repo.find_commit(target)?;
    
    let mut checkout_opts = CheckoutBuilder::new();
    checkout_opts.force();
    
    // Reset index and working tree to HEAD, clearing any conflict markers in the index
    repo.reset(commit.as_object(), git2::ResetType::Hard, Some(&mut checkout_opts))?;
    repo.cleanup_state()?;
    Ok(())
}

pub fn get_merge_status(repo: &Repository) -> Result<MergeStatus, git2::Error> {
    let index = repo.index()?;
    let mut conflicted = 0;
    
    if index.has_conflicts() {
        for entry in index.conflicts()? {
            let _ = entry?; // Just iterating to count conflicts
            conflicted += 1;
        }
    }
    
    // For now, simplicity: unresolved = conflicted
    // "Resolved" files would have been added to the index and are no longer in conflict status.
    Ok(MergeStatus {
        conflicted,
        resolved: 0,
        unresolved: conflicted,
    })
}
