const fs = require('fs');
const path = require('path');

const rootFolder = path.dirname(require.main.filename);
const filePath = path.join(rootFolder, "data", "cart.json");

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(filePath, (error, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!error) {
                cart = JSON.parse(fileContent);
            }
            // Analyze the cart => find existing product
            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty += 1;
                cart.products = [ ...cart.products ];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [ ...cart.products, updatedProduct];
            }
            // Add new product/ increase quantity
            cart.totalPrice = cart.totalPrice + +productPrice;

            fs.writeFile(filePath, JSON.stringify(cart), error => {
                console.log(error);
            })
        })
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(filePath, (error, fileContent) => {
            if (error) {
                return;
            }

            let cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };
            const product = updatedCart.products.find(product => product.id === id);
            if (!product) {
                return;
            }

            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

            fs.writeFile(filePath, JSON.stringify(updatedCart), error => {
                console.log(error);
            })
        });
    }

    static getCart(callback) {
        fs.readFile(filePath, (error, fileContent) => { 
            const cart = JSON.parse(fileContent);
            if (error) {
                callback(null);
            } else {
                callback(cart);                
            }
        });
    }
}