'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '@clerk/nextjs';
import { db } from '../db';
import MediaItem from './MediaItem';
import { pullChanges, pushChanges } from '../syncService';

export default function Feed() {
  const { getToken, isSignedIn } = useAuth();
  const [filter, setFilter] = useState('ai');
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Query from Dexie
  const posts = useLiveQuery(
    () => db.posts.orderBy('timestamp').reverse().toArray(),
    []
  );

  // Sync Logic
  useEffect(() => {
    const runSync = async () => {
      setIsSyncing(true);
      
      // 1. Pull latest from cloud (public feed)
      await pullChanges();

      // 2. Push local changes if logged in
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          await pushChanges(token);
        }
      }
      setIsSyncing(false);
    };

    runSync();
    
    // Optional: Poll for changes every minute
    const interval = setInterval(runSync, 60000);
    return () => clearInterval(interval);

  }, [isSignedIn, getToken]);

  const filteredPosts = posts?.filter(p => filter === 'ai' ? p.is_ai : !p.is_ai) || [];

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4 items-center gap-4">
        <div className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex gap-1 text-sm">
          <button onClick={() => setFilter('ai')} className={`px-3 py-1 rounded-md ${filter === 'ai' ? 'bg-white dark:bg-black' : ''}`}>AI</button>
          <button onClick={() => setFilter('human')} className={`px-3 py-1 rounded-md ${filter === 'human' ? 'bg-white dark:bg-black' : ''}`}>Human</button>
        </div>
        {isSyncing && <span className="text-xs text-zinc-400 animate-pulse">Syncing...</span>}
      </div>
      
      {!posts && <p className="text-center">Loading feed...</p>}
      {posts && filteredPosts.length === 0 && (
        <p className="text-center text-zinc-500">No posts to show for this filter.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id || post._id} className="relative aspect-square border rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <MediaItem post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}