// Management for the user.db database
const migrations = [
   // Initial creation of database
   (db) => {
      // PRAGMA to set journal mode to WAL (Write-Ahead Logging)
      db.execAsync("PRAGMA journal_mode = WAL;");

      // Create children table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS children (
        child_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bday TEXT,
        bio TEXT,
        avatar TEXT,
        color TEXT
      );
    `);

      // Create contacts table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        level INTEGER
      );
    `);

      // Create achievements table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        date INTEGER,
        goal_id INTEGER UNIQUE,
        FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE SET NULL
      );
    `);

      // Create stressors table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS stressors (
        stressor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
      );
    `);

      // Create supports table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS supports (
        support_id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
      );
    `);

      // Create goals table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        date INTEGER,
        met INTEGER,
        child_id INTEGER UNIQUE,
        FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE SET NULL
      );
    `);
   },

   // Additional migrations can be added here
];

export default migrations;

/**
 * Will run all database migrations from the "migrations" array
 */
export async function migrateDbIfNeeded(db) {
   // What verions of the db schema do we want
   const DATABASE_VERSION = 1;

   let currentDbVersion = 0;
   //    let {user_version: currentDbVersion} = await db.getFirstAsync('PRAGMA user_version');
   //    if (currentDbVersion >= DATABASE_VERSION) {
   //        console.log("Database is up-to-date")
   //        return;
   //    }

   migrations.forEach((migrate, i) => {
      console.log(`Migrating DB ${i + 1}/${migrations.length}...`);
      if (currentDbVersion === i) {
         migrate(db);
      }
      currentDbVersion++; // update so additional migrations occur
   });

   // Update DB version
   await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
