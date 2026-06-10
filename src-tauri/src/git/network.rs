use git2::{Repository, RemoteCallbacks, FetchOptions, PushOptions, Cred};

pub fn fetch_remote(repo: &Repository, token: &str) -> Result<(), git2::Error> {
    let mut remote = repo.find_remote("origin")?;
    
    let mut callbacks = RemoteCallbacks::new();
    let token_clone = token.to_string();
    callbacks.credentials(move |_url, username_from_url, _allowed_types| {
        Cred::userpass_plaintext(username_from_url.unwrap_or("git"), &token_clone)
    });
    
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);
    
    remote.fetch(&["refs/heads/*:refs/remotes/origin/*"], Some(&mut fetch_options), None)?;
    
    Ok(())
}

pub fn push_remote(repo: &Repository, token: &str) -> Result<(), git2::Error> {
    let mut remote = repo.find_remote("origin")?;
    
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
    
    Ok(())
}

pub fn pull_remote(repo: &Repository, token: &str) -> Result<(), git2::Error> {
    fetch_remote(repo, token)?;
    
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
