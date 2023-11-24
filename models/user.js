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

  //reurn a products array with all the products in the cart with full info.
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
    let cartProductIndex = -1;
    let updatedCartItems = [];
    //search for item.
    if (this.cart) {
      cartProductIndex = this.cart.items.findIndex((cp) => {
        return product._id.toString() === cp.productId.toString();
      });
      updatedCartItems = [...this.cart.items];
    }
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
        productId: new ObjectId(product._id),
        quantity: newQty,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    // const updatedCart = { items: [{productId: new mongodb.ObjectId(product._id), quantity: 1 }] };
    //update the db
    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  deleteCartItemsById(prodId) {
    //delete the product
    const updatedCartItems = this.cart.items.filter(
      (p) => !equals(p.productId, prodId)
    );

    //update the db
    const db = getDb();
    return (
      db
        .collection("users")
        //update items inside the cart important
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: { items: updatedCartItems } } }
        )
    );
  }

  addOrder() {
    const db = getDb();
    //add order
    return (
      this.getCart()
        .then((products) => {
          const newOrder = {
            items: products,
            user: {
              userId: new ObjectId(this._id),
              name: this.name,
            },
          };
          db.collection("orders").insertOne(newOrder);
          console.log("add order");
        })
        //delete the cart.
        .then((result) => {
          this.cart = { items: [] };
          return db
            .collection("users")
            .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
        })
    );
  }

  getOrders() {
    const db = getDb();

    return db
      .collection("orders")
      .find({ "user.userId": new ObjectId(this._id) })
      .toArray()
      .then((items) => {
        console.log('items',items)
        return items;
      });
  }

  static findById(userId) {
    const db = getDb();
    const mongoIdForm = new ObjectId(userId);
    return db
      .collection("users")
      .findOne({ _id: mongoIdForm })
      .then((user) => {
        return user;
      });
  }
}

module.exports = User;

function equals(id1, id2) {
  if (id1.toString() === id2.toString()) {
    console.log("The ObjectId values match");
    return true;
  } else {
    console.log("The ObjectId values do NOT match");
    return false;
  }
}
