'use client';

import { useEffect, useState } from 'react';
import { getFileUrl } from '../fileSystem';
import { Post } from '../db';

export default function MediaItem({ post }: { post: Post }) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // The contentUrl from Dexie is now just a filename.
    // We need to get a temporary blob URL from the OPFS to display it.
    if (post.contentUrl) {
      getFileUrl(post.contentUrl)
        .then(url => {
          if (isMounted) {
            setLocalUrl(url);
          }
        })
        .catch(err => {
          console.error(`Could not load media for ${post.contentUrl}:`, err);
        });
    }

    return () => {
      isMounted = false;
      // Revoke the blob URL when the component unmounts to free up memory
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [post.contentUrl, localUrl]);

  if (!localUrl) {
    // Placeholder while the local file URL is being loaded
    return <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>;
  }

  return (
    <>
      {post.mediaType === 'image' ? (
        <img src={localUrl} alt={post.safePrompt} className="object-cover w-full h-full" />
      ) : (
        <video src={localUrl} controls className="object-cover w-full h-full" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs text-white truncate">{post.safePrompt}</p>
      </div>
    </>
  );
}
