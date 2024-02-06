const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
//get all the validation errors might have been thrown
const { validationResult } = require("express-validator");

const User = require("../models/user");
const domain = require("../util/mydomain");

const API_KEY =
  "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";
const SINGLE_SENDER = "'furniture' sara.momo7112@gmail.com";

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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login-PR",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.E");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          req.flash("error", "Invalid email or password.P");
          return res.redirect("/login");
        }
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup-PR",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      //flash an error 1
      return res.redirect("/signup");
    }
    const token = buffer.toString("hex");
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          name: "temp",
          email: email,
          password: hashedPassword,
          isConfirmed: false,
          confirmToken: token,
          confirmTokenExpiration: Date.now() + 60000 * 120, //120min
          cart: { items: [] },
        });
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");

        return transporter.sendMail({
          to: email,
          from: SINGLE_SENDER,
          subject: "Signup successfully!",
          html: `<h2>Dear ${email}</h2>

            <p>Thank you for signing up for our platform! </p>
            <p>To ensure that you have provided a valid email address</p>
            <p> please click on the link below to verify your account: <a href='${domain(
              req
            )}/confirm/${token}'> Verify </a> </p>
            <p>If you did not sign up for our platform, please ignore this email.</p>
            <p>Thank you for your cooperation.</p>
            <p>Best regards,</p>
            <p>College Team</p>

            `,
        });
        // .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(`${domain(req)}/confirm/${token}`);
        console.log(err);
        const error = new Error(err);
        error.setHttpStatus = 500;
        next(error);
      });
  });
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
        user.resetTokenExpiration = Date.now() + 60000 * 120;
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
              <p> Click this <a href='https://w5vm9jzj-3000.uks1.devtunnels.ms/reset/${token}'> link </a> to set a new password</p>
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
        passwordToken: token,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

//update password
exports.postNewPassword = (req, res, next) => {
  const token = req.body.passwordToken;
  const userId = req.body.userId;
  const password = req.body.password;

  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getConfirmSignup = (req, res, next) => {
  const token = req.params.token;
  console.log(token);
  User.findOne({
    confirmToken: token,
    confirmTokenExpiration: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return console.log("confirmfailed");
    }
    user.isConfirmed = true;
    user.confirmToken = undefined;
    user.confirmTokenExpiration = undefined;
    return user.save().then(() => {
      return res.render("auth/confirm-signup");
    });
  });
};
