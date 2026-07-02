use tauri::{State, command};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::sync::Mutex;

use crate::AppState;
use crate::db::sqlite::{get_setting, set_setting};

#[derive(Serialize, Deserialize, Debug)]
pub struct AiSettings {
    pub provider: String, // "openai", "anthropic", "ollama", "grok", "deepseek", "qwen"
    pub model: String,
    pub api_key: String,
    pub base_url: String, // e.g. "http://localhost:11434/v1" or "https://api.openai.com/v1"
}

#[derive(Serialize, Deserialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct OpenAiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    temperature: f32,
}

#[derive(Deserialize)]
struct OpenAiResponse {
    choices: Vec<OpenAiChoice>,
}

#[derive(Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessageResponse,
}

#[derive(Deserialize)]
struct OpenAiMessageResponse {
    content: String,
}

// Anthropic types
#[derive(Serialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct AnthropicRequest {
    model: String,
    messages: Vec<AnthropicMessage>,
    max_tokens: u32,
    temperature: f32,
    system: String,
}

#[derive(Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContent>,
}

#[derive(Deserialize)]
struct AnthropicContent {
    text: String,
}

// Gemini types
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<GeminiCandidate>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: GeminiCandidateContent,
}

#[derive(Deserialize)]
struct GeminiCandidateContent {
    parts: Vec<GeminiPartResponse>,
}

#[derive(Deserialize)]
struct GeminiPartResponse {
    text: String,
}

#[command]
pub async fn get_ai_settings(state: State<'_, AppState>) -> Result<AiSettings, String> {
    let conn = state.db.lock().map_err(|_| "Failed to acquire db lock")?;
    
    let provider = get_setting(&conn, "ai_provider").unwrap_or(None).unwrap_or_else(|| "openai".to_string());
    let model = get_setting(&conn, "ai_model").unwrap_or(None).unwrap_or_else(|| "gpt-4o-mini".to_string());
    let api_key = get_setting(&conn, "ai_api_key").unwrap_or(None).unwrap_or_default();
    let base_url = get_setting(&conn, "ai_base_url").unwrap_or(None).unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    Ok(AiSettings {
        provider,
        model,
        api_key,
        base_url,
    })
}

