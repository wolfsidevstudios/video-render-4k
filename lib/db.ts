import Dexie, { Table } from 'dexie';

export interface FileStore {
  id: number;
  blob: File;
}

export class AppDatabase extends Dexie {
  files!: Table<FileStore>; 

  constructor() {
    super('multimedia-slideshow');
  }

  async clearAll() {
    await this.files.clear();
  }
}

export const db = new AppDatabase();

// Fix for: Property 'version' does not exist on type 'AppDatabase'.
// Moved schema definition out of the constructor to avoid potential `this` typing
// issues within the class constructor.
db.version(1).stores({
  files: 'id'
});