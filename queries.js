require('dotenv').config();
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  published_year: Number,
  price: Number,
  in_stock: Boolean,
  pages: Number,
  publisher: String
});

const Book = mongoose.model('Book', bookSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Find all books in a specific genre
  const fictionBooks = await Book.find({ genre: "Fiction" });
  console.log(" Fiction Books:", fictionBooks);

  // Find books published after a certain year
  const recentBooks = await Book.find({ published_year: { $gt: 2019 } });
  console.log(" Books after 2019:", recentBooks);

  // Find books by a specific author
  const aliceBooks = await Book.find({ author: "Alice" });
  console.log(" Books by Alice:", aliceBooks);

  // Update the price of a specific book
  await Book.updateOne({ title: "Book One" }, { $set: { price: 18 } });
  console.log(" Price updated for Book One");

  // Delete a book by its title
  await Book.deleteOne({ title: "Book Ten" });
  console.log(" Book Ten deleted"); 

//Task 3
   books = await Book.find({
    in_stock: true,
    published_year: { $gt: 2010 }
  });
  console.log("Books in stock after 2010:", books);
  
  books = await Book.find(
    { in_stock: true, published_year: { $gt: 2010 } },
    { title: 1, author: 1, price: 1, _id: 0 }
  );
  console.log("Projection:", books);
  const ascBooks = await Book.find().sort({ price: 1 });
console.log("Books sorted ascending:", ascBooks);
const descBooks = await Book.find().sort({ price: -1 });
console.log("Books sorted descending:", descBooks);
const page = 2;
const limit = 5;
const skip = (page - 1) * limit;

const paginatedBooks = await Book.find()
  .skip(skip)
  .limit(limit);

console.log(`Page ${page}:`, paginatedBooks);


  // Task 4: Aggregation Pipelines


  // Average price by genre
  console.log("\n Average price by genre:");
  console.log(await Book.aggregate([
    { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } }
  ]));

  // Author with most books
  console.log("\n Author with most books:");
  console.log(await Book.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]));

  // Group books by decade
  console.log("\n Books grouped by decade:");
  console.log(await Book.aggregate([
    {
      $group: {
        _id: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]));


  // Task 5: Indexing
  

  await Book.collection.createIndex({ title: 1 });
  console.log("\n⚡ Index created on title");

  await Book.collection.createIndex({ author: 1, published_year: -1 });
  console.log("⚡ Compound index created on author + published_year");

  const explainPlan = await Book.find({ title: "Book A" }).explain("executionStats");
  console.log("\n🔍 Query plan for finding Book A:");
  console.log(JSON.stringify(explainPlan.executionStats, null, 2));

  
  process.exit();
}

main().catch(err => console.error(err));

