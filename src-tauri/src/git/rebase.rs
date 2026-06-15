use git2::{Repository, Oid, MergeOptions};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ValidationResult {
    pub valid: bool,
    pub conflict_commit: Option<String>,
    pub new_head_oid: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RebaseOperation {
    pub action: String, // "pick", "drop", "squash"
    pub commit_id: String,
}

pub fn validate_visual_rebase(
    repo: &Repository,
    base_commit_id: &str,
    operations: Vec<RebaseOperation>,
) -> Result<ValidationResult, git2::Error> {
    let base_oid = Oid::from_str(base_commit_id).map_err(|e| git2::Error::from_str(&format!("Invalid base commit ID: {}", e)))?;
    let mut current_commit = repo.find_commit(base_oid)?;
    let committer = repo.signature().unwrap_or_else(|_| git2::Signature::now("TyeGit", "noreply@tyegit.local").unwrap());

    let mut merge_opts = MergeOptions::new();
    // Rebase typical merge options
    merge_opts.find_renames(true);

    for op in operations {
        if op.action == "drop" {
            continue;
        }

        let cherry_commit_oid = Oid::from_str(&op.commit_id).map_err(|e| git2::Error::from_str(&format!("Invalid commit ID: {}", e)))?;
        let cherry_commit = repo.find_commit(cherry_commit_oid)?;

        if op.action == "pick" {
            // Perform the in-memory cherrypick
            let mut index = repo.cherrypick_commit(&cherry_commit, &current_commit, 0, Some(&mut merge_opts))?;

            if index.has_conflicts() {
                return Ok(ValidationResult {
                    valid: false,
                    conflict_commit: Some(op.commit_id),
                    new_head_oid: None,
                });
            }

            // Write the new tree to the ODB
            let tree_oid = index.write_tree_to(repo)?;
            let tree = repo.find_tree(tree_oid)?;

            // Create the new commit, preserving the original author
            let new_commit_oid = repo.commit(
                None, // Do NOT update any reference yet (detached commit)
                &cherry_commit.author(),
                &committer,
                cherry_commit.message().unwrap_or(""),
                &tree,
                &[&current_commit],
            )?;

            current_commit = repo.find_commit(new_commit_oid)?;
        }
        // Future versions will handle "squash" here
    }

    Ok(ValidationResult {
        valid: true,
        conflict_commit: None,
        new_head_oid: Some(current_commit.id().to_string()),
    })
}

pub fn apply_visual_rebase(
    repo: &Repository,
    new_head_oid: &str,
) -> Result<(), git2::Error> {
    let oid = Oid::from_str(new_head_oid).map_err(|e| git2::Error::from_str(&format!("Invalid new head OID: {}", e)))?;
    let commit = repo.find_commit(oid)?;
    
    // Safety check: Ensure the working directory is clean before we move HEAD and update files
    let mut status_opts = git2::StatusOptions::new();
    status_opts.include_untracked(true);
    let statuses = repo.statuses(Some(&mut status_opts))?;
    
    if !statuses.is_empty() {
        return Err(git2::Error::from_str("Working directory is not clean. Please stash or commit your changes before applying the rebase."));
    }

    // Checkout the new commit to update the working directory and index
    let mut checkout_builder = git2::build::CheckoutBuilder::new();
    checkout_builder.force(); // We know working directory is clean
    repo.checkout_tree(commit.as_object(), Some(&mut checkout_builder))?;

    // Move the current branch to point to the new commit
    let head = repo.head()?;
    if head.is_branch() {
        let branch_name = head.name().unwrap();
        repo.reference(branch_name, oid, true, "TyeGit Visual Rebase")?;
    } else {
        // Detached HEAD case
        repo.set_head_detached(oid)?;
    }

    Ok(())
}
