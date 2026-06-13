use git2::{DiffFormat, DiffOptions, Repository};
use std::path::Path;
use serde::{Deserialize, Serialize};
use crate::git::history::CommitInfo;

#[derive(Serialize, Deserialize, Debug)]
pub struct FileDiffSummary {
    pub file_path: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CommitDetails {
    pub info: CommitInfo,
    pub files_changed: Vec<FileDiffSummary>,
}

pub fn get_file_diff(repo: &Repository, file_path: &str, is_staged: bool) -> Result<String, git2::Error> {
    let mut opts = DiffOptions::new();
    opts.pathspec(file_path);

    let diff = if is_staged {
        // Staged: Compare HEAD to Index
        let head_tree = match repo.head() {
            Ok(head) => Some(head.peel_to_tree()?),
            Err(_) => None, // Initial commit case
        };
        let index = repo.index()?;
        repo.diff_tree_to_index(head_tree.as_ref(), Some(&index), Some(&mut opts))?
    } else {
        // Unstaged: Compare Index to Workdir
        let index = repo.index()?;
        repo.diff_index_to_workdir(Some(&index), Some(&mut opts))?
    };

    let mut diff_text = String::new();
    
    diff.print(DiffFormat::Patch, |_delta, _hunk, line| {
        let prefix = match line.origin() {
            '+' => "+",
            '-' => "-",
            ' ' => " ",
            _ => "",
        };
        let content = String::from_utf8_lossy(line.content());
        diff_text.push_str(&format!("{}{}", prefix, content));
        true
    })?;

    Ok(diff_text)
}

pub fn get_commit_details(repo: &Repository, commit_id: &str) -> Result<CommitDetails, git2::Error> {
    let oid = git2::Oid::from_str(commit_id)?;
    let commit = repo.find_commit(oid)?;
    
    let author = commit.author();
    let message = commit.message().unwrap_or("").to_string();
    let author_name = author.name().unwrap_or("Unknown").to_string();
    let author_email = author.email().unwrap_or("Unknown").to_string();
    let parents = commit.parent_ids().map(|id| id.to_string()).collect();
    
    let info = CommitInfo {
        id: oid.to_string(),
        message,
        author_name,
        author_email,
        timestamp: commit.time().seconds(),
        parents,
        refs: Vec::new(),
        graph_row: None,
    };

    let mut files_changed = Vec::new();
    let commit_tree = commit.tree()?;
    
    // Find parent tree
    let parent_tree = if commit.parent_count() > 0 {
        Some(commit.parent(0)?.tree()?)
    } else {
        None
    };

    let diff = repo.diff_tree_to_tree(parent_tree.as_ref(), Some(&commit_tree), None)?;
    
    for delta in diff.deltas() {
        let file_path = delta.new_file().path().or_else(|| delta.old_file().path())
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| "Unknown".to_string());
            
        let status = match delta.status() {
            git2::Delta::Added => "Added",
            git2::Delta::Deleted => "Deleted",
            git2::Delta::Modified => "Modified",
            git2::Delta::Renamed => "Renamed",
            git2::Delta::Copied => "Copied",
            _ => "Unknown",
        }.to_string();
        
        files_changed.push(FileDiffSummary {
            file_path,
            status,
        });
    }

    Ok(CommitDetails {
        info,
        files_changed,
    })
}

pub fn get_commit_file_diff(repo: &Repository, commit_id: &str, file_path: &str) -> Result<String, git2::Error> {
    let oid = git2::Oid::from_str(commit_id)?;
    let commit = repo.find_commit(oid)?;
    let commit_tree = commit.tree()?;
    
    let parent_tree = if commit.parent_count() > 0 {
        Some(commit.parent(0)?.tree()?)
    } else {
        None
    };

    let mut opts = DiffOptions::new();
    opts.pathspec(file_path);

    let diff = repo.diff_tree_to_tree(parent_tree.as_ref(), Some(&commit_tree), Some(&mut opts))?;
    
    let mut diff_text = String::new();
    diff.print(DiffFormat::Patch, |_delta, _hunk, line| {
        let prefix = match line.origin() {
            '+' => "+",
            '-' => "-",
            ' ' => " ",
            _ => "",
        };
        let content = String::from_utf8_lossy(line.content());
        diff_text.push_str(&format!("{}{}", prefix, content));
        true
    })?;

    Ok(diff_text)
}
