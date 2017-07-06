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
    user: req.cookies["name"]
  }
  next();
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID1: {
    email: "juanvictor.cortez@gmail.com",
    password: "asdf",
  },
  userRandomID2: {
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
      return true
    }
  }
  return false
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
      users[user_id] = { email, password };
      const newRandomId = users[user_id];
      res.cookie("user_id", newRandomId);
      res.redirect("/urls")
    }
  });

  app.get("/login", (req, res) => {
   res.render("urls_login")
  })

  app.post("/login", (req, res) => {
    let loginName = req.body.email;
    const user = findUser(loginName)
    if (user !== undefined) {    
      const randomID =  res.cookie("user_id", loginName)
      res.redirect("/urls")
    } else {
      res.status(403).send("Please login")
      res.redirect('/')
    }
  });

  app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
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