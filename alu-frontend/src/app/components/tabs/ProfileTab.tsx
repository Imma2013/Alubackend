'use client';

import { useState } from 'react';
import { SettingsIcon, LockIcon, LogOutIcon } from '../icons';

const MOCK_CONTENT = {
  posts: [
    { id: 1, color: '#D4A017', isAI: true },
    { id: 2, color: '#B8860B', isAI: false },
    { id: 3, color: '#F5D060', isAI: true },
    { id: 4, color: '#D4A017', isAI: false },
    { id: 5, color: '#B8860B', isAI: true },
    { id: 6, color: '#F5D060', isAI: false },
    { id: 7, color: '#D4A017', isAI: true },
    { id: 8, color: '#B8860B', isAI: false },
    { id: 9, color: '#F5D060', isAI: true },
  ],
  shorts: [
    { id: 1, color: '#D4A017', isAI: true },
    { id: 2, color: '#F5D060', isAI: true },
    { id: 3, color: '#B8860B', isAI: false },
  ],
  videos: [
    { id: 1, color: '#F5D060', isAI: true },
    { id: 2, color: '#D4A017', isAI: false },
  ],
};

type ContentTab = 'posts' | 'shorts' | 'videos' | 'likes' | 'favorites';

export default function ProfileTab() {
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [profileShowAI, setProfileShowAI] = useState(true);
  const [profileShowNormal, setProfileShowNormal] = useState(true);

  const toggleProfileAI = () => {
    if (profileShowAI && !profileShowNormal) return;
    setProfileShowAI(!profileShowAI);
  };
  const toggleProfileNormal = () => {
    if (profileShowNormal && !profileShowAI) return;
    setProfileShowNormal(!profileShowNormal);
  };

  const contentTabs: { key: ContentTab; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'shorts', label: 'Shorts' },
    { key: 'videos', label: 'Videos' },
    { key: 'likes', label: 'Likes' },
    { key: 'favorites', label: 'Favorites' },
  ];

  const rawContent = MOCK_CONTENT[activeContentTab as keyof typeof MOCK_CONTENT] || [];
  const currentContent = rawContent.filter((item) => {
    if (profileShowAI && profileShowNormal) return true;
    if (profileShowAI && !profileShowNormal) return item.isAI;
    if (!profileShowAI && profileShowNormal) return !item.isAI;
    return true;
  });

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-alu-surface flex items-center justify-center text-2xl font-bold text-alu-text-secondary shrink-0">
            Y
          </div>
          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-alu-text">yourname</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-alu-text-secondary hover:text-alu-text transition-colors"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
            <div className="flex gap-6 mb-3">
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">24</span>
                <span className="text-[11px] text-alu-text-tertiary">Posts</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">1.2K</span>
                <span className="text-[11px] text-alu-text-tertiary">Followers</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">348</span>
                <span className="text-[11px] text-alu-text-tertiary">Following</span>
              </div>
            </div>
            <p className="text-sm text-alu-text-secondary">Creating with AI and having fun</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2 rounded-lg text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors">
            Edit Profile
          </button>
          <button className="flex-1 py-2 rounded-lg text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors">
            Share Profile
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="mx-4 mb-4 p-2 bg-alu-surface rounded-xl animate-fade-in">
          <button className="w-full text-left px-3 py-2.5 text-sm text-alu-text hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5">
            <SettingsIcon size={18} />
            Settings
          </button>
          <button className="w-full text-left px-3 py-2.5 text-sm text-alu-text hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5">
            <LockIcon size={18} />
            Privacy
          </button>
          <button className="w-full text-left px-3 py-2.5 text-sm text-alu-danger hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5">
            <LogOutIcon size={18} />
            Log Out
          </button>
        </div>
      )}

      {/* Content Tabs */}
      <div className="border-b border-alu-border">
        <div className="flex overflow-x-auto hide-scrollbar">
          {contentTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveContentTab(tab.key)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-semibold text-center transition-all duration-200 border-b-2 ${
                activeContentTab === tab.key
                  ? 'border-[var(--alu-primary)] text-[var(--alu-primary-dark)]'
                  : 'border-transparent text-alu-text-tertiary hover:text-alu-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI / Normal filter for profile content */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-alu-border-light">
        <span className="text-xs text-alu-text-tertiary mr-1">Show:</span>
        <button
          onClick={toggleProfileAI}
          className={`toggle-pill px-3 py-1 rounded-full text-xs font-medium ${profileShowAI ? 'toggle-pill-active' : 'bg-[var(--alu-surface)] text-[var(--alu-text-tertiary)]'}`}
        >
          AI
        </button>
        <button
          onClick={toggleProfileNormal}
          className={`toggle-pill px-3 py-1 rounded-full text-xs font-medium ${profileShowNormal ? 'toggle-pill-active' : 'bg-[var(--alu-surface)] text-[var(--alu-text-tertiary)]'}`}
        >
          Normal
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {currentContent.length > 0 ? (
          currentContent.map((item) => (
            <div
              key={item.id}
              className="aspect-square relative"
              style={{ background: `linear-gradient(135deg, ${item.color}33, ${item.color}77)` }}
            >
              {item.isAI && (
                <div className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">
                  AI
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <p className="text-sm text-alu-text-tertiary">Nothing here yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
