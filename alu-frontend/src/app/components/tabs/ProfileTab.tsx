'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUser, useClerk } from '@clerk/nextjs';
import { db, Post } from '../../db';
import MediaItem from '../MediaItem';
import { SettingsIcon, ShieldIcon, FileTextIcon, LogOutIcon } from '../icons';
import PrivacyPolicy from '../PrivacyPolicy';
import TermsConditions from '../TermsConditions';
import EditProfile from '../EditProfile';
import PostModal from '../PostModal';

type ContentTab = 'posts' | 'shorts' | 'videos' | 'likes' | 'favorites';

export default function ProfileTab() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const userId = user?.id;
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileShowAI, setProfileShowAI] = useState(true);
  const [profileShowNormal, setProfileShowNormal] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Real data from Dexie — user's own posts
  const userPosts = useLiveQuery(
    async () => {
      if (!userId) return [] as Post[];
      return db.posts.where('userId').equals(userId).reverse().sortBy('timestamp');
    },
    [userId]
  );

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

  // Filter by content tab
  const tabFiltered = (userPosts || []).filter((p: Post) => {
    if (activeContentTab === 'posts') return p.mediaType === 'image';
    if (activeContentTab === 'shorts') return p.mediaType === 'video' && (!p.videoType || p.videoType === 'short');
    if (activeContentTab === 'videos') return p.mediaType === 'video' && p.videoType === 'long';
    // likes and favorites — show all for now (post-launch feature)
    return true;
  });

  // Filter by AI/Normal
  const currentContent = tabFiltered.filter((p: Post) => {
    if (profileShowAI && profileShowNormal) return true;
    if (profileShowAI && !profileShowNormal) return p.is_ai;
    if (!profileShowAI && profileShowNormal) return !p.is_ai;
    return true;
  });

  const totalPosts = userPosts?.length || 0;
  const displayName = user?.firstName || user?.username || 'You';
  const avatarLetter = displayName[0]?.toUpperCase() || 'U';
  const userBio = (user?.unsafeMetadata?.bio as string) || 'Creating on Alu';

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id || ''}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = profileUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-alu-surface flex items-center justify-center shrink-0 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-alu-text-secondary">{avatarLetter}</span>
            )}
          </div>
          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-alu-text">{displayName}</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-alu-text-secondary hover:text-alu-text transition-colors"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
            <div className="flex gap-6 mb-3">
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">{totalPosts}</span>
                <span className="text-[11px] text-alu-text-tertiary">Posts</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">0</span>
                <span className="text-[11px] text-alu-text-tertiary">Followers</span>
              </div>
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">0</span>
                <span className="text-[11px] text-alu-text-tertiary">Following</span>
              </div>
            </div>
            <p className="text-sm text-alu-text-secondary">{userBio}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={handleShareProfile}
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors"
          >
            {copiedLink ? 'Copied!' : 'Share Profile'}
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="mx-4 mb-4 p-2 bg-alu-surface rounded-xl animate-fade-in">
          <button
            onClick={() => { setShowPrivacy(true); setShowSettings(false); }}
            className="w-full text-left px-3 py-2.5 text-sm text-alu-text hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5"
          >
            <ShieldIcon size={18} />
            Privacy
          </button>
          <button
            onClick={() => { setShowTerms(true); setShowSettings(false); }}
            className="w-full text-left px-3 py-2.5 text-sm text-alu-text hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5"
          >
            <FileTextIcon size={18} />
            Terms & Conditions
          </button>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2.5 text-sm text-alu-danger hover:bg-alu-hover rounded-lg transition-colors flex items-center gap-2.5"
          >
            <LogOutIcon size={18} />
            Log Out
          </button>
        </div>
      )}

      {/* Privacy Policy overlay */}
      {showPrivacy && <PrivacyPolicy onBack={() => setShowPrivacy(false)} />}

      {/* Terms & Conditions overlay */}
      {showTerms && <TermsConditions onBack={() => setShowTerms(false)} />}

      {/* Edit Profile overlay */}
      {showEditProfile && <EditProfile onBack={() => setShowEditProfile(false)} />}

      {/* Post expand modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

      {/* Content Tabs */}
      <div className="border-b border-alu-border">
        <div className="flex overflow-x-auto hide-scrollbar">
          {contentTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveContentTab(tab.key)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-semibold text-center transition-all duration-200 border-b-2 ${activeContentTab === tab.key
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
          currentContent.map((post) => (
            <div
              key={post._id}
              className="aspect-square relative overflow-hidden bg-alu-surface cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <MediaItem post={post} />
              {post.is_ai && (
                <div className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm z-10">
                  AI
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <p className="text-sm text-alu-text-tertiary">
              {!userPosts ? 'Loading...' : 'Nothing here yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
