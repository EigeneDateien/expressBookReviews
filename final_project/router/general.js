const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some(user => user.username === username);
}

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (doesExist(username)) {
        return res.status(409).json({ message: "Customer already exists!" });
    }
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,3));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let requestedAuthor = req.params.author;
    let booksByAuthor = {"booksbyauthor": []};

    for (let key in books) {
        if (books[key].author === requestedAuthor) {
            booksByAuthor.booksbyauthor.push({
                "isbn": key,
                "title": books[key].title,
                "reviews": books[key].reviews
            });
        }
    }

    if (booksByAuthor.booksbyauthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).send('No books found for the author: ' + requestedAuthor);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let requestedTitle = req.params.title;
    let booksByTitle = {"booksbytitle": []};

    for (let key in books) {
        if (books[key].title === requestedTitle) {
            booksByTitle.booksbytitle.push({
                "isbn": key,
                "author": books[key].author,
                "reviews": books[key].reviews
            });
        }
    }

    if (booksByTitle.booksbytitle.length > 0) {
        res.json(booksByTitle);
    } else {
        res.status(404).send('No books found for the title: ' + requestedTitle);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]?.reviews);
});

module.exports.general = public_users;
