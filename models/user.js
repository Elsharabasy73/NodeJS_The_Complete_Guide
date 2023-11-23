const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;
const ObjectId = mongodb.ObjectId;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; //{}
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const updatedCart = { items: [{productId: new mongodb.ObjectId(product._id), quantity: 1 }] };
    const db = getDb();

    db
      .collection("users").findOne({_id: this._id}).then(user=>{
        console.log('done', user);
      })
    return db
      .collection("users")
      .updateOne({ _id: this._id}, { $set: { cart: updatedCart } });
  }

  static findById(userId) {
    const db = getDb();
    const mongoIdForm = new mongodb.ObjectId(userId);
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
