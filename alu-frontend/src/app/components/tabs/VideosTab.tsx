'use client';

const MOCK_VIDEOS = [
  { id: 1, title: 'How I Built a Social Network in 48 Hours', user: 'techvibes', views: '14K views', time: '2 days ago', duration: '8:42', color: '#D4A017' },
  { id: 2, title: 'AI Art Revolution: What Creators Need to Know', user: 'artflow', views: '32K views', time: '1 week ago', duration: '5:17', color: '#B8860B' },
  { id: 3, title: 'The Future of Social Media is Local-First', user: 'alex_ai', views: '8.9K views', time: '3 days ago', duration: '10:00', color: '#F5D060' },
  { id: 4, title: 'Color Theory for Digital Content Creators', user: 'maya.creates', views: '21K views', time: '5 days ago', duration: '7:23', color: '#D4A017' },
  { id: 5, title: 'Building in Public: Week 1 Update', user: 'filmjunkie', views: '5.2K views', time: '1 day ago', duration: '3:45', color: '#B8860B' },
  { id: 6, title: 'Generate Videos with AI — Full Tutorial', user: 'techvibes', views: '67K views', time: '2 weeks ago', duration: '9:58', color: '#F5D060' },
];

export default function VideosTab() {
  return (
    <div className="w-full max-w-[960px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {MOCK_VIDEOS.map((video) => (
          <button key={video.id} className="group text-left w-full">
            {/* Thumbnail */}
            <div
              className="w-full aspect-video rounded-xl overflow-hidden relative"
              style={{ background: `linear-gradient(135deg, ${video.color}22 0%, ${video.color}55 50%, ${video.color}88 100%)` }}
            >
              {/* Play icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                {video.duration}
              </div>
            </div>
            {/* Info */}
            <div className="flex gap-2.5 mt-2.5 px-0.5">
              <div className="w-8 h-8 rounded-full bg-alu-surface flex items-center justify-center text-xs font-semibold text-alu-text-secondary shrink-0 mt-0.5">
                {video.user[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-alu-text leading-snug line-clamp-2 group-hover:text-[var(--alu-primary-dark)] transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-alu-text-tertiary mt-0.5">
                  {video.user} · {video.views} · {video.time}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
