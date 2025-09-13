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
      files: 'id'
    });
  }

  async clearAll() {
    await this.files.clear();
  }
}

export const db = new AppDatabase();