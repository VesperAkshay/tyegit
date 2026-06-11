use git2::{Repository, RepositoryState as Git2State};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub enum RepositoryState {
    Clean,
    Merge,
    Rebase,
    RebaseInteractive,
    RebaseMerge,
    ApplyMailbox,
    ApplyMailboxOrRebase,
    Bisect,
    CherryPick,
    CherryPickSequence,
    Revert,
    RevertSequence,
}

pub fn get_repo_state(repo: &Repository) -> RepositoryState {
    match repo.state() {
        Git2State::Clean => RepositoryState::Clean,
        Git2State::Merge => RepositoryState::Merge,
        Git2State::Revert => RepositoryState::Revert,
        Git2State::RevertSequence => RepositoryState::RevertSequence,
        Git2State::CherryPick => RepositoryState::CherryPick,
        Git2State::CherryPickSequence => RepositoryState::CherryPickSequence,
        Git2State::Bisect => RepositoryState::Bisect,
        Git2State::Rebase => RepositoryState::Rebase,
        Git2State::RebaseInteractive => RepositoryState::RebaseInteractive,
        Git2State::RebaseMerge => RepositoryState::RebaseMerge,
        Git2State::ApplyMailbox => RepositoryState::ApplyMailbox,
        Git2State::ApplyMailboxOrRebase => RepositoryState::ApplyMailboxOrRebase,
    }
}
