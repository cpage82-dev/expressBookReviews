const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    let userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user to users array
    users.push({ username, password });

    return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/books');
        const booksList = response.data;

        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:5000/books/${isbn}`);
        const book = response.data;

        return res.status(200).json(book);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorParam = req.params.author.toLowerCase();

    try {
        const response = await axios.get('http://localhost:5000/books');
        const allBooks = response.data;

        const results = Object.values(allBooks).filter(book => book.author.toLowerCase() === authorParam);

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleParam = req.params.title.toLowerCase();

    try {
        // Fetch all books from a local /books endpoint
        const response = await axios.get('http://localhost:5000/books');
        const allBooks = response.data;

        // Filter books matching the title (case-insensitive)
        const results = Object.values(allBooks).filter(book => book.title.toLowerCase() === titleParam);

        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
