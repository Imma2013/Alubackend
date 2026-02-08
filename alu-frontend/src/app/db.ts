import Dexie, { Table } from 'dexie';

export interface Post {
  _id?: string; // MongoDB ID
  id?: number;  // Local Dexie ID
  contentUrl: string;
  safePrompt: string;
  mediaType: 'image' | 'video';
  is_ai: boolean;
  timestamp: Date;
  updatedAt?: Date; // For sync
  userId: string;
  synced?: number; // 0 = not synced, 1 = synced
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
    this.version(2).stores({ // Increment version for schema change
      posts: '++id, mediaType, timestamp, userId, synced, updatedAt', 
      syncState: 'id'
    });
  }
}

export const db = new AluDexie();