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
    const db = getDb();
    const mongoIdForm = new mongodb.ObjectId(userId);
    console.log(mongoIdForm);
    return db
      .collection("users")
      .findOne({ _id: mongoIdForm })
      .then((user) => {
        console.log("appreq user", user);
        return user;
      });
  }
}

module.exports = User;
