const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 5544;

app.use(express.json());

mongoose.connect("mongodb+srv://pawa:ahmer123@cluster0.974rwur.mongodb.net/your-database-name"
)
  .then(() => {
    app.listen(PORT, () => {
      console.log("server is running on ther port", PORT);
    })
  }).catch((error) => {
    console.log("something went wrong", error);
  })
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
});

const Book = mongoose.model("Book", bookSchema);
// Add sample data
const sampleBooks = [
  { title: "Biology", author: "Aristotle", genre: "Science" },
  { title: "Chemistry", author: "	R C Mukherjee", genre: "Science" },
  { title: "Physics", author: " Brian Greene", genre: "Science" },
  { title: "History", author: "William Shakespeare", genre: "Social Science" },
  { title: "Literature", author: "William Shakespeare", genre: "Fiction" },
  { title: "Mathematics", author: "Pythagoreans", genre: "Science" },
  { title: "Computer Science", author: "Charles Babbage", genre: "Science" },
  { title: "Psychology", author: "William James", genre: "Social Science" },
  { title: "Art and Design", author: "Jane Bingham", genre: "Arts" },
];
Book.insertMany(sampleBooks)
  .then(() => {
    console.log("Sample books added")
  })
  .catch((error) => console.error("Error adding sample books", error));
// Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Search for books
app.get("/books/search", async (req, res) => {
  const query = req.query.q.toLowerCase();
  try {
    const results = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all authors
app.get("/authors", async (req, res) => {
  try {
    const authors = await Book.distinct("author");
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Add a new book
app.post("/AddBooks", async (req, res) => {
  const newBook = req.body;
  try {
    const result = await Book.create(newBook);
    res.json(result);
    console.log("Book added successfully");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Update a book by ID
app.put("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const updatedBook = req.body;
  
  try {
    const result = await Book.findByIdAndUpdate(bookId, updatedBook, { new: true });

    if (!result) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book updated successfully", updatedBook: result });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Delete a book by ID
app.delete("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  try {
    await Book.findByIdAndDelete(bookId);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// echo "# Book-directory" >> README.md
//   git init
//   git add README.md
//   git commit -m "first commit"
//   git branch -M main
//   git remote add origin git@github.com:AhmerHafeez/Book-directory.git
//   git push -u origin main
