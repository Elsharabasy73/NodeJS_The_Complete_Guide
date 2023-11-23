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

  addToCart(product) {
    //s/earch for item.
    console.log('cartt', this.cart)
    console.log('itemst', this.cart.items)
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      console.log("Product ID:", product._id);
      console.log("Cart Product ID:", cp.productId);
      return product._id.toString() === cp.productId.toString();
    });
    console.log("cartProductIndex", cartProductIndex);
    let newQty = 1;
    const updatedCartItems = [...this.cart.items];
    //item already exist
    if (cartProductIndex >= 0) {
      console.log('update product')
      newQty = this.cart.items[cartProductIndex].quantity + 1;
      //forgot .quantity
      updatedCartItems[cartProductIndex].quantity = newQty;
      //first time for this item.
    } else {
      console.log('product first')
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
