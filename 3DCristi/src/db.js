import Dexie from 'dexie';

export const db = new Dexie('TourDB');

// Update schema: '++id' means auto-incrementing unique ID
// We store 'name', 'fileData', and 'previewUrl' (optional helper)
db.version(2).stores({
  tours: '++id, name, date' 
});