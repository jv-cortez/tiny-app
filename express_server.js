const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'development',
  maxAge: 24 * 60 * 60 * 1000
}));

app.use((req, res, next) => {
  res.locals = {
    user_id: req.session.userId
  }
  next();
});

const bcrypt = require('bcrypt');
const salt = 10;

const urlDatabase = {
  "5gwPxY": {
    "creator": "user_id",
    "longURL": "http://www.lighthouselabs.ca",
  }
};

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
};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

function generateRandomIdNumber() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

function findUser(email) {
  for (let uid in users) {
    if (email == users[uid].email) {
      return users[uid]
    }
  }
  return undefined
};

function findUserPassword(password) {
  for (let uid in users) {
    if (password == users[uid].password) {
      return users[uid]
    }
  }
  return undefined
};

function findUserID(id) {
  let filteredUrls = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.user_id == id) {
      filteredUrls[shortURL] = url;
    }
  }
  return filteredUrls;
};

app.get("/", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect("login")
  } else {
    res.render("urls_index", { urls: urlDatabase });
  }
});

app.get("/urls", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_index", { urls: urlDatabase });
  }
});

app.post("/urls", (req, res) => {
  const newString = generateRandomString()
  urlDatabase[newString] = {
    "longURL": req.body.longURL,
    "creator": req.session.userId
  };
  res.redirect("/urls/" + newString);
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new")
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURLObject = urlDatabase[req.params.shortURL]
  if (longURLObject.longURL === undefined) {
    res.status(404).send('No existing URL');
  } else {
    res.redirect(longURLObject.longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {
    shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.session.userId]
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
  if (user !== undefined) {
    res.status(400).send("Invalid email or email exists. Please login instead")
  } else {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        res.send("There was an error creating your account.")
        return
      }
      const user_id = generateRandomIdNumber();
      users[user_id] = { id: user_id, email, password: hash };
      req.session.userId = password;
      res.redirect("/urls")
    })
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  const user = findUser(email);
  bcrypt.compare(password, user.password, function (err, matched) {
    if (matched) {
      req.session.userId = user.id;
      res.locals.user_id = user.id;
      res.render("urls_index", { urls: urlDatabase });
    } else {
      res.status(403).send("Email not found. Please register. You won't regret it!");
    }
  })
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("login")
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send('No existing URL');
  } else if (urlDatabase[req.params.id].creator === req.session.userId) {
    delete urlDatabase[req.params.id];
    res.redirect("/");
  } else {
    res.send("Invalid user")
  }
});

app.listen(PORT, () => {
  console.log(`What time is it? It's ${PORT} time!`);
});