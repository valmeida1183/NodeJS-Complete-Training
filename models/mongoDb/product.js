const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const productSchema = new Schema({
    title: {
        type: String,
        reuired: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        reuired: true,
    },
});

module.exports = mongoose.model('Product', productSchema);

/* const mongoDb = require('mongodb');
const { getDb } = require('../../utils/database_mongoDb');

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongoDb.ObjectId(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOperation;

        if (this._id) {
            dbOperation = db.collection('products')
                .updateOne({_id: this._id}, { $set: this });
        } else {
           dbOperation = db.collection('products')
                .insertOne(this);
        }

        return dbOperation
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongoDb.ObjectID(productId)})
            .next()
            .then(product => {
                console.log(product);
                return product;
            })
            .catch(err => console.log(err))
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection('products')
            .deleteOne({ _id: new mongoDb.ObjectID(productId)})
            .then(result => {
                console.log('Deleted!');
            })
            .catch(err => console.log(err));        
    }
}

module.exports = Product; */
