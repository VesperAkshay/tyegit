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
