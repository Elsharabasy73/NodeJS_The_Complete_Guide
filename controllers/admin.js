const mongoose = require("mongoose");

const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasErrors: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log("post add products");
  const { title, price, description } = req.body;
  const image = req.file;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    //you can store the entire user object and mongoose will just pick up the user._id it self
    userId: req.user,
  });
  //validate
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product-PR",
      path: "/admin/add-product",
      editing: false,
      product: product,
      hasErrors: true,
      errorMessage: "Attach file is not an image.",
      validationErrors: [],
    });
  }
  product.imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product-PR",
      path: "/admin/add-product",
      editing: false,
      product: product,
      hasErrors: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  // the save method used here is provided by mongoose not me.
  product
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      //server side issue accured.
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
      // return res.redirect("/500");
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Edit Product-PR",
      //   path: "/admin/add-product",
      //   editing: false,
      //   product: product,
      //   hasErrors: true,
      //   errorMessage: "Database opration failed, please try again laiter.",
      //   validationErrors: [],
      // });
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId; //:productId"

  Product.findById(prodId)
    .then((product) => {
      // throw new Error("dummy");
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasErrors: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const product = {
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDesc,
    _id: prodId,
  };
  //validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product-PR",
      path: "/admin/edit-product",
      editing: true,
      product: product,
      hasErrors: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  //add product
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        if (image) {
          fileHelper.deleteFile(product.imageUrl);
        }
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getProducts = (req, res, next) => {
  //populate the field you want with all the data field not just the id
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate("userId", "name")
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log("getindex-shopcontroller", err));
};

exports.deleteProduct = (req, res, next) => {
  console.log("teste");
  const prodId = req.params.productId;
  let imageUrl;
  Product.findById(prodId)
    .then((prod) => {
      console.log("delete prod", prod);
      if (!prod) {
        return res.redirect("/admin/products").then((params) => {
          console.log("product url not found");
        });
      }
      imageUrl = prod.imageUrl;
      return Product.deleteOne({ _id: prodId, userId: req.user._id }).then(
        (resutl) => {
          fileHelper.deleteFile(prod.imageUrl);
          res.status(200).json({ message: "product was deleted" });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "failed to delete this product." });
    });
};
