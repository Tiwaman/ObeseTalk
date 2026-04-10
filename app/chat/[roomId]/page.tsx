"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Circle } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

interface ChatMessage {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
}

interface RoomInfo {
  id: string;
  name: string;
  description: string | null;
}

export default function ChatRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const username = searchParams.get("username") || localStorage.getItem("obesetalk_chat_username") || "Anonymous";

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // Fetch room info
  useEffect(() => {
    fetch(`/api/chat/rooms`)
      .then((r) => r.json())
      .then((rooms) => {
        const found = rooms.find((r: RoomInfo) => r.id === roomId);
        if (found) setRoom(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [roomId]);

  // Fetch initial messages
  useEffect(() => {
    fetch(`/api/chat/rooms/${roomId}/messages`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((msgs: ChatMessage[]) => {
        setMessages(msgs);
        if (msgs.length > 0) {
          lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
        }
        setTimeout(() => scrollToBottom(true), 100);
      })
      .catch(() => {});
  }, [roomId, scrollToBottom]);

  // SSE for real-time messages with polling fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let useSSE = true;

    const addMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      lastTimestampRef.current = msg.createdAt;
      setTimeout(() => scrollToBottom(), 50);
    };

    const startSSE = () => {
      const after = lastTimestampRef.current;
      const url = after
        ? `/api/chat/rooms/${roomId}/stream?after=${encodeURIComponent(after)}`
        : `/api/chat/rooms/${roomId}/stream`;

      eventSource = new EventSource(url);

      eventSource.addEventListener("message", (e) => {
        try {
          const msg = JSON.parse(e.data) as ChatMessage;
          addMessage(msg);
        } catch { /* ignore */ }
      });

      eventSource.addEventListener("presence", (e) => {
        try {
          const data = JSON.parse(e.data);
          setOnlineCount(data.count || 0);
        } catch { /* ignore */ }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
        if (useSSE) {
          // Fallback to polling
          startPolling();
          // Try SSE again after 10s
          setTimeout(() => {
            if (useSSE && !eventSource) {
              if (fallbackInterval) clearInterval(fallbackInterval);
              fallbackInterval = null;
              startSSE();
            }
          }, 10000);
        }
      };
    };

    const startPolling = () => {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(() => {
        const after = lastTimestampRef.current;
        const url = after
          ? `/api/chat/rooms/${roomId}/messages?after=${encodeURIComponent(after)}`
          : `/api/chat/rooms/${roomId}/messages`;

        fetch(url)
          .then((r) => r.json())
          .then((msgs: ChatMessage[]) => {
            msgs.forEach(addMessage);
          })
          .catch(() => {});
      }, 2000);
    };

    startSSE();

    return () => {
      useSSE = false;
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [roomId, scrollToBottom]);

  // Presence heartbeat every 15s
  useEffect(() => {
    const sendHeartbeat = () => {
      fetch(`/api/chat/rooms/${roomId}/presence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [roomId, username]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic add
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      text,
      authorName: username,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, authorName: username }),
      });
      if (res.ok) {
        const real = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? real : m))
        );
        lastTimestampRef.current = real.createdAt;
      }
    } catch {
      // Keep optimistic message on failure
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (msg: ChatMessage) => msg.authorName === username;

  if (notFound) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🚪</div>
          <h1 className="font-serif text-xl text-warm-brown font-semibold mb-2">
            Room not found
          </h1>
          <p className="font-sans text-sm text-warm-brown/50 mb-4">
            This room may have been deleted.
          </p>
          <Link
            href="/chat"
            className="font-sans text-sm text-coral hover:text-coral-dark transition-colors"
          >
            Back to Chat Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-shrink-0 bg-cream/90 backdrop-blur-sm border-b border-warm-brown/8 z-10"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/chat?username=${encodeURIComponent(username)}`}
            className="text-warm-brown/40 hover:text-coral transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-base text-warm-brown font-semibold truncate">
              {room?.name || "Loading..."}
            </h1>
            {room?.description && (
              <p className="font-sans text-xs text-warm-brown/40 truncate">
                {room.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onlineCount > 0 && (
              <span className="font-sans text-xs text-green-600 flex items-center gap-1">
                <Circle size={8} fill="currentColor" />
                {onlineCount}
              </span>
            )}
            <span className="font-sans text-xs text-warm-brown/40">
              {username}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="max-w-2xl mx-auto space-y-1">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <div className="text-4xl mb-3">💬</div>
              <p className="font-sans text-sm text-warm-brown/40">
                No messages yet. Say something!
              </p>
            </motion.div>
          )}

          {messages.map((msg, i) => {
            const own = isOwnMessage(msg);
            const showAuthor =
              i === 0 || messages[i - 1].authorName !== msg.authorName;
            const showTimestamp =
              i === 0 ||
              new Date(msg.createdAt).getTime() -
                new Date(messages[i - 1].createdAt).getTime() >
                300000; // 5 min gap

            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="text-center my-3">
                    <span className="font-sans text-[10px] text-warm-brown/25 bg-cream px-2">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${own ? "justify-end" : "justify-start"} ${
                    showAuthor ? "mt-3" : "mt-0.5"
                  }`}
                >
                  <div
                    className={`max-w-[75%] ${
                      own
                        ? "bg-coral text-white rounded-2xl rounded-br-md"
                        : "bg-white border border-warm-brown/8 text-warm-brown rounded-2xl rounded-bl-md"
                    } px-3.5 py-2 shadow-sm`}
                  >
                    {showAuthor && !own && (
                      <p className="font-sans text-[11px] font-medium text-coral/80 mb-0.5">
                        {msg.authorName}
                      </p>
                    )}
                    <p className="font-sans text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-warm-brown/8 bg-cream/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-full border border-warm-brown/15 bg-white font-sans text-sm text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center hover:bg-coral-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
