const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.use((req, res, next) => {
  res.locals = {
    username: req.cookies["name"]
  }
  next();
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const newString = generateRandomString()
  urlDatabase[newString] = req.body.longURL;
  res.redirect("/urls/" + newString);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  if (longURL === undefined) {
    res.status(404).send('No existing URL');
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.id, longURL: urlDatabase[req.params.id]
  });
});

app.post("/login", (req, res) => {
  let loginName = req.body.username
  if (loginName !== undefined) {
    res.cookie("name", loginName)
    res.redirect("/urls")
  } else {
    res.status(404).send("Please login")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("name")
  res.redirect("/urls")
})

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  console.log(urlDatabase[shortURL]);
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send('No existing URL');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Bone Saw is ready ${PORT}!`);
});