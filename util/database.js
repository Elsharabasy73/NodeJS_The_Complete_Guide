const mongodb = require("mongodb");
;
let _db

const mongoConnect = (cb) => {
  const MongoClient = mongodb.MongoClient;
  //create a connection
  MongoClient.connect(
    "mongodb+srv://abdomake73:xlsgzIvu2CYeOTrg@cluster0.vclsggt.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("conneced");
      //overwrite the name of the db provided in the url
      _db = client.db()
      cb();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

//create a connection pool
const getDb = ()=>{
  if (_db){
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
