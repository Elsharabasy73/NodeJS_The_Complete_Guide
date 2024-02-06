const path = require("path");
const express = require("express");

const isAuth = require("../middleware/is-auth");
const productValidator = require("../validation/product");

const adminController = require("../controllers/admin");

const router = express.Router();

// // /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product",productValidator.postAddProduct, isAuth,  adminController.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", productValidator.postAddProduct, isAuth, adminController.postEditProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
