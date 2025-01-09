const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});


public_users.get('/', async function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books); 
  })
  .then((bookData) => {
    return res.status(200).json(bookData);
  })
  .catch((error) => {
    return res.status(500).json({ message: "An error occurred" });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (isbn) {
      let book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ message: "Book Not Found Please try another one", status: 300 });
      }
    } else {
      reject({ message: "Invalid ISBN", status: 400 });
    }
  })
  .then((book) => {
    return res.status(200).json(book);
  })
  .catch((error) => {
    return res.status(error.status || 500).json({ message: error.message });
  });
});

  
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author;

  new Promise((resolve, reject) => {
    if (author) {
      let filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ message: "Book Not Found. Please try another Author.", status: 404 });
      }
    } else {
      reject({ message: "Invalid Author", status: 400 });
    }
  })
  .then((filteredBooks) => {
    return res.status(200).json(filteredBooks);
  })
  .catch((error) => {
    return res.status(error.status || 500).json({ message: error.message });
  });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;

  new Promise((resolve, reject) => {
    if (title) {
      let filteredBooks = Object.values(books).filter(book => book.title === title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ message: "Book Not Found. Please try another Title.", status: 404 });
      }
    } else {
      reject({ message: "Invalid Title", status: 400 });
    }
  })
  .then((filteredBooks) => {
    return res.status(200).json(filteredBooks);
  })
  .catch((error) => {
    return res.status(error.status || 500).json({ message: error.message });
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (isbn) {
      let book = books[isbn];
      if (book && book['reviews']) {
        resolve(book['reviews']);
      } else {
        reject({ message: "Yet to be implemented", status: 300 });
      }
    } else {
      reject({ message: "Invalid ISBN", status: 400 });
    }
  })
  .then((reviews) => {
    return res.status(200).json(reviews);
  })
  .catch((error) => {
    return res.status(error.status || 500).json({ message: error.message });
  });
});

module.exports.general = public_users;
