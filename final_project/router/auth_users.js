const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password required"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if username exists in the session
    if (!req.session || !req.session.authorization || !req.session.authorization.username) {
        return res.status(401).send("You must be logged in to post a review.");
    }
    const username = req.session.authorization.username;

    if (!isbn || !review) {
        return res.status(400).send("ISBN and review are required");
    }
    if (!books[isbn]) {
        return res.status(404).send("Book not found");
    }

    // Add or update the review
    books[isbn].reviews[username] = review;
    res.status(200).send("The review for the book with ISBN " + isbn + " has been added/updated");
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if username exists in the session
    if (!req.session || !req.session.authorization || !req.session.authorization.username) {
        return res.status(401).send("You must be logged in to delete a review.");
    }
    const username = req.session.authorization.username;

    if (!isbn) {
        return res.status(400).send("ISBN is required");
    }
    if (!books[isbn]) {
        return res.status(404).send("Book not found");
    }
    if (!books[isbn].reviews[username]) {
        return res.status(404).send("Review not found for the user " + username);
    }

    // Delete the user's review for the specified ISBN
    delete books[isbn].reviews[username];
    res.status(200).send("Reviews for the ISBN " + isbn + " posted by the user " + username + " deleted.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
