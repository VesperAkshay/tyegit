use git2::{Repository, StashApplyOptions, StashFlags};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct StashInfo {
    pub index: usize,
    pub message: String,
    pub commit_id: String,
}

pub fn list_stashes(repo: &mut Repository) -> Result<Vec<StashInfo>, git2::Error> {
    let mut stashes = Vec::new();

    repo.stash_foreach(|index, message, id| {
        stashes.push(StashInfo {
            index,
            message: message.to_string(),
            commit_id: id.to_string(),
        });
        true
    })?;

    Ok(stashes)
}

pub fn stash_save(repo: &mut Repository, message: Option<&str>) -> Result<(), git2::Error> {
    let sig = repo.signature()?;
    
    // git2 stash_save needs a signature, and optionally a message. 
    // We use StashFlags::DEFAULT which keeps index and works on tracked files.
    // If we want untracked, we'd use StashFlags::INCLUDE_UNTRACKED
    let flags = StashFlags::INCLUDE_UNTRACKED;
    
    repo.stash_save(&sig, message.unwrap_or(""), Some(flags))?;
    Ok(())
}

pub fn stash_apply(repo: &mut Repository, index: usize) -> Result<(), git2::Error> {
    let mut options = StashApplyOptions::new();
    repo.stash_apply(index, Some(&mut options))?;
    Ok(())
}

pub fn stash_pop(repo: &mut Repository, index: usize) -> Result<(), git2::Error> {
    let mut options = StashApplyOptions::new();
    repo.stash_pop(index, Some(&mut options))?;
    Ok(())
}

pub fn stash_drop(repo: &mut Repository, index: usize) -> Result<(), git2::Error> {
    repo.stash_drop(index)?;
    Ok(())
}
