import Dexie, { Table } from 'dexie';

export interface Post {
  _id: string;  // MongoDB ID — primary key in Dexie (dedup key)
  contentUrl: string;
  safePrompt: string;
  mediaType: 'image' | 'video';
  videoType?: 'short' | 'long';
  is_ai: boolean;
  isLongForm?: boolean;
  timestamp: Date;
  updatedAt?: Date;
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

    // v3 → v4: Switch primary key from auto-increment (++id) to MongoDB _id
    // This prevents duplicate posts when sync pulls the same post that was created locally
    this.version(4).stores({
      posts: '_id, mediaType, timestamp, userId, synced, updatedAt',
      syncState: 'id'
    });

    // Keep v3 declaration so Dexie knows the upgrade path
    this.version(3).stores({
      posts: '++id, mediaType, timestamp, userId, synced, updatedAt',
      syncState: 'id'
    });
  }
}

export const db = new AluDexie();