#[command]
pub async fn save_ai_settings(state: State<'_, AppState>, settings: AiSettings) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| "Failed to acquire db lock")?;
    
    set_setting(&conn, "ai_provider", &settings.provider).map_err(|e| e.to_string())?;
    set_setting(&conn, "ai_model", &settings.model).map_err(|e| e.to_string())?;
    set_setting(&conn, "ai_api_key", &settings.api_key).map_err(|e| e.to_string())?;
    set_setting(&conn, "ai_base_url", &settings.base_url).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[command]
pub async fn generate_commit_message(state: State<'_, AppState>, repo_path: String, diff_text: String) -> Result<String, String> {
    if diff_text.trim().is_empty() {
        return Err("No changes staged to generate a commit message for.".to_string());
    }

    let settings = get_ai_settings(state).await?;
    
    // Load MEMORY.md for context
    let mut memory_context = String::new();
    let mem_path = std::path::PathBuf::from(repo_path).join(".tyegit").join("MEMORY.md");
    if mem_path.exists() {
        if let Ok(mem) = std::fs::read_to_string(&mem_path) {
            memory_context = format!("\n\nProject Memory Context:\n{}", mem);
        }
    }
    
    let system_prompt = format!("You are an expert Git assistant. Given a git diff, write a concise, conventional commit message. Do NOT wrap it in quotes, markdown code blocks, or add any introductory text. Just output the commit message itself. Follow the format: <type>(<scope>): <subject>. Example: fix(ui): resolve button alignment issue.{}", memory_context);
    let user_prompt = format!("Here is the git diff:\n\n{}", diff_text);

    let msg = call_llm(&settings, &system_prompt, &user_prompt).await?;
    
    // Strip out any surrounding backticks just in case the LLM disobeys the system prompt
    Ok(msg.trim().trim_matches('`').trim().to_string())
}

#[command]
pub async fn generate_code_review(state: State<'_, AppState>, diff_text: String) -> Result<String, String> {
    if diff_text.trim().is_empty() {
        return Err("No changes to review.".to_string());
    }

    let settings = get_ai_settings(state).await?;
    let system_prompt = "You are an expert Senior Software Engineer and AI Code Reviewer (acting as CodeRabbit).
Your goal is to perform a rigorous, highly structured, and constructive code review of the provided git diff.

### Core Review Directives:
1. Focus on logic errors, security vulnerabilities, edge cases, and performance bottlenecks.
2. Ignore minor stylistic nitpicks or whitespace changes.
3. Be highly specific: ALWAYS quote the problematic code or reference the exact context.
4. Be actionable: ALWAYS provide a concrete code snippet to fix the issue using markdown blocks.
5. Do not hallucinate or make assumptions about code outside the provided diff.
6. If the code is perfectly clean, explicitly state: \"No issues found. The code is clean and follows best practices.\"

### Output Format:
Your response MUST strictly adhere to the following Markdown format:

## 📝 Summary
[A concise, 1-2 sentence high-level summary of the overall changes and their intent.]

## 🚶‍♂️ Walkthrough
- `[File path or component name]`: [Brief 1-sentence explanation of what changed and why.]

## 🧐 Code Review & Feedback
[If no issues, state: \"No issues found. The code is clean and follows best practices.\"]

[If issues are found, format each issue as follows:]

### 🚨 [Severity: Critical / High / Medium / Low] - [Short Title of Issue]
**Location:** `[filename]`

**Issue:**
[Clear explanation of the problem, why it's an issue, and its potential impact.]

**Suggestion:**
[Concrete explanation of how to fix it.]
```[language]
[Proposed corrected code block]
```";
    
    let user_prompt = format!("Please review this git diff:\n\n{}", diff_text);

    call_llm(&settings, system_prompt, &user_prompt).await
}

async fn call_llm(settings: &AiSettings, system_prompt: &str, user_prompt: &str) -> Result<String, String> {
    let client = Client::new();

    // If using Anthropic
    if settings.provider == "anthropic" {
        let req_body = AnthropicRequest {
            model: settings.model.clone(),
            system: system_prompt.to_string(),
            messages: vec![
                AnthropicMessage {
                    role: "user".to_string(),
                    content: user_prompt.to_string(),
                }
            ],
            max_tokens: 1000,
            temperature: 0.2,
        };

        let response = client.post(format!("{}/messages", settings.base_url.trim_end_matches('/')))
            .header("x-api-key", &settings.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            let status = response.status();
            let err_text = response.text().await.unwrap_or_default();
            return Err(format!("Anthropic API error {}: {}", status, err_text));
        }

        let resp_json: AnthropicResponse = response.json().await.map_err(|e| e.to_string())?;
        if let Some(content) = resp_json.content.first() {
            return Ok(content.text.trim().to_string());
        }
        return Err("No content in Anthropic response".to_string());
    }

    // If using Gemini
    if settings.provider == "gemini" {
        let req_body = GeminiRequest {
            contents: vec![
                GeminiContent {
                    parts: vec![
                        GeminiPart {
                            text: format!("{}\n\n{}", system_prompt, user_prompt),
                        }
                    ]
                }
            ]
        };

        let url = if settings.base_url.contains("googleapis.com") {
            format!("{}/models/{}:generateContent", settings.base_url.trim_end_matches('/'), settings.model)
        } else {
            // Fallback just in case
            format!("{}/models/{}:generateContent", "https://generativelanguage.googleapis.com/v1beta", settings.model)
        };

        let response = client.post(url)
            .header("x-goog-api-key", &settings.api_key)
            .header("content-type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            let status = response.status();
            let err_text = response.text().await.unwrap_or_default();
            return Err(format!("Gemini API error {}: {}", status, err_text));
        }

        let resp_json: GeminiResponse = response.json().await.map_err(|e| e.to_string())?;
        if let Some(candidate) = resp_json.candidates.first() {
            if let Some(part) = candidate.content.parts.first() {
                return Ok(part.text.trim().to_string());
            }
        }
        return Err("No content in Gemini response".to_string());
    }

    // Default to OpenAI-compatible API
    let req_body = OpenAiRequest {
        model: settings.model.clone(),
        messages: vec![
            OpenAiMessage {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            OpenAiMessage {
                role: "user".to_string(),
                content: user_prompt.to_string(),
            }
        ],
        temperature: 0.2,
    };

    let mut request = client.post(format!("{}/chat/completions", settings.base_url.trim_end_matches('/')))
        .header("Content-Type", "application/json");
        
    // Only attach Authorization header if a key is provided (Ollama usually doesn't need one)
    if !settings.api_key.trim().is_empty() {
        request = request.header("Authorization", format!("Bearer {}", settings.api_key));
    }

    let response = request
        .json(&req_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let status = response.status();
        let err_text = response.text().await.unwrap_or_default();
        return Err(format!("LLM API error {}: {}", status, err_text));
    }

    let resp_json: OpenAiResponse = response.json().await.map_err(|e| e.to_string())?;
    if let Some(choice) = resp_json.choices.first() {
        return Ok(choice.message.content.trim().to_string());
    }

    Err("No content in LLM response".to_string())
}

#[command]
pub async fn resolve_conflict(state: State<'_, AppState>, repo_path: String, file_path: String) -> Result<(), String> {
    let full_path = std::path::Path::new(&repo_path).join(&file_path);
    if !full_path.exists() {
        return Err(format!("File does not exist: {}", full_path.display()));
    }

    let file_content = std::fs::read_to_string(&full_path).map_err(|e| format!("Failed to read file: {}", e))?;

    if !file_content.contains("<<<<<<< HEAD") && !file_content.contains("=======") {
        return Err("File does not appear to contain Git conflict markers.".to_string());
    }

    let settings = get_ai_settings(state).await?;
    let system_prompt = "You are an expert Senior Software Engineer resolving a git merge conflict.
You will be provided with a file containing git conflict markers (<<<<<<<, =======, >>>>>>>).
Your goal is to carefully analyze the conflicting changes and logically fuse them together into a fully working, syntax-error-free file.
DO NOT provide any explanations, markdown code blocks, or greetings.
Return ONLY the raw, final resolved code. The output must be ready to be written directly to the file.";

    let user_prompt = format!("Please resolve the conflicts in this file and return the final code:\n\n{}", file_content);

    let resolved_code = call_llm(&settings, system_prompt, &user_prompt).await?;

    let cleaned_code = strip_markdown_code_block(&resolved_code);

    std::fs::write(&full_path, cleaned_code).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

fn strip_markdown_code_block(text: &str) -> String {
    let mut lines: Vec<&str> = text.lines().collect();
    if let Some(first) = lines.first() {
        if first.trim().starts_with("```") {
            lines.remove(0);
        }
    }
    if let Some(last) = lines.last() {
        if last.trim().starts_with("```") {
            lines.pop();
        }
    }
    lines.join("\n")
}
