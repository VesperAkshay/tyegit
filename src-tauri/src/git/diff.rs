use git2::{DiffFormat, DiffOptions, Repository};
use std::path::Path;

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
