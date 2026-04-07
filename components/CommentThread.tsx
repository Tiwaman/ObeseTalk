"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import CommentForm from "./CommentForm";
import { relativeTime } from "@/lib/utils";

interface Reply {
  id: string;
  text: string;
  authorName: string | null;
  createdAt: string;
}

interface Comment {
  id: string;
  text: string;
  authorName: string | null;
  createdAt: string;
  replies: Reply[];
}

interface CommentThreadProps {
  submissionId: string;
  commentCount: number;
}

export default function CommentThread({ submissionId, commentCount }: CommentThreadProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localCount, setLocalCount] = useState(commentCount);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?submissionId=${submissionId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setLoaded(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    if (open && !loaded) {
      fetchComments();
    }
  }, [open, loaded, fetchComments]);

  const handleNewComment = useCallback((comment: Comment) => {
    setComments((prev) => [...prev, comment]);
    setLocalCount((c) => c + 1);
  }, []);

  const handleNewReply = useCallback((parentId: string, reply: Reply) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
    setLocalCount((c) => c + 1);
    setReplyingTo(null);
  }, []);

  return (
    <div className="relative z-10 mt-3 pt-3 border-t border-warm-brown/8">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-sans text-warm-brown/45 hover:text-coral transition-colors group"
      >
        <MessageCircle size={14} className="group-hover:text-coral transition-colors" />
        <span>
          {localCount > 0
            ? `${localCount} ${localCount === 1 ? "reply" : "replies"}`
            : "Add a reply"}
        </span>
      </button>

      {/* Thread content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {loading && (
                <p className="text-xs text-warm-brown/30 font-sans py-2">Loading...</p>
              )}

              {/* Comments list */}
              {comments.map((comment) => (
                <div key={comment.id}>
                  {/* Top-level comment */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-0.5 bg-coral/20 rounded-full shrink-0 mt-1" style={{ minHeight: 16 }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs text-warm-brown leading-relaxed">
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-warm-brown/35 font-sans">
                          {comment.authorName || "Anonymous"} · {relativeTime(comment.createdAt)}
                        </span>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-[10px] text-warm-brown/30 hover:text-coral font-sans transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Nested replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-2 ml-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <motion.div
                              key={reply.id}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex gap-2"
                            >
                              <div className="w-0.5 bg-warm-brown/10 rounded-full shrink-0 mt-1" style={{ minHeight: 12 }} />
                              <div className="min-w-0">
                                <p className="font-sans text-[11px] text-warm-brown/70 leading-relaxed">
                                  {reply.text}
                                </p>
                                <span className="text-[10px] text-warm-brown/30 font-sans">
                                  {reply.authorName || "Anonymous"} · {relativeTime(reply.createdAt)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      <AnimatePresence>
                        {replyingTo === comment.id && (
                          <div className="mt-2">
                            <CommentForm
                              submissionId={submissionId}
                              parentId={comment.id}
                              placeholder="Write a reply..."
                              onSubmit={(reply) => handleNewReply(comment.id, reply)}
                              onCancel={() => setReplyingTo(null)}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              ))}

              {/* New comment form */}
              <div className="pt-1">
                <CommentForm
                  submissionId={submissionId}
                  placeholder="Share your story too..."
                  onSubmit={handleNewComment}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
