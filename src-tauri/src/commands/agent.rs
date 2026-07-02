use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{command, AppHandle, Emitter, State};
use std::path::PathBuf;
use crate::AppState;
use crate::commands::ai::{get_ai_settings, AiSettings};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String, // "system", "user", "assistant", "tool"
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_calls: Option<Vec<ToolCall>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_call_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ToolCall {
    pub id: String,
    pub r#type: String, // always "function"
    pub function: FunctionCall,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FunctionCall {
    pub name: String,
    pub arguments: String, // JSON string
}

pub fn get_agent_tools() -> Vec<Value> {
    vec![
        json!({
            "type": "function",
            "function": {
                "name": "bash_command",
                "description": "Execute a bash or powershell command in the repository workspace. Use this for git commands, running tests, or building.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "command": {
                            "type": "string",
                            "description": "The command string to execute."
                        }
                    },
                    "required": ["command"]
                }
            }
        }),
        json!({
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read the contents of a file in the repository.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "The relative path to the file to read."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        json!({
            "type": "function",
            "function": {
                "name": "write_file",
                "description": "Write contents to a file in the repository, overwriting it.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "The relative path to the file to write."
                        },
                        "content": {
                            "type": "string",
                            "description": "The complete new content of the file."
                        }
                    },
                    "required": ["path", "content"]
                }
            }
        }),
        json!({
            "type": "function",
            "function": {
                "name": "list_directory",
                "description": "List the contents of a directory in the repository.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "The relative path to the directory to list. Use '.' for the root."
                        }
                    },
                    "required": ["path"]
                }
            }
        }),
        json!({
            "type": "function",
            "function": {
                "name": "grep_search",
                "description": "Search for a string or regex pattern across the repository.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "The regex pattern or string to search for."
                        },
                        "path": {
                            "type": "string",
                            "description": "Optional directory to limit the search (e.g. 'src/')."
                        }
                    },
                    "required": ["pattern"]
                }
            }
        }),
        json!({
            "type": "function",
            "function": {
                "name": "update_memory",
                "description": "Save important context, rules, or architectural decisions to the project's MEMORY.md file so you can remember them in future sessions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The exact markdown content to write/append to MEMORY.md."
                        },
                        "append": {
                            "type": "boolean",
                            "description": "If true, append to MEMORY.md. If false, overwrite it completely."
                        }
                    },
                    "required": ["content", "append"]
                }
            }
        }),
    ]
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AgentEvent {
    pub event_type: String, // "text_chunk", "tool_start", "tool_result", "action_required"
    pub payload: Value,
}

#[derive(Serialize)]
struct OpenAiRequestWithTools {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    tools: Vec<Value>,
}

#[derive(Deserialize)]
struct OpenAiResponseWithTools {
    choices: Vec<OpenAiChoiceWithTools>,
}

#[derive(Deserialize)]
struct OpenAiChoiceWithTools {
    message: ChatMessage,
}

