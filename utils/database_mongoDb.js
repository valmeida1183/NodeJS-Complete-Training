const mongodb = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();
const MongoClient = mongodb.MongoClient;

let _db;

const mongoAtlasDbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmc3b.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const mongoConnect = callback => {
    MongoClient.connect(mongoAtlasDbUrl, { useUnifiedTopology: true })
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback(client);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No database found!';
};

exports.dbUrl = mongoAtlasDbUrl;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
