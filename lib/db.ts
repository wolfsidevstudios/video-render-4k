import Dexie, { Table } from 'dexie';

export interface FileStore {
  id: number;
  blob: File;
}

export class AppDatabase extends Dexie {
  files!: Table<FileStore>; 

  constructor() {
    super('multimedia-slideshow');
    this.version(1).stores({
      // FIX: The `blob` property cannot be indexed, and the primary key is provided by the app, so it should be 'id' instead of '++id'.
      files: 'id'
    });
  }
}

export const db = new AppDatabase();