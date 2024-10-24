const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Secret key for signing the JWT
const secretKey = 'your_jwt_secret_key';

// Function to check if the username is valid
const isValid = (username) => {
  // Check if the username already exists in the system
  return users.some(user => user.username === username);
}

// Function to check if the username and password match the records
const authenticatedUser = (username, password) => {
  // Check if the provided username and password match any user
  const user = users.find(user => user.username === username && user.password === password);
  return !!user; // Returns true if the user exists, false otherwise
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // If authentication is successful, generate a JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const token = req.headers['authorization'];

  // Verify the JWT token
  if (!token) {
    return res.status(403).json({ message: "Authentication token is missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const username = decoded.username;

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review for the given ISBN
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
