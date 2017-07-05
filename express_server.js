var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
   "b2xVn2": "http://www.lighthouselabs.ca",
   "9sm5xK": "http://www.google.com"
};

function generateRandomString(webaddress) {
 var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase 
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const newString = generateRandomString()
  urlDatabase[newString] = req.body.longURL;
  console.log(urlDatabase);
  console.log(req.body);  // debug statement to see POST parameters
  console.log(newString);
  res.send("Ok, Hi there, here is your new URL: http://localhost:8080/urls/" + newString);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", { shortURL: req.params.id, longURL: urlDatabase[req.params.id]
  });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Bone Saw is ready ${PORT}!`);
});