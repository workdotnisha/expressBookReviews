const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  console.log(users);
  let { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username or password were not given." });

  let usersWithSameName = users.filter((user) => user.username === username);
  if (usersWithSameName.length <= 0) {
    users.push({ username, password });
    return res
      .status(201)
      .json({ message: "The user " + username + " successfully registered." });
  } else {
    return res.status(409).json({ message: "User already exists" });
  }
});

public_users.get("/books-async", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get("/books-async/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
});

public_users.get("/books-async/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
});

public_users.get("/books-async/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
});


// Get the book list available in the shop
public_users.get("/", function (req, res) {
  if (Object.keys(books).length > 0)
    return res.status(200).send(JSON.stringify(books));
  else
    return res
      .status(204)
      .json({ message: "No books available at this moment" });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book));
  } else {
    return res.status(204).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author;
  let booksFilteredByAuthor = Object.values(books).filter(
    (book) => book.author === author
  );
  if (booksFilteredByAuthor) {
    return res.status(200).send(JSON.stringify(booksFilteredByAuthor));
  } else {
    return res.status(200).json({ message: "Book not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  let booksFilteredByTitle = Object.values(books).filter(
    (book) => book.title === title
  );
  if (booksFilteredByTitle) {
    return res.status(200).send(JSON.stringify(booksFilteredByTitle));
  } else {
    return res.status(200).json({ message: "Book not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  let reviews = book.reviews;

  if (Object.keys(reviews).length > 0) {
    return res.status(200).send(JSON.stringify(reviews));
  } else {
    return res.status(200).json({ message: "This book does not have reviews" });
  }
});

module.exports.general = public_users;