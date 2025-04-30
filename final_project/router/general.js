
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} registered`});
        }
        else {
            return res.status(400).json({message:`User ${username} already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooks().then((bks) => res.send(JSON.stringify(bks)));
});

function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getByISBN(req.params.isbn)
  .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({message: error.message})
  );
});

module.exports.general = public_users;



async function fetchBooksWithAxios() {
    try {
        const response = await axios.get("http://localhost:5000/");
        console.log("Books fetched using Axios + async/await:");
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching books:", error.message);
    }
}

fetchBooksWithAxios();


async function fetchBookDetails(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`Book details for ISBN ${isbn}:`);
        console.log(response.data);
    } catch (error) {
        console.error(`Error fetching book details for ISBN ${isbn}:`, error.message);
    }
}

// Example usage: Fetch details for a specific book
fetchBookDetails(1); // Replace 1 with the ISBN of the book you want to fetch


async function fetchBooksByAuthor(author) {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Books by author ${author}:`);
        console.log(response.data);
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
    }
}

// Example usage: Fetch books by a specific author
fetchBooksByAuthor("Jane Austen"); // Replace with the author you want to fetch


async function fetchBooksByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Books with title ${title}:`);
        console.log(response.data);
    } catch (error) {
        console.error(`Error fetching books with title ${title}:`, error.message);
    }
}

// Example usage: Fetch books by a specific title
fetchBooksByTitle("Fairy Tales"); 
