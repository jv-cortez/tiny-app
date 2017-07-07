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
    user_id: req.cookies["user_id"]
  }
  next();
});

const urlDatabase = {
  "shortURL": {
    "creator": "user_id",
    "longURL": "http://www.lighthouselabs.ca",
  }
}
//urlsDatabase[id - form the cooke].url should 
// must be dynamic user_id: {

const users = {
  userRandomID1: {
    id: "userRandomID1",
    email: "juanvictor.cortez@gmail.com",
    password: "asdf",
  },
  userRandomID2: {
    id: "userRandomID2",
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

function findUser(email) {
  for (let uid in users) {
    if (email == users[uid].email) {
      return users[uid]
    }
  }
  return undefined
}

function findUserPassword(password) {
  for (let uid in users) {
    if (password == users[uid].password) {
      return users[uid]
    }
  }
  return undefined
}

function findUserID(id) {
  let filteredUrls = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.user_id == id) {
      filteredUrls[shortURL] = url;
    }
  }
  return filteredUrls;
}

app.get("/", (req, res) => {
  var foundUserID = findUserID();
  if (foundUserID !== undefined) {
    res.redirect("login")
  } else {
    res.render("urls_index", { urls: urlDatabase });
  }
});

app.get("/urls", (req, res) => {
  var foundUserID = findUserID();
  if (foundUserID !== undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_index", { urls: urlDatabase });
  }
});
// if (urlDatabase[req.params.id].creator !== req.cookies["user_id"]) {
//   res.status(404).send('Not logged in');
// } else if (urlDatabase[req.params.id].creator === req.cookies["user_id"]) {
//   res.redirect("/urls_index");
// } else {
//   res.redirect("/urls_login");
// }

app.post("/urls", (req, res) => {
  const newString = generateRandomString()
  urlDatabase[newString] = {
    "longURL": req.body.longURL,
    "creator": req.cookies["user_id"]
  };
  res.redirect("/urls/" + newString);
});
//Cannot read property 'grnAJn' of undefined address this bug 
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("/register")
  }
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
    shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]
  });
});

app.get("/register", (req, res) => {
  res.render("urls_register", {
    user: req.body.email, password: req.body.password
  })
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email)
  if (user) {
    res.status(400).send("Invalid email or email exists. Please login instead")
  } else {
    const user_id = generateRandomIdNumber();
    users[user_id] = { id: user_id, email, password };
    const newRandomId = users[user_id];
    res.cookie("user_id", newRandomId);
    res.redirect("/urls")
    console.log("random ID", newRandomId)
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login")
})

app.post("/login", (req, res) => {
  const { email, password } = req.body
  const user = findUser(email)
  // const userPassword = findUserPassword(password)
  if (user && user.password === password) {;
    res.cookie("user_id", user.id)
    res.locals.user_id = user.id
    res.render("urls_index", { urls: urlDatabase })
  } else {
    res.status(403).send("Please login")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("login")
})

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send('No existing URL');
  } else if (urlDatabase[req.params.id].creator === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("urls");
  } else {
    res.send("Invalid user")
  }
});

app.listen(PORT, () => {
  console.log(`What time is it? It's ${PORT} time!`);
});