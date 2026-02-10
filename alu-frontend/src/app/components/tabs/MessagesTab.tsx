'use client';

import { useState } from 'react';
import { SearchIcon, MessagesIcon } from '../icons';

export default function MessagesTab() {
  const [search, setSearch] = useState('');

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

      <div className="h-[1px] bg-alu-border" />

      {/* Empty state */}
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-alu-surface flex items-center justify-center mx-auto mb-4 text-alu-text-tertiary">
          <MessagesIcon size={28} />
        </div>
        <p className="text-sm font-semibold text-alu-text mb-1">No messages yet</p>
        <p className="text-xs text-alu-text-tertiary">Start a conversation</p>
      </div>
    </div>
  );
}
