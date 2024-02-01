const mongoose = require("mongoose");
const Order = require("./orders");
const product = require("./product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean },
  confirmToken: String,
  confirmTokenExpiration: Date,
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let cartProductIndex = -1;
  let updatedCartItems = [];
  //search for item.
  cartProductIndex = this.cart.items.findIndex((cp) => {
    return product._id.toString() === cp.productId.toString();
  });
  updatedCartItems = [...this.cart.items];

  let newQty = 1;

  //item already exist
  if (cartProductIndex >= 0) {
    console.log("update product quantity in cart");
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    //forgot .quantity
    updatedCartItems[cartProductIndex].quantity = newQty;
    //first time for this item.
  } else {
    console.log("product first time in cart.");
    updatedCartItems.push({
      productId: product._id,
      quantity: newQty,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.getCart = function () {
  return this.populate("cart.items.productId").then((user) => {
    const products = [];
    user.cart.items.forEach((element) => {
      const product = { ...element.productId._doc, quantity: element.quantity };
      products.push(product);
    });
    return products;
  });
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter((product) => {
    return product.productId.toString() !== prodId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = function () {
  return this.populate("cart.items.productId")
    .then((user) => {
      //modefy the cart to the order form
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      //save order
      const order = new Order({
        products: products,
        user: { name: this.name, userId: this._id },
      });
      return order.save();
    })
    .then((result) => {
      //clean cart
      this.cart.items = [];
      return this.save();
    });
};
userSchema.methods.getOrders = function () {
  return Order.find({ "user.userId": this._id }).then((products) => products);
};
module.exports = mongoose.model("User", userSchema);
