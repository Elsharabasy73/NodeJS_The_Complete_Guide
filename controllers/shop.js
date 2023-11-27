const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log("getproducts -shopcontroller", err);
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
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  //.find give us the products not the curser
  //we could alse use .find().curser()
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log("getindex-shopcontroller", err));
};

exports.getCart = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const products = [];
    user.cart.items.forEach((element, index) => {
      const product = { ...element.productId._doc, quantity: element.quantity };
      products.push(product);
    });
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
    .catch((err) => console.log(err));

  // let newQuanity = 1;
  // let fetchCart;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     if (product) {
  //       newQuanity = product.cartItem.quantity + 1;
  //     }
  //     return Product.findByPk(prodId).then((product) => {
  //       return fetchCart.addProduct(product, {
  //         through: { quantity: newQuanity },
  //       });
  //     });
  //   })
  //   .then((e) => {
  //     res.redirect("/cart");
  //   });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .deleteCartItemsById(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then((items) => {
    console.log("items2", items);
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: items,
    });
  });
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => res.redirect("/orders"))
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
