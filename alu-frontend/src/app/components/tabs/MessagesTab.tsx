'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { SearchIcon, MessagesIcon } from '../icons';

interface UserResult {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
}

export default function MessagesTab() {
  const { getToken } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — fires 300ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = await getToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const res = await fetch(
          `${backendUrl}/users/search?q=${encodeURIComponent(search.trim())}`,
          { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
        );

        if (res.ok) {
          const data = await res.json();
          setResults(data.users || []);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, getToken]);

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

      {/* Search Results */}
      {results.length > 0 && (
        <div className="divide-y divide-alu-border">
          {results.map((user) => (
            <button
              key={user.userId}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-alu-surface/50 transition-colors text-left"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-alu-surface flex items-center justify-center text-sm font-bold text-alu-text-secondary flex-shrink-0">
                  {(user.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-alu-text truncate">
                  {user.displayName || 'Alu User'}
                </p>
                {user.bio && (
                  <p className="text-xs text-alu-text-tertiary truncate">{user.bio}</p>
                )}
              </div>
              {/* Message icon placeholder — will open chat in the future */}
              <div className="text-alu-text-tertiary">
                <MessagesIcon size={20} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--alu-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* Empty state */}
      {!isSearching && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-alu-surface flex items-center justify-center mx-auto mb-4 text-alu-text-tertiary">
            <MessagesIcon size={28} />
          </div>
          {search.trim() ? (
            <>
              <p className="text-sm font-semibold text-alu-text mb-1">No users found</p>
              <p className="text-xs text-alu-text-tertiary">Try a different name</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-alu-text mb-1">Search for people</p>
              <p className="text-xs text-alu-text-tertiary">Find someone to message</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
