use git2::Repository;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TagInfo {
    pub name: String,
    pub commit_id: String,
    pub message: String,
}

pub fn list_tags(repo: &Repository) -> Result<Vec<TagInfo>, git2::Error> {
    let mut tags = Vec::new();
    let tag_names = repo.tag_names(None)?;

    for name in tag_names.iter().flatten() {
        if let Ok(obj) = repo.revparse_single(name) {
            let commit_id = match obj.peel_to_commit() {
                Ok(commit) => commit.id().to_string(),
                Err(_) => obj.id().to_string(), // fallback
            };
            let mut message = String::new();

            // Try to see if it's an annotated tag
            if let Ok(tag) = obj.into_tag() {
                message = tag.message().unwrap_or("").to_string();
            }

            tags.push(TagInfo {
                name: name.to_string(),
                commit_id,
                message,
            });
        }
    }

    Ok(tags)
}

pub fn create_tag(repo: &Repository, tag_name: &str, message: &str) -> Result<(), git2::Error> {
    let obj = repo.revparse_single("HEAD")?;
    
    if message.trim().is_empty() {
        repo.tag_lightweight(tag_name, &obj, false)?;
    } else {
        let sig = repo.signature()?;
        repo.tag(tag_name, &obj, &sig, message, false)?;
    }
    
    Ok(())
}

pub fn delete_tag(repo: &Repository, tag_name: &str) -> Result<(), git2::Error> {
    repo.tag_delete(tag_name)?;
    Ok(())
}

pub fn checkout_tag(repo: &Repository, tag_name: &str) -> Result<(), git2::Error> {
    let obj = repo.revparse_single(&format!("refs/tags/{}", tag_name))?;
    let commit = obj.peel_to_commit()?;
    repo.checkout_tree(&obj, None)?;
    repo.set_head_detached(commit.id())?;
    Ok(())
}
