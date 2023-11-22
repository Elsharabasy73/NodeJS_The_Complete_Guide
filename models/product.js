const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, imageUrl, description) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    const db = getDb();
    // console.log(db);
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
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
