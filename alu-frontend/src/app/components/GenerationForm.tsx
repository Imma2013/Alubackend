'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { db } from '../db';
import { saveFileFromUrl } from '../fileSystem';

export default function GenerationForm() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('image'); // image, short-video, long-video
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const body = {
      prompt,
      type: type === 'image' ? 'image' : 'video',
      isLongVideo: type === 'long-video',
    };

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("You must be logged in to generate content.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Generation successful, received metadata:', result);
      
      if (result.post && result.post.contentUrl) {
        // 1. Save the file from the cloud URL to the local OPFS
        const fileExtension = result.post.mediaType === 'image' ? 'png' : 'mp4';
        const fileName = `${result.post._id}.${fileExtension}`;
        
        console.log(`Downloading from ${result.post.contentUrl} and saving to OPFS as ${fileName}...`);
        await saveFileFromUrl(result.post.contentUrl, fileName);

        // 2. Add post to Dexie
        await db.posts.add({
          ...result.post,
          contentUrl: fileName, // Use the local path for storage
          synced: 1, // It came from the API, so it is synced
          updatedAt: new Date() 
        });

        console.log('Successfully saved to local DB with OPFS path.');
      }
      
    } catch (err: any) {
      console.error('Full generation process failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cat wearing a tiny top hat..."
          className="w-full p-2 border rounded-md bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
          rows={3}
          required
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="image" checked={type === 'image'} onChange={() => setType('image')} className="accent-blue-500" />
              Image
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="short-video" checked={type === 'short-video'} onChange={() => setType('short-video')} className="accent-blue-500" />
              Short Video
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="type" value="long-video" checked={type === 'long-video'} onChange={() => setType('long-video')} className="accent-blue-500" />
              Long Video
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
}