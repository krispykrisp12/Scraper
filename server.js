// require('dotenv').config();
let express = require("express");
let bodyParser = require("body-parser");
let logger = require("morgan");
let mongoose = require("mongoose");

let axios = require("axios");
let request = require("request");
let cheerio = require("cheerio");

let exphbs = require("express-handlebars");

// ============================================
let path = require("path");
let PORT = process.env.PORT || 3001;
let db = require("./models");

let app = express();
// ============================================
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: true
}));
// ============================================
// connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/News";
mongoose.connect("mongodb://localhost/News", { useNewUrlParser: true });

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// ============================================
// ============================================
// Use express.static to serve the public folder as a static directory
app.use(express.static(__dirname));
// ============================================
// Use express.static to serve the public folder as a static directory
// Handlerbars  
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
// ============================================
app.get("/", function (req, res) {
  res.render("index");
});
// ============================================
app.get("/", function (req, res) {
  db.Article.find({})
    .then(function (articles) {
      res.render("index", {
        articles: articles
      });
    })
    .catch(function (err) {
      res.json(err);
    })
})
// ============================================
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/food").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.story.theme-summary div.story-body").each(function(i, element) {
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      let headline = $(this).find("h2.headline").text().trim() || "Not Found!";
      let link = $(this).find("a").attr("href").trim() || "Not Found!";
      let summary = $(this).find("p.summary").text().trim() || "Not Found!";
      let author = $(this).find("p.byline").text().trim() || "Not Found!";


      
      if (headline  && summary && author && link) {
        result.link = link;
        result.headline = headline;
        result.summary = summary;
        result.author = author;
      
      // --------------------------------------------------
      // console.log(results);
      // --------------------------------------------------

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(articles) {
          // View the added result in the console
          console.log(articles);
          // res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        })
        
      } //end of the if statment
      else {
        console.log("Not everything is being returned");
      };
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    // res.send("Scrape Complete");
  });
});
// ==================================================================
// ==================================================================
// ==================================================================
// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// =====================================================
app.delete("/delete", function(req, res) {
  db.Article.deleteMany({}, function(err){
    if (err) {
      console.log(err);
    }
  });
})

// Start the server
app.listen(PORT, function() {
    console.log(`App running on port ${PORT} !`);
  });