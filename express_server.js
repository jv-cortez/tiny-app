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

const users = {
  userRandomID: {
    email: "juanvictor.cortez@gmail.com",
    password: "asdf",
  },
  userRandomID: {
    email: "juanvictorcortez@yahoo.ca",
    password: "qwer"
  }
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateRandomIdNumber() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function findUser(username, code) {
  return users.find((user) => user.username == username && user.code == code);
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

app.get("/register", (req, res) => {
  res.render("urls_register", {
    username: req.body.email, password: req.body.password
  })
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404).redirect("/register");
  } else {
    const newId = generateRandomIdNumber();
    users[newId] = { email, password };
    const newRandomId = users[newId];
    res.cookie("newId", newRandomId);
    res.redirect("/urls")
    console.log(users)
  }
  // if (!newRandomId) {
  //   res.redirect("/register");
  // } else {
  //   return res.redirect("/urls");

  // }
})

app.post("/login", (req, res) => {
  let loginName = req.body.username
  if (loginName !== undefined) {
    // const randomID = ........... // res.cookie("name", loginName)
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
  console.log(`What time is it? It's ${PORT} time!`);
});