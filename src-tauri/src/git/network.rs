use git2::{Repository, RemoteCallbacks, FetchOptions, PushOptions, Cred};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct RemoteInfo {
    pub name: String,
    pub url: String,
}

pub fn list_remotes(repo: &Repository) -> Result<Vec<RemoteInfo>, git2::Error> {
    let remotes_array = repo.remotes()?;
    let mut results = Vec::new();
    
    for name_opt in remotes_array.iter() {
        if let Some(name) = name_opt {
            if let Ok(remote) = repo.find_remote(name) {
                if let Some(url) = remote.url() {
                    results.push(RemoteInfo {
                        name: name.to_string(),
                        url: url.to_string(),
                    });
                }
            }
        }
    }
    
    Ok(results)
}

pub fn add_remote(repo: &Repository, name: &str, url: &str) -> Result<(), git2::Error> {
    repo.remote(name, url)?;
    Ok(())
}

pub fn remove_remote(repo: &Repository, name: &str) -> Result<(), git2::Error> {
    repo.remote_delete(name)?;
    Ok(())
}

pub fn fetch_remote(repo: &Repository, remote_name: &str, token: &str) -> Result<(), git2::Error> {
    let mut remote = repo.find_remote(remote_name)?;
    
    let mut callbacks = RemoteCallbacks::new();
    let token_clone = token.to_string();
    callbacks.credentials(move |_url, username_from_url, _allowed_types| {
        Cred::userpass_plaintext(username_from_url.unwrap_or("git"), &token_clone)
    });
    
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);
    
    // We construct a dynamic refspec for the given remote
    let refspec = format!("refs/heads/*:refs/remotes/{}/*", remote_name);
    remote.fetch(&[&refspec], Some(&mut fetch_options), None)?;
    
    Ok(())
}

pub fn push_remote(repo: &Repository, remote_name: &str, token: &str) -> Result<(), git2::Error> {
    let mut remote = repo.find_remote(remote_name)?;
    
    let mut callbacks = RemoteCallbacks::new();
    let token_clone = token.to_string();
    callbacks.credentials(move |_url, username_from_url, _allowed_types| {
        Cred::userpass_plaintext(username_from_url.unwrap_or("git"), &token_clone)
    });
    
    let mut push_options = PushOptions::new();
    push_options.remote_callbacks(callbacks);
    
    let head = repo.head()?;
    let branch_name = head.shorthand().unwrap_or("main");
    let refspec = format!("refs/heads/{}:refs/heads/{}", branch_name, branch_name);
    
    remote.push(&[&refspec], Some(&mut push_options))?;
    
    // Set upstream tracking to the selected remote
    if let Ok(mut branch) = repo.find_branch(branch_name, git2::BranchType::Local) {
        let upstream_name = format!("{}/{}", remote_name, branch_name);
        let _ = branch.set_upstream(Some(&upstream_name));
    }
    
    Ok(())
}

pub fn pull_remote(repo: &Repository, remote_name: &str, token: &str) -> Result<(), git2::Error> {
    fetch_remote(repo, remote_name, token)?;
    
    let fetch_head = repo.find_reference("FETCH_HEAD")?;
    let fetch_commit = repo.reference_to_annotated_commit(&fetch_head)?;
    
    let analysis = repo.merge_analysis(&[&fetch_commit])?;
    if analysis.0.is_up_to_date() {
        return Ok(());
    } else if analysis.0.is_fast_forward() {
        let head = repo.head()?;
        let refname = format!("refs/heads/{}", head.shorthand().unwrap_or("main"));
        let mut reference = repo.find_reference(&refname)?;
        reference.set_target(fetch_commit.id(), "Fast-Forward")?;
        repo.set_head(&refname)?;
        repo.checkout_head(Some(git2::build::CheckoutBuilder::default().force()))?;
    } else {
        return Err(git2::Error::from_str("Normal merge is not supported in MVP. Only Fast-Forward is supported. Please resolve manually in terminal."));
    }
    
    Ok(())
}
