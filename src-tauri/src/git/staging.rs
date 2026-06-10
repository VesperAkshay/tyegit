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
    index.add_all(["*"], git2::IndexAddOption::DEFAULT, None)?;
    index.write()?;
    Ok(())
}

pub fn unstage_all(repo: &Repository) -> Result<(), git2::Error> {
    let head = repo.head()?.peel_to_commit()?;
    repo.reset_default(Some(head.as_object()), ["*"])?;
    Ok(())
}
