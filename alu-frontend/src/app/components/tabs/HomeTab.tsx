'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '@clerk/nextjs';
import { db, Post } from '../../db';
import { pullChanges, pushChanges } from '../../syncService';
import MediaItem from '../MediaItem';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from '../icons';

interface HomeTabProps {
  showAI: boolean;
  showNormal: boolean;
}

export default function HomeTab({ showAI, showNormal }: HomeTabProps) {
  const { getToken, isSignedIn } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  // Live query from Dexie — real posts
  const allPosts = useLiveQuery(
    () => db.posts.orderBy('timestamp').reverse().toArray(),
    []
  );

  // Filter by AI/Normal toggles
  const posts = allPosts?.filter((p: Post) => {
    if (showAI && showNormal) return true;
    if (showAI && !showNormal) return p.is_ai;
    if (!showAI && showNormal) return !p.is_ai;
    return true;
  }) || [];

  // Sync on mount + every 60s
  useEffect(() => {
    const runSync = async () => {
      setIsSyncing(true);
      await pullChanges();
      if (isSignedIn) {
        const token = await getToken();
        if (token) await pushChanges(token);
      }
      setIsSyncing(false);
    };

    runSync();
    const interval = setInterval(runSync, 60000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  const getPostKey = (post: Post) => post._id || String(post.id);

  const toggleLike = (key: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSave = (key: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Sync indicator */}
      {isSyncing && (
        <div className="text-center py-2">
          <span className="text-[11px] text-alu-text-tertiary animate-pulse">Syncing...</span>
        </div>
      )}

      {/* Feed */}
      <div className="flex flex-col">
        {!allPosts && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[var(--alu-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-alu-text-tertiary">Loading feed...</p>
          </div>
        )}

        {allPosts && posts.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-alu-surface flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--alu-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-alu-text mb-1">No posts yet</p>
            <p className="text-xs text-alu-text-tertiary">Be the first to create something</p>
          </div>
        )}

        {posts.map((post) => {
          const key = getPostKey(post);
          return (
            <article key={key} className="border-b border-alu-border-light">
              {/* Post Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary">
                  {(post.userId || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-alu-text">
                    {post.userId?.slice(0, 12) || 'Unknown'}
                  </span>
                  <span className="text-xs text-alu-text-tertiary block">{timeAgo(post.timestamp)}</span>
                </div>
                <button className="text-alu-text-tertiary hover:text-alu-text transition-colors p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                </button>
              </div>

              {/* Caption */}
              {post.safePrompt && post.safePrompt !== 'User upload' && (
                <div className="px-4 pb-2">
                  <p className="text-sm leading-relaxed text-alu-text">{post.safePrompt}</p>
                </div>
              )}

              {/* Post Media */}
              <div className="w-full aspect-[4/3] bg-alu-surface relative overflow-hidden">
                <MediaItem post={post} />
                {post.is_ai && (
                  <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                    AI
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(key)}
                    className={`flex items-center gap-1.5 transition-all duration-200 ${
                      likedPosts.has(key) ? 'text-[var(--alu-danger)]' : 'text-alu-text-secondary hover:text-alu-text'
                    }`}
                  >
                    <HeartIcon size={20} />
                    <span className="text-xs font-medium">{(post.likes || 0) + (likedPosts.has(key) ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-alu-text-secondary hover:text-alu-text transition-colors">
                    <CommentIcon size={20} />
                  </button>
                  <button className="flex items-center gap-1.5 text-alu-text-secondary hover:text-alu-text transition-colors">
                    <ShareIcon size={20} />
                  </button>
                </div>
                <button
                  onClick={() => toggleSave(key)}
                  className={`transition-all duration-200 ${
                    savedPosts.has(key) ? 'text-[var(--alu-primary)]' : 'text-alu-text-secondary hover:text-alu-text'
                  }`}
                >
                  <BookmarkIcon size={20} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
