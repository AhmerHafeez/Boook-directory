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
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: String,
    text: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [String],
    dislikedBy: [String],
  }],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
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
//comment on a book
app.post("/books/:id/comments", async (req, res) => {
  const bookId = req.params.id;
  const { user, text } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }
    //addd new comment
    book.comments.push({ user, text });
    const result = await book.save();
    res.status(200).json({ message: "Comment added Successfully", book: result });
  } catch (error) {
    console.log("error adding comment", error);
    res.status(500), json({ error: "Internal server error" })
  }
});
//...like post
app.post("/books/:bookId/comments/:commentsId/like", async (req, res) => {
  const bookId = req.params.bookId;
  const commentsId = req.params.commentsId;
  const userName = req.body.userName;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const comment = book.comments.id(commentsId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user has already disliked the comment
    if (comment.likedBy.includes(userName)) {
      return res.status(400).json({ error: "You have already liked this comment" });
    }

    // Increment the dislikes counter and add the user to dislikedBy array
    comment.likes += 1;
    comment.likedBy.push(userName);

    await book.save();

    // Remove null values from dislikedBy array in the response
    comment.likedBy = comment.likedBy.filter(Boolean);

    res.json({
      message: "Comment liked successfully",
      book: {
        ...book.toObject(),
        comments: book.comments.map(c => ({
          ...c.toObject(),
          likes: c.likes,
          likedBy: c.likedBy,
        })),
      },
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//.............diskike api
app.post("/books/:bookId/comments/:commentId/dislike", async (req, res) => {
  const bookId = req.params.bookId;
  const commentId = req.params.commentId;
  const userName = req.body.userName;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const comment = book.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user has already disliked the comment
    if (comment.dislikedBy.includes(userName)) {
      return res.status(400).json({ error: "You have already disliked this comment" });
    }

    // Increment the dislikes counter and add the user to dislikedBy array
    comment.dislikes += 1;
    comment.dislikedBy.push(userName);
    await book.save();

    // Remove null values from dislikedBy array in the response
    comment.dislikedBy = comment.dislikedBy.filter(Boolean);

    res.json({
      message: "Comment disliked successfully",
      book: {
        ...book.toObject(),
        comments: book.comments.map(c => ({
          ...c.toObject(),
          dislikes: c.dislikes,
          dislikedBy: c.dislikedBy,
        })),
      },
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
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
app.delete("/api/data", async (req, res) => {
  try {
    const result = await Book.deleteMany({});
    res.json({ message: "all data deleted" })
  } catch (error) {
    res.status(404).json({ error: "error deletng data" })
  }
})
// echo "# Book-directory" >> README.md
//   git init
//   git add README.md
//   git commit -m "first commit"
//   git branch -M main
//   git remote add origin git@github.com:AhmerHafeez/Book-directory.git
//   git push -u origin main