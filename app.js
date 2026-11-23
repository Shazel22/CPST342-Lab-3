// Name: [SKYE HAZEL
// Course: CPST342 - Lab 3

const path = require('path');
const express = require('express');
const dbOperations = require('./database.js');

const app = express();
const port = process.env.PORT || 3000; // allow the port to be configured

/**
 * Serve static files (images, CSS, client-side JavaScript) from the
 * `assets` folder. Example: assets/css/styles.css -> /css/styles.css
 */
app.use(express.static(path.join(__dirname, 'assets')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Parse application/json
app.use(express.json());

// Parse application/x-www-form-urlencoded (HTML form submissions)
app.use(express.urlencoded({ extended: false }));

/* ------------------------- Helpers ------------------------- */

// Validate grocery form input on the server. Never trust the browser alone:
// HTML `required`/`min` attributes can be bypassed.
function validateItem({ item_name, item_count }) {
  const name = typeof item_name === 'string' ? item_name.trim() : '';
  const count = Number(item_count);
  const errors = [];

  if (!name) errors.push('Grocery item name is required.');
  if (name.length > 100) errors.push('Grocery item name must be 100 characters or fewer.');
  if (!Number.isInteger(count) || count < 1) errors.push('Quantity must be a whole number of at least 1.');

  return { errors, item: { item_name: name, item_count: count } };
}

// Validate a record ID coming from a form or URL.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Render the home page with the current list (plus an optional error message).
async function renderIndex(res, { status = 200, errors = [], form = {} } = {}) {
  const rows = await dbOperations.getAllItems();
  res.status(status).render('index', { rows, errors, form });
}

/* -------------------------- Routes -------------------------- */
// Express 4 does not catch errors thrown inside async functions, so each
// async route wraps its work in try/catch and passes errors to next().

// Route to home - display all grocery items
app.get('/', async (req, res, next) => {
  try {
    await renderIndex(res);
  } catch (err) {
    next(err);
  }
});

// Route to create a grocery list item
app.post('/create_item', async (req, res, next) => {
  try {
    const { errors, item } = validateItem(req.body);
    if (errors.length) {
      return await renderIndex(res, { status: 400, errors, form: req.body });
    }

    await dbOperations.createItem(item.item_name, item.item_count);

    // Post/Redirect/Get: redirect after a successful POST so refreshing the
    // page does not submit the form a second time.
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Route that allows me to delete a grocery list item
app.post('/delete_item', async (req, res, next) => {
  try {
    const itemID = parseId(req.body.deleterecord);
    if (!itemID) {
      return await renderIndex(res, { status: 400, errors: ['Invalid item selected.'] });
    }

    await dbOperations.deleteItem(itemID);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// TODO (Done) (Lab 3 - Step 4): add your update route(s) here.
// Route that allows me to update a grocery list item
app.post('/update_item', async (req, res, next) => {
  try {
    // Code reused from create_item route to validate input and update the item 
    const { errors, item } = validateItem(req.body);
    if (errors.length) {
      return await renderIndex(res, { status: 400, errors, form: req.body });
    }
    // Code modified from delete_item route to get itemID and update database
    const itemID = parseId(req.body.updaterecord);
    if (!itemID) {
      return await renderIndex(res, { status: 400, errors: ['Invalid item selected.'] });
    }

    await dbOperations.updateItem(itemID, item.item_name, item.item_count);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});


// Step 5: Route that displays the edit page for one grocery list item
app.get('/edit_item/:id', async (req, res, next) => {
  try {
    const itemID = parseId(req.params.id);
      if (!itemID) {
  return await renderIndex(res, { status: 400, errors: ['Invalid item selected.'] });
}

const item = await dbOperations.getItemById(itemID);
if (!item) {
  return await renderIndex(res, { status: 404, errors: ['That item no longer exists.'] });
}

res.render('edit', { item });
  } catch (err) {
    next(err);
  }
});


/* ---------------------- Error handling ---------------------- */

// 404 - no route matched
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// 500 - something went wrong (must have 4 arguments for Express to treat it
// as an error handler). Log details on the server; don't leak them to users.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('500 - Something went wrong. Check the server console.');
});

/* ----------------------- Start server ----------------------- */

const server = app.listen(port, () => {
  console.log(`Grocery app listening at http://localhost:${port}`);
});

// Shut down gracefully (Ctrl+C) so the database file is closed properly.
process.on('SIGINT', () => {
  server.close(async () => {
    await dbOperations.close();
    console.log('Server stopped and database closed.');
    process.exit(0);
  });
});
