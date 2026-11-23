const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // npm install sqlite3

/**
 * Data-access layer.
 *
 * Best practice: this file ONLY talks to the database. It never touches the
 * Express `req`/`res` objects. Each function returns a Promise so the route
 * handlers in app.js can `await` the result and decide how to respond.
 *
 * The sqlite3 package gives a handful of methods for executing queries:
 *   run: create/alter tables, insert, update or delete rows
 *   get: select a single row
 *   all: select multiple rows
 */

// Resolve the path relative to this file so the app works no matter which
// directory `npm start` is run from.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'grocerydb.db');

// OPEN_CREATE lets a fresh clone (or a deleted .db file) start without errors.
const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Cannot open database:', err.message);
      throw err;
    }
    console.log(`Connected to the SQLite database at ${DB_PATH}`);
  }
);

// Make sure the table exists. IF NOT EXISTS keeps any data already present.
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS grocery_item (
    itemID     INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name  TEXT    NOT NULL,
    item_count INTEGER
  )`);
});

/* ---------- Small Promise wrappers around the callback API ---------- */

// Resolves with { lastID, changes } for INSERT / UPDATE / DELETE statements.
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

/* --------------------------- Queries --------------------------- */
// Always use parameterized queries (the `?` placeholders) — never build SQL
// by concatenating user input. This prevents SQL injection.

// Display all grocery list items
const getAllItems = () =>
  all('SELECT itemID, item_name, item_count FROM grocery_item ORDER BY itemID');

// Get a single grocery list item by its ID (useful for an "edit" page)
const getItemById = (itemID) =>
  get('SELECT itemID, item_name, item_count FROM grocery_item WHERE itemID = ?', [itemID]);

// Create a grocery list item
const createItem = (item_name, item_count) =>
  run('INSERT INTO grocery_item (item_name, item_count) VALUES (?, ?)', [item_name, item_count]);

// Delete a grocery list item
const deleteItem = (itemID) =>
  run('DELETE FROM grocery_item WHERE itemID = ?', [itemID]);

// TODO (Done) (Lab 3 - Step 3): add an `updateItem(itemID, item_name, item_count)`
// function here and add it to module.exports below.
const updateItem = (itemID, item_name, item_count) =>
  run('UPDATE grocery_item SET item_name = ?, item_count = ? WHERE itemID = ?', [item_name, item_count, itemID]);

// Close the connection cleanly when the server shuts down.
const close = () =>
  new Promise((resolve, reject) => db.close((err) => (err ? reject(err) : resolve())));

module.exports = { getAllItems, getItemById, createItem, deleteItem, updateItem, close };