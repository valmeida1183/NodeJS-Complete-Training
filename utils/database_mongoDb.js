const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  const mongoAtlasDbUrl =
    "mongodb+srv://valmeida:Aprenda4tudo@cluster0.gmc3b.mongodb.net/shop?retryWrites=true&w=majority";
  MongoClient.connect(mongoAtlasDbUrl, { useUnifiedTopology: true })
    .then((client) => {
      console.log("Connected!");
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
