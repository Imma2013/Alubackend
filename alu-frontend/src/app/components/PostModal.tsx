'use client';

import { useState } from 'react';
import { Post } from '../db';
import MediaItem from './MediaItem';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from './icons';

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

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
        // Brief visual feedback handled via state if needed
      }
    } catch {
      // User cancelled share or clipboard failed
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch { /* silent */ }
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
          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--alu-border)]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 transition-all ${liked ? 'text-[var(--alu-danger)]' : 'text-alu-text-secondary hover:text-alu-text'}`}
              >
                <HeartIcon size={22} />
                <span className="text-xs font-medium">{(post.likes || 0) + (liked ? 1 : 0)}</span>
              </button>
              <button className="text-alu-text-secondary hover:text-alu-text transition-colors">
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

          {/* Timestamp */}
          <div className="px-4 pb-4">
            <span className="text-[11px] text-alu-text-tertiary">{timeAgo(post.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
