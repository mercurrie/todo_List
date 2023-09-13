//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Cluster27213:Test123@cluster27213.acc5fv8.mongodb.net/todoListDB", {usenewUrlParser: true});


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
  Item.find({}).then(data => {
      if (data.length === 0) {
        Item.insertMany([{name: "Welcome to your todolist!"}, {name: "Hit the + button to add a new item."}, {name: "<-- Hit this to delete an item."}]);
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: data});
      }
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(data => {
      data.items.push(item);
      data.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function (err) {
      if (!err) {
        console.error("Error deleting item:", err);
        res.status(500).send("Error deleting item");
      } else {
        console.log("Item deleted successfully.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(data => {
      res.redirect("/" + listName);
    }); 
  }

  
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}).then(data => {
    if (!data) {
      const list = new List({
        name: customListName,
        items: [{name: "Welcome to your todolist!"}, {name: "Hit the + button to add a new item."}, {name: "<-- Hit this to delete an item."}]
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else{
      console.log("List already exists");
      res.render("list", {listTitle: data.name, newListItems: data.items});
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});