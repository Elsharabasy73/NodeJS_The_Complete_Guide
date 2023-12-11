const express = require("express");

const authController = require("../controllers/auth");
const { check, body } = require("express-validator");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        if (value === "abdo") {
          console.log("value", value, value === "abdo");
          throw new Error("this email is forbidden");
        }
        return true;
      }),
    body("password", "Plese enter a pass with lenth more than or equal 5 ch.")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
