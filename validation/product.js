const { check, body } = require("express-validator");

module.exports.postAddProduct = [
  body("title", "choose a valid title").isString().trim().isLength({ min: 3 }),
  body("price", "choose a valid price")
    .trim()
    .isLength({ min: 1 })
    .isFloat()
    .withMessage("Price must be a float"),
  body("description", "desc from 5 to 200.")
    .trim()
    .isLength({ min: 5, max: 200 }),
];
