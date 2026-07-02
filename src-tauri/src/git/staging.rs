use git2::Repository;
use std::path::Path;

pub fn stage_file(repo: &Repository, path: &str) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    let path_obj = Path::new(path);
    index.add_path(path_obj)?;
    index.write()?;
    Ok(())
}

pub fn unstage_file(repo: &Repository, path: &str) -> Result<(), git2::Error> {
    let head = repo.head()?.peel_to_commit()?;
    let path_obj = Path::new(path);
    repo.reset_default(Some(head.as_object()), [path_obj])?;
    Ok(())
}

pub fn stage_all(repo: &Repository) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    
    // First try standard add_all
    if let Err(_) = index.add_all(["*"], git2::IndexAddOption::DEFAULT, None) {
        // Fallback to manual staging if git2 pathspec fails
        let mut opts = git2::StatusOptions::new();
        opts.include_untracked(true).recurse_untracked_dirs(true);
        let statuses = repo.statuses(Some(&mut opts))?;
        for entry in statuses.iter() {
            if let Some(path) = entry.path() {
                let status = entry.status();
                if status.contains(git2::Status::WT_DELETED) {
                    let _ = index.remove_path(Path::new(path));
                } else {
                    let _ = index.add_path(Path::new(path));
                }
            }
        }
    } else {
        // Handle deletions
        let _ = index.update_all(["*"], None);
    }
    
    index.write()?;
    Ok(())
}

pub fn unstage_all(repo: &Repository) -> Result<(), git2::Error> {
    match repo.head() {
        Ok(head) => {
            // If HEAD exists, a Mixed reset unstages everything
            let commit = head.peel_to_commit()?;
            repo.reset(commit.as_object(), git2::ResetType::Mixed, None)?;
        }
        Err(_) => {
            // If there's no HEAD (initial commit), just clear the index
            let mut index = repo.index()?;
            index.clear()?;
            index.write()?;
        }
    }
    Ok(())
}

pub fn discard_file(repo: &Repository, path: &str) -> Result<(), git2::Error> {
    let repo_path = repo.workdir().ok_or_else(|| git2::Error::from_str("Bare repo"))?;
    let full_path = repo_path.join(path);
    
    // Get file status to see if it's untracked
    if let Ok(status) = repo.status_file(Path::new(path)) {
        if status.contains(git2::Status::WT_NEW) {
            // Untracked file: simply delete it
            if full_path.exists() {
                let _ = std::fs::remove_file(full_path);
            }
            return Ok(());
        }
    }

    // Tracked file: checkout from HEAD
    let mut checkout_builder = git2::build::CheckoutBuilder::new();
    checkout_builder.path(path).force();
    repo.checkout_head(Some(&mut checkout_builder))?;
    Ok(())
}

pub fn add_to_gitignore(repo: &Repository, path: &str) -> Result<(), git2::Error> {
    let repo_path = repo.workdir().ok_or_else(|| git2::Error::from_str("Bare repo"))?;
    let gitignore_path = repo_path.join(".gitignore");
    
    let mut needs_newline = false;
    if gitignore_path.exists() {
        if let Ok(contents) = std::fs::read_to_string(&gitignore_path) {
            if !contents.is_empty() && !contents.ends_with('\n') {
                needs_newline = true;
            }
        }
    }
    
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&gitignore_path)
        .map_err(|e| git2::Error::from_str(&format!("Failed to open .gitignore: {}", e)))?;
        
    if needs_newline {
        writeln!(file).map_err(|e| git2::Error::from_str(&format!("Failed to write newline: {}", e)))?;
    }
        
    writeln!(file, "{}", path)
        .map_err(|e| git2::Error::from_str(&format!("Failed to write to .gitignore: {}", e)))?;
        
    Ok(())
}

pub fn stage_file_from_text(repo: &Repository, path: &str, text: &str) -> Result<(), git2::Error> {
    let mut index = repo.index()?;
    let oid = repo.blob(text.as_bytes())?;
    
    let normalized_path = path.replace("\\", "/");
    
    let (ctime, mtime, mode) = if let Some(entry) = index.get_path(Path::new(&normalized_path), 0) {
        (entry.ctime, entry.mtime, entry.mode)
    } else {
        // we can just use 0 directly if we can't construct IndexTime. Wait, how to create IndexTime?
        // Let's just create a new empty IndexEntry and modify what we need!
        // git2::IndexEntry doesn't implement Default.
        // We can just construct a dummy file and get its IndexEntry?
        // Let's use `git2::IndexTime::new(0, 0)`
        (git2::IndexTime::new(0, 0), git2::IndexTime::new(0, 0), 0o100644)
    };

    let entry = git2::IndexEntry {
        ctime,
        mtime,
        dev: 0,
        ino: 0,
        mode,
        uid: 0,
        gid: 0,
        file_size: text.len() as u32,
        id: oid,
        flags: 0,
        flags_extended: 0,
        path: normalized_path.as_bytes().to_vec(),
    };
    
    index.add(&entry)?;
    index.write()?;
    Ok(())
}
