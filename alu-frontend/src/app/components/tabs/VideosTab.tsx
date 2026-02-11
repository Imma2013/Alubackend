'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Post } from '../../db';
import MediaItem from '../MediaItem';
import { VideosIcon } from '../icons';

export default function VideosTab() {
  const videos = useLiveQuery(
    async () => {
      const all = await db.posts.where('mediaType').equals('video').toArray();
      return all
        .filter((p: Post) => p.videoType === 'long')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    []
  );

  const videoList = videos || [];

  if (videoList.length === 0) {
    return (
      <div className="w-full max-w-[960px] mx-auto animate-fade-in">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-alu-surface flex items-center justify-center mx-auto mb-4 text-alu-text-tertiary">
            <VideosIcon size={28} />
          </div>
          <p className="text-sm font-semibold text-alu-text mb-1">No videos yet</p>
          <p className="text-xs text-alu-text-tertiary">Long-form videos will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[960px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {videoList.map((video) => {
          const key = video._id;
          return (
            <button key={key} className="group text-left w-full">
              {/* Thumbnail */}
              <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-alu-surface">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full">
                    <MediaItem post={video} />
                  </div>
                )}
                {/* Play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
                  </div>
                </div>
                {video.is_ai && (
                  <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                    AI
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex gap-2.5 mt-2.5 px-0.5">
                <div className="w-8 h-8 rounded-full bg-alu-surface flex items-center justify-center text-xs font-semibold text-alu-text-secondary shrink-0 mt-0.5">
                  {(video.userId || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-alu-text leading-snug line-clamp-2 group-hover:text-[var(--alu-primary-dark)] transition-colors">
                    {video.safePrompt || 'Video'}
                  </h3>
                  <p className="text-xs text-alu-text-tertiary mt-0.5">
                    {video.userId?.slice(0, 12) || 'User'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
