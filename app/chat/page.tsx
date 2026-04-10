"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Plus, ArrowLeft, Users, X, Circle } from "lucide-react";
import Link from "next/link";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  messageCount: number;
  lastMessage: {
    text: string;
    authorName: string;
    createdAt: string;
  } | null;
  activeUsers: number;
}

export default function ChatLobbyPage() {
  const [username, setUsername] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("obesetalk_chat_username");
    if (saved) {
      setUsername(saved);
      setUsernameSet(true);
    }
  }, []);

  const fetchRooms = useCallback(() => {
    fetch("/api/chat/rooms")
      .then((r) => r.json())
      .then(setRooms)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (usernameSet) fetchRooms();
  }, [usernameSet, fetchRooms]);

  // Poll rooms every 10s
  useEffect(() => {
    if (!usernameSet) return;
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [usernameSet, fetchRooms]);

  const handleSetUsername = () => {
    const name = username.trim() || "Anonymous";
    setUsername(name);
    localStorage.setItem("obesetalk_chat_username", name);
    setUsernameSet(true);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: newRoomDesc.trim() || null,
          createdBy: username,
        }),
      });
      if (res.ok) {
        const room = await res.json();
        setRooms((prev) => [room, ...prev]);
        setNewRoomName("");
        setNewRoomDesc("");
        setShowCreate(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const relativeTime = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Username picker screen
  if (!usernameSet) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-4"
            >
              💬
            </motion.div>
            <h1 className="font-serif text-2xl text-warm-brown font-semibold mb-2">
              Join the Chat
            </h1>
            <p className="font-sans text-sm text-warm-brown/60">
              Pick a name or stay anonymous — your call.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-warm-brown/10 p-6">
            <label className="block font-sans text-xs text-warm-brown/60 mb-2">
              Choose a display name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
              placeholder="Anonymous"
              maxLength={30}
              className="w-full px-4 py-3 rounded-lg border border-warm-brown/15 bg-cream/50 font-sans text-sm text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-colors"
            />
            <button
              onClick={handleSetUsername}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-coral text-white font-sans text-sm font-medium hover:bg-coral-dark transition-colors"
            >
              Enter Chat Rooms
            </button>
            <p className="text-center mt-3 font-sans text-xs text-warm-brown/40">
              Leave blank to join as Anonymous
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="font-sans text-xs text-warm-brown/40 hover:text-coral transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              Back Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat lobby
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-warm-brown/8"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-warm-brown/40 hover:text-coral transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="font-serif text-lg text-warm-brown font-semibold">
              💬 Chat Rooms
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs text-warm-brown/50">
              {username}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("obesetalk_chat_username");
                setUsernameSet(false);
                setUsername("");
              }}
              className="font-sans text-xs text-warm-brown/30 hover:text-coral transition-colors"
            >
              change
            </button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Room Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mb-6 px-4 py-4 rounded-xl border-2 border-dashed border-warm-brown/15 hover:border-coral/40 text-warm-brown/40 hover:text-coral font-sans text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Create a new room
          </button>
        </motion.div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
              onClick={(e) =>
                e.target === e.currentTarget && setShowCreate(false)
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-xl shadow-lg border border-warm-brown/10 p-6 w-full max-w-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg text-warm-brown font-semibold">
                    New Room
                  </h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="text-warm-brown/30 hover:text-warm-brown transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <label className="block font-sans text-xs text-warm-brown/60 mb-1">
                  Room name *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  placeholder="e.g. Body positivity lounge"
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-lg border border-warm-brown/15 bg-cream/50 font-sans text-sm text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-colors mb-3"
                />

                <label className="block font-sans text-xs text-warm-brown/60 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What's this room about?"
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-lg border border-warm-brown/15 bg-cream/50 font-sans text-sm text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/30 transition-colors mb-4"
                />

                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim() || creating}
                  className="w-full px-4 py-2.5 rounded-lg bg-coral text-white font-sans text-sm font-medium hover:bg-coral-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Room"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room List */}
        <div className="space-y-3">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                href={`/chat/${room.id}?username=${encodeURIComponent(username)}`}
                className="block bg-white rounded-xl border border-warm-brown/8 hover:border-coral/30 hover:shadow-sm p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base text-warm-brown font-semibold group-hover:text-coral transition-colors truncate">
                        {room.name}
                      </h3>
                      {room.activeUsers > 0 && (
                        <span className="flex items-center gap-1 font-sans text-[11px] text-green-600 flex-shrink-0">
                          <Circle size={6} fill="currentColor" />
                          {room.activeUsers}
                        </span>
                      )}
                    </div>
                    {room.lastMessage ? (
                      <p className="font-sans text-xs text-warm-brown/45 mt-0.5 truncate">
                        <span className="font-medium">{room.lastMessage.authorName}:</span>{" "}
                        {room.lastMessage.text}
                      </p>
                    ) : room.description ? (
                      <p className="font-sans text-xs text-warm-brown/50 mt-0.5 truncate">
                        {room.description}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-sans text-xs text-warm-brown/35 flex items-center gap-1">
                        <MessageCircle size={12} />
                        {room.messageCount}
                      </span>
                      <span className="font-sans text-xs text-warm-brown/35">
                        {room.lastMessage
                          ? relativeTime(room.lastMessage.createdAt)
                          : relativeTime(room.createdAt)}
                      </span>
                      {room.createdBy && (
                        <span className="font-sans text-xs text-warm-brown/35 flex items-center gap-1">
                          <Users size={12} />
                          {room.createdBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-warm-brown/20 group-hover:text-coral transition-colors mt-1">
                    <MessageCircle size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {rooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl mb-4"
              >
                🫧
              </motion.div>
              <p className="font-sans text-sm text-warm-brown/40 mb-1">
                No rooms yet.
              </p>
              <p className="font-sans text-xs text-warm-brown/30">
                Create the first one and start chatting!
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
