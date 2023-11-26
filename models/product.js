const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//_id will be added automatecally
const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
//use model to connect a blue print (schema) with a name
module.exports = mongoose.model('Product', productSchema); 

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, imageUrl, description, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     //notice id must be converted here before not after passing
//     //because of the use of $set:this id of object must be of mongo form.
//     this._id = id?new mongodb.ObjectId(id):null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dpOp;
//     console.log(this._id);
//     if (this._id) {
//       //update
//       const update = { $set: this };
//       dpOp = db.collection("products").updateOne({ _id: this._id }, update);
//       console.log('update');
//     } else {
//       //insert
//       dpOp = db.collection("products").insertOne(this);
//       console.log('insert');
//     }
//     return dpOp
//       .then((result) => {
//         console.log('save/update');
//       })
//       .catch((err) => console.log(err));
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     const mongoObjIdForm = new mongodb.ObjectId(prodId);

//     return db
//       .collection("products")
//       .deleteOne({ _id: mongoObjIdForm })
//       .then((result) => {
//         console.log("Delete result:", result);
//       })
//       .catch((err) => console.log("Delete error:", err));
//   }

//   //return a list of products.
//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .catch((err) => console.log(err));
//   }
//   static findById(prodId) {
//     const db = getDb();
//     const mongoObjIdForm = new mongodb.ObjectId(prodId);
//     console.log("prodId", prodId);
//     console.log(mongoObjIdForm);
//     return db
//       .collection("products")
//       .find({ _id: mongoObjIdForm })
//       .next()
//       .then((product) => {
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = Product;
