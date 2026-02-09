'use client';

import { useState } from 'react';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from '../icons';

const MOCK_SHORTS = [
  { id: 1, user: 'artflow', description: 'AI-generated dance animation 🤖💃 #alu #aigenereted', likes: '12.4K', comments: '231', color: '#D4A017' },
  { id: 2, user: 'filmjunkie', description: 'Quick tutorial: color grading in 30 seconds 🎬', likes: '8.7K', comments: '89', color: '#B8860B' },
  { id: 3, user: 'maya.creates', description: 'POV: You discover Alu AI for the first time 😮', likes: '45.2K', comments: '1.2K', color: '#F5D060' },
];

export default function ShortsTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const short = MOCK_SHORTS[currentIndex];

  const toggleLike = () => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(short.id)) next.delete(short.id);
      else next.add(short.id);
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < MOCK_SHORTS.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="w-full h-full flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-[400px] mx-auto" style={{ height: 'calc(100vh - 180px)', maxHeight: '720px' }}>
        {/* Video area */}
        <div
          className="w-full h-full rounded-2xl overflow-hidden relative"
          style={{ background: `linear-gradient(180deg, ${short.color}22 0%, ${short.color}88 60%, ${short.color}dd 100%)` }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            if (y < rect.height / 2) goPrev();
            else goNext();
          }}
        >
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
            </div>
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-16 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
                {short.user[0].toUpperCase()}
              </div>
              <span className="text-white font-semibold text-sm">{short.user}</span>
              <button className="text-xs font-semibold text-white border border-white/40 rounded-full px-3 py-0.5 hover:bg-white/10 transition-colors">
                Follow
              </button>
            </div>
            <p className="text-white text-sm leading-snug">{short.description}</p>
          </div>

          {/* Right side actions */}
          <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
            <button onClick={(e) => { e.stopPropagation(); toggleLike(); }} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-colors ${liked.has(short.id) ? 'text-red-400' : 'text-white'}`}>
                <HeartIcon size={22} />
              </div>
              <span className="text-white text-[11px] font-medium">{short.likes}</span>
            </button>
            <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <CommentIcon size={22} />
              </div>
              <span className="text-white text-[11px] font-medium">{short.comments}</span>
            </button>
            <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <BookmarkIcon size={22} />
              </div>
            </button>
            <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <ShareIcon size={22} />
              </div>
            </button>
          </div>

          {/* Navigation dots */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
            {MOCK_SHORTS.map((_, i) => (
              <div key={i} className={`h-[3px] rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
