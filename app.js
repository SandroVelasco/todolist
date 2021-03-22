//jshint esversion:6

// Requires
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

// Express defines
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// Mongoose
mongoose.connect(
    "A DEFINIR",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// Item
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const initialItems = [
  new Item({
    name: "Go to school"
  }), 
  new Item({
    name: "Go to work"
  }),
  new Item({
    name: "Go to home"
  })
];



const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {  

  Item.find({}, (err, results) => {
    if(results.length === 0) {
      const newItem = new Item({
        name: "Item 01"
      })

      newItem.save();

      res.redirect("/");
    } else {
      res.render("list", { listName: "Today", newListItems: results });
    }
  });
});

app.post("/", function(req, res){

  let newItem = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: newItem
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, list) {
      if(!err) {
        list.items.push(item);
        list.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:listName", function (req, res) {
  const listName = _.capitalize(req.params.listName);

  // Insert listName on collection of lists if not exists
  List.findOne({name: listName}, function(err, results) {
    if(!results) {
      const newList = new List({
          name: listName,
          items: [
              new Item({ name: "Item 01" }),
              new Item({ name: "Item 02" }),
              new Item({ name: "Item 03" }),
          ],
      });

      newList.save();
      
      res.redirect("/" + listName);
    } else {
      res.render("list", { listName: results.name, newListItems: results.items });
    }
  })
});

app.post("/delete", (req, res) => {
  const checkedCheckboxId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.deleteOne({ _id: checkedCheckboxId }, function () {});

    res.redirect("/");
  } else {
    List.updateOne({name: listName}, {$pull: {items: {_id: checkedCheckboxId}}}, function(err, docs) {
      if(err) console.log("Error ocurred", err);

      res.redirect("/" + listName);
    });
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
