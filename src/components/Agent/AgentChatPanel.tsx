import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { MessageSquare, X, Send, Terminal, Settings, List, Plus } from "lucide-react";

interface AgentEventPayload {
  event_type: string;
  payload: any;
}

interface SessionInfo {
  id: string;
  created_at: number;
}

interface AgentChatPanelProps {
  repoPath: string | null;
}

interface ChatMessage {
  role: "user" | "assistant" | "tool" | "system";
  content?: string;
  tool_calls?: any[];
}

export default function AgentChatPanel({ repoPath }: AgentChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSessions = async () => {
    if (!repoPath) return;
    try {
      const sess = await invoke<SessionInfo[]>("list_agent_sessions", { repoPath });
      setSessions(sess);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, repoPath]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTool]);

  useEffect(() => {
    const unlisten = listen<AgentEventPayload>("agent-event", (event) => {
      const { event_type, payload } = event.payload;

      if (event_type === "text_chunk") {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant" && !lastMsg.tool_calls) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...lastMsg,
              content: (lastMsg.content || "") + payload.text,
            };
            return updated;
          } else {
            return [...prev, { role: "assistant", content: payload.text }];
          }
        });
      } else if (event_type === "tool_start") {
        setActiveTool(`Executing ${payload.tool_name}...`);
      } else if (event_type === "tool_result") {
        setActiveTool(null);
        // We could render tool results, but usually we just let the LLM see it
        setMessages((prev) => [
          ...prev,
          { role: "tool", content: `Tool ${payload.tool_name} returned: ${payload.result.substring(0, 100)}...` }
        ]);
      } else if (event_type === "done") {
        setIsTyping(false);
        setActiveTool(null);
      } else if (event_type === "session_saved") {
        setCurrentSessionId(payload.session_id);
      } else if (event_type === "error") {
        setIsTyping(false);
        setActiveTool(null);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `❌ Error: ${payload.message}` }
        ]);
      }
    });

    const unlistenTrigger = listen<{prompt: string}>("open-agent-chat", async (event) => {
      setIsOpen(true);
      const prompt = event.payload.prompt;
      
      const userMessage: ChatMessage = { role: "user", content: prompt };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      
      try {
        await invoke("start_agent_session", {
          repoPath,
          prompt: prompt,
          history: messagesRef.current,
          sessionId: currentSessionId,
        });
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `❌ Failed to start agent: ${err}` }
        ]);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
      unlistenTrigger.then((fn) => fn());
    };
  }, [repoPath]);

  const handleSend = async () => {
    if (!input.trim() || !repoPath) return;

    if (input.startsWith("/")) {
      const parts = input.split(" ");
      const cmd = parts[0].substring(1);
      const argsStr = parts.slice(1).join(" ");
      
      const allowedCommands = ["read_file", "write_file", "list_directory", "bash_command", "grep_search", "update_memory"];
      if (allowedCommands.includes(cmd)) {
        const userMessage: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        
        const forcedPrompt = `USER EXPLICIT INSTRUCTION: Please use the '${cmd}' tool with the following context/arguments. Think carefully like an agent to determine the correct JSON arguments to pass to the tool based on this context. Do not ask for permission, just execute the tool:\n\n${argsStr}`;
        
        try {
          await invoke("start_agent_session", {
            repoPath,
            prompt: forcedPrompt,
            history: messagesRef.current,
            sessionId: currentSessionId,
          });
        } catch (err) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { role: "system", content: `❌ Failed to start agent: ${err}` }
          ]);
        }
        return;
      }
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      await invoke("start_agent_session", {
        repoPath,
        prompt: input,
        history: messages,
        sessionId: currentSessionId,
      });
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ Failed to start agent: ${err}` }
      ]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white p-3 shadow-[4px_4px_0px_rgba(61,79,151,1)] border-2 border-chrome-indigo hover:bg-primary-hover transition-colors"
        title="Open Agent Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[32rem] bg-platinum border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="bg-chrome-indigo text-white p-2 flex justify-between items-center border-b-2 border-chrome-indigo shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-bold tracking-tight">AGENT SYSTEM</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSessions(!showSessions)} 
            className={`hover:bg-white/20 p-1 rounded-sm ${showSessions ? "bg-white/20" : ""}`}
            title="Sessions"
          >
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSessions ? (
        <div className="flex-1 bg-white overflow-y-auto p-2">
          <button 
            onClick={() => {
              setCurrentSessionId(null);
              setMessages([]);
              setShowSessions(false);
            }}
            className="w-full flex items-center gap-2 p-2 mb-2 bg-platinum hover:bg-primary/10 border-2 border-chrome-indigo text-left"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
          {sessions.length === 0 ? (
            <p className="text-center text-ink-soft mt-8 text-xs">No saved sessions.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={async () => {
                    if (!repoPath) return;
                    try {
                      const history = await invoke<ChatMessage[]>("load_agent_session", { repoPath, sessionId: s.id });
                      setMessages(history);
                      setCurrentSessionId(s.id);
                      setShowSessions(false);
                    } catch(e) {
                      console.error("Failed to load session", e);
                    }
                  }}
                  className={`w-full text-left p-2 border-2 ${currentSessionId === s.id ? 'border-primary bg-primary/5' : 'border-chrome-indigo/30 hover:border-chrome-indigo'}`}
                >
                  <div className="font-bold text-xs truncate">Session {s.id.substring(8)}</div>
                  <div className="text-[10px] text-ink-soft">{new Date(s.created_at * 1000).toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        {messages.filter(m => m.role !== "system" && m.role !== "tool").length === 0 && (
          <div className="text-center text-ink-soft my-8 space-y-2">
            <p className="font-bold">AGENT INITIALIZED</p>
            <p className="text-xs">I can read files, execute commands, and explore your repository.</p>
            {!repoPath && <p className="text-red-500 text-xs">⚠️ Please open a repository first.</p>}
          </div>
        )}

        {messages.filter(m => m.role !== "system").map((msg, i) => {
          if (msg.role === "tool") {
            return (
              <div key={i} className="text-[10px] text-ink-soft bg-platinum border border-chrome-indigo/30 p-2 font-mono break-all">
                {msg.content}
              </div>
            );
          }

          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div className="text-[10px] text-ink-soft font-bold mb-1">
                {isUser ? "USER" : "AGENT"}
              </div>
              <div className={`p-2 max-w-[85%] border-2 shadow-[2px_2px_0px_rgba(61,79,151,1)] ${
                isUser 
                  ? "bg-primary text-white border-chrome-indigo" 
                  : "bg-white text-ink border-chrome-indigo"
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        })}
        
        {activeTool && (
          <div className="flex items-center gap-2 text-ink-soft text-xs animate-pulse bg-warning/20 p-2 border border-warning/50">
            <Settings className="w-3 h-3 animate-spin" />
            {activeTool}
          </div>
        )}
        
        {isTyping && !activeTool && (
          <div className="flex items-center gap-2 text-ink-soft text-xs">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-75">●</span>
            <span className="animate-bounce delay-150">●</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {input.startsWith("/") && (
        <div className="absolute bottom-16 left-0 right-0 bg-platinum border-t-2 border-x-2 border-chrome-indigo text-xs max-h-32 overflow-y-auto">
          {["/read_file", "/write_file", "/list_directory", "/bash_command", "/grep_search", "/update_memory"].filter(c => c.startsWith(input.split(" ")[0])).map(cmd => (
            <div key={cmd} className="p-2 hover:bg-primary/10 cursor-pointer font-bold text-ink" onClick={() => setInput(cmd + " ")}>
              {cmd}
            </div>
          ))}
        </div>
      )}
      <div className="p-2 bg-platinum border-t-2 border-chrome-indigo shrink-0 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={!repoPath || isTyping}
          placeholder={repoPath ? "Ask me anything..." : "Open a repository first"}
          className="flex-1 bg-white border-2 border-chrome-indigo p-2 outline-none focus:bg-primary/5 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !repoPath || isTyping}
          className="bg-primary text-white p-2 border-2 border-chrome-indigo shadow-[2px_2px_0px_rgba(61,79,151,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
        </div>
      )}
    </div>
  );
}
