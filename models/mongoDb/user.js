const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.addToCart = function (product) {
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    const cartProductIndex = this.cart.items.findIndex(cartProduct => {
        return cartProduct.productId.toString() === product._id.toString();
    });

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }

    const updatedCart = {
        items: updatedCartItems,
    };

    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCart = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });

    this.cart.items = updatedCart;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

/* const mongoDb = require('mongodb');
const { getDb } = require('../../utils/database_mongoDb');

class User {
  constructor(name, email, id, cart) {
    this.name = name;
    this.email = email;
    this._id = id ? new mongoDb.ObjectId(id) : null;
    this.cart = cart;
  }

  save() {
    const db = getDb();
    let dbOperation;

    if (this._id) {
      dbOperation = db
        .collection('users')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOperation = db.collections('users').insertOne(this);
    }

    return dbOperation
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  }

  addToCart(product) {
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
      return cartProduct.productId.toString() === product._id.toString();
    });

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongoDb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((item) => {
      return item.productId;
    });

    // a sinxtaxe significa: procure todos os produtos pelo _id que estão nesta lista de ids
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          const quantity = this.cart.items.find((item) => {
            return item.productId.toString() === product._id.toString();
          }).quantity;

          return { ...product, quantity: quantity };
        });
      });
  }

  deleteItemFromCart(productId) {
    const updatedCart = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    const db = getDb();
    return db
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart: { items: updatedCart } } });
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.name,
          },
        };
        return db.collection('orders').insertOne(order);
      })
      .then(() => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders').find({ 'user._id': this._id }).toArray();
  }

  static findById(userId) {
    const db = getDb();
    const objId = new mongoDb.ObjectId(userId);

    return db
      .collection('users')
      .findOne(objId)
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
 */
