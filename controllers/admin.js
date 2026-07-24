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
  const {
    title,
    price,
    description,
    category,
    highlights,
    rating,
    isOutOfStock,
  } = req.body;
  const image = req.files?.image?.[0];
  const galleryImages = req.files?.images || [];

  const product = new Product({
    title,
    price,
    description,
    category,
    highlights: highlights || "",
    rating: rating || 0,
    isOutOfStock,
    creator: req.user._id,
    mainImageUrl: image?.path,
    images: galleryImages.map((file) => file.path),
  });
  //validate
  if (!image) {
    galleryImages.forEach((file) => fileHelper.deleteFile(file.path));
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    [image, ...galleryImages]
      .filter(Boolean)
      .forEach((file) => fileHelper.deleteFile(file.path));
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
      [image, ...galleryImages]
        .filter(Boolean)
        .forEach((file) => fileHelper.deleteFile(file.path));
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
  const {
    title,
    price,
    description,
    category,
    highlights,
    rating,
    isOutOfStock,
  } = req.body;
  const image = req.files?.image?.[0];
  const galleryImages = req.files?.images || [];
  const product = {
    title,
    price,
    description,
    category,
    highlights,
    rating,
    isOutOfStock,
    _id: prodId,
  };
  //validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    [image, ...galleryImages]
      .filter(Boolean)
      .forEach((file) => fileHelper.deleteFile(file.path));
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
      if (!product) {
        [image, ...galleryImages]
          .filter(Boolean)
          .forEach((file) => fileHelper.deleteFile(file.path));
        return res.redirect("/admin/products");
      }
      const oldMainImage = product.mainImageUrl;
      const oldGalleryImages = [...product.images];

      product.title = title;
      product.price = price;
      product.description = description;
      product.category = category;
      product.highlights = highlights || "";
      product.rating = rating || 0;
      product.isOutOfStock = isOutOfStock;
      if (image) {
        product.mainImageUrl = image.path;
      }
      if (galleryImages.length) {
        product.images = galleryImages.map((file) => file.path);
      }
      return product.save().then((result) => {
        if (image) {
          fileHelper.deleteFile(oldMainImage);
        }
        if (galleryImages.length) {
          oldGalleryImages.forEach(fileHelper.deleteFile);
        }
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      [image, ...galleryImages]
        .filter(Boolean)
        .forEach((file) => fileHelper.deleteFile(file.path));
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getProducts = (req, res, next) => {
  //populate the field you want with all the data field not just the id
  Product.find()
    .sort({ createdAt: -1 })
    // .select('title price -_id')
    // .populate("userId", "name")
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch(next);
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByIdAndDelete(prodId)
    .then((prod) => {
      if (!prod) {
        return res.status(404).json({ message: "Product was not found." });
      }
      [prod.mainImageUrl, ...prod.images].forEach(fileHelper.deleteFile);
      return res.status(200).json({ message: "Product was deleted." });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "failed to delete this product." });
    });
};
