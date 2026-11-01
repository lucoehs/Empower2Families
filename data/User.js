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
        bio TEXT
      );
    `);

      // Create contacts table
      db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
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
        FOREIGN KEY (goal_id) REFERENCES GOALS(goal_id) ON DELETE SET NULL
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
        met INTEGER
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

// TODO sync operations

/**
 * Either insert new item or update existing data
 * @todo this method currently does no sanatization, it's probably fine since it's local but it should. This function should also be moved to the child-info screen
 * @param db
 * @param {string} oldName Value to use for primary key when searching for existing data
 * @param {string} name Value for "name" field
 * @param {string} bday Value for "birthday" field
 * @param {string} bio Value for "bio" field
 */
export async function addUpdateChild(db, id, oldName, name, bday, bio) {
   // make sure no info is null
   if (id === null || name === null || name === "" || oldName === null || oldName === "") {
      return null;
   }
   // select child to update
   const result = await db.getFirstAsync(
      "SELECT * FROM children WHERE child_id = ?;",
      id,
   );

   // if the child doesn't exist make a new one
   if (result === null) {
      return db.runAsync(
         "INSERT INTO children (name, bday, bio) VALUES (?, ?, ?);",
         name,
         bday,
         bio,
      );
   } else {
      return db.runAsync(
         "UPDATE children SET name = ?, bday = ?, bio = ? WHERE name = ?;",
         name,
         bday,
         bio,
         oldName,
      );
   }
}

export async function addContact(db, id, name, phone, level) {
   console.log("adding contact...." + name);
   if (name === null || name === "") {
      return null;
   }
   const result = await db.getFirstAsync(
      "SELECT * FROM CONTACTS WHERE contact_id = ?;",
      id,
   );

   if (result === null) {
      return db.runAsync(
         "INSERT INTO CONTACTS (name, phone, level) VALUES (?, ?, ?);",
         name,
         phone,
         level,
      );
   }
}

export async function delContact(db, id, name, phone, level) {
   if (name === null || name === "") {
      return null;
   }

   console.log("Preparing result...");
   const result = await db.getFirstAsync(
      "DELETE FROM contacts WHERE contact_id = ?;",
      id,
   );
   console.log("Successful result");
   console.log("Result: " + result);

   if (result === null) {
      return db.runAsync("DELETE FROM CONTACTS WHERE contact_id = ?;", id);
   }
}
