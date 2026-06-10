use git2::{Repository, BranchType};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct BranchInfo {
    pub name: String,
    pub is_head: bool,
    pub is_remote: bool,
}

pub fn list_branches(repo: &Repository) -> Result<Vec<BranchInfo>, git2::Error> {
    let mut branches = Vec::new();
    
    // Local branches
    for branch_res in repo.branches(Some(BranchType::Local))? {
        let (branch, _) = branch_res?;
        if let Ok(Some(name)) = branch.name() {
            branches.push(BranchInfo {
                name: name.to_string(),
                is_head: branch.is_head(),
                is_remote: false,
            });
        }
    }
    
    // Remote branches
    for branch_res in repo.branches(Some(BranchType::Remote))? {
        let (branch, _) = branch_res?;
        if let Ok(Some(name)) = branch.name() {
            branches.push(BranchInfo {
                name: name.to_string(),
                is_head: false,
                is_remote: true,
            });
        }
    }

    Ok(branches)
}

pub fn create_branch(repo: &Repository, branch_name: &str) -> Result<(), git2::Error> {
    let head = repo.head()?;
    let commit = head.peel_to_commit()?;
    repo.branch(branch_name, &commit, false)?;
    Ok(())
}

pub fn switch_branch(repo: &Repository, branch_name: &str) -> Result<(), git2::Error> {
    let obj = repo.revparse_single(&format!("refs/heads/{}", branch_name))?;
    repo.checkout_tree(&obj, None)?;
    repo.set_head(&format!("refs/heads/{}", branch_name))?;
    Ok(())
}