#[command]
pub async fn start_agent_session(
    app: AppHandle,
    state: State<'_, AppState>,
    repo_path: String,
    prompt: String,
    history: Vec<ChatMessage>,
    session_id: Option<String>
) -> Result<(), String> {
    
    // Fetch settings synchronously (since we are inside a command, we can't easily await inside the spawned thread without cloning)
    let settings = get_ai_settings(state).await?;
    
    tauri::async_runtime::spawn(async move {
        let mut messages = if let Some(sid) = &session_id {
            let session_file = PathBuf::from(&repo_path).join(".tyegit").join("sessions").join(format!("{}.json", sid));
            if let Ok(json_str) = std::fs::read_to_string(&session_file) {
                serde_json::from_str(&json_str).unwrap_or_else(|_| history.clone())
            } else {
                history.clone()
            }
        } else {
            history.clone()
        };
        
        // Always ensure the system prompt is present
        if !messages.iter().any(|m| m.role == "system") {
            let memory_path = PathBuf::from(&repo_path).join(".tyegit").join("MEMORY.md");
            let memory_str = std::fs::read_to_string(memory_path).unwrap_or_default();
            
            let system_prompt = format!("You are an advanced agentic coding assistant built into TyeGit.
You are running directly inside the user's repository: {}
You have access to native tools to read files, run commands, and update your memory.
Always use tools to explore the workspace before making assumptions.
Here are the user's persistent memory rules:\n{}", repo_path, memory_str);

            messages.insert(0, ChatMessage {
                role: "system".to_string(),
                content: Some(system_prompt),
                tool_calls: None,
                tool_call_id: None,
                name: None,
            });
        }
        
        messages.push(ChatMessage {
            role: "user".to_string(),
            content: Some(prompt.clone()),
            tool_calls: None,
            tool_call_id: None,
            name: None,
        });

        let client = reqwest::Client::new();
        let tools = get_agent_tools();
        let max_iterations = 10;
        let mut iterations = 0;

        // Map Gemini to Google's official OpenAI compatibility endpoint
        let mut base_url = settings.base_url.trim_end_matches('/').to_string();
        if settings.provider == "gemini" {
            base_url = "https://generativelanguage.googleapis.com/v1beta/openai".to_string();
        } else if settings.provider == "anthropic" {
            let _ = app.emit("agent-event", AgentEvent {
                event_type: "error".to_string(),
                payload: json!({ "message": "Agent mode currently does not support Anthropic natively. Please use Gemini or an OpenAI-compatible API." }),
            });
            return;
        }

        loop {
            if iterations >= max_iterations {
                let _ = app.emit("agent-event", AgentEvent {
                    event_type: "error".to_string(),
                    payload: json!({ "message": "Max iterations reached." }),
                });
                break;
            }
            iterations += 1;

            let req_body = OpenAiRequestWithTools {
                model: settings.model.clone(),
                messages: messages.clone(),
                temperature: 0.2,
                tools: tools.clone(),
            };

            let mut request = client.post(format!("{}/chat/completions", base_url))
                .header("Content-Type", "application/json");
            
            if !settings.api_key.trim().is_empty() {
                request = request.header("Authorization", format!("Bearer {}", settings.api_key));
            }

            let response = match request.json(&req_body).send().await {
                Ok(r) => r,
                Err(e) => {
                    let _ = app.emit("agent-event", AgentEvent {
                        event_type: "error".to_string(),
                        payload: json!({ "message": format!("Network error: {}", e) }),
                    });
                    break;
                }
            };

            if !response.status().is_success() {
                let status = response.status();
                let err_text = response.text().await.unwrap_or_default();
                let _ = app.emit("agent-event", AgentEvent {
                    event_type: "error".to_string(),
                    payload: json!({ "message": format!("API error {}: {}", status, err_text) }),
                });
                break;
            }

            let resp_json: Result<OpenAiResponseWithTools, _> = response.json().await;
            match resp_json {
                Ok(parsed) => {
                    if let Some(choice) = parsed.choices.into_iter().next() {
                        let response_msg = choice.message;
                        messages.push(response_msg.clone());

                        if let Some(content) = &response_msg.content {
                            if !content.is_empty() {
                                let _ = app.emit("agent-event", AgentEvent {
                                    event_type: "text_chunk".to_string(),
                                    payload: json!({ "text": content }),
                                });
                            }
                        }

                        if let Some(tool_calls) = response_msg.tool_calls {
                            for tool_call in tool_calls {
                                let _ = app.emit("agent-event", AgentEvent {
                                    event_type: "tool_start".to_string(),
                                    payload: json!({ "tool_name": tool_call.function.name, "arguments": tool_call.function.arguments }),
                                });

                                let result = execute_tool(&repo_path, &tool_call.function.name, &tool_call.function.arguments).await;
                                
                                let _ = app.emit("agent-event", AgentEvent {
                                    event_type: "tool_result".to_string(),
                                    payload: json!({ "tool_name": tool_call.function.name, "result": result }),
                                });

                                messages.push(ChatMessage {
                                    role: "tool".to_string(),
                                    content: Some(result),
                                    tool_calls: None,
                                    tool_call_id: Some(tool_call.id),
                                    name: Some(tool_call.function.name),
                                });
                            }
                        } else {
                            // No tools called, generation finished
                            let _ = app.emit("agent-event", AgentEvent {
                                event_type: "done".to_string(),
                                payload: json!({}),
                            });
                            break;
                        }
                    }
                },
                Err(e) => {
                    let _ = app.emit("agent-event", AgentEvent {
                        event_type: "error".to_string(),
                        payload: json!({ "message": format!("Failed to parse response: {}", e) }),
                    });
                    break;
                }
            }
        }
        
        // Save session
        let sid = session_id.unwrap_or_else(|| {
            use std::time::{SystemTime, UNIX_EPOCH};
            let start = SystemTime::now();
            let since_the_epoch = start.duration_since(UNIX_EPOCH).expect("Time went backwards");
            format!("session_{}", since_the_epoch.as_secs())
        });
        
        let sessions_dir = PathBuf::from(&repo_path).join(".tyegit").join("sessions");
        let _ = std::fs::create_dir_all(&sessions_dir);
        let session_file = sessions_dir.join(format!("{}.json", sid));
        
        // Exclude system message from saved history to save space and allow dynamic system prompt
        let history_to_save: Vec<ChatMessage> = messages.into_iter().filter(|m| m.role != "system").collect();
        if let Ok(json_str) = serde_json::to_string_pretty(&history_to_save) {
            let _ = std::fs::write(&session_file, json_str);
        }
        
        // Inform UI about the session ID in case it was newly generated
        let _ = app.emit("agent-event", AgentEvent {
            event_type: "session_saved".to_string(),
            payload: json!({ "session_id": sid }),
        });

    });
    
    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub created_at: u64,
}

#[command]
pub async fn list_agent_sessions(repo_path: String) -> Result<Vec<SessionInfo>, String> {
    let sessions_dir = PathBuf::from(repo_path).join(".tyegit").join("sessions");
    if !sessions_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut sessions = Vec::new();
    if let Ok(entries) = std::fs::read_dir(sessions_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    let created_at = entry.metadata()
                        .and_then(|m| m.created())
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);
                    sessions.push(SessionInfo {
                        id: stem.to_string(),
                        created_at,
                    });
                }
            }
        }
    }
    
    // Sort by created_at descending
    sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(sessions)
}

