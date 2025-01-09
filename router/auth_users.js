const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0 ? false : true;
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  
  
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: '2 days' });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Retrieve ISBN from the route parameter
  const review = req.query.review; // Retrieve the review from the query
  let book = books[isbn]; // Find the book by ISBN

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (req.session.authorization) {
    const username = req.session.authorization.username; // Retrieve the username from the session

    // Check if reviews already exist for the book
    if (!book.reviews) {
      book.reviews = {}; 
    }

    // Add or update the review for the user
    book.reviews[username] = review;
    
    // Return success response
    return res.status(200).json({
      message: `Review added/updated successfully for ISBN ${isbn}`,
      reviews: book.reviews
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Retrieve ISBN from the route parameter
  let book = books[isbn]; // Find the book by ISBN

  // Check if the book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user is logged in
  if (req.session.authorization) {
    const username = req.session.authorization.username; // Retrieve the username from the session

    if (book.reviews && book.reviews[username]) {
      
      delete book.reviews[username];

      return res.status(200).json({
        message: `Review deleted successfully for ISBN ${isbn}`,
        reviews: book.reviews,
      });
    } else {
      return res.status(404).json({
        message: "No review found for the user on this book.",
      });
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
