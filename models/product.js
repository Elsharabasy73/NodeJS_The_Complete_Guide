const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, imageUrl, description, id) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    //notice id must be converted here before not after passing
    //because of the use of $set:this id of object must be of mongo form.
    this._id = new mongodb.ObjectId(id);
  }

  save() {
    const db = getDb();
    let dpOp;

    if (this._id) {
      //update

      const update = { $set: this };
      dpOp = db.collection("products").updateOne({ _id: this._id }, update);
    } else {
      //insert
      dpOp = db.collection("products").insertOne(this);
    }
    return dpOp
      .then((result) => {
        console.log('save/update');
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    const mongoObjIdForm = new mongodb.ObjectId(prodId);

    return db
      .collection("products")
      .deleteOne({ _id: mongoObjIdForm })
      .then((result) => {
        console.log("Delete result:", result);
      })
      .catch((err) => console.log("Delete error:", err));
  }

  //return a list of products.
  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .catch((err) => console.log(err));
  }
  static findById(prodId) {
    const db = getDb();
    const mongoObjIdForm = new mongodb.ObjectId(prodId);
    console.log("prodId", prodId);
    console.log(mongoObjIdForm);
    return db
      .collection("products")
      .find({ _id: mongoObjIdForm })
      .next()
      .then((product) => {
        console.log("mongo product", product);
        return product;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
