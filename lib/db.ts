import Dexie, { Table } from 'dexie';

export interface FileStore {
  id: number;
  blob: File;
}

export class AppDatabase extends Dexie {
  files!: Table<FileStore>; 

  constructor() {
    super('multimedia-slideshow');
    // Fix for: Property 'version' does not exist on type 'AppDatabase'.
    // The schema definition for a Dexie database should be done within the constructor.
    this.version(1).stores({
      files: 'id'
    });
  }

  async clearAll() {
    await this.files.clear();
  }
}

export const db = new AppDatabase();
