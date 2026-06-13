use git2::Repository;
use std::path::Path;

pub fn open_repository<P: AsRef<Path>>(path: P) -> Result<Repository, git2::Error> {
    Repository::open(path)
}

pub fn init_repository<P: AsRef<Path>>(path: P) -> Result<Repository, git2::Error> {
    Repository::init(path)
}

pub fn clone_repository(url: &str, path: &Path) -> Result<Repository, git2::Error> {
    Repository::clone(url, path)
}

pub fn get_file_content(repo: &Repository, path: &str, treeish: &str) -> Result<String, git2::Error> {
    match treeish {
        "working" => {
            let repo_path = repo.workdir().ok_or_else(|| git2::Error::from_str("Bare repo"))?;
            let full_path = repo_path.join(path);
            if full_path.exists() {
                std::fs::read_to_string(full_path).map_err(|e| git2::Error::from_str(&format!("fs error: {}", e)))
            } else {
                Ok(String::new())
            }
        },
        "index" => {
            let index = repo.index()?;
            let normalized_path = path.replace("\\", "/");
            if let Some(entry) = index.get_path(Path::new(&normalized_path), 0) {
                let blob = repo.find_blob(entry.id)?;
                let content = std::str::from_utf8(blob.content()).unwrap_or("");
                Ok(content.to_string())
            } else {
                Ok(String::new())
            }
        },
        "head" | _ => {
            let normalized_path = path.replace("\\", "/");
            if let Ok(head) = repo.head() {
                if let Ok(head_commit) = head.peel_to_commit() {
                    if let Ok(tree) = head_commit.tree() {
                        if let Ok(entry) = tree.get_path(Path::new(&normalized_path)) {
                            if let Ok(object) = entry.to_object(repo) {
                                if let Some(blob) = object.as_blob() {
                                    let content = std::str::from_utf8(blob.content()).unwrap_or("");
                                    return Ok(content.to_string());
                                }
                            }
                        }
                    }
                }
            }
            Ok(String::new())
        }
    }
}
