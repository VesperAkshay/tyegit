use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use serde::Serialize;

#[derive(Serialize)]
pub struct RecentRepo {
    pub id: i32,
    pub path: String,
    pub name: String,
    pub last_opened: String,
}

pub fn init_db(app_data_dir: PathBuf) -> Result<Connection> {
    let db_path = app_data_dir.join("git_desktop.db");
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS recent_repositories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            last_opened DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

pub fn add_recent_repository(conn: &Connection, path: &str, name: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO recent_repositories (path, name, last_opened)
         VALUES (?1, ?2, CURRENT_TIMESTAMP)
         ON CONFLICT(path) DO UPDATE SET last_opened = CURRENT_TIMESTAMP, name = ?2",
        params![path, name],
    )?;
    Ok(())
}

pub fn get_recent_repositories(conn: &Connection) -> Result<Vec<RecentRepo>> {
    let mut stmt = conn.prepare("SELECT id, path, name, last_opened FROM recent_repositories ORDER BY last_opened DESC LIMIT 15")?;
    let repo_iter = stmt.query_map([], |row| {
        Ok(RecentRepo {
            id: row.get(0)?,
            path: row.get(1)?,
            name: row.get(2)?,
            last_opened: row.get(3)?,
        })
    })?;

    let mut repos = Vec::new();
    for repo in repo_iter {
        repos.push(repo?);
    }
    Ok(repos)
}
