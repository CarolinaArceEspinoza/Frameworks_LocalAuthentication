// routes/index.js
import express from 'express';
import passport from 'passport';
import User from '../models/user.js';

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Let's Go Camping", user: req.user });
});

// GET /login
router.get("/login", (req, res, next) => {
  let messages = req.session.messages || [];
  req.session.messages = [];
  res.render("login", { title: "Login", messages: messages, user: req.user });
});

// POST /login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/workshops",
    failureRedirect: "/login",
    failureMessage: "Invalid credentials",
  })
);

// GET /register
router.get("/register", (req, res, next) => {
  res.render("register", { title: "Create a new account", user: req.user });
});

// POST /register
router.post("/register", (req, res, next) => {
  User.register(
    new User({
      username: req.body.username,
    }),
    req.body.password,
    (err, newUser) => {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      } else {
        req.login(newUser, (err) => {
          res.redirect("/workshops");
        });
      }
    }
  );
});

// GET /logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    res.redirect("/login");
  });
});

// Autenticación con Google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// Callback de Google después de autenticarse
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/workshops");
  }
);

export default router; // Exportar el router usando export default