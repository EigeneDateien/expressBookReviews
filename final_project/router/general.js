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
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books found");
        }
    })
    .then((booksData) => {
        res.send(JSON.stringify(booksData, null, 3));
    })
    .catch((error) => {
        res.status(404).send(error);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found for ISBN: " + isbn);
        }
    })
    .then((bookData) => {
        res.send(bookData);
    })
    .catch((errorMessage) => {
        res.status(404).send(errorMessage);
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let requestedAuthor = req.params.author;

    new Promise((resolve, reject) => {
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
            resolve(booksByAuthor);
        } else {
            reject('No books found for the author: ' + requestedAuthor);
        }
    })
    .then((booksData) => {
        res.json(booksData);
    })
    .catch((errorMessage) => {
        res.status(404).send(errorMessage);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let requestedTitle = req.params.title;
    
    new Promise((resolve, reject) => {
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
            resolve(booksByTitle);
        } else {
            reject('No books found for the title: ' + requestedTitle);
        }
    })
    .then((booksData) => {
        res.json(booksData);
    })
    .catch((errorMessage) => {
        res.status(404).send(errorMessage);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]?.reviews);
});

module.exports.general = public_users;
