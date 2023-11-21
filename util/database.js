const mongodb = require("mongodb");

const mongoConnect = (cb) => {
  const MongoClient = mongodb.MongoClient;
  //create a connection
  MongoClient.connect(
    "mongodb+srv://abdomake73:xlsgzIvu2CYeOTrg@cluster0.vclsggt.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((result) => {
      console.log("conneced");
      cb(result);
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect;
