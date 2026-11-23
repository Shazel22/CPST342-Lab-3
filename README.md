#  Nodejs Express Grocery List App - Adding Update Feature (Lab 3) 
You are going to extend the functionality of an existing application by adding an update feature to the application provided. 

![Image of Lab 3 Functionality](https://instructorc.github.io/site/slides/logic/images/node/lab3-review.gif)
## Requirements

### Step 1 - Setup project folder and start-up server
1.  Create a copy of the repository by forking and opening the repository in your editor.  Once development environment is setup, install the dependencies needed to run the application.  The package.json file has already been created and identifies the packages your repository will depend upon.
    ```bash
    npm install
    ```
2.  Start the server and make sure you are able to create and delete grocery items at [http://localhost:3000](http://localhost:3000).
    ```bash
    npm run dev   # development: restarts automatically when you save (nodemon)
    npm start     # production-style start with plain node
    ```
3.  Take a few minutes to read the starter code before you change anything. Note how responsibilities are separated:

    | File | Responsibility |
    | --- | --- |
    | `database.js` | Talks to SQLite **only**. Each function returns a Promise and never touches `req`/`res`. |
    | `app.js` | Routes. Validates input, `await`s the database function, then redirects or renders. |
    | `views/index.hbs` | The HTML template (Handlebars). |
    | `assets/css/styles.css` | Custom styles, served by `express.static`. |

    Look for the `TODO (Lab 3 - Step X)` comments. They mark where your code goes.

### Step 2 - Adjust the front-end code to include an Update button
Listed below are a few steps that will help you accomplish adding an Update button
1.  Navigate to the link below and select a button to add to your HTML code.
	1.  [Link to Bootstrap Button Options](https://getbootstrap.com/docs/4.6/components/buttons/)
    2.  Select one of the button styles from the page. For example, in the code below, I selected the warning button and added the text **"Update"** between the opening and closing button element.
        ```html
         <button type="button" class="btn btn-warning">Update</button>
        ```

	3.  Add a new form element similar to the delete button and add the button as a child element. Your code should look similar to what's below.
        ```html
         <form action="/[ADD YOUR OWN UPDATE PATH]" method="[GET OR POST - SEE NOTE BELOW]">
            <button name="[ADD A NAME]" type="submit" class="btn btn-warning btn-sm" value="{{this.itemID}}">Update</button>
         </form>
        ```
        > **Best practice:** Use `GET` only to *display* something (for example, an edit page) and `POST` for anything that *changes* data (the actual update). Never change data with a `GET` request: browsers, crawlers and link prefetchers may call GET URLs on their own.
        >
        > Do not add an `id` attribute to elements inside `{{#each}}`. The loop would create the same `id` on every row, and an `id` must be unique on the page.
	4. You will need to update the action path and method values based on how you create your route in step 3.
    5. Make sure your update button has ```{{this.itemID}}``` specified for the value.  This is necessary so that we identify which record to update.
2.  Save your code, start up the server and visually inspect to make sure the button properly displays next to the delete button. 

### Step 3 - Create the database function that allows you to execute the UPDATE SQL command
1.  Navigate to the database.js file and include statements that will allow you to execute an update on a specific record. Follow the pattern used by `createItem` and `deleteItem`. An example of what your function might look like is listed below.
    ```javascript
    // Update a grocery list item
    const updateItem = (itemID, item_name, item_count) =>
      run('[YOUR SQL STATEMENT]', [/* parameters in the same order as the ? placeholders */]);
    ```
    * Your function needs the **itemID** so that the `WHERE` clause updates only one record. Without a `WHERE` clause, *every* row is updated.
    * Use `?` placeholders (a **parameterized query**) for every value. Never build SQL by joining strings with user input, because that allows SQL injection.
    * Do not pass `res` into the database layer. The route decides how to respond.
2. Make sure your function properly makes a call to the database before implementing it into a route. The resolved value includes `changes`. If it is `0`, no row matched the ID.
3. Make sure the function is able to be exported to different files (add it to `module.exports`).
### Step 4 - Define a Route/URL path
1.  Navigate to the app.js and create a route that will allow you to update a selected item. An example of what your route might look like is listed below.
    ```javascript
      app.post('/update_item', async (req, res, next) => {
        try {
          // 1. Read and validate the values from req.body (see validateItem and parseId in app.js)
          // 2. await dbOperations.updateItem(...)
          // 3. res.redirect('/')   <- Post/Redirect/Get: refreshing the page won't resubmit the form
        } catch (err) {
          next(err); // passes the error to the error-handling middleware
        }
      })
    ```
2.  Always validate input on the **server**, even if your HTML form uses `required` or `min`. Browser checks are easy to bypass.
3.  Add your route **above** the 404 and error-handling middleware at the bottom of app.js. Express runs middleware in order, so routes added after them are never reached.
		
### Step 5 - Implement functionality to update a record. [Stretch Requirement]
There are a number of ways you can go about achieving this objective.  Think creatively about a solution and plan out your logic before attempting to implement the functionality.  This would be a good opportunity to create a new branch and experiment with different ways in which you can allow a record to be updated.  Listed below are a few ideas to get you started.
	
1.  When the Update button is clicked, you can have the end-user navigate to a different page to re-enter and update grocery item information. (Hint: a `GET /edit_item/:id` route can use `dbOperations.getItemById(id)` to pre-fill an edit form, which then `POST`s to your update route.)

2.  You can use the existing form used to create a record and change the action value to a new route. This would require the use of JavaScript and the ability to change the attribute value.
	
3. You can add an entirely new form on the index page that would be used solely to update a record.  This is probably the easiest way to implement functionality, but not user-friendly. 


### STEP 6 - Extra Credit (2 Points) 
1.  Add a new column to your database table.  The new column will allow the end user to add a description for each item.
    * Use an `ALTER TABLE grocery_item ADD COLUMN ...` statement, and update the `CREATE TABLE IF NOT EXISTS` statement in database.js so that a brand-new database also gets the column.
    * Remember to update your `SELECT`, `INSERT` and `UPDATE` queries, the form and the table in index.hbs, and your server-side validation.

### STEP 7 - GitHub Repository
1.  Adjust README.md file at the end to include the date of completion and course information.

### STEP 8 - Submission
1.  Add your name to the comment at the top of the app.js file.
2.  Make sure your main branch is clean and push up your final changes.
3.  In Sakai, submit the URL to your repository

### Lab Resources
The lecture videos listed under week 5 will walk you through how the application is built.

[SQLite Update Example](https://www.sqlitetutorial.net/sqlite-update/)

[Express - Routing](https://expressjs.com/en/guide/routing.html)

[Express - Error Handling](https://expressjs.com/en/guide/error-handling.html)

[MDN - Post/Redirect/Get and HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

[OWASP - SQL Injection Prevention (Parameterized Queries)](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

### Submission Information
Name: SKYE HAZEL
Course: CPST342 - Lab 3
Completion Date: November 22nd, 2026