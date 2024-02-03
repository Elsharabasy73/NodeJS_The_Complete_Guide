const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(
  "sk_test_51OfVIOJyKkHwBXZ9kCebRobcgZv8GsPtFgbfLWBPj1ZUXGHe75VbS89pEAzuGVHK4057sRsnkQ7o9z7jfLkO9OVN00TmPVS552"
);

const Product = require("../models/product");
const user = require("../models/user");
const Order = require("../models/orders");

const ITEMS_PER_PAGE = 2;
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      console.log("index");
      return res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        // Handle the case where the product is not found
        res.status(404).send("Product not found");
        return;
      }
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: true,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getIndex = (req, res, next) => {
  //.find give us the products not the curser
  //we could alse use .find().curser()
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      console.log("index");
      return res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  // console.log("user", req.session.user);
  // console.log("user", req.user);

  req.user.getCartItems().then((products) => {
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log("post cart");
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then((items) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: items,
    });
  });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => res.redirect("/orders"))
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => res.redirect("/orders"))
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  // => http://localhost:3000
  const domain = req.protocol + "://" + req.get("host");
  let products;
  let total = 0;
  req.user
    .getCartItems()
    .then((cartProducts) => {
      const totalSum = cartProducts.reduce((accumulator, currentProduct) => {
        return accumulator + currentProduct.price * currentProduct.quantity;
      }, 0);
      total = totalSum;
      products = cartProducts;

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cartProducts.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: "usd",
              unit_amount: p.price * 100,
              product_data: {
                name: p.title,
                description: p.description,
              },
            },
          };
        }),
        mode: "payment",
        success_url: `${domain}/checkout/success`,
        cancel_url: `${domain}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.setHttpStatus = 500;
      next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);
  Order.findOne({ "user.userId": req.user._id, _id: orderId })
    .then((order) => {
      if (!order) {
        const error = new Error("No order was found.");
        return next(error);
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename='" + invoiceName + "'"
      );
      // const file = fs.createReadStream(invoicePath);
      //use readable streams to pipe their output to a writable stream.
      // file.pipe(res);
      const pdfDoc = new PDFDocument(); //readable stream
      pdfDoc.pipe(res);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      //file content.
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
    });
};
