const fs = require("fs");
const path = require("path");

const rootFolder = path.dirname(require.main.filename);
const filePath = path.join(rootFolder, "data", "products.json");

const getProductsFromFile = (callback) => {
  fs.readFile(filePath, (error, fileContent) => {
    if (error) {
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }    
  });
};

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {    
    getProductsFromFile(products => {
        products.push(this);
        fs.writeFile(filePath, JSON.stringify(products), (error) => {
          console.log(error);
        });
      })      
  }

  static fetchAll(callback) {
      getProductsFromFile(callback);
  }
};
