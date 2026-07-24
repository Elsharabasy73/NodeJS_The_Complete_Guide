const { body } = require("express-validator");

module.exports.postAddProduct = [
  body("title", "choose a valid title").isString().trim().isLength({ min: 3 }),
  body("category", "Choose a valid category")
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 }),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number")
    .toFloat(),
  body("description", "Description must contain at least 5 characters")
    .trim()
    .isLength({ min: 5, max: 5000 }),
  body("highlights")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Highlights cannot exceed 2000 characters"),
  body("rating")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5")
    .toFloat(),
  body("isOutOfStock").customSanitizer(
    (value) => value === "true" || value === "on",
  ),
];
