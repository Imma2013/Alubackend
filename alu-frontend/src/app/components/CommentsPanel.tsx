'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

interface CommentData {
    _id: string;
    userId: string;
    text: string;
    displayName: string;
    avatarUrl: string;
    createdAt: string;
}

interface CommentsPanelProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function CommentsPanel({ postId, isOpen, onClose }: CommentsPanelProps) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!isOpen || !postId) return;
        setLoading(true);
        fetch(`${backendUrl}/posts/${postId}/comments`)
            .then(res => res.ok ? res.json() : { comments: [] })
            .then(data => setComments(data.comments || []))
            .catch(() => setComments([]))
            .finally(() => setLoading(false));
    }, [isOpen, postId, backendUrl]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!text.trim() || submitting) return;
        const token = await getToken();
        if (!token) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${backendUrl}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    text: text.trim(),
                    displayName: user?.fullName || '',
                    avatarUrl: user?.imageUrl || '',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                setText('');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${backendUrl}/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            setComments(prev => prev.filter(c => c._id !== commentId));
        }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in">
            <div
                ref={panelRef}
                className="w-full max-w-[500px] bg-white rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up"
                style={{ maxHeight: '70vh' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--alu-border)]">
                    <h3 className="text-sm font-bold text-alu-text">Comments ({comments.length})</h3>
                    <button onClick={onClose} className="p-1 text-alu-text-tertiary hover:text-alu-text">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Comments list */}
                <div className="overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-[var(--alu-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-xs text-alu-text-tertiary py-6">No comments yet. Be the first!</p>
                    ) : (
                        comments.map((c) => (
                            <div key={c._id} className="flex gap-2.5 group">
                                {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-alu-surface flex items-center justify-center text-xs font-bold text-alu-text-secondary shrink-0">
                                        {(c.displayName || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs">
                                        <span className="font-semibold text-alu-text">{c.displayName || 'User'}</span>
                                        <span className="text-alu-text-tertiary ml-1.5">{timeAgo(c.createdAt)}</span>
                                    </p>
                                    <p className="text-sm text-alu-text mt-0.5">{c.text}</p>
                                </div>
                                {c.userId === user?.id && (
                                    <button
                                        onClick={() => handleDelete(c._id)}
                                        className="opacity-0 group-hover:opacity-100 text-alu-text-tertiary hover:text-red-500 transition-all p-1 shrink-0 self-start"
                                        title="Delete"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-[var(--alu-border)] px-4 py-3 flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Add a comment..."
                        className="flex-1 h-10 px-3 bg-alu-surface rounded-full text-sm text-alu-text placeholder:text-alu-text-tertiary outline-none focus:ring-2 focus:ring-[var(--alu-primary-glow)]"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !text.trim()}
                        className="h-10 px-4 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, var(--alu-primary), var(--alu-primary-light))' }}
                    >
                        {submitting ? '...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
