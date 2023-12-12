const { check, body } = require("express-validator");

const User = require("../models/user");

module.exports.signup = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail()
    .trim()
    .custom((value, { req }) => {
      // if (value === "abdo") {
      //   console.log("value", value, value === "abdo");
      //   throw new Error("this email is forbidden");
      // }
      //if we return a promise express validator will wait for it to be fullfield.
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          console.log("Email already exists.");
          //this reject will be stored as an error message.
          return Promise.reject("Email already exists.");
        }
      });
    })
    .normalizeEmail()
    .trim(),
  body("password", "Plese enter a pass with lenth more than or equal 5 ch.")
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
];

module.exports.login = [
  check("email", "Envalid  email.")
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (!user) {
          return Promise.reject("this email dosen't exists");
        }
      });
    }),
  check("password", "password must be at least 5 characters")
    .isAlphanumeric()
    .isLength({ min: 5 }),
];