#[command]
pub async fn load_agent_session(repo_path: String, session_id: String) -> Result<Vec<ChatMessage>, String> {
    let session_file = PathBuf::from(repo_path).join(".tyegit").join("sessions").join(format!("{}.json", session_id));
    if !session_file.exists() {
        return Err("Session not found".to_string());
    }
    let json_str = std::fs::read_to_string(session_file).map_err(|e| e.to_string())?;
    let history: Vec<ChatMessage> = serde_json::from_str(&json_str).map_err(|e| e.to_string())?;
    Ok(history)
}

#[command]
pub async fn delete_agent_session(repo_path: String, session_id: String) -> Result<(), String> {
    let session_file = PathBuf::from(repo_path).join(".tyegit").join("sessions").join(format!("{}.json", session_id));
    if session_file.exists() {
        std::fs::remove_file(session_file).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
pub async fn execute_agent_tool(repo_path: String, tool_name: String, args: String) -> Result<String, String> {
    Ok(execute_tool(&repo_path, &tool_name, &args).await)
}

async fn execute_tool(repo_path: &str, tool_name: &str, args: &str) -> String {
    let args_json: Value = match serde_json::from_str(args) {
        Ok(v) => v,
        Err(_) => return "Error: Invalid JSON arguments".to_string(),
    };

    let repo_dir = PathBuf::from(repo_path);

    match tool_name {
        "read_file" => {
            if let Some(path) = args_json["path"].as_str() {
                let full_path = repo_dir.join(path);
                std::fs::read_to_string(&full_path)
                    .unwrap_or_else(|e| format!("Error reading file: {}", e))
            } else {
                "Error: Missing path argument".to_string()
            }
        },
        "write_file" => {
            if let (Some(path), Some(content)) = (args_json["path"].as_str(), args_json["content"].as_str()) {
                let full_path = repo_dir.join(path);
                if let Some(parent) = full_path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }
                match std::fs::write(&full_path, content) {
                    Ok(_) => format!("Successfully wrote to {}", path),
                    Err(e) => format!("Error writing file: {}", e),
                }
            } else {
                "Error: Missing path or content argument".to_string()
            }
        },
        "list_directory" => {
            if let Some(path) = args_json["path"].as_str() {
                let full_path = repo_dir.join(path);
                match std::fs::read_dir(&full_path) {
                    Ok(entries) => {
                        let mut result = String::new();
                        for entry in entries.flatten() {
                            let name = entry.file_name().into_string().unwrap_or_default();
                            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
                            result.push_str(&format!("{}{}\n", name, if is_dir { "/" } else { "" }));
                        }
                        result
                    },
                    Err(e) => format!("Error listing directory: {}", e),
                }
            } else {
                "Error: Missing path argument".to_string()
            }
        },
        "grep_search" => {
            // Simplified grep: just uses ripgrep if installed, or simple Rust fallback
            "Error: Grep search not yet fully implemented in Rust backend.".to_string()
        },
        "bash_command" => {
            "Error: Action required. UI must confirm bash commands.".to_string()
        },
        "update_memory" => {
            let content = args_json.get("content").and_then(|v| v.as_str()).unwrap_or("");
            let append = args_json.get("append").and_then(|v| v.as_bool()).unwrap_or(true);
            
            let memory_path = PathBuf::from(repo_path).join(".tyegit").join("MEMORY.md");
            let _ = std::fs::create_dir_all(memory_path.parent().unwrap());
            
            if append {
                use std::io::Write;
                match std::fs::OpenOptions::new().create(true).append(true).open(&memory_path) {
                    Ok(mut file) => {
                        if let Err(e) = writeln!(file, "\n{}", content) {
                            return format!("Failed to append memory: {}", e);
                        }
                        "Memory appended successfully.".to_string()
                    },
                    Err(e) => format!("Failed to open memory file: {}", e)
                }
            } else {
                match std::fs::write(&memory_path, content) {
                    Ok(_) => "Memory overwritten successfully.".to_string(),
                    Err(e) => format!("Failed to write memory: {}", e)
                }
            }
        },
        _ => format!("Unknown tool: {}", tool_name)
    }
}
