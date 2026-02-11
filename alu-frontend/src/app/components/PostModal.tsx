'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Post } from '../db';
import MediaItem from './MediaItem';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from './icons';
import CommentsPanel from './CommentsPanel';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onViewUser?: (userId: string) => void;
}

export default function PostModal({ post, onClose, onViewUser }: PostModalProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const toggleLike = async () => {
    const token = await getToken();
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
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

  const timeAgo = (date: Date) => {
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
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div
        className="relative bg-white w-full max-w-[500px] max-h-[90vh] mx-4 rounded-2xl overflow-hidden animate-fade-in flex flex-col"
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

        {/* Media */}
        <div className="w-full bg-black flex-shrink-0" style={{ maxHeight: '60vh' }}>
          <div className="w-full h-full flex items-center justify-center">
            {post.mediaType === 'image' ? (
              <div className="w-full relative" style={{ maxHeight: '60vh' }}>
                <MediaItem post={post} />
              </div>
            ) : (
              <div className="w-full aspect-video relative">
                <MediaItem post={post} />
              </div>
            )}
          </div>
          {post.is_ai && (
            <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm z-10">
              AI
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--alu-border)]">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--alu-border)]">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 transition-all ${likedByMe ? 'text-[var(--alu-danger)]' : 'text-alu-text-secondary hover:text-alu-text'}`}
              >
                <HeartIcon size={22} />
                <span className="text-xs font-medium">{likeCount}</span>
              </button>
              <button
                onClick={() => setCommentsOpen(!commentsOpen)}
                className="text-alu-text-secondary hover:text-alu-text transition-colors"
              >
                <CommentIcon size={22} />
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

          {/* Caption */}
          {post.safePrompt && post.safePrompt !== 'User upload' && (
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-alu-text">{post.safePrompt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments panel */}
      <CommentsPanel
        postId={post._id}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}
