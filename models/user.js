const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(name, email, id) {
    this.name = name;
    this.email = email;
    this.id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    const mongoIdForm = new mongodb.ObjectId(userId);
    return db.collection("user").findOne({ _id: userId });
  }
}

module.exports = User;
