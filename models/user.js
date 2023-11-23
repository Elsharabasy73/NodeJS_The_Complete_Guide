const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;
const ObjectId = mongodb.ObjectId;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; //{}
    this._id = id ? new ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  getCart() {
    const db = getDb();
    //get full products info form products table
    const productIds = this.cart.items.map((p) => p.productId);

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((prodcuts) => {
        return prodcuts.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find(
              (cartProd) =>
                cartProd.productId.toString() === product._id.toString()
            ).quantity,
          };
        });
      });
  }

  addToCart(product) {
    //search for item.
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return product._id.toString() === cp.productId.toString();
    });
    let newQty = 1;
    const updatedCartItems = [...this.cart.items];

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
        productId: new ObjectId(product._id),
        quantity: newQty,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    // const updatedCart = { items: [{productId: new mongodb.ObjectId(product._id), quantity: 1 }] };

    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  static findById(userId) {
    const db = getDb();
    const mongoIdForm = new ObjectId(userId);
    console.log(mongoIdForm);
    return db
      .collection("users")
      .findOne({ _id: mongoIdForm })
      .then((user) => {
        return user;
      });
  }
}

module.exports = User;
