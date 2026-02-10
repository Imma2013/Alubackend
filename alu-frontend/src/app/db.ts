import Dexie, { Table } from 'dexie';

export interface Post {
  _id?: string; // MongoDB ID
  id?: number;  // Local Dexie ID
  contentUrl: string;
  safePrompt: string;
  mediaType: 'image' | 'video';
  videoType?: 'short' | 'long';
  is_ai: boolean;
  isLongForm?: boolean;
  timestamp: Date;
  updatedAt?: Date; // For sync
  userId: string;
  synced?: number; // 0 = not synced, 1 = synced
  thumbnailUrl?: string;
  likes?: number;
  originalPrompt?: string;
  caption?: string;
  visibility?: 'everyone' | 'followers' | 'private';
}

export interface SyncState {
  id: string; // 'lastPull'
  timestamp: string; // ISO Date string
}

export class AluDexie extends Dexie {
  posts!: Table<Post>;
  syncState!: Table<SyncState>;

  constructor() {
    super('aluDatabase');
    this.version(3).stores({
      posts: '++id, mediaType, timestamp, userId, synced, updatedAt',
      syncState: 'id'
    });
  }
}

export const db = new AluDexie();