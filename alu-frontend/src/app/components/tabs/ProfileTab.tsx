'use client';

import { useState, useEffect } from 'react';
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

interface ProfileTabProps {
  viewUserId?: string | null;
  onBack?: () => void;
  onViewUser?: (userId: string) => void;
}

interface OtherUserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  isPro: boolean;
  counts: { posts: number; shorts: number; videos: number };
}

export default function ProfileTab({ viewUserId, onBack, onViewUser }: ProfileTabProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const userId = user?.id;
  const isOwnProfile = !viewUserId || viewUserId === userId;

  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileShowAI, setProfileShowAI] = useState(true);
  const [profileShowNormal, setProfileShowNormal] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Other user state
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [otherUserPosts, setOtherUserPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch other user's profile + posts when viewing someone else
  useEffect(() => {
    if (isOwnProfile || !viewUserId) {
      setOtherUser(null);
      setOtherUserPosts([]);
      return;
    }

    setLoadingProfile(true);
    setActiveContentTab('posts');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // Fetch profile and posts in parallel
    Promise.all([
      fetch(`${backendUrl}/users/${viewUserId}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null),
      fetch(`${backendUrl}/sync/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
        .then(res => res.ok ? res.json() : { changes: [] })
        .catch(() => ({ changes: [] })),
    ]).then(([profileData, syncData]) => {
      if (profileData) setOtherUser(profileData);
      const userPosts = (syncData.changes || [])
        .filter((p: Post) => p.userId === viewUserId)
        .sort((a: Post, b: Post) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOtherUserPosts(userPosts);
    }).finally(() => setLoadingProfile(false));
  }, [viewUserId, isOwnProfile]);

  // Real data from Dexie — own posts
  const ownPosts = useLiveQuery(
    async () => {
      if (!userId || !isOwnProfile) return [] as Post[];
      return db.posts.where('userId').equals(userId).reverse().sortBy('timestamp');
    },
    [userId, isOwnProfile]
  );

  // Use the right post array based on mode
  const userPosts = isOwnProfile ? (ownPosts || []) : otherUserPosts;

  const toggleProfileAI = () => {
    if (profileShowAI && !profileShowNormal) return;
    setProfileShowAI(!profileShowAI);
  };
  const toggleProfileNormal = () => {
    if (profileShowNormal && !profileShowAI) return;
    setProfileShowNormal(!profileShowNormal);
  };

  const contentTabs: { key: ContentTab; label: string }[] = isOwnProfile
    ? [
        { key: 'posts', label: 'Posts' },
        { key: 'shorts', label: 'Shorts' },
        { key: 'videos', label: 'Videos' },
        { key: 'likes', label: 'Likes' },
        { key: 'favorites', label: 'Favorites' },
      ]
    : [
        { key: 'posts', label: 'Posts' },
        { key: 'shorts', label: 'Shorts' },
        { key: 'videos', label: 'Videos' },
      ];

  // Filter by content tab
  const tabFiltered = userPosts.filter((p: Post) => {
    if (activeContentTab === 'posts') return p.mediaType === 'image';
    if (activeContentTab === 'shorts') return p.mediaType === 'video' && (!p.videoType || p.videoType === 'short');
    if (activeContentTab === 'videos') return p.mediaType === 'video' && p.videoType === 'long';
    return true;
  });

  // Filter by AI/Normal
  const currentContent = tabFiltered.filter((p: Post) => {
    if (profileShowAI && profileShowNormal) return true;
    if (profileShowAI && !profileShowNormal) return p.is_ai;
    if (!profileShowAI && profileShowNormal) return !p.is_ai;
    return true;
  });

  // Own profile display info
  const totalPosts = userPosts.length;
  const ownDisplayName = user?.firstName || user?.username || 'You';
  const ownAvatarLetter = ownDisplayName[0]?.toUpperCase() || 'U';
  const ownBio = (user?.unsafeMetadata?.bio as string) || 'Creating on Alu';

  // Other user display info
  const otherDisplayName = otherUser?.displayName || 'User';
  const otherAvatarLetter = otherDisplayName[0]?.toUpperCase() || 'U';
  const otherBio = otherUser?.bio || '';

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${isOwnProfile ? (user?.id || '') : (viewUserId || '')}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
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

  // Loading state for other profiles
  if (!isOwnProfile && loadingProfile) {
    return (
      <div className="w-full max-w-[600px] mx-auto animate-fade-in">
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[var(--alu-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-alu-text-tertiary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      {/* Back button for other user profiles */}
      {!isOwnProfile && (
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-alu-text-secondary hover:text-alu-text transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-alu-surface flex items-center justify-center shrink-0 overflow-hidden">
            {isOwnProfile ? (
              user?.imageUrl ? (
                <img src={user.imageUrl} alt={ownDisplayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-alu-text-secondary">{ownAvatarLetter}</span>
              )
            ) : (
              otherUser?.avatarUrl ? (
                <img src={otherUser.avatarUrl} alt={otherDisplayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-alu-text-secondary">{otherAvatarLetter}</span>
              )
            )}
          </div>
          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-alu-text">
                {isOwnProfile ? ownDisplayName : otherDisplayName}
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-alu-text-secondary hover:text-alu-text transition-colors"
                >
                  <SettingsIcon size={20} />
                </button>
              )}
            </div>
            <div className="flex gap-6 mb-3">
              <div className="text-center">
                <span className="text-base font-bold text-alu-text block">
                  {isOwnProfile ? totalPosts : (otherUser?.counts?.posts ?? 0) + (otherUser?.counts?.shorts ?? 0) + (otherUser?.counts?.videos ?? 0)}
                </span>
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
            <p className="text-sm text-alu-text-secondary">
              {isOwnProfile ? ownBio : otherBio}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {isOwnProfile ? (
            <>
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
            </>
          ) : (
            <>
              <button
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--alu-primary), var(--alu-primary-light))' }}
                disabled
              >
                Follow (Coming Soon)
              </button>
              <button
                onClick={handleShareProfile}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-alu-surface text-alu-text hover:bg-alu-border transition-colors"
              >
                {copiedLink ? 'Copied!' : 'Share Profile'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings dropdown (own profile only) */}
      {isOwnProfile && showSettings && (
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

      {/* Overlays (own profile only) */}
      {isOwnProfile && showPrivacy && <PrivacyPolicy onBack={() => setShowPrivacy(false)} />}
      {isOwnProfile && showTerms && <TermsConditions onBack={() => setShowTerms(false)} />}
      {isOwnProfile && showEditProfile && <EditProfile onBack={() => setShowEditProfile(false)} />}

      {/* Post expand modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onViewUser={onViewUser} />}

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

      {/* AI / Normal filter */}
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
              {loadingProfile ? 'Loading...' : 'Nothing here yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
