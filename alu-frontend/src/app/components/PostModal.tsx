'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Post, db } from '../db';
import MediaItem from './MediaItem';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from './icons';

interface CommentData {
  _id: string;
  userId: string;
  text: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onViewUser?: (userId: string) => void;
  onDeleted?: (postId: string) => void;
}

export default function PostModal({ post, onClose, onViewUser, onDeleted }: PostModalProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likedByMe, setLikedByMe] = useState(post.likedBy?.includes(user?.id || '') || false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const isOwner = post.userId === user?.id;

  // Fetch comments on open
  useEffect(() => {
    setLoadingComments(true);
    fetch(`${backendUrl}/posts/${post._id}/comments`)
      .then(res => res.ok ? res.json() : { comments: [] })
      .then(data => setComments(data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [post._id, backendUrl]);

  const toggleLike = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/posts/${post._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ displayName: user?.fullName || '', avatarUrl: user?.imageUrl || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likes);
        setLikedByMe(data.liked);
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    const shareData = {
      title: 'Check this out on Alu',
      text: post.safePrompt || 'Shared from Alu',
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      try { await navigator.clipboard.writeText(shareUrl); } catch { /* silent */ }
    }
  };

  const handleViewUser = () => {
    if (post.userId && onViewUser) {
      onViewUser(post.userId);
      onClose();
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    const token = await getToken();
    if (!token) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${backendUrl}/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          text: commentText.trim(),
          displayName: user?.fullName || '',
          avatarUrl: user?.imageUrl || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setCommentText('');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Comment failed:', res.status, errorData);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${backendUrl}/posts/${post._id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      setComments(prev => prev.filter(c => c._id !== commentId));
    }
  };

  const deletePost = async () => {
    const token = await getToken();
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${backendUrl}/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        // Remove from local Dexie
        try { await db.posts.delete(post._id); } catch { /* ok */ }
        onDeleted?.(post._id);
        onClose();
      }
    } catch (err) {
      console.error('Delete post failed:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const timeAgo = (date: Date | string) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6" onClick={onClose}>
      <div
        className="relative bg-white w-full max-w-[950px] max-h-[90vh] rounded-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* LEFT — Media (desktop: 60% width, mobile: full width) */}
        <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative flex-shrink-0" style={{ minHeight: '300px', maxHeight: '90vh' }}>
          {post.mediaType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center">
              <MediaItem post={post} />
            </div>
          ) : (
            <div className="w-full aspect-video relative">
              <MediaItem post={post} />
            </div>
          )}
          {post.is_ai && (
            <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm z-10">
              AI
            </div>
          )}
        </div>

        {/* RIGHT — Info + Comments (desktop: 40% width, mobile: below media) */}
        <div className="w-full md:w-[40%] flex flex-col md:max-h-[90vh] max-h-[50vh]">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--alu-border)] shrink-0">
            <button onClick={handleViewUser} className="shrink-0">
              {post.avatarUrl ? (
                <img src={post.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary">
                  {(post.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <button onClick={handleViewUser} className="hover:underline">
                <span className="font-semibold text-sm text-alu-text">{post.displayName || 'Alu User'}</span>
              </button>
              <span className="text-xs text-alu-text-tertiary block">{timeAgo(post.timestamp)}</span>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-alu-text-tertiary hover:text-red-500 transition-colors p-1"
                title="Delete post"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>

          {/* Comments List — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Caption as first "comment" */}
            {post.safePrompt && post.safePrompt !== 'User upload' && (
              <div className="flex gap-2.5 mb-4">
                {post.avatarUrl ? (
                  <img src={post.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-alu-surface flex items-center justify-center text-xs font-bold text-alu-text-secondary shrink-0">
                    {(post.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-xs text-alu-text">{post.displayName || 'User'}</span>
                  <p className="text-sm text-alu-text mt-0.5">{post.safePrompt}</p>
                </div>
              </div>
            )}

            {loadingComments ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[var(--alu-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs text-alu-text-tertiary py-6">No comments yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {comments.map((c) => (
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
                        onClick={() => deleteComment(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-alu-text-tertiary hover:text-red-500 transition-all p-1 shrink-0 self-start"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--alu-border)] shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 transition-all ${likedByMe ? 'text-[var(--alu-danger)]' : 'text-alu-text-secondary hover:text-alu-text'}`}
              >
                <HeartIcon size={22} />
                <span className="text-xs font-medium">{likeCount}</span>
              </button>
              <button className="text-alu-text-secondary hover:text-alu-text transition-colors">
                <CommentIcon size={22} />
                {comments.length > 0 && <span className="text-xs font-medium ml-1">{comments.length}</span>}
              </button>
              <button
                onClick={handleShare}
                className="text-alu-text-secondary hover:text-alu-text transition-colors"
              >
                <ShareIcon size={22} />
              </button>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`transition-all ${saved ? 'text-[var(--alu-primary)]' : 'text-alu-text-secondary hover:text-alu-text'}`}
            >
              <BookmarkIcon size={22} />
            </button>
          </div>

          {/* Comment Input */}
          <div className="border-t border-[var(--alu-border)] px-4 py-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              className="flex-1 h-10 px-3 bg-alu-surface rounded-full text-sm text-alu-text placeholder:text-alu-text-tertiary outline-none focus:ring-2 focus:ring-[var(--alu-primary-glow)]"
            />
            <button
              onClick={submitComment}
              disabled={submittingComment || !commentText.trim()}
              className="h-10 px-4 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(135deg, var(--alu-primary), var(--alu-primary-light))' }}
            >
              {submittingComment ? '...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-[320px] mx-4 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-alu-text mb-2">Delete this post?</h3>
            <p className="text-sm text-alu-text-secondary mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
