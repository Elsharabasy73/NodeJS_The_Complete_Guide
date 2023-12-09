const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");
const user = require("../models/user");

const API_KEY =
  "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";
const SINGLE_SENDER = "sara.momo7112@gmail.com";

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  const errorMessageList = req.flash("error");
  const errorMessage = errorMessageList ? errorMessageList[0] : null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage, // Pass the stored flash message to the view
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessageList = req.flash("error");
  const errorMessage = errorMessageList ? errorMessageList[0] : null;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          console.log("user login: ", user);
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          return res.redirect("/login");
        }
      });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", `This email '${email}' already exist`);
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          return transporter
            .sendMail({
              to: email,
              from: SINGLE_SENDER,
              subject: "Signup successfully!",
              html: "<h1>hi from us. </h1>",
            })
            .catch((err) => console.log(err));
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  const errorMessageList = req.flash("error");
  const errorMessage = errorMessageList ? errorMessageList[0] : null;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: errorMessage, // Pass the stored flash message to the view
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  return crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("asdfa", err);
      res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    //find user
    User.findOne({ email: email })
      .then((user) => {
        //not found
        if (!user) {
          req.flash(
            "error",
            `This email '${email}' you want to reset dosen't exist`
          );
          return res.redirect("/signup");
        }
        //found
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 6000 * 120;
        console.log();
        return user.save().then((result) => {
          res.redirect("/login");
          return transporter
            .sendMail({
              to: email,
              from: SINGLE_SENDER,
              subject: "Reset your password!",
              html: `
              <h1>Ready to Reset?</h1>
              <p> Click this <a href='http://localhost:3000/reset/${token}'> link </a> to set a new password</p>
              `,
            })
            .catch((err) => console.log("asdfa", err));
        });
      })
      .catch((err) => console.log("adsf", err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  const errorMessageList = req.flash("error");
  const errorMessage = errorMessageList ? errorMessageList[0] : null;

  console.log("token", token);
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/new-password", {
        path: "/reset",
        pageTitle: "Reset",
        errorMessage: errorMessage, // Pass the stored flash message to the view
        userId: user._id.toString(),
      });
    })
    .catch((err) => console.log(err));
};
