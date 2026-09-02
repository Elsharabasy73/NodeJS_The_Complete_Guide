const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
//get all the validation errors might have been thrown
const { validationResult } = require("express-validator");

const User = require("../models/user");
const domain = require("../util/mydomain");

// Use Gmail SMTP credentials from environment (.env loaded in app.js)
const SENDER_EMAIL =
  process.env.SENDER_EMAIL || process.env.SENDGRID_SENDER || null;
const SENDER_PASSWORD =
  process.env.SENDER_PASSWORD || process.env.SENDGRID_PASSWORD || null;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD,
  },
});

const sendEmail = async (options) => {
  if (!SENDER_EMAIL || !SENDER_PASSWORD) {
    throw new Error(
      "Missing SENDER_EMAIL or SENDER_PASSWORD environment variable.",
    );
  }

  try {
    const info = await transporter.sendMail({
      ...options,
      from: { name: "Furniture Shop", address: SENDER_EMAIL },
      replyTo: SENDER_EMAIL,
    });

    console.log("Email SMTP result:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      response: info.response,
    });

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error(`SMTP did not accept email for ${options.to}.`);
    }

    return info;
  } catch (err) {
    console.error("Email delivery failed:", {
      to: options.to,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      response: err.response,
      message: err.message,
    });
    throw err;
  }
};

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
  const confirmPassword = req.body.confirmPassword;

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
    let createdUser;

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
        createdUser = result;
        const confirmationUrl = `${domain(req)}/confirm/${token}`;

        return sendEmail({
          to: email,
          subject: "Confirm your Furniture Shop email address",
          text: `Welcome to Furniture Shop.

Please confirm your email address by opening this link:
${confirmationUrl}

This link expires in 2 hours. If you did not create this account, you can ignore this email.

Furniture Shop`,
          html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#27272a">
    <div style="max-width:560px;margin:32px auto;padding:32px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px">
      <h1 style="margin:0 0 16px;font-size:24px">Confirm your email address</h1>
      <p style="line-height:1.6">Welcome to Furniture Shop. Confirm your email address to finish creating your account.</p>
      <p style="margin:28px 0">
        <a href="${confirmationUrl}" style="display:inline-block;padding:12px 20px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px">Confirm email address</a>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#52525b">This link expires in 2 hours. If the button does not work, copy and paste this address into your browser:</p>
      <p style="font-size:13px;line-height:1.6;word-break:break-all"><a href="${confirmationUrl}" style="color:#2563eb">${confirmationUrl}</a></p>
      <hr style="margin:28px 0;border:0;border-top:1px solid #e4e4e7">
      <p style="margin:0;font-size:13px;color:#71717a">If you did not create this account, you can safely ignore this email.</p>
    </div>
  </body>
</html>`,
        });
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch(async (err) => {
        // Allow another signup attempt if the confirmation email could not be sent.
        if (createdUser) {
          try {
            await User.deleteOne({ _id: createdUser._id });
          } catch (cleanupError) {
            console.error("Could not remove unconfirmed user:", cleanupError);
          }
        }
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
            `This email '${email}' you want to reset dosen't exist`,
          );
          return res.redirect("/signup");
        }
        //found
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60000 * 120;
        console.log();
        return user.save().then((result) => {
          const resetUrl = `${domain(req)}/reset/${token}`;

          return sendEmail({
            to: email,
            subject: "Reset your Furniture Shop password",
            text: `A password reset was requested for your Furniture Shop account.

Set a new password by opening this link:
${resetUrl}

This link expires in 2 hours. If you did not request a password reset, you can ignore this email.

Furniture Shop`,
            html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#27272a">
    <div style="max-width:560px;margin:32px auto;padding:32px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px">
      <h1 style="margin:0 0 16px;font-size:24px">Reset your password</h1>
      <p style="line-height:1.6">A password reset was requested for your Furniture Shop account.</p>
      <p style="margin:28px 0">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px">Set a new password</a>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#52525b">This link expires in 2 hours. If the button does not work, copy and paste this address into your browser:</p>
      <p style="font-size:13px;line-height:1.6;word-break:break-all"><a href="${resetUrl}" style="color:#2563eb">${resetUrl}</a></p>
      <hr style="margin:28px 0;border:0;border-top:1px solid #e4e4e7">
      <p style="margin:0;font-size:13px;color:#71717a">If you did not request this change, you can safely ignore this email.</p>
    </div>
  </body>
</html>`,
          }).then(() => res.redirect("/login"));
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.setHttpStatus = 500;
        next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  const errorMessageList = req.flash("error");
  const errorMessage = errorMessageList ? errorMessageList[0] : null;

  console.log("token", token);
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "This password reset link has expired or is invalid.",
        );
        return res.redirect("/reset");
      }
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
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "This confirmation link has expired or is invalid.");
        return res.redirect("/signup");
      }
      user.isConfirmed = true;
      user.confirmToken = undefined;
      user.confirmTokenExpiration = undefined;
      return user.save().then(() => {
        return res.render("auth/confirm-signup", {
          path: "/login",
          pageTitle: "Email Confirmed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};
