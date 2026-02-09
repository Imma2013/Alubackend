'use client';

import { useState } from 'react';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from '../icons';

const MOCK_STORIES = [
  { id: 1, name: 'Your Story', avatar: '', isOwn: true },
  { id: 2, name: 'alex_ai', avatar: '', hasNew: true },
  { id: 3, name: 'maya.creates', avatar: '', hasNew: true },
  { id: 4, name: 'techvibes', avatar: '', hasNew: false },
  { id: 5, name: 'artflow', avatar: '', hasNew: true },
  { id: 6, name: 'sarah.k', avatar: '', hasNew: false },
  { id: 7, name: 'designpro', avatar: '', hasNew: true },
  { id: 8, name: 'filmjunkie', avatar: '', hasNew: true },
];

const MOCK_POSTS = [
  {
    id: 1,
    user: 'alex_ai',
    avatar: '',
    time: '2h ago',
    content: 'Just generated this incredible sunset landscape using Alu AI. The detail is insane.',
    image: true,
    imageColor: '#F5D060',
    likes: 234,
    comments: 18,
    isAI: true,
  },
  {
    id: 2,
    user: 'maya.creates',
    avatar: '',
    time: '4h ago',
    content: 'Morning coffee and brainstorming session. What are you all working on today?',
    image: false,
    likes: 89,
    comments: 42,
    isAI: false,
  },
  {
    id: 3,
    user: 'techvibes',
    avatar: '',
    time: '6h ago',
    content: 'AI-generated short film concept art for my upcoming project. Alu makes it so easy to prototype visuals.',
    image: true,
    imageColor: '#B8860B',
    likes: 567,
    comments: 31,
    isAI: true,
  },
];

export default function HomeTab() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Stories Row */}
      <div className="px-2 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {MOCK_STORIES.map((story) => (
            <button key={story.id} className="flex flex-col items-center gap-1 w-[72px] shrink-0">
              <div
                className={`w-[62px] h-[62px] rounded-full flex items-center justify-center ${
                  story.isOwn
                    ? 'border-2 border-dashed border-alu-text-tertiary'
                    : story.hasNew
                    ? 'p-[2px] bg-gradient-to-br from-[var(--alu-primary)] to-[var(--alu-primary-light)]'
                    : 'border-2 border-alu-border'
                }`}
              >
                <div className="w-[56px] h-[56px] rounded-full bg-alu-surface flex items-center justify-center text-lg">
                  {story.isOwn ? (
                    <span className="text-alu-text-tertiary text-2xl">+</span>
                  ) : (
                    <span className="text-alu-text-secondary">{story.name[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-alu-text-secondary truncate w-full text-center">
                {story.isOwn ? 'Your Story' : story.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-alu-border" />

      {/* Feed */}
      <div className="flex flex-col">
        {MOCK_POSTS.map((post) => (
          <article key={post.id} className="border-b border-alu-border-light">
            {/* Post Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary">
                {post.user[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-alu-text">{post.user}</span>
                <span className="text-xs text-alu-text-tertiary block">{post.time}</span>
              </div>
              <button className="text-alu-text-tertiary hover:text-alu-text transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
              <p className="text-sm leading-relaxed text-alu-text">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="w-full aspect-[4/3] bg-alu-surface relative overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${post.imageColor}33 0%, ${post.imageColor}66 50%, ${post.imageColor}99 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                    </div>
                  </div>
                </div>
                {post.isAI && (
                  <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                    AI
                  </div>
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 transition-all duration-200 ${
                    likedPosts.has(post.id) ? 'text-[var(--alu-danger)]' : 'text-alu-text-secondary hover:text-alu-text'
                  }`}
                >
                  <HeartIcon size={20} />
                  <span className="text-xs font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1.5 text-alu-text-secondary hover:text-alu-text transition-colors">
                  <CommentIcon size={20} />
                  <span className="text-xs font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-alu-text-secondary hover:text-alu-text transition-colors">
                  <ShareIcon size={20} />
                </button>
              </div>
              <button
                onClick={() => toggleSave(post.id)}
                className={`transition-all duration-200 ${
                  savedPosts.has(post.id) ? 'text-[var(--alu-primary)]' : 'text-alu-text-secondary hover:text-alu-text'
                }`}
              >
                <BookmarkIcon size={20} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
