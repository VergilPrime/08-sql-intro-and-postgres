'use strict';

// DONE: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json

const pg = require('pg');
const fs = require('fs');
const express = require('express');

// REVIEW: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// DONE: Complete the connection string (conString) for the URL that will connect to your local Postgres database.

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// Windows:
// const conString = 'postgres://postgres:1234@localhost:5432/articles';

// Mac:
const conString = 'postgres://localhost:5432';


// DONE: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
// This is how it knows the URL and, for Windows and Linux users, our username and password for our database when client.connect() is called below. Thus, we need to pass our conString into our pg.Client() call.

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //// When the user adds the /new route its number 2, which is a request from the user to the server. This relates to number 5, which is the response from the controller to the view. It is not connected to the article.js, it is connected when the user adds the /new route to the url. This piece of code would be Read because the user is retrieving data.
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //// This relates to number 3 and 4, which is creating a query that returns a result from the database. The fetchAll method is interacting with this piece because it is getting the results from the "articles" database and sorting and pushing the data into an array. This piece would be the READ because the user is retrieving the article data.
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  // Which method of article.js is interacting with this particular piece of `server.js`?
  // What part of CRUD is being enacted/managed by this particular piece of code?
  //// This relates to number 3, which takes a query from the server to the database. This piece interacts with the insertRecord method by taking the created article object and inserting it into the database.  This would be apart of the Create because it is creating new data.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //// This would relate to number 3 because its only job is to update the database.  This interacts with the updateRecord method which takes the article with the given id and resets its values based on what we give it.  This would be the Update because its modifying the databse.
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //// The number that this corresponds to is 2 and 3 because the user selects an id to delete and sends that to the server which takes the id and deletes the Records for the given id. The deleteRecord is the method that it's interacting with, because the user gives the server an id relative to what they want to delete. The part of CRUD would be the Delete section because it is removing the Record from the database.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //// This relates to number 2 and 3, because it takes the user requesting to delete all of the records from the database. The method it's interacting with would be truncateTable because truncateTable is used to delete all the articles from the database. The part of CRUD would be Delete, because it is removing all of the Records from the database.
  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENTed: What is this function invocation doing?
//// This function is creating a query that creates the articles database if it does not exist with the given fields. and then it loads all the articles based on the hackerIpsum.json.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


function loadArticles() {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //// The number it corresponds to is number 3, because it creates a query that updates the database. It's not connecting to any method in article.js because it is just when the server is initiated. The part of CRUD being enacted is Create and Update because it is Updating the articles database by Creating records.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that Postgres returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENTed: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //// This relates to number 3, because it is creating a database. It's not interacting with any method in article.js because it is only relaying to the database. Create is being enacted because it is creating a database.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
