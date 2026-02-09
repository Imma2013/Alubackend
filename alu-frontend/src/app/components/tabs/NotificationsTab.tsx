'use client';

import { HeartIcon, ProfileIcon, CommentIcon, ShareIcon } from '../icons';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'like', user: 'alex_ai', text: 'liked your post', time: '2m ago', read: false },
  { id: 2, type: 'follow', user: 'maya.creates', text: 'started following you', time: '15m ago', read: false },
  { id: 3, type: 'comment', user: 'techvibes', text: 'commented: "This is incredible!"', time: '1h ago', read: false },
  { id: 4, type: 'mention', user: 'artflow', text: 'mentioned you in a comment', time: '3h ago', read: true },
  { id: 5, type: 'like', user: 'filmjunkie', text: 'liked your short', time: '5h ago', read: true },
  { id: 6, type: 'follow', user: 'sarah.k', text: 'started following you', time: '8h ago', read: true },
  { id: 7, type: 'comment', user: 'designpro', text: 'commented: "How did you make this?"', time: '1d ago', read: true },
  { id: 8, type: 'like', user: 'alex_ai', text: 'liked your video', time: '2d ago', read: true },
];

function NotifIcon({ type }: { type: string }) {
  const className = "text-alu-text-tertiary";
  switch (type) {
    case 'like': return <span className="text-[var(--alu-danger)]"><HeartIcon size={18} /></span>;
    case 'follow': return <span className={className}><ProfileIcon size={18} /></span>;
    case 'comment': return <span className={className}><CommentIcon size={18} /></span>;
    case 'mention': return <span className="text-[var(--alu-primary)]"><ShareIcon size={18} /></span>;
    default: return <span className={className}><HeartIcon size={18} /></span>;
  }
}

export default function NotificationsTab() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read);
  const read = MOCK_NOTIFICATIONS.filter(n => n.read);

  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold text-alu-text">Notifications</h2>
      </div>

      {/* Unread section */}
      {unread.length > 0 && (
        <>
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-alu-text-secondary uppercase tracking-wider">New</span>
          </div>
          {unread.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--alu-primary-glow)]"
            >
              <div className="w-10 h-10 rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary shrink-0">
                {notif.user[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-alu-text">
                  <span className="font-semibold">{notif.user}</span>{' '}
                  <span className="text-alu-text-secondary">{notif.text}</span>
                </p>
                <span className="text-xs text-alu-text-tertiary">{notif.time}</span>
              </div>
              <div className="shrink-0">
                <NotifIcon type={notif.type} />
              </div>
            </div>
          ))}
        </>
      )}

      {/* Read section */}
      {read.length > 0 && (
        <>
          <div className="px-4 py-2 mt-2">
            <span className="text-xs font-semibold text-alu-text-secondary uppercase tracking-wider">Earlier</span>
          </div>
          {read.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-alu-hover transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-alu-surface flex items-center justify-center text-sm font-semibold text-alu-text-secondary shrink-0">
                {notif.user[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-alu-text-secondary">
                  <span className="font-semibold text-alu-text">{notif.user}</span>{' '}
                  {notif.text}
                </p>
                <span className="text-xs text-alu-text-tertiary">{notif.time}</span>
              </div>
              <div className="shrink-0 opacity-40">
                <NotifIcon type={notif.type} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
