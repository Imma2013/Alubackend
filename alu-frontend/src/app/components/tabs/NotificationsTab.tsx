'use client';

import { NotificationsIcon } from '../icons';

export default function NotificationsTab() {
  return (
    <div className="w-full max-w-[600px] mx-auto animate-fade-in">
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold text-alu-text">Notifications</h2>
      </div>

      {/* Empty state */}
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-alu-surface flex items-center justify-center mx-auto mb-4 text-alu-text-tertiary">
          <NotificationsIcon size={28} />
        </div>
        <p className="text-sm font-semibold text-alu-text mb-1">No notifications yet</p>
        <p className="text-xs text-alu-text-tertiary">We'll let you know when something happens</p>
      </div>
    </div>
  );
}
