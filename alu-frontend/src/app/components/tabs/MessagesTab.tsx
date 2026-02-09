'use client';

import { useState } from 'react';
import { SearchIcon } from '../icons';

const MOCK_STORIES = [
  { id: 1, name: 'alex_ai', hasNew: true },
  { id: 2, name: 'maya', hasNew: true },
  { id: 3, name: 'techvibes', hasNew: false },
  { id: 4, name: 'artflow', hasNew: true },
  { id: 5, name: 'sarah.k', hasNew: false },
];

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'alex_ai', lastMessage: 'That AI generation was incredible! How did you...', time: '2m', unread: 3, online: true },
  { id: 2, name: 'maya.creates', lastMessage: 'Thanks for the follow! Love your content', time: '1h', unread: 1, online: true },
  { id: 3, name: 'techvibes', lastMessage: 'Sent a video', time: '3h', unread: 0, online: false },
  { id: 4, name: 'artflow', lastMessage: 'Check out this new feature on Alu', time: '5h', unread: 0, online: false },
  { id: 5, name: 'filmjunkie', lastMessage: 'Let me know when the collab is ready!', time: '1d', unread: 0, online: false },
  { id: 6, name: 'sarah.k', lastMessage: 'haha thats amazing', time: '2d', unread: 0, online: true },
];

export default function MessagesTab() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-alu-text-tertiary">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full h-10 pl-10 pr-4 bg-alu-surface rounded-full text-sm text-alu-text placeholder:text-alu-text-tertiary outline-none focus:ring-2 focus:ring-[var(--alu-primary-glow)] transition-shadow"
          />
        </div>
      </div>

      {/* Stories / Highlights */}
      <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {MOCK_STORIES.map((story) => (
            <button key={story.id} className="flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${story.hasNew ? 'p-[2px] bg-gradient-to-br from-[var(--alu-primary)] to-[var(--alu-primary-light)]' : 'border-2 border-alu-border'}`}>
                <div className="w-[48px] h-[48px] rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary">
                  {story.name[0].toUpperCase()}
                </div>
              </div>
              <span className="text-[11px] text-alu-text-secondary">{story.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-alu-border" />

      {/* Conversations */}
      <div className="flex flex-col">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-alu-hover transition-colors text-left w-full"
          >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-alu-surface flex items-center justify-center text-base font-semibold text-alu-text-secondary">
                {conv.name[0].toUpperCase()}
              </div>
              {conv.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--alu-success)] border-2 border-white" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${conv.unread > 0 ? 'font-bold text-alu-text' : 'font-medium text-alu-text'}`}>
                  {conv.name}
                </span>
                <span className={`text-xs ${conv.unread > 0 ? 'text-[var(--alu-primary)]' : 'text-alu-text-tertiary'}`}>
                  {conv.time}
                </span>
              </div>
              <p className={`text-sm truncate ${conv.unread > 0 ? 'font-medium text-alu-text-secondary' : 'text-alu-text-tertiary'}`}>
                {conv.lastMessage}
              </p>
            </div>
            {/* Unread badge */}
            {conv.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-[var(--alu-primary)] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">{conv.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
